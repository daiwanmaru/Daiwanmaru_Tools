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
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/login');
        },
    });

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
        <div className="min-h-screen bg-[#111216] text-white">
            <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col">
                {/* Header/Nav */}
                <header className="p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center space-x-4">
                        <Link href="/tools" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X className="h-5 w-5 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold">Image Resize</h1>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    {step === 'upload' ? (
                        <div className="flex-1 flex items-center justify-center p-8 text-center">
                            <div className="max-w-xl w-full">
                                <div className="relative group border-2 border-dashed border-white/10 rounded-[32px] p-24 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center space-y-6">
                                        <div className="p-6 bg-blue-500/10 rounded-3xl group-hover:scale-110 transition-transform">
                                            <Upload className="h-10 w-10 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">Upload your images</p>
                                            <p className="text-gray-500 mt-2">Maximum {MAX_FILES} files, up to {isPro ? '50MB' : '10MB'} total</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : step === 'settings' ? (
                        <>
                            {/* Left Settings Sidebar */}
                            <aside className="w-[320px] bg-[#1a1b1f] border-r border-white/5 overflow-y-auto p-6 flex flex-col">
                                <section className="mb-10">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Resize Settings</h3>

                                    <div className="bg-[#111216] p-1 rounded-xl flex mb-8">
                                        {[
                                            { id: 'size', label: 'By Size' },
                                            { id: 'percentage', label: 'As %' },
                                            { id: 'social', label: 'Social' }
                                        ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setResizeMode(mode.id as any)}
                                                className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${resizeMode === mode.id ? 'bg-[#2a2b2f] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Width</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={width}
                                                    onChange={e => setWidth(e.target.value)}
                                                    className="w-full bg-[#111216] border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Height</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={height}
                                                    onChange={e => setHeight(e.target.value)}
                                                    className="w-full bg-[#111216] border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                                        className="flex items-center text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors ${lockAspectRatio ? 'bg-blue-600 border-blue-600' : 'border-white/10'}`}>
                                            {lockAspectRatio ? <Lock className="h-2 w-2 text-white" /> : <Unlock className="h-2 w-2" />}
                                        </div>
                                        Lock Aspect Ratio
                                    </button>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Export Settings</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Target File Size (Optional)</label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="KB"
                                                    value={targetFileSize}
                                                    onChange={e => setTargetFileSize(e.target.value)}
                                                    className="flex-1 bg-[#111216] border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500"
                                                />
                                                <div className="bg-[#111216] px-4 py-3 rounded-xl border border-white/5 text-xs font-bold text-gray-500">KB</div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Save Image As</label>
                                            <select
                                                value={format}
                                                onChange={e => setFormat(e.target.value)}
                                                className="w-full bg-[#111216] border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 appearance-none transition-colors"
                                            >
                                                <option value="original">Original Format</option>
                                                <option value="jpg">JPG</option>
                                                <option value="png">PNG</option>
                                                <option value="webp">WebP</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <div className="mt-auto">
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center"
                                    >
                                        Export
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                            </aside>

                            {/* Main Content Area */}
                            <div className="flex-1 bg-[#111216] p-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {files.map((file, i) => (
                                        <div key={i} className="group relative bg-[#1a1b1f] rounded-[24px] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all shadow-xl">
                                            <div className="aspect-square relative flex items-center justify-center p-4">
                                                {/* Tool overlay */}
                                                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                    <button className="p-2 bg-black/50 backdrop-blur-md rounded-lg hover:bg-blue-600 text-white"><Maximize2 className="h-4 w-4" /></button>
                                                    <button onClick={() => removeFile(i)} className="p-2 bg-black/50 backdrop-blur-md rounded-lg hover:bg-red-600 text-white"><X className="h-4 w-4" /></button>
                                                </div>

                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={previews[i]} alt={file.name} className="max-w-full max-h-full object-contain rounded-lg" />
                                            </div>
                                            <div className="px-5 py-4 bg-[#1a1b1f] border-t border-white/5">
                                                <p className="text-xs font-bold truncate mb-3">{file.name}</p>
                                                <div className="flex items-center space-x-2">
                                                    <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-500">Original</div>
                                                    <ArrowRight className="h-3 w-3 text-gray-600" />
                                                    <div className="px-2 py-1 bg-blue-500/10 rounded text-[10px] font-black text-blue-500">{width} × {height}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[24px] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer group">
                                        <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        <div className="p-5 bg-[#1a1b1f] rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                                            <Plus className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">Add more</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="max-w-md w-full bg-[#1a1b1f] rounded-[32px] p-12 border border-white/5 text-center">
                                {uploading ? (
                                    <div className="space-y-8">
                                        <div className="relative inline-block">
                                            <div className="h-32 w-32 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-blue-500">{progress}%</div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">{jobStatus?.toLowerCase().replace('_', ' ') || 'Resizing'}</h3>
                                            <p className="text-gray-500 text-sm">Please hold on while we process your images.</p>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                ) : downloadUrls.length > 0 ? (
                                    <div className="space-y-8 animate-in zoom-in duration-300">
                                        <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black mb-2 tracking-tight">Success!</h3>
                                            <p className="text-gray-500">All images have been resized successfully.</p>
                                        </div>
                                        <div className="space-y-3 pt-4">
                                            {downloadUrls.map((file, i) => (
                                                <a
                                                    key={i}
                                                    href={file.url}
                                                    download={file.name}
                                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-blue-500/30"
                                                >
                                                    <span className="text-sm font-bold truncate pr-4">{file.name}</span>
                                                    <Download className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                </a>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setStep('upload');
                                                    setFiles([]);
                                                    setDownloadUrls([]);
                                                    setError(null);
                                                }}
                                                className="block w-full text-center text-gray-500 text-xs font-bold uppercase tracking-widest mt-8 hover:text-white transition-colors"
                                            >
                                                Resize more images
                                            </button>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="space-y-6">
                                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                                        <p className="text-red-400 font-bold">{error}</p>
                                        <button onClick={() => setStep('settings')} className="text-blue-500 font-bold">Try again</button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style jsx global>{`
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
