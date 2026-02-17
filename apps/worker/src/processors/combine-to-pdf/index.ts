import { PDFDocument, PageSizes } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export interface ProcessInput {
    jobId: string;
    params: any;
    inputFiles: string[]; // Absolute paths to downloaded input files
    workingDir: string;
}

export interface ProcessOutput {
    outputs: Array<{ key: string, name: string, mime?: string }>;
}

export const process = async (input: ProcessInput): Promise<ProcessOutput> => {
    console.log(`[Combine to PDF] Processing job ${input.jobId}`);

    const mergedPdf = await PDFDocument.create();

    // A4 dimensions in points
    const A4_WIDTH = PageSizes.A4[0];
    const A4_HEIGHT = PageSizes.A4[1];

    for (const filePath of input.inputFiles) {
        const fileExtension = path.extname(filePath).toLowerCase();
        const fileBytes = await fs.readFile(filePath);

        try {
            if (fileExtension === '.pdf') {
                // Handle PDF
                const pdf = await PDFDocument.load(fileBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileExtension)) {
                // Handle Image
                let image;
                let imageData: Buffer | Uint8Array = fileBytes;

                // For WebP or if we want to ensure standard format, use sharp
                if (fileExtension === '.webp') {
                    const webpBuffer = await sharp(fileBytes).toFormat('png').toBuffer();
                    imageData = new Uint8Array(webpBuffer);
                    image = await mergedPdf.embedPng(imageData);
                } else if (fileExtension === '.png') {
                    image = await mergedPdf.embedPng(fileBytes);
                } else {
                    image = await mergedPdf.embedJpg(fileBytes);
                }

                // Add to new page
                const page = mergedPdf.addPage(PageSizes.A4);

                // Calculate dimensions to fit A4 while maintaining aspect ratio
                const { width, height } = image.scale(1);
                const ratio = Math.min(A4_WIDTH / width, A4_HEIGHT / height);
                const scaledWidth = width * ratio;
                const scaledHeight = height * ratio;

                // Center horizontally and vertically
                page.drawImage(image, {
                    x: (A4_WIDTH - scaledWidth) / 2,
                    y: (A4_HEIGHT - scaledHeight) / 2,
                    width: scaledWidth,
                    height: scaledHeight,
                });
            } else {
                console.warn(`[Combine to PDF] Unsupported file type: ${fileExtension}`);
            }
        } catch (err) {
            console.error(`[Combine to PDF] Error processing file ${filePath}:`, err);
            throw new Error(`Failed to process ${path.basename(filePath)}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    const mergedBytes = await mergedPdf.save();

    const outputFilename = input.params.outputName || 'merged.pdf';
    const outputPath = path.join(input.workingDir, outputFilename);
    const outputKey = `jobs/${input.jobId}/outputs/${outputFilename}`;

    await fs.writeFile(outputPath, mergedBytes);

    return {
        outputs: [
            {
                key: outputKey,
                name: outputFilename,
                mime: 'application/pdf',
            }
        ]
    };
};
