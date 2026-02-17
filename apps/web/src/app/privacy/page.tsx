export default function PrivacyPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center text-blue-600">Privacy Policy</h1>

                <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">1. Information We Collect</h2>
                        <p>
                            We collect information necessary to provide our services, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Account information (email, name) when you register.</li>
                            <li>OAuth profiles (from Google or Facebook) if you choose to sign in using those services.</li>
                            <li>Usage data to help us improve the performance and reliability of our tools.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">2. File Data Handling</h2>
                        <p>
                            We understand the sensitive nature of your files. Files uploaded for processing are stored temporarily and are automatically deleted after a short period. We do not inspect the contents of your files unless required for automated processing or by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">3. Cookies and Advertising</h2>
                        <p>
                            We use cookies to maintain your session and remember your preferences.
                        </p>
                        <div className="bg-blue-50/50 p-4 rounded-xl mt-4 border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-2">Google AdSense Disclosure</h3>
                            <p className="text-sm text-blue-700 leading-relaxed">
                                We use Google AdSense to serve ads on our website. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.
                                <br /><br />
                                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Ad Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="underline font-medium">www.aboutads.info</a>.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">4. Third-Party Services</h2>
                        <p>
                            We use Neo DB for database storage, Redis for queuing, and Backblaze B2 for temporary file storage. These services have their own privacy policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">5. Your Rights</h2>
                        <p>
                            You have the right to access, update, or delete your account information at any time. If you wish to delete your data completely, please contact us or use the account settings page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us through our official channels.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-gray-100 text-sm italic text-gray-400">
                        Last Updated: February 17, 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
