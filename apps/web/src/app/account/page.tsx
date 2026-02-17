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

                        {/* Subscription */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                                <h3 className="font-semibold text-gray-900">Subscription & Billing</h3>
                            </div>
                            <div className="p-6 flex flex-col items-center justify-center text-center py-12">
                                <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                    <CreditCard className="h-8 w-8 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-gray-900">No active subscription</h4>
                                <p className="text-sm text-gray-500 max-w-xs mt-2">
                                    Unlock 10GB+ storage, unlimited conversions, and 24/7 priority support.
                                </p>
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
