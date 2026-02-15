'use client';

import { useState } from 'react';

export default function ToolForm({ tool }: { tool: any }) {
    const [files, setFiles] = useState<File[]>([]);
    const [params, setParams] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Create Job
            const res = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toolId: tool.id,
                    params,
                    files: files.map(f => ({ name: f.name, contentType: f.type })),
                }),
            });

            const { jobId, uploadUrls } = await res.json();
            setJobId(jobId);

            // 2. Upload Files
            await Promise.all(
                files.map(async (file, i) => {
                    const upload = uploadUrls.find((u: any) => u.name === file.name);
                    await fetch(upload.url, {
                        method: 'PUT',
                        body: file,
                        headers: { 'Content-Type': file.type },
                    });
                })
            );

            // 3. Commit Job
            await fetch('/api/jobs/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId }),
            });

            // Show success or redirect to status page
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Area */}
            <div>
                <label className="block text-sm font-medium mb-2">Upload Files</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}>
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    />
                    {files.length > 0 ? (
                        <ul className="text-left space-y-1">
                            {files.map((f, i) => <li key={i} className="text-sm">📄 {f.name}</li>)}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Click or drag files here to upload</p>
                    )}
                </div>
            </div>

            {/* Dynamic Parameters */}
            <div className="space-y-4">
                {tool.paramsDefine?.fields?.map((field: any) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium mb-1">{field.label}</label>
                        {field.type === 'select' ? (
                            <select
                                className="w-full p-3 rounded-lg border dark:bg-gray-700"
                                onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
                                defaultValue={field.default}
                            >
                                {field.options.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                className="w-full p-3 rounded-lg border dark:bg-gray-700"
                                placeholder={field.label}
                                defaultValue={field.default}
                                onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || files.length === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Processing...' : 'Start Task'}
            </button>

            {jobId && (
                <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                    Job created! ID: {jobId}
                </div>
            )}
        </form>
    );
}
