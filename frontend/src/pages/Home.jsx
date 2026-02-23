import { Link } from 'react-router-dom';
import { MessageCircle, Heart, BookOpen, AlertCircle, Sparkles, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
    const [greeting, setGreeting] = useState('');
    const [userName] = useState('Tanya'); // Can be dynamic from auth later

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    const quickActions = [
        {
            title: 'AI Companion',
            description: 'Speak with our empathetic AI for support',
            icon: MessageCircle,
            path: '/chat',
            iconColor: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            title: 'Mood Flow',
            description: 'Check in with your inner self',
            icon: Heart,
            path: '/mood',
            iconColor: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            title: 'Deep Journal',
            description: 'Reflect on your thoughts safely',
            icon: BookOpen,
            path: '/journal',
            iconColor: 'text-teal-600',
            bg: 'bg-teal-50',
        },
        {
            title: 'Emergency',
            description: 'Immediate mental health resources',
            icon: AlertCircle,
            path: '/emergency',
            iconColor: 'text-rose-600',
            bg: 'bg-rose-50',
        },
    ];

    const quotes = [
        "In the middle of every difficulty lies opportunity.",
        "Your mental health is a priority. Your happiness is an essential.",
        "Take a deep breath. It's just a bad day, not a bad life.",
        "You don't have to see the whole staircase, just take the first step.",
    ];

    const [randomQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

    return (
        <div className="min-h-screen pb-20">
            <div className="container-custom py-12 md:py-20">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center mb-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/60 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold tracking-wider uppercase text-purple-700">AI Wellness Assistant</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                    >
                        Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">inner calm</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-xl text-gray-600 max-w-2xl mb-12 font-medium leading-relaxed"
                    >
                        MentalScope uses advanced AI to help you understand your emotions,
                        track your wellness journey, and build lasting resilience.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex gap-4 flex-wrap justify-center"
                    >
                        <Link to="/chat">
                            <button className="btn-primary flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Start a Conversation
                            </button>
                        </Link>
                        <Link to="/mood">
                            <button className="btn-secondary">Explore Moods</button>
                        </Link>
                    </motion.div>
                </div>

                {/* Daily Mindfulness Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="max-w-4xl mx-auto mb-20"
                >
                    <div className="card text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-200 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-blue-200 transition-colors" />

                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-purple-600 mb-4 tracking-widest uppercase">Daily Reflection</h3>
                            <blockquote className="text-2xl md:text-3xl font-medium text-gray-800 italic leading-relaxed mb-6 px-4">
                                "{randomQuote}"
                            </blockquote>
                            <div className="flex justify-center">
                                <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <motion.div
                                key={action.path}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 * index + 0.8, duration: 0.6 }}
                            >
                                <Link to={action.path}>
                                    <div className="card h-full p-8 flex flex-col items-center text-center">
                                        <div className={`p-4 rounded-2xl ${action.bg} mb-6 transition-transform group-hover:rotate-6`}>
                                            <Icon className={`w-8 h-8 ${action.iconColor}`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{action.title}</h3>
                                        <p className="text-gray-600 font-medium text-sm leading-relaxed">
                                            {action.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Integration Spotlight */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="rounded-[40px] bg-white border border-white/40 p-12 md:p-20 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                Intelligence meets <br />
                                <span className="text-purple-600">compassion</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 font-medium">
                                Our AI system doesn't just process data—it's designed to recognize
                                emotional nuances and provide the support you need, when you need it.
                            </p>
                            <ul className="space-y-4">
                                {['Emotion Recognition', 'Wellness Analytics', 'Confidential Support'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-gray-800 font-semibold">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative">
                                <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-50 rounded-full animate-pulse shadow-inner" />
                                <Sparkles className="w-16 h-16 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
