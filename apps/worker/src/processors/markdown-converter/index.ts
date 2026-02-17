import mammoth from 'mammoth';
import TurndownService from 'turndown';
// @ts-ignore
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

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
    console.log(`[Markdown Converter] Processing job ${input.jobId}`);

    const results: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    for (const filePath of input.inputFiles) {
        const fileExtension = path.extname(filePath).toLowerCase();
        const fileBytes = await fs.readFile(filePath);
        let markdown = '';

        try {
            if (fileExtension === '.docx') {
                // @ts-ignore
                const result = await mammoth.convertToMarkdown({ buffer: fileBytes });
                markdown = result.value;
                if (result.messages.length > 0) {
                    // @ts-ignore
                    warnings.push(...result.messages.map(m => `DOCX: ${m.message}`));
                }
            } else if (['.html', '.htm'].includes(fileExtension)) {
                const html = fileBytes.toString('utf-8');
                const turndownService = new TurndownService({
                    headingStyle: 'atx',
                    codeBlockStyle: 'fenced'
                });
                markdown = turndownService.turndown(html);
            } else if (fileExtension === '.pdf') {
                const data = await pdf(fileBytes);
                // Basic cleanup for PDF text
                markdown = data.text.replace(/\r/g, '').replace(/ +/g, ' ');
                if (data.text.trim().length < 100) {
                    warnings.push('PDF might be scanned or contains very little text.');
                }
            } else if (['.txt', '.md'].includes(fileExtension)) {
                markdown = fileBytes.toString('utf-8');
            } else {
                warnings.push(`Unsupported file type: ${fileExtension}`);
                continue;
            }

            results.push(markdown);
        } catch (err) {
            console.error(`[Markdown Converter] Error processing ${path.basename(filePath)}:`, err);
            warnings.push(`Failed to process ${path.basename(filePath)}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    const finalMarkdown = results.join('\n\n---\n\n');
    let outputContent = finalMarkdown;

    if (input.params.frontMatter !== false) {
        const frontMatter = [
            '---',
            `job_id: ${input.jobId}`,
            `converted_at: ${new Date().toISOString()}`,
            `source_files: ${input.inputFiles.map(f => path.basename(f)).join(', ')}`,
            '---',
            '',
            ''
        ].join('\n');
        outputContent = frontMatter + finalMarkdown;
    }

    const outputFilename = input.params.outputName || 'output.md';
    const outputPath = path.join(input.workingDir, outputFilename);
    const outputKey = `jobs/${input.jobId}/outputs/${outputFilename}`;

    await fs.writeFile(outputPath, outputContent);

    // Also write meta.json
    const meta = {
        status: results.length > 0 ? 'success' : 'failed',
        tool: { name: 'markdown-converter', version: '0.1.0' },
        stats: {
            char_count: outputContent.length,
            file_count: results.length
        },
        warnings,
        timing_ms: { total: Date.now() - startTime }
    };
    await fs.writeFile(path.join(input.workingDir, 'meta.json'), JSON.stringify(meta, null, 2));

    return {
        outputs: [
            {
                key: outputKey,
                name: outputFilename,
                mime: 'text/markdown',
            }
        ]
    };
};
