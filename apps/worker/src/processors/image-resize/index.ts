import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface ProcessInput {
    jobId: string;
    params: {
        width?: number;
        height?: number;
        lockAspectRatio?: boolean;
        targetFileSize?: number; // In KB
        format?: string;
    };
    inputFiles: string[];
    workingDir: string;
}

export interface ProcessOutput {
    outputs: Array<{ key: string, name: string, mime?: string }>;
}

export const process = async (input: ProcessInput): Promise<ProcessOutput> => {
    console.log(`[Image Resize] Processing job ${input.jobId}`);

    const outputs: Array<{ key: string, name: string, mime?: string }> = [];

    for (const filePath of input.inputFiles) {
        const originalName = path.basename(filePath);
        const nameWithoutExt = path.parse(originalName).name;
        const targetFormat = input.params.format === 'original' ? path.extname(filePath).slice(1).toLowerCase() : input.params.format || 'jpg';

        const outputFilename = `${nameWithoutExt}-resized.${targetFormat}`;
        const outputPath = path.join(input.workingDir, outputFilename);

        let pipeline = sharp(filePath);

        // Resize
        if (input.params.width || input.params.height) {
            pipeline = pipeline.resize({
                width: input.params.width,
                height: input.params.height,
                fit: input.params.lockAspectRatio !== false ? 'inside' : 'fill'
            });
        }

        // Format and Quality
        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
            pipeline = pipeline.jpeg({ quality: 85 });
        } else if (targetFormat === 'png') {
            pipeline = pipeline.png();
        } else if (targetFormat === 'webp') {
            pipeline = pipeline.webp({ quality: 80 });
        }

        await pipeline.toFile(outputPath);

        // Optional: Force file size limit (this is tricky with sharp, would need multiple passes)
        // For now, we just output the resized image.

        outputs.push({
            key: `jobs/${input.jobId}/outputs/${outputFilename}`,
            name: outputFilename,
            mime: `image/${targetFormat}`
        });
    }

    return { outputs };
};
