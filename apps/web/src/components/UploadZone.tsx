'use client';

import { useState } from 'react';
import { Upload, FileIcon } from 'lucide-react';
import { Tool as CoreTool } from '@daiwanmaru/core';

// Extend the core Tool type to include category if it's missing in the build
// Extend the core Tool type to include category if it's missing in the build
type Tool = CoreTool & {
    category?: string;
};

export function UploadZone({ tool }: { tool: Tool }) {
    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [downloadUrls, setDownloadUrls] = useState<Array<{ name: string; url: string }>>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const pollJobStatus = async (id: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/jobs/${id}`);
                const data = await res.json();

                setJobStatus(data.status);

                if (data.status === 'COMPLETED') {
                    clearInterval(interval);
                    setDownloadUrls(data.downloadUrls || []);
                } else if (data.status === 'FAILED') {
                    clearInterval(interval);
                    alert(`Job failed: ${data.errorMessage}`);
                }
            } catch (e) {
                console.error('Error polling job status:', e);
            }
        }, 2000);
    };

    const handleProcess = async () => {
        setUploading(true);
        setJobStatus('UPLOADING');
        try {
            // 1. Create Job & Get Presigned URLs
            const res = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toolId: tool.id,
                    files: files.map(f => ({ name: f.name, contentType: f.type })),
                    params: {}
                })
            });

            if (!res.ok) throw new Error('Failed to create job');
            const { jobId, uploadUrls } = await res.json();

            // 2. Upload Files via Proxy (to avoid CORS)
            await Promise.all(uploadUrls.map(async (u: any) => {
                const file = files.find(f => f.name === u.name);
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('uploadUrl', u.url);
                formData.append('contentType', file.type);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error('Upload failed');
            }));

            // 3. Queue Job for Processing
            await fetch(`/api/jobs/${jobId}/process`, { method: 'POST' });

            // 4. Start Polling
            setJobId(jobId);
            setJobStatus('QUEUED');
            pollJobStatus(jobId);

        } catch (e) {
            console.error(e);
            alert('Error processing files');
            setJobStatus(null);
        } finally {
            setUploading(false);
        }
    };

    if (jobStatus === 'COMPLETED') {
        return (
            <div className="text-center p-12">
                <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                    <FileIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-500 mb-8">Your files have been processed.</p>
                <div className="space-y-4">
                    {downloadUrls.map((file, i) => (
                        <a
                            key={i}
                            href={file.url}
                            download
                            className="block w-full max-w-sm mx-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm"
                        >
                            Download {file.name}
                        </a>
                    ))}
                    <button
                        onClick={() => {
                            setFiles([]);
                            setJobId(null);
                            setJobStatus(null);
                            setDownloadUrls([]);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline mt-4"
                    >
                        Process another file
                    </button>
                </div>
            </div>
        );
    }

    if (jobStatus && jobStatus !== 'COMPLETED' && jobStatus !== 'FAILED') {
        return (
            <div className="text-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900">Processing...</h3>
                <p className="text-gray-500 mt-2">Status: {jobStatus}</p>
                {jobId && <p className="text-xs text-gray-400 mt-1">Job ID: {jobId}</p>}
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900">
                {files.length > 0 ? `${files.length} file(s) selected` : 'Drop files here'}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
                {files.length > 0 ? 'Ready to process' : 'or click to browse from your device'}
            </p>

            {files.length > 0 && (
                <div className="mt-6 space-y-2 w-full max-w-md">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                            <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                            <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 flex gap-4">
                <label className="relative cursor-pointer">
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <span className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {files.length > 0 ? 'Add more files' : 'Upload from PC or Mobile'}
                    </span>
                </label>

                {files.length > 0 && (
                    <button
                        onClick={handleProcess}
                        disabled={uploading}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {uploading ? 'Start Processing' : 'Start Processing'}
                    </button>
                )}
            </div>
        </div>
    );
}
