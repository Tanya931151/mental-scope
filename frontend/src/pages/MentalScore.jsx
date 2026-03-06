import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, HeartPulse, Zap, Moon, CheckCircle2, ChevronRight, PieChart } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function MentalScore() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);

    // Simulated survey questions based on standard mental health index assessments
    const questions = [
        { id: 'q1', text: "How often have you felt nervous or 'on edge' this week?", options: ['Never', 'Sometimes', 'Often', 'Constantly'] },
        { id: 'q2', text: "Have you experienced sudden changes in energy levels?", options: ['Not at all', 'Slightly', 'Noticeably', 'Significantly'] },
        { id: 'q3', text: "How would you rate your overall sleep quality?", options: ['Excellent', 'Good', 'Restless', 'Poor'] },
        { id: 'q4', text: "Do you find it difficult to experience positive emotions?", options: ['Rarely', 'Occasionally', 'Frequently', 'Almost always'] },
    ];

    const handleSelect = (qId, optionIdx) => {
        const newAnswers = { ...answers, [qId]: optionIdx };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setTimeout(() => setStep(step + 1), 400);
        } else {
            calculateScore(newAnswers);
        }
    };

    const calculateScore = (finalAnswers) => {
        // Basic heuristic: optionIdx 0 is best (least symptoms), 3 is worst. 
        // Higher score overall = better mental health in this context (Max 100)
        let totalPenalty = 0;
        Object.values(finalAnswers).forEach(val => {
            totalPenalty += (val * 8); // Max penalty per question is 24
        });

        // Base 100, calculate final
        const finalScore = Math.max(12, 100 - totalPenalty);

        setTimeout(() => {
            setScore({
                total: finalScore,
                breakdown: [
                    { name: 'Stress Tolerance', value: Math.max(10, 30 - (finalAnswers.q1 * 5)), color: '#ef4444' }, // Rose
                    { name: 'Energy Levels', value: Math.max(10, 25 - (finalAnswers.q2 * 4)), color: '#f59e0b' },   // Amber
                    { name: 'Sleep Quality', value: Math.max(10, 20 - (finalAnswers.q3 * 4)), color: '#8b5cf6' },   // Purple
                    { name: 'Emotional Range', value: Math.max(10, 25 - (finalAnswers.q4 * 4)), color: '#10b981' }  // Emerald
                ]
            });
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FE] pt-28 pb-20 px-6 sm:px-12 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background blobs */}
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-4xl z-10">

                {!score && (
                    <header className="mb-12 text-center">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <h1 className="text-sm font-black text-emerald-600 tracking-[0.3em] uppercase mb-3">Clinical Assessment</h1>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                MentalScope <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Index</span>
                            </h2>
                            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
                                Answer four quick questions to generate your comprehensive Mental Health Score.
                            </p>
                        </motion.div>
                    </header>
                )}

                <AnimatePresence mode="wait">
                    {!score ? (
                        <motion.div
                            key={`q-${step}`}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-emerald-100/20 max-w-2xl mx-auto relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(step / questions.length) * 100}%` }} />
                                </div>
                                <span className="text-xs font-black text-gray-400 tracking-widest uppercase">
                                    {step + 1} / {questions.length}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-8 leading-tight">
                                {questions[step].text}
                            </h3>

                            <div className="space-y-4">
                                {questions[step].options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(questions[step].id, idx)}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 text-left transition-all group"
                                    >
                                        <span className="font-bold text-gray-700 group-hover:text-emerald-700">{opt}</span>
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                    ) : (

                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="w-full relative"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Score Card */}
                                <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden text-center">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70" />

                                    <div className="relative z-10">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Your MentalScope Score</h3>

                                        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${score.total * 2.83} 283`} className={score.total > 70 ? 'text-emerald-500' : score.total > 40 ? 'text-amber-500' : 'text-rose-500'} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.5s ease-out' }} />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-6xl font-black text-gray-900 tracking-tighter">{score.total}</span>
                                                <span className="text-sm font-bold text-gray-400">/ 100</span>
                                            </div>
                                        </div>

                                        <p className={`text-xl font-bold ${score.total > 70 ? 'text-emerald-600' : score.total > 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                                            {score.total > 70 ? 'Excellent Balance' : score.total > 40 ? 'Moderate Strain' : 'High Alert'}
                                        </p>
                                        <p className="text-gray-500 font-medium text-sm mt-2 max-w-sm mx-auto">
                                            {score.total > 70 ? 'You are maintaining a strong mental equilibrium.' :
                                                'There are a few areas of tension to watch out for. Check the breakdown.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Breakdown & Recommendations */}
                                <div className="space-y-8 flex flex-col">
                                    <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-8 shadow-xl flex-1 flex flex-col">
                                        <h4 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                            <PieChart className="w-4 h-4 text-emerald-500" /> Category Breakdown
                                        </h4>

                                        <div className="space-y-5">
                                            {score.breakdown.map((item, idx) => (
                                                <div key={idx}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                                        <span className="text-xs font-black" style={{ color: item.color }}>{item.value} pts</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }} animate={{ width: `${(item.value / 30) * 100}%` }} transition={{ delay: 0.5 + (idx * 0.1), duration: 0.8 }}
                                                            className="h-full rounded-full" style={{ backgroundColor: item.color }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-[40px] p-8 shadow-xl text-white relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10 flex items-start gap-4">
                                            <div className="p-3 bg-white/10 rounded-2xl"><Brain className="w-6 h-6 text-emerald-400" /></div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-2">Action Plan</h4>
                                                <ul className="space-y-2 mt-4">
                                                    <li className="flex gap-3 text-sm font-medium text-gray-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                                        Take a 15-minute nature walk today to boost emotional range.
                                                    </li>
                                                    <li className="flex gap-3 text-sm font-medium text-gray-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                                        Implement a strict pre-sleep wind-down routine.
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
