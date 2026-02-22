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
    const { data: session, status } = useSession();

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
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href="/tools" className="hover:text-blue-600 transition-colors">Tools</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-neutral-600">Markdown Converter</span>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-4">Markdown Converter & 標記轉換</h1>
                    <p className="text-neutral-500 max-w-xl mx-auto uppercase tracking-[0.2em] text-[10px] font-bold">
                        Convert documents to clean markdown structure.
                    </p>
                </div>

                {!jobId || error ? (
                    <div className="space-y-8">
                        {/* Options */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100 flex flex-wrap gap-8 justify-center">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${extractImages ? 'bg-blue-600 border-blue-600' : 'border-neutral-300'}`}>
                                    {extractImages && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={extractImages}
                                    onChange={(e) => setExtractImages(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-blue-600 transition-colors">Extract Images</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${frontMatter ? 'bg-blue-600 border-blue-600' : 'border-neutral-300'}`}>
                                    {frontMatter && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={frontMatter}
                                    onChange={(e) => setFrontMatter(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-blue-600 transition-colors">Include Front Matter</span>
                            </label>
                        </div>

                        {/* Upload Zone */}
                        <div className={`
                            relative group border-4 border-dashed rounded-[2.5rem] p-16 transition-all duration-300
                            ${files.length > 0 ? 'bg-white border-blue-100' : 'bg-white border-neutral-200 hover:border-blue-400 hover:bg-blue-50/30'}
                        `}>
                            <input
                                type="file"
                                multiple
                                accept=".docx,.pdf,.html,.htm,.txt,.md"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="p-5 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-neutral-900">Choose documents to convert</p>
                                    <p className="text-sm text-neutral-400 mt-1">DOCX, PDF, HTML, TXT (Max {MAX_FILES} files)</p>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
                                <div className="px-8 py-5 bg-neutral-50/50 border-b border-neutral-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{files.length} Files Selected</span>
                                    <span className="text-[10px] font-bold text-blue-600">Total: {(totalSize / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                                <div className="divide-y divide-neutral-50">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center px-8 py-5 hover:bg-neutral-50 transition-colors group">
                                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-neutral-900 truncate">{file.name}</p>
                                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">{(file.size / 1024).toFixed(1)} KB</p>
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
                                <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 flex justify-center">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={uploading || files.length === 0}
                                        className="inline-flex items-center justify-center px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {uploading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <FileType className="h-5 w-5 mr-3" />}
                                        Convert Documents
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100">
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-16 text-center space-y-8 max-w-lg mx-auto border border-neutral-100">
                        {uploading ? (
                            <div className="space-y-8">
                                <div className="relative inline-block">
                                    <div className="h-24 w-24 rounded-full border-4 border-neutral-50 border-t-blue-600 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-black text-blue-600">{progress}%</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-neutral-900 uppercase tracking-[0.1em]">{jobStatus === 'UPLOADING' ? 'Uploading...' : 'Converting...'}</h3>
                                    <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-2">Magic in progress</p>
                                </div>
                                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-500 ease-out shadow-sm"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : downloadUrl ? (
                            <div className="animate-in zoom-in duration-300">
                                <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                </div>
                                <h3 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">Success!</h3>
                                <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-10">Your markdown is ready</p>
                                <div className="flex flex-col space-y-4">
                                    <a
                                        href={downloadUrl}
                                        download="output.md"
                                        className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-200 transition-all active:scale-95 group"
                                    >
                                        <Download className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                                        Download Markdown
                                    </a>
                                    <button
                                        onClick={() => {
                                            setFiles([]);
                                            setJobId(null);
                                            setDownloadUrl(null);
                                            setError(null);
                                        }}
                                        className="inline-block mt-8 text-[10px] font-bold text-neutral-400 hover:text-blue-600 uppercase tracking-[0.3em] transition-all underline decoration-1 underline-offset-[12px]"
                                    >
                                        Convert another file
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
                {/* FAQ / Info */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-900 mb-4 flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 mr-2" />
                            Supported Formats
                        </h3>
                        <p className="text-xs text-neutral-500 leading-relaxed font-bold uppercase tracking-wider">
                            Word (.docx), PDF, HTML, and plain TXT.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-900 mb-4 flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 mr-2" />
                            Clean Output
                        </h3>
                        <p className="text-xs text-neutral-500 leading-relaxed font-bold uppercase tracking-wider">
                            Optimized for CommonMark with semantic structures.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
