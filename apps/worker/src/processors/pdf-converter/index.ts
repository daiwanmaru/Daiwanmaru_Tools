import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface ProcessInput {
    jobId: string;
    params: {
        outputName?: string;
    };
    inputFiles: string[]; // Absolute paths
    workingDir: string;
}

export interface ProcessOutput {
    outputs: Array<{ key: string, name: string, mime?: string }>;
}

export const process = async (input: ProcessInput): Promise<ProcessOutput> => {
    console.log(`[PDF Converter] Processing job ${input.jobId}`);

    const pdfDoc = await PDFDocument.create();
    const outputName = (input.params.outputName || 'converted') + '.pdf';
    const outputPath = path.join(input.workingDir, outputName);

    for (const filePath of input.inputFiles) {
        const ext = path.extname(filePath).toLowerCase();

        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            const imageBuffer = await fs.readFile(filePath);
            const metadata = await sharp(imageBuffer).metadata();

            // Standardize to JPEG for embedding
            const jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
            const pdfImage = await pdfDoc.embedJpg(jpegBuffer);

            const page = pdfDoc.addPage([metadata.width || 595, metadata.height || 842]);
            page.drawImage(pdfImage, {
                x: 0,
                y: 0,
                width: metadata.width,
                height: metadata.height,
            });
        } else if (ext === '.txt') {
            const text = await fs.readFile(filePath, 'utf-8');
            const page = pdfDoc.addPage();
            const { height } = page.getSize();
            page.drawText(text, {
                x: 50,
                y: height - 50,
                size: 12,
            });
        } else {
            console.warn(`[PDF Converter] Unsupported file type: ${ext}`);
        }
    }

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);

    return {
        outputs: [
            {
                key: `jobs/${input.jobId}/outputs/${outputName}`,
                name: outputName,
                mime: 'application/pdf'
            }
        ]
    };
};
