import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Quote } from 'lucide-react';

export default function MindfulnessCard({ compact = false }) {
    const [isVisible, setIsVisible] = useState(true);
    const [quote, setQuote] = useState('');

    const quotes = [
        "Your mind is like water. When it is agitated, it becomes difficult to see. But if you allow it to settle, the answer becomes clear.",
        "The present moment is the only time over which we have dominion.",
        "You are the sky. Everything else—it's just the weather.",
        "Quiet the mind, and the soul will speak.",
        "Feelings are just visitors, let them come and go."
    ];

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    if (!isVisible) return null;

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group"
            >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-200" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-100">Daily Wisdom</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed pr-4 italic">
                        "{quote}"
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card border-none relative bg-white/40 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 z-20">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 py-4">
                        <div className="w-20 h-20 bg-purple-50 rounded-[32px] flex items-center justify-center flex-shrink-0 group shadow-sm transition-transform hover:rotate-12">
                            <Quote className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-purple-600 mb-2">Mindful Moment</h3>
                            <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed italic">
                                "{quote}"
                            </p>
                        </div>
                    </div>

                    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
