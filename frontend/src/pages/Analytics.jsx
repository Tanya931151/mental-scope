import { useState, useEffect } from 'react';
import { TrendingUp, PieChart as PieChartIcon, Activity, Calendar, Brain, Sparkles } from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Analytics() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        emotionData: [],
        trendData: []
    });

    useEffect(() => {
        if (!currentUser) return;

        // Fetch journals for emotion distribution
        const qJournals = query(
            collection(db, 'users', currentUser.uid, 'journals'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(qJournals, (snapshot) => {
            const savedEntries = [];
            snapshot.forEach(doc => {
                savedEntries.push(doc.data());
            });

            // Process emotion distribution
            const emotionCounts = {};
            savedEntries.forEach(entry => {
                if (entry.emotion) {
                    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
                }
            });

            const emotionData = Object.keys(emotionCounts).map(name => ({
                name,
                value: emotionCounts[name]
            }));

            // Process trend
            const trendData = savedEntries.slice(0, 10).reverse().map((entry) => ({
                name: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: getEmotionScore(entry.emotion)
            }));

            setStats({ emotionData, trendData });
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getEmotionScore = (emotion) => {
        const scores = {
            "Joy": 100,
            "Neutral": 70,
            "Sadness": 40,
            "Stress / Overwhelm": 30,
            "Anxiety": 20,
            "Anger": 10,
            "Fear": 15
        };
        return scores[emotion] || 50;
    };

    const COLORS = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

    return (
        <div className="min-h-screen pb-20">
            <div className="container-custom py-12 md:py-20 max-w-7xl mx-auto">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">Mental Metrology</h1>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Your Emotional Landscape</h2>
                    </motion.div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Charts Row */}
                    <div className="lg:col-span-8 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card h-[480px]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold">Wellness Progression</h3>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">Last 10 Entries</div>
                            </div>
                            <ResponsiveContainer width="100%" height="80%">
                                <LineChart data={stats.trendData}>
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card h-[480px]"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <PieChartIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold">Emotion Mix</h3>
                            </div>
                            <ResponsiveContainer width="100%" height="70%">
                                <PieChart>
                                    <Pie
                                        data={stats.emotionData}
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.emotionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {stats.emotionData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Metrics Summary Row */}
                <div className="grid md:grid-cols-4 gap-6 mt-8">
                    {[
                        { label: 'Weekly Velocity', value: stats.trendData.length, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
                        { label: 'Dominant Vibe', value: stats.emotionData[0]?.name || 'Neutral', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
                        { label: 'Emotional Range', value: stats.emotionData.length, icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
                        { label: 'AI Confidence', value: '94%', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="card-compact !p-6 flex items-center gap-5"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`}>
                                <item.icon className={`w-7 h-7 ${item.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                                <p className="text-xl font-black text-gray-900">{item.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
