import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Wind, Sun, Moon, Volume2 } from 'lucide-react';

export default function Meditation() {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale
    const [breatheKey, setBreatheKey] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Box breathing cycle simulation
    useEffect(() => {
        if (!isActive) return;

        const cycle = setInterval(() => {
            setPhase(prev => {
                if (prev === 'Inhale') return 'Hold';
                if (prev === 'Hold') return 'Exhale';
                return 'Inhale';
            });
            setBreatheKey(k => k + 1);
        }, 4000);

        return () => clearInterval(cycle);
    }, [isActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="min-h-screen pb-20">
            <div className="container-custom py-12 md:py-20 max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">Guided Breathing</h1>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight">Center Your Self</h2>
                        <p className="mt-4 text-gray-600 font-medium">Follow the rhythm. Find your peace.</p>
                    </motion.div>
                </header>

                <div className="flex flex-col items-center">
                    {/* Breathing Circle */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={breatheKey}
                                initial={{ scale: phase === 'Inhale' ? 0.8 : 1.2, opacity: 0.3 }}
                                animate={{ scale: phase === 'Inhale' ? 1.2 : 0.8, opacity: 1 }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className={`absolute inset-0 rounded-full blur-2xl ${phase === 'Inhale' ? 'bg-blue-400' : phase === 'Hold' ? 'bg-purple-400' : 'bg-teal-400'
                                    } opacity-20`}
                            />
                        </AnimatePresence>

                        <motion.div
                            animate={{
                                scale: isActive ? (phase === 'Inhale' ? 1.4 : phase === 'Exhale' ? 1 : 1.4) : 1
                            }}
                            transition={{ duration: 4, ease: "easeInOut" }}
                            className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white border-8 border-white shadow-2xl flex flex-col items-center justify-center relative z-10"
                        >
                            <Wind className={`w-8 h-8 mb-2 transition-colors duration-1000 ${isActive ? 'text-blue-500' : 'text-gray-300'
                                }`} />
                            <span className="text-xl font-black text-gray-900 tracking-tight">
                                {isActive ? phase : 'Ready?'}
                            </span>
                        </motion.div>
                    </div>

                    {/* Timer */}
                    <div className="text-6xl font-black text-gray-900 tracking-tighter mb-12 tabular-nums">
                        {formatTime(timeLeft)}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => { setTimeLeft(300); setIsActive(false); }}
                            className="p-4 bg-gray-100 text-gray-600 rounded-3xl hover:bg-gray-200 transition-all"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </button>

                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95 ${isActive ? 'bg-rose-50 text-rose-600' : 'bg-blue-600 text-white'
                                }`}
                        >
                            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>

                        <button className="p-4 bg-gray-100 text-gray-600 rounded-3xl hover:bg-gray-200 transition-all">
                            <Volume2 className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Presets */}
                    <div className="mt-16 flex gap-3">
                        {[
                            { label: 'Relax', time: 300, icon: Moon, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Energy', time: 180, icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Quick', time: 60, icon: Wind, color: 'text-teal-600', bg: 'bg-teal-50' }
                        ].map((p, i) => (
                            <button
                                key={i}
                                onClick={() => { setTimeLeft(p.time); setIsActive(false); }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 bg-white`}
                            >
                                <p.icon className={`w-4 h-4 ${p.color}`} />
                                <span className="text-sm font-bold text-gray-700">{p.label} - {p.time / 60}m</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
