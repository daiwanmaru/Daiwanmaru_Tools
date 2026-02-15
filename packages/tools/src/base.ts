export interface ProcessContext {
    jobId: string;
    params: any;
    inputFiles: { key: string; name: string; path: string }[];
    workingDir: string;
}

export interface ProcessResult {
    outputs: { key: string; name: string; path: string }[];
}

export abstract class ToolExecutor {
    abstract slug: string;
    abstract process(ctx: ProcessContext): Promise<ProcessResult>;
}
