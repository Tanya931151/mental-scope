import { useState, useEffect } from 'react';
import { Phone, MessageSquare, Heart, Wind, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Emergency() {
    const [breathingPhase, setBreathingPhase] = useState('inhale');
    const [breathingCount, setBreathingCount] = useState(4);
    const [isBreathing, setIsBreathing] = useState(false);

    useEffect(() => {
        if (!isBreathing) return;

        const interval = setInterval(() => {
            setBreathingCount((prev) => {
                if (prev === 1) {
                    setBreathingPhase((phase) => {
                        if (phase === 'inhale') return 'hold';
                        if (phase === 'hold') return 'exhale';
                        return 'inhale';
                    });
                    return 4;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isBreathing]);

    const helplines = [
        {
            name: 'National Suicide Prevention Lifeline',
            number: '988',
            description: '24/7 free and confidential support',
            color: 'from-red-400 to-rose-500',
        },
        {
            name: 'Crisis Text Line',
            number: 'Text HOME to 741741',
            description: 'Free 24/7 crisis support via text',
            color: 'from-blue-400 to-indigo-500',
        },
        {
            name: 'SAMHSA National Helpline',
            number: '1-800-662-4357',
            description: 'Treatment referral and information',
            color: 'from-purple-400 to-violet-500',
        },
    ];

    const groundingSteps = [
        '5 things you can see',
        '4 things you can touch',
        '3 things you can hear',
        '2 things you can smell',
        '1 thing you can taste',
    ];

    const affirmations = [
        'This feeling is temporary',
        'I am safe right now',
        'I have survived difficult moments before',
        'I am worthy of help and support',
        'One breath at a time',
    ];

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full mb-3 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Immediate Support Available</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                        Emergency Help
                    </h1>
                    <p className="text-gray-600">You're not alone. Help is available 24/7</p>
                </motion.div>

                {/* Crisis Helplines */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Phone className="w-6 h-6 text-red-600" />
                        Crisis Helplines
                    </h2>

                    <div className="space-y-4">
                        {helplines.map((helpline, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="helpline-card"
                            >
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{helpline.name}</h3>
                                <p className="text-2xl font-bold text-red-700 mb-2">{helpline.number}</p>
                                <p className="text-sm text-gray-700 mb-3">{helpline.description}</p>
                                <a href={`tel:${helpline.number.replace(/[^0-9]/g, '')}`}>
                                    <button className="btn-emergency flex items-center gap-2">
                                        <Phone className="w-5 h-5" />
                                        Call Now
                                    </button>
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Breathing Exercise */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card mb-8 text-center"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                        <Wind className="w-6 h-6 text-purple-600" />
                        Breathing Exercise
                    </h2>
                    <p className="text-gray-600 mb-6">Follow the circle to calm your mind</p>

                    <div className="flex flex-col items-center gap-6">
                        <div
                            className={`breathing-circle ${breathingPhase === 'inhale' ? 'inhale' : breathingPhase === 'exhale' ? 'exhale' : ''}`}
                            style={{
                                transition: 'transform 1s ease-in-out',
                            }}
                        >
                            <div>
                                <div className="text-3xl font-bold mb-2 capitalize">{breathingPhase}</div>
                                {isBreathing && <div className="text-5xl">{breathingCount}</div>}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsBreathing(!isBreathing)}
                            className={isBreathing ? 'btn-secondary' : 'btn-primary'}
                        >
                            {isBreathing ? 'Stop' : 'Start Breathing Exercise'}
                        </button>

                        <p className="text-sm text-gray-500">
                            Inhale for 4 seconds, hold for 4, exhale for 4
                        </p>
                    </div>
                </motion.div>

                {/* Grounding Technique */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="card mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">5-4-3-2-1 Grounding Technique</h2>
                    <p className="text-gray-600 mb-4">
                        Use your senses to ground yourself in the present moment:
                    </p>

                    <div className="space-y-3">
                        {groundingSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="flex items-center gap-3 p-3 bg-white/60 rounded-lg"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {5 - index}
                                </div>
                                <span className="text-gray-700 font-medium">{step}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Affirmations */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="card"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-pink-600" fill="currentColor" />
                        Calming Affirmations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {affirmations.map((affirmation, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg text-center"
                            >
                                <p className="text-gray-800 font-medium">{affirmation}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom Notice */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-gray-600">
                        💙 Remember: Reaching out for help is a sign of strength, not weakness.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
