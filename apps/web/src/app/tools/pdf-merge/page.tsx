'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Upload,
    FileIcon,
    X,
    ArrowUp,
    ArrowDown,
    Plus,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Monitor,
    FileCode,
    FileType,
    ChevronRight,
    Download,
    Settings,
    Layout,
    ArrowRight
} from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function PdfMergePage() {
    const { data: session, status } = useSession();

    const [step, setStep] = useState<'upload' | 'edit' | 'processing'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // Options
    const [pageSize, setPageSize] = useState<'A4' | 'original'>('A4');
    const [outputName, setOutputName] = useState('merged.pdf');

    // Limits
    const isPro = session?.user?.plan === 'PRO';
    const MAX_FILES = isPro ? 20 : 10;
    const MAX_TOTAL_SIZE = (isPro ? 50 : 20) * 1024 * 1024;

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const combined = [...files, ...newFiles].slice(0, MAX_FILES);
            setFiles(combined);
            setError(null);
            if (combined.length > 0) {
                setStep('edit');
            }
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (newFiles.length === 0) {
            setStep('upload');
        }
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= files.length) return;

        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
        setFiles(newFiles);
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
                        setError(job.errorMessage || 'Merge failed');
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
        setStep('processing');
        setError(null);
        setProgress(5);
        setJobStatus('INITIALIZING');

        try {
            // 1. Get Tool ID
            const toolsRes = await fetch('/api/tools');
            const tools = await toolsRes.json();
            const tool = tools.find((t: any) => t.slug === 'pdf-merge');
            if (!tool) throw new Error('Tool not found. Please seed database.');

            // 2. Create Job
            const createRes = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toolId: tool.id,
                    params: { pageSize, outputName },
                    files: files.map(f => ({ name: f.name, contentType: f.type }))
                })
            });

            if (!createRes.ok) throw new Error('Failed to initialize job');
            const { jobId, uploadUrls } = await createRes.json();
            setJobId(jobId);
            setJobStatus('UPLOADING');

            // 3. Upload Files
            let completed = 0;
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
                completed++;
                setProgress(Math.round(5 + (completed / files.length) * 25));
            }));

            // 4. Start Processing
            setJobStatus('QUEUED');
            const processRes = await fetch(`/api/jobs/${jobId}/process`, { method: 'POST' });
            if (!processRes.ok) throw new Error('Failed to start processing');

            pollStatus(jobId);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setUploading(false);
        }
    };

    if (status === 'loading') return null;

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-xs font-medium text-neutral-400 mb-8">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href="/tools" className="hover:text-blue-600 transition-colors">Tools</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-neutral-600">PDF Merge</span>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-4">PDF Merge & 合併 PDF</h1>
                    <p className="text-neutral-500 max-w-xl mx-auto uppercase tracking-[0.2em] text-[10px] font-bold">
                        Professional document management utilities.
                    </p>
                </div>

                {step === 'upload' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="relative group border-4 border-dashed rounded-3xl p-20 transition-all duration-300 bg-white border-neutral-200 hover:border-blue-400 hover:bg-blue-50/30">
                            <input
                                type="file"
                                multiple
                                accept="application/pdf,image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="p-6 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="h-10 w-10 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-neutral-900">Drop files here or click to upload</p>
                                    <p className="text-sm text-neutral-400 mt-2">PDF, JPG, PNG, WebP (Max {MAX_FILES} files)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'edit' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* File list area */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
                                <div className="px-6 py-4 bg-neutral-50/50 border-b border-neutral-100 flex justify-between items-center">
                                    <h3 className="font-bold text-neutral-900 flex items-center">
                                        <Layout className="h-5 w-5 mr-2 text-blue-600" />
                                        Arrange Order
                                    </h3>
                                    <span className="text-xs font-medium text-neutral-400">{files.length} files selected</span>
                                </div>
                                <div className="divide-y divide-neutral-50">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center p-4 hover:bg-neutral-50 transition-colors group">
                                            <div className="flex flex-col space-y-1 mr-4">
                                                <button onClick={() => moveFile(i, 'up')} disabled={i === 0} className="p-1 text-neutral-300 hover:text-blue-600 disabled:opacity-10">
                                                    <ArrowUp className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => moveFile(i, 'down')} disabled={i === files.length - 1} className="p-1 text-neutral-300 hover:text-blue-600 disabled:opacity-10">
                                                    <ArrowDown className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center mr-4">
                                                <FileIcon className="h-6 w-6 text-neutral-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-neutral-900 truncate">{file.name}</p>
                                                <p className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">{(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]}</p>
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
                                <div className="p-6 bg-neutral-50/50 border-t border-neutral-100">
                                    <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-white transition-all group">
                                        <input type="file" multiple accept="application/pdf,image/*" onChange={handleFileSelect} className="hidden" />
                                        <Plus className="h-4 w-4 mr-2 text-neutral-400 group-hover:text-blue-600" />
                                        <span className="text-sm font-bold text-neutral-500 group-hover:text-blue-600">Add more files</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Settings area */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8">
                                <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center">
                                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                                    Merge Settings
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Page Size</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['A4', 'original'] as const).map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setPageSize(size)}
                                                    className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${pageSize === size
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                                        : 'bg-white text-neutral-600 border-neutral-100 hover:border-blue-200'
                                                        }`}
                                                >
                                                    {size.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Output Name</label>
                                        <input
                                            type="text"
                                            value={outputName}
                                            onChange={(e) => setOutputName(e.target.value)}
                                            className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={files.length < 1}
                                            className="w-full inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                                        >
                                            Merge Files
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <p className="text-sm font-bold">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-12 text-center border border-neutral-100">
                        {uploading ? (
                            <div className="space-y-8">
                                <div className="relative inline-block">
                                    <div className="h-32 w-32 rounded-full border-4 border-neutral-50 border-t-blue-600 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-black text-blue-600">{progress}%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-neutral-900 capitalize">{jobStatus?.toLowerCase().replace('_', ' ') || 'Processing'}</h3>
                                    <p className="text-neutral-400 text-sm">Please wait while we merge your files...</p>
                                </div>
                                <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-500 ease-out shadow-lg shadow-blue-200"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : downloadUrl ? (
                            <div className="animate-in zoom-in duration-300 space-y-8">
                                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-neutral-900">Done!</h3>
                                    <p className="text-neutral-500">Your merged PDF is ready for download.</p>
                                </div>
                                <div className="flex flex-col space-y-4 pt-4">
                                    <a
                                        href={downloadUrl}
                                        download={outputName}
                                        className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-xl shadow-green-200 transition-all active:scale-95"
                                    >
                                        <Download className="h-6 w-6 mr-3" />
                                        Download PDF
                                    </a>
                                    <button
                                        onClick={() => {
                                            setStep('upload');
                                            setFiles([]);
                                            setJobId(null);
                                            setDownloadUrl(null);
                                            setError(null);
                                        }}
                                        className="text-sm font-bold text-neutral-400 hover:text-neutral-600 underline"
                                    >
                                        Start a new merge
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
