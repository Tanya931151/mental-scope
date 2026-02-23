import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Brain, Shield, Moon, Sun, Wind, ChevronRight } from 'lucide-react';

export default function Facts() {
    const topics = [
        {
            title: "Anxiety Management",
            icon: Brain,
            color: "text-purple-600",
            bg: "bg-purple-50",
            facts: [
                "Periodic anxiety is a normal part of life. However, people with anxiety disorders frequently have intense, excessive and persistent worry.",
                "The '5-4-3-2-1' technique is a common sensory grounding method used to stay in the present moment.",
                "Regular physical activity can help lower overall stress levels and improve mood."
            ]
        },
        {
            title: "Sleep Hygiene",
            icon: Moon,
            color: "text-blue-600",
            bg: "bg-blue-50",
            facts: [
                "Consistency is key: Try to go to bed and wake up at the same time every day, including weekends.",
                "Make sure your bedroom is quiet, dark, relaxing, and at a comfortable temperature.",
                "Remove electronic devices, such as TVs, computers, and smart phones, from the bedroom."
            ]
        },
        {
            title: "Stress Reduction",
            icon: Wind,
            color: "text-teal-600",
            bg: "bg-teal-50",
            facts: [
                "Deep breathing increases the supply of oxygen to your brain and stimulates the parasympathetic nervous system.",
                "Spending time in nature has been shown to reduce cortisol levels and blood pressure.",
                "Setting boundaries and saying 'no' is a vital form of self-care for stress management."
            ]
        }
    ];

    return (
        <div className="min-h-screen pb-20">
            <div className="container-custom py-12 md:py-20 max-w-5xl mx-auto">
                <header className="mb-16 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-2">Knowledge Base</h1>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight">Understanding Your Mind</h2>
                        <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">Empower yourself with science-backed facts and practical tips for better mental wellbeing.</p>
                    </motion.div>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    {topics.map((topic, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all border-b-4 border-b-transparent hover:border-b-teal-500"
                        >
                            <div className={`w-16 h-16 ${topic.bg} rounded-2xl flex items-center justify-center ${topic.color} mb-8 shadow-sm`}>
                                <topic.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{topic.title}</h3>
                            <ul className="space-y-4">
                                {topic.facts.map((fact, fIdx) => (
                                    <li key={fIdx} className="flex gap-3 text-sm text-gray-600 leading-relaxed group">
                                        <ChevronRight className="w-4 h-4 text-teal-500 mt-1 shrink-0 group-hover:translate-x-1 transition-transform" />
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 p-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-[40px] text-white overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 md:flex items-center justify-between">
                        <div className="max-w-md">
                            <h3 className="text-3xl font-black mb-4">Daily Mindfulness Tip</h3>
                            <p className="text-teal-50 font-medium">Research shows that just 10 minutes of journaling can significantly reduce long-term stress. Start your entry today!</p>
                        </div>
                        <button className="mt-8 md:mt-0 bg-white text-teal-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                            Open Journal
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
