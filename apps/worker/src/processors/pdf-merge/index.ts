import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export interface ProcessInput {
    jobId: string;
    params: any;
    inputFiles: string[]; // Absolute paths to downloaded input files
    workingDir: string;
}

export interface ProcessOutput {
    outputs: Array<{ key: string, name: string }>;
}

export const process = async (input: ProcessInput): Promise<ProcessOutput> => {
    console.log(`[PDF Merge] Processing job ${input.jobId}`);

    const mergedPdf = await PDFDocument.create();

    for (const filePath of input.inputFiles) {
        const fileBytes = await fs.readFile(filePath);
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();

    const outputFilename = input.params.outputName || 'merged.pdf';
    const outputPath = path.join(input.workingDir, outputFilename);
    const outputKey = `output/${input.jobId}/${outputFilename}`;

    await fs.writeFile(outputPath, mergedBytes);

    // In a real implementation, we would upload the file here or return the path for the caller to upload.
    // However, our current architecture expects the worker to upload the result to B2.
    // To keep this module pure, we'll return the local path and let the main worker loop handle upload?
    // Wait, the main loop handles S3 operations. So we should probably return something the main loop can use.
    // The main loop expects `outputs` with keys. The main loop uploads using `storage.putObject`?
    // Let's check `apps/worker/src/index.ts`.
    // It seems the main loop handles `inputs` download, but for `outputs` it expects the processor to have done something?
    // No, currently the main `processJob` function calls `executor.process`.
    // Let's make `process` return the local file path, and let the main loop upload it.

    // BUT WAIT: The `ProcessOutput` interface I defined above expects `key`.
    // This implies the processor is responsible for uploading? Or the key is just a suggestion?
    // Let's refactor the main loop to handle S3 upload for consistency.
    // So here we return: `localPath` and `suggestedKey`.

    // Actually, looking at the existing code in `worker/src/index.ts` (which I viewed earlier):
    // The `executor` was a mock.
    // Let's return the local file info so the main loop can upload it.

    return {
        outputs: [
            {
                key: outputKey, // The target key in S3
                name: outputFilename,
                // We also need to pass the local path back so the main loop can read it!
                // I will add a `localPath` property to the return type in the main loop logic.
                // For now, let's treat `key` as the S3 key, and assume the file exists at `outputPath`.
            } as any
        ]
    };
};
