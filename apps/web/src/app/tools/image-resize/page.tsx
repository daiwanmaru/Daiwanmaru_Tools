'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Upload,
    ImageIcon,
    X,
    Maximize2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    Download,
    Settings,
    ArrowRight,
    Lock,
    Unlock,
    Plus,
    Image as ImageIconLucide
} from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function ImageResizePage() {
    const { data: session, status } = useSession();

    const [step, setStep] = useState<'upload' | 'settings' | 'processing'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrls, setDownloadUrls] = useState<Array<{ name: string; url: string }>>([]);

    // Resize Settings
    const [resizeMode, setResizeMode] = useState<'size' | 'percentage' | 'social'>('size');
    const [width, setWidth] = useState<string>('1200');
    const [height, setHeight] = useState<string>('800');
    const [lockAspectRatio, setLockAspectRatio] = useState(true);
    const [targetFileSize, setTargetFileSize] = useState<string>('');
    const [format, setFormat] = useState<string>('original');

    // Limits
    const isPro = session?.user?.plan === 'PRO';
    const MAX_FILES = isPro ? 20 : 5;
    const MAX_TOTAL_SIZE = (isPro ? 50 : 10) * 1024 * 1024;

    useEffect(() => {
        // Generate previews
        if (files.length > 0) {
            const urls = files.map(f => URL.createObjectURL(f));
            setPreviews(urls);
            return () => urls.forEach(url => URL.revokeObjectURL(url));
        }
    }, [files]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const combined = [...files, ...newFiles].slice(0, MAX_FILES);
            setFiles(combined);
            setError(null);
            if (combined.length > 0) {
                setStep('settings');
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
                        setDownloadUrls(job.downloadUrls || []);
                        setUploading(false);
                    } else if (job.status === 'FAILED') {
                        clearInterval(interval);
                        setError(job.errorMessage || 'Resize failed');
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

        setUploading(true);
        setStep('processing');
        setError(null);
        setProgress(5);
        setJobStatus('INITIALIZING');

        try {
            const toolsRes = await fetch('/api/tools');
            const tools = await toolsRes.json();
            const tool = tools.find((t: any) => t.slug === 'image-resize');
            if (!tool) throw new Error('Tool not found');

            const createRes = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toolId: tool.id,
                    params: {
                        width: parseInt(width) || undefined,
                        height: parseInt(height) || undefined,
                        lockAspectRatio,
                        targetFileSize: targetFileSize ? parseInt(targetFileSize) : undefined,
                        format
                    },
                    files: files.map(f => ({ name: f.name, contentType: f.type }))
                })
            });

            if (!createRes.ok) throw new Error('Failed to initialize job');
            const { jobId, uploadUrls } = await createRes.json();
            setJobId(jobId);
            setJobStatus('UPLOADING');

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
                    <span className="text-neutral-600">Image Resize</span>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-4">Image Resize & 圖片縮放</h1>
                    <p className="text-neutral-500 max-w-xl mx-auto uppercase tracking-[0.2em] text-[10px] font-bold">
                        Professional image processing utilities.
                    </p>
                </div>

                {step === 'upload' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="relative group border-4 border-dashed rounded-3xl p-20 transition-all duration-300 bg-white border-neutral-200 hover:border-blue-400 hover:bg-blue-50/30">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="p-6 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="h-10 w-10 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-neutral-900">Drop images here or click to upload</p>
                                    <p className="text-sm text-neutral-400 mt-2">JPG, PNG, WebP (Max {MAX_FILES} files)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'settings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Preview Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8">
                                <section className="mb-8 flex justify-between items-center px-2">
                                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Image Previews</h3>
                                    <span className="text-[10px] font-bold text-blue-600">{files.length} SELECTED</span>
                                </section>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {files.map((file, i) => (
                                        <div key={i} className="group relative bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100 hover:border-blue-200 transition-all">
                                            <div className="aspect-square relative flex items-center justify-center p-4">
                                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    <button onClick={() => removeFile(i)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:text-red-600 transition-colors">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <img src={previews[i]} alt={file.name} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                                            </div>
                                            <div className="px-4 py-3 bg-white border-t border-neutral-50">
                                                <p className="text-[10px] font-bold text-neutral-500 truncate mb-1 uppercase tracking-wider">{file.name}</p>
                                                <div className="flex items-center text-[10px] font-bold text-blue-600">
                                                    <span>{width || '?'} × {height || '?'} PX</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                                        <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        <Plus className="h-6 w-6 text-neutral-400 group-hover:text-blue-600 transition-transform group-hover:scale-110" />
                                        <span className="text-[10px] font-bold text-neutral-400 mt-2 uppercase tracking-widest group-hover:text-blue-600">Add More</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Settings sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8">
                                <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center">
                                    <Settings className="h-5 w-5 mr-3 text-blue-600" />
                                    Resize Options
                                </h3>

                                <div className="space-y-6">
                                    <div className="bg-neutral-50 p-1 rounded-xl flex">
                                        {[
                                            { id: 'size', label: 'Size' },
                                            { id: 'percentage', label: '%' },
                                            { id: 'social', label: 'Social' }
                                        ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setResizeMode(mode.id as any)}
                                                className={`flex-1 py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${resizeMode === mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Width</label>
                                            <input
                                                type="text"
                                                value={width}
                                                onChange={e => setWidth(e.target.value)}
                                                className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Height</label>
                                            <input
                                                type="text"
                                                value={height}
                                                onChange={e => setHeight(e.target.value)}
                                                className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                                        className="flex items-center text-[10px] font-bold text-neutral-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                                    >
                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center mr-2 transition-colors ${lockAspectRatio ? 'bg-blue-600 border-blue-600' : 'border-neutral-300'}`}>
                                            {lockAspectRatio && <CheckCircle2 className="h-2 w-2 text-white" />}
                                        </div>
                                        Lock Aspect Ratio
                                    </button>

                                    <div className="pt-4 border-t border-neutral-50">
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95"
                                        >
                                            Resize Images
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
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
                                    <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-[0.1em]">{jobStatus?.toLowerCase().replace('_', ' ') || 'Processing'}</h3>
                                    <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest italic">Optimizing and resizing...</p>
                                </div>
                                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-500 shadow-sm" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        ) : downloadUrls.length > 0 ? (
                            <div className="animate-in zoom-in duration-300 space-y-8">
                                <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-neutral-900">Success!</h2>
                                <div className="space-y-3 pt-4">
                                    {downloadUrls.map((file, i) => (
                                        <a
                                            key={i}
                                            href={file.url}
                                            download={file.name}
                                            className="w-full flex items-center justify-between p-5 bg-neutral-50 hover:bg-neutral-100 rounded-2xl transition-all border border-neutral-100 group"
                                        >
                                            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest truncate pr-4">{file.name}</span>
                                            <Download className="h-5 w-5 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        </a>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setStep('upload');
                                            setFiles([]);
                                            setDownloadUrls([]);
                                            setError(null);
                                        }}
                                        className="inline-block mt-12 text-[10px] font-bold text-neutral-400 hover:text-blue-600 uppercase tracking-[0.3em] transition-all underline decoration-1 underline-offset-[12px]"
                                    >
                                        Resize more images
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
