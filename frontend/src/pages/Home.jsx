import { Link } from 'react-router-dom';
import { MessageCircle, Heart, BookOpen, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const quickActions = [
        {
            title: 'AI Chat Support',
            description: 'Talk to our empathetic AI companion',
            icon: MessageCircle,
            path: '/chat',
            gradient: 'from-purple-400 to-indigo-500',
        },
        {
            title: 'Track Your Mood',
            description: 'Log how you\'re feeling today',
            icon: Heart,
            path: '/mood',
            gradient: 'from-pink-400 to-rose-500',
        },
        {
            title: 'Journal',
            description: 'Write your thoughts and reflections',
            icon: BookOpen,
            path: '/journal',
            gradient: 'from-blue-400 to-cyan-500',
        },
        {
            title: 'Emergency Help',
            description: 'Get immediate support and resources',
            icon: AlertCircle,
            path: '/emergency',
            gradient: 'from-red-400 to-orange-500',
        },
    ];

    const quotes = [
        "You are stronger than you think 💪",
        "Every day is a fresh start 🌅",
        "Your mental health matters 💙",
        "Be kind to yourself today 🌸",
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return (
        <div className="min-h-screen">
            <div className="container-custom py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-4 shadow-sm">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Your Mental Wellness Companion</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Welcome to MentalScope
                    </h1>

                    <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-6">
                        Your safe space for mental wellness, self-reflection, and emotional support
                    </p>

                    {/* Daily Quote */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="card max-w-md mx-auto mb-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-lg font-medium text-gray-800">{randomQuote}</p>
                        </div>
                    </motion.div>

                    {/* Quick Check-in Button */}
                    <Link to="/mood">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                        >
                            <Heart className="w-5 h-5" />
                            Quick Mood Check-in
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <motion.div
                                key={action.path}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index, duration: 0.5 }}
                            >
                                <Link to={action.path}>
                                    <div className="card h-full hover:scale-105 transition-transform cursor-pointer">
                                        <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{action.title}</h3>
                                        <p className="text-gray-600">{action.description}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="card-compact text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
                        <div className="text-gray-600">AI Support Available</div>
                    </div>
                    <div className="card-compact text-center">
                        <div className="text-3xl font-bold text-indigo-600 mb-1">100%</div>
                        <div className="text-gray-600">Private & Confidential</div>
                    </div>
                    <div className="card-compact text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">∞</div>
                        <div className="text-gray-600">Unlimited Journaling</div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center mt-12"
                >
                    <div className="card max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">New to MentalScope?</h2>
                        <p className="text-gray-600 mb-6">
                            Create an account to save your progress, track your mood over time, and access personalized insights.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link to="/signup">
                                <button className="btn-primary">Get Started Free</button>
                            </Link>
                            <Link to="/login">
                                <button className="btn-secondary">Sign In</button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
