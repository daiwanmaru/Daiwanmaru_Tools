import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { ToolExecutor, ProcessContext, ProcessResult } from '../base.js';

export class PDFMergeExecutor extends ToolExecutor {
    slug = 'pdf-merge';

    async process(ctx: ProcessContext): Promise<ProcessResult> {
        const { params, inputFiles, workingDir, jobId } = ctx;
        const outputName = params.outputName || 'merged.pdf';

        console.log(`[PDFMerge] Merging ${inputFiles.length} files...`);

        const mergedPdf = await PDFDocument.create();

        for (const file of inputFiles) {
            const pdfBytes = await fs.readFile(file.path);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const outputPath = path.join(workingDir, outputName);
        await fs.writeFile(outputPath, mergedPdfBytes);

        return {
            outputs: [
                {
                    key: `output/${jobId}/${outputName}`,
                    name: outputName,
                    path: outputPath,
                },
            ],
        };
    }
}
