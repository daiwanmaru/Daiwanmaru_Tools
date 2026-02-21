'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Upload,
    FileIcon,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileType,
    ChevronRight,
    Download,
    FileText,
    FileOutput,
    FileCode
} from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function MarkdownConverterPage() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/login');
        },
    });

    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // Options
    const [extractImages, setExtractImages] = useState(true);
    const [frontMatter, setFrontMatter] = useState(true);

    // Limits
    const isPro = session?.user?.plan === 'PRO';
    const MAX_FILES = isPro ? 10 : 3;
    const MAX_TOTAL_SIZE = (isPro ? 50 : 20) * 1024 * 1024;

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    const SUPPORTED_EXTENSIONS = ['.docx', '.pdf', '.html', '.htm', '.txt', '.md'];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles: File[] = [];
            let errorMsg: string | null = null;

            for (const file of newFiles) {
                const ext = '.' + file.name.split('.').pop()?.toLowerCase();
                if (!SUPPORTED_EXTENSIONS.includes(ext)) {
                    errorMsg = `File type ${ext} is not supported. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`;
                    continue;
                }
                if (file.size > 20 * 1024 * 1024 && !isPro) {
                    errorMsg = `File ${file.name} exceeds 20MB limit.`;
                    continue;
                }
                validFiles.push(file);
            }

            if (errorMsg) setError(errorMsg);

            setFiles(prev => {
                const combined = [...prev, ...validFiles];
                if (combined.length > MAX_FILES) {
                    setError(`Maximum ${MAX_FILES} files allowed.`);
                    return combined.slice(0, MAX_FILES);
                }
                return combined;
            });
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const pollStatus = async (id: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/jobs/${id}`);
                const job = await res.json();

                if (job) {
                    setJobStatus(job.status);
                    setProgress(job.progress || 0);

                    if (job.status === 'COMPLETED') {
                        clearInterval(interval);
                        if (job.downloadUrl) {
                            setDownloadUrl(typeof job.downloadUrl === 'string' ? job.downloadUrl : job.downloadUrl.url);
                        }
                        setUploading(false);
                    } else if (job.status === 'FAILED') {
                        clearInterval(interval);
                        setError(job.errorMessage || 'Conversion failed');
                        setUploading(false);
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 2000);
    };

    const handleSubmit = async () => {
        if (files.length === 0) return;
        if (totalSize > MAX_TOTAL_SIZE) {
            setError(`Total size exceeds ${isPro ? '50MB' : '20MB'}. Please remove some files.`);
            return;
        }

        setUploading(true);
        setError(null);
        setProgress(5);
        setJobStatus('INITIALIZING');

        try {
            // 1. Find Tool ID
            const toolsRes = await fetch('/api/tools');
            const tools = await toolsRes.json();
            const tool = tools.find((t: any) => t.slug === 'markdown-converter');
            if (!tool) throw new Error('Tool metadata not found. Please re-seed database.');

            // 2. Create Job
            const createRes = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toolId: tool.id,
                    params: { extractImages, frontMatter, outputName: 'output.md' },
                    files: files.map(f => ({ name: f.name, contentType: f.type }))
                })
            });

            if (!createRes.ok) throw new Error('Failed to initialize job on server');
            const { jobId, uploadUrls } = await createRes.json();
            setJobId(jobId);
            setJobStatus('UPLOADING');

            // 3. Upload Files via Proxy
            let completedUploads = 0;
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

                if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`);

                completedUploads++;
                setProgress(Math.round(5 + (completedUploads / files.length) * 25));
            }));

            setProgress(35);
            setJobStatus('QUEUED');

            // 4. Start Processing
            const processRes = await fetch(`/api/jobs/${jobId}/process`, { method: 'POST' });
            if (!processRes.ok) throw new Error('Failed to start processing queue');

            pollStatus(jobId);

        } catch (err: any) {
            console.error('[Frontend] Submit Error:', err);
            setError(err.message || 'An unexpected error occurred during processing');
            setUploading(false);
        }
    };

    if (status === 'loading') return null;

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-xs font-medium text-neutral-400 mb-8">
                    <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-neutral-600">Markdown Converter</span>
                </nav>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 mb-6">
                        <FileCode className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-4">Markdown Converter</h1>
                    <p className="text-neutral-500 max-w-xl mx-auto">
                        Convert DOCX, PDF, HTML, and TXT into clean, structured Markdown files.
                    </p>
                </div>

                {!jobId || error ? (
                    <div className="space-y-8">
                        {/* Options */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-wrap gap-6 justify-center">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={extractImages}
                                    onChange={(e) => setExtractImages(e.target.checked)}
                                    className="h-5 w-5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-semibold text-neutral-700 group-hover:text-emerald-600 transition-colors">Extract Images</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={frontMatter}
                                    onChange={(e) => setFrontMatter(e.target.checked)}
                                    className="h-5 w-5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-semibold text-neutral-700 group-hover:text-emerald-600 transition-colors">Include Front Matter</span>
                            </label>
                        </div>

                        {/* Upload Zone */}
                        <div className={`
                            relative group border-4 border-dashed rounded-3xl p-12 transition-all duration-300
                            ${files.length > 0 ? 'bg-white border-emerald-100' : 'bg-white border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50/30'}
                        `}>
                            <input
                                type="file"
                                multiple
                                accept=".docx,.pdf,.html,.htm,.txt,.md"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="h-8 w-8 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-neutral-900">Choose documents to convert</p>
                                    <p className="text-sm text-neutral-400 mt-1">DOCX, PDF, HTML, TXT (Max {MAX_FILES} files)</p>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
                                <div className="px-6 py-4 bg-neutral-50/50 border-b border-neutral-100 flex justify-between items-center">
                                    <span className="text-sm font-bold text-neutral-700">{files.length} Files Selected</span>
                                    <span className="text-xs text-neutral-400">Total: {(totalSize / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                                <div className="divide-y divide-neutral-50">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center p-4 hover:bg-neutral-50 transition-colors group">
                                            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-4">
                                                <FileText className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-neutral-900 truncate">{file.name}</p>
                                                <p className="text-[10px] text-neutral-400">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                onClick={() => removeFile(i)}
                                                className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-neutral-50/50 border-t border-neutral-100 flex justify-center">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={uploading || files.length === 0}
                                        className="inline-flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {uploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FileType className="h-5 w-5 mr-2" />}
                                        Convert to Markdown
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center space-y-6 max-w-lg mx-auto border border-neutral-100">
                        {uploading ? (
                            <>
                                <div className="relative inline-block">
                                    <div className="h-24 w-24 rounded-full border-4 border-neutral-50 border-t-emerald-600 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-black text-emerald-600">{progress}%</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900">{jobStatus === 'UPLOADING' ? 'Uploading Files...' : 'Magic in Progress...'}</h3>
                                    <p className="text-slate-400 text-sm mt-2">Status: {jobStatus?.toLowerCase() || 'Processing'}</p>
                                </div>
                                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-600 h-full transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </>
                        ) : downloadUrl ? (
                            <div className="animate-in zoom-in duration-300">
                                <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral-900 mb-2">Conversion Complete!</h3>
                                <p className="text-neutral-500 mb-8">Your Markdown file is ready. It will be automatically deleted in 1 hour.</p>
                                <div className="flex flex-col space-y-3">
                                    <a
                                        href={downloadUrl}
                                        download="output.md"
                                        className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                    >
                                        <Download className="h-5 w-5 mr-3" />
                                        Download Markdown
                                    </a>
                                    <button
                                        onClick={() => {
                                            setFiles([]);
                                            setJobId(null);
                                            setDownloadUrl(null);
                                            setError(null);
                                        }}
                                        className="text-sm text-neutral-400 hover:text-neutral-600 font-medium underline"
                                    >
                                        Convert another file
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* FAQ / Info */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
                        <h3 className="font-bold text-neutral-900 mb-3 flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
                            Supported Formats
                        </h3>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            We support Word (.docx), PDF (text-based), HTML documents, and plain TXT files.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
                        <h3 className="font-bold text-neutral-900 mb-3 flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
                            Clean Markdown
                        </h3>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Outputs are optimized for CommonMark, removing unnecessary styling while preserving headings and lists.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
