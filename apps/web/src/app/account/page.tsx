'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, Mail, Shield, CreditCard, LogOut, ChevronRight, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function AccountPage() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/login');
        },
    });

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    const user = session?.user;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="mt-2 text-gray-600">Manage your profile and account preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                {user?.image ? (
                                    <img src={user.image} alt="" className="h-24 w-24 rounded-full border-4 border-blue-50 shadow-inner" />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-50">
                                        <User className="h-10 w-10 text-blue-600" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Settings className="h-4 w-4 text-gray-500" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                            <p className="text-sm text-gray-500 truncate w-full px-4">{user?.email}</p>

                            <div className="mt-6 w-full pt-6 border-t border-gray-50">
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-gray-500">Current Plan</span>
                                    {/* @ts-ignore */}
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs uppercase tracking-wider">
                                        {/* @ts-ignore */}
                                        {user?.plan || 'FREE'}
                                    </span>
                                </div>
                                <button className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Upgrade to PRO
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-white text-red-600 rounded-2xl shadow-sm border border-red-50 hover:bg-red-50 transition-colors font-medium"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>

                    {/* Right Column: Detailed Settings */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <h3 className="font-semibold text-gray-900">Security & Privacy</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Email Address</p>
                                            <p className="text-xs text-gray-500">Change your primary login email</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Change Password</p>
                                            <p className="text-xs text-gray-500">Protect your account with a secure password</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-amber-400 transition-colors" />
                                </div>
                            </div>
                        </section>

                        {/* Subscription & Billing (Enhanced) */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-900">Subscription & Billing</h3>
                                </div>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Payment powered by Stripe</span>
                            </div>

                            <div className="p-6">
                                {/* Plan Comparison */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    {/* @ts-ignore */}
                                    <div className={`p-5 rounded-2xl border-2 transition-all ${user?.plan !== 'PRO' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 bg-white'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Free Explorer</h4>
                                                <p className="text-xs text-gray-500 mt-1">Perfect for casual use</p>
                                            </div>
                                            {/* @ts-ignore */}
                                            {user?.plan !== 'PRO' && <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Current</span>}
                                        </div>
                                        <div className="text-2xl font-black text-gray-900 mb-4">$0 <span className="text-xs font-normal text-gray-400">/ month</span></div>
                                        <ul className="space-y-2 mb-0">
                                            <li className="flex items-center text-xs text-gray-600">
                                                <ChevronRight className="h-3 w-3 text-blue-500 mr-1" /> Up to 5 files / day
                                            </li>
                                            <li className="flex items-center text-xs text-gray-600">
                                                <ChevronRight className="h-3 w-3 text-blue-500 mr-1" /> Basic PDF tools
                                            </li>
                                        </ul>
                                    </div>

                                    {/* @ts-ignore */}
                                    <div className={`p-5 rounded-2xl border-2 transition-all group relative overflow-hidden ${user?.plan === 'PRO' ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-indigo-200'}`}>
                                        <div className="absolute -right-4 -top-4 bg-indigo-500 text-white text-[10px] px-8 py-4 rotate-45 font-bold shadow-lg">POPULAR</div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Pro Collector</h4>
                                                <p className="text-xs text-gray-500 mt-1">For heavy creative work</p>
                                            </div>
                                            {/* @ts-ignore */}
                                            {user?.plan === 'PRO' && <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Current</span>}
                                        </div>
                                        <div className="text-2xl font-black text-indigo-600 mb-4">$9.9 <span className="text-xs font-normal text-gray-400">/ month</span></div>
                                        <ul className="space-y-2 mb-4">
                                            <li className="flex items-center text-xs text-gray-600">
                                                <ChevronRight className="h-3 w-3 text-indigo-500 mr-1" /> Unlimited file processing
                                            </li>
                                            <li className="flex items-center text-xs text-gray-600">
                                                <ChevronRight className="h-3 w-3 text-indigo-500 mr-1" /> High-speed cloud export
                                            </li>
                                            <li className="flex items-center text-xs text-gray-600">
                                                <ChevronRight className="h-3 w-3 text-indigo-500 mr-1" /> Priority 24/7 support
                                            </li>
                                        </ul>
                                        {/* @ts-ignore */}
                                        {user?.plan !== 'PRO' && (
                                            <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95">
                                                Upgrade Now
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Billing History Placeholder */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900">Billing History</h4>
                                    <div className="border border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/30">
                                        <p className="text-sm text-gray-400 font-medium italic">No invoices found</p>
                                        <p className="text-[10px] text-gray-300 mt-1">Invoices appear here after your first payment.</p>
                                    </div>
                                </div>

                                {/* Billing FAQ */}
                                <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-900">Can I cancel anytime?</p>
                                        <p className="text-[11px] text-gray-500">Yes, you can cancel your subscription at any time with one click. You will remain Pro until the end of your billing cycle.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-900">What payment methods do you accept?</p>
                                        <p className="text-[11px] text-gray-500">We accept all major credit cards, Apple Pay, and Google Pay via our secure partner Stripe.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Other */}
                        <div className="flex justify-center space-x-6 text-sm text-gray-400 font-medium pb-8">
                            <Link href="/terms" className="hover:text-gray-600 flex items-center space-x-1">
                                <span>Terms of Service</span>
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                            <Link href="/privacy" className="hover:text-gray-600 flex items-center space-x-1">
                                <span>Privacy Policy</span>
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
