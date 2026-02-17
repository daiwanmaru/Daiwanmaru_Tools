export default function TermsPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center text-blue-600">Terms of Service</h1>

                <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Daiwanmaru Tool, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">2. Description of Service</h2>
                        <p>
                            Daiwanmaru Tool provides a collection of online tools for document processing, image manipulation, video editing, and audio conversion. We reserve the right to modify or discontinue any part of the service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">3. User Conduct</h2>
                        <p>
                            You are responsible for any content you upload or process through our tools. You agree not to use the service for any illegal purposes or to upload content that infringes on third-party intellectual property rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">4. Privacy</h2>
                        <p>
                            Your use of the service is also governed by our Privacy Policy. We do not store your uploaded files longer than necessary for processing.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">5. Limitation of Liability</h2>
                        <p>
                            Daiwanmaru Tool is provided "as is" without any warranties. We shall not be liable for any damages resulting from the use or inability to use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800">6. Changes to Terms</h2>
                        <p>
                            We may update these terms from time to time. Your continued use of the service after such changes constitutes acceptance of the new terms.
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
