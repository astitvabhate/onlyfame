import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen gradient-animated">
            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <span className="text-xl font-bold">⭐</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                                ONLYFAME
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/auth/login" className="btn btn-ghost">
                                Log In
                            </Link>
                            <Link href="/auth/register" className="btn btn-primary">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-sm text-primary-300">Trusted by 500+ casting professionals</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                                Your Talent Deserves
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-accent-400 bg-clip-text text-transparent">
                                Real Opportunities
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
                            ONLYFAME connects aspiring actors with verified casting directors.
                            No random DMs. No WhatsApp chaos. Just structured, merit-driven auditions.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link href="/auth/register?role=actor" className="btn btn-primary text-lg px-8 py-4 glow-primary">
                                <span>🎭</span> Join as Actor
                            </Link>
                            <Link href="/auth/register?role=caster" className="btn btn-secondary text-lg px-8 py-4">
                                <span>🎬</span> I&apos;m a Casting Director
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                                <div className="text-neutral-500 text-sm">Active Actors</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-1">500+</div>
                                <div className="text-neutral-500 text-sm">Casting Directors</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-1">2K+</div>
                                <div className="text-neutral-500 text-sm">Roles Filled</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Why Choose ONLYFAME?
                        </h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">
                            A transparent ecosystem where talent meets opportunity
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="card card-hover">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Verified Casting Calls</h3>
                            <p className="text-neutral-400">
                                Every casting director is verified. No fake calls, no scams.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card card-hover">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl">📹</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Video Auditions</h3>
                            <p className="text-neutral-400">
                                Record and submit audition videos based on provided sample scripts.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card card-hover">
                            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Secure Process</h3>
                            <p className="text-neutral-400">
                                Contact details are shared only after selection. Your privacy matters.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card card-hover">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Track Applications</h3>
                            <p className="text-neutral-400">
                                Real-time updates on your application status. No more guessing.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card card-hover">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Instant Notifications</h3>
                            <p className="text-neutral-400">
                                Get notified immediately when you&apos;re shortlisted or selected.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card card-hover">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                                <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Equal Visibility</h3>
                            <p className="text-neutral-400">
                                Every actor gets fair exposure. Merit decides, not connections.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Actors */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="badge badge-primary mb-4">For Actors</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Your Journey to the Screen
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                1
                            </div>
                            <h3 className="font-semibold text-white mb-2">Create Profile</h3>
                            <p className="text-neutral-500 text-sm">Add your details & 3 face angles</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                2
                            </div>
                            <h3 className="font-semibold text-white mb-2">Browse Calls</h3>
                            <p className="text-neutral-500 text-sm">Find roles that match you</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                3
                            </div>
                            <h3 className="font-semibold text-white mb-2">Submit Audition</h3>
                            <p className="text-neutral-500 text-sm">Record & upload your video</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-neutral-900">
                                ✓
                            </div>
                            <h3 className="font-semibold text-white mb-2">Get Selected</h3>
                            <p className="text-neutral-500 text-sm">Land your dream role</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="card bg-gradient-to-br from-primary-900/50 to-neutral-900 border-primary-500/20">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-neutral-400 mb-8">
                            Join thousands of actors and casting directors building the future of entertainment.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-4">
                                Create Free Account
                            </Link>
                            <Link href="/auth/login" className="btn btn-ghost text-lg">
                                Already have an account? Log in
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <span className="text-sm">⭐</span>
                            </div>
                            <span className="font-semibold text-white">ONLYFAME</span>
                        </div>
                        <p className="text-neutral-500 text-sm">
                            © 2024 ONLYFAME. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
