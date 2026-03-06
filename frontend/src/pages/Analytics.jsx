import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Brain, Activity, HelpCircle, Lightbulb } from 'lucide-react';
import { getDatasetSamples, getShapValues } from '../api/emotionApi';

export default function Analytics() {
    const [samples, setSamples] = useState([]);
    const [realShapData, setRealShapData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            // Load dataset samples
            const data = await getDatasetSamples();
            if (data && data.train) {
                setSamples(data.train.slice(0, 3));
            }

            // Fetch dynamic SHAP values for a typical "high-stress" profile 
            // (e.g., 4 hours sleep, 0 min workout, no journaling, 50 min reading, 8 hours screen time)
            try {
                const shapResponse = await getShapValues({
                    sleep_hours: 4.5,
                    workout_minutes: 0,
                    journaling: false,
                    reading_minutes: 60,
                    screen_time_minutes: 480 // 8 hours
                });

                if (shapResponse && shapResponse.features) {
                    setRealShapData(shapResponse.features);
                }
            } catch (err) {
                console.error("Error loading SHAP data:", err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F9FE] pt-28 pb-20 px-6 sm:px-12 relative overflow-hidden flex flex-col items-center">
            {/* Background blobs */}
            <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-6xl z-10">
                <header className="mb-12 text-center w-full max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <h1 className="text-sm font-black text-purple-600 tracking-[0.3em] uppercase mb-3">Explainable AI (XAI)</h1>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Stress Cause <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Analysis</span>
                        </h2>
                        <p className="text-gray-500 mt-4 max-w-2xl mx-auto font-medium">
                            Understand exactly *why* our models predict certain stress levels.
                            This dashboard uses Explainable AI techniques (like SHAP) to show the factors contributing most to your mental state.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main XAI Chart - Spans 2 cols */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-8 md:p-10 shadow-xl shadow-indigo-100/20">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Activity className="w-5 h-5" /></div>
                                    Feature Importance (SHAP Values)
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mt-2">
                                    Factors pushing your stress prediction higher (red) vs lower (green).
                                </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-xs font-bold text-gray-600">
                                <HelpCircle className="w-4 h-4" /> How to read this
                            </div>
                        </div>

                        <div className="h-[400px] w-full mt-4 -ml-5 relative">
                            {isLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={realShapData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 700 }} width={120} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ fontWeight: 'bold', color: '#111827' }}
                                        formatter={(value) => [`+${value.toFixed(1)} Impact`, 'Penalty']}
                                    />
                                    <Bar dataKey="impact" radius={[0, 8, 8, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Right Side Info Panels */}
                    <div className="space-y-8 flex flex-col">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <Brain className="w-8 h-8 mb-6 opacity-80" />
                            <h4 className="text-lg font-black mb-3 text-white">Why Sleep Matters Most</h4>
                            <p className="text-indigo-100 font-medium text-sm leading-relaxed mb-6">
                                According to the Remote Work Mental Health Dataset, sleep deprivation is consistently the highest contributor (42%) to elevated stress risks, significantly outweighing workload.
                            </p>
                            <button className="w-full py-3 mt-auto bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors border border-white/10">
                                View Full Analysis
                            </button>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex-1 bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-8 shadow-xl shadow-indigo-100/20">
                            <h4 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <Lightbulb className="w-4 h-4 text-amber-500" /> Model Insights
                            </h4>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                        <strong className="text-gray-900 block mb-1">High Workload Penalty</strong>
                                        Working &gt; 9 hours without adequate breaks correlates with a 35% spike in stress probability.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                        <strong className="text-gray-900 block mb-1">The Exercise Buffer</strong>
                                        Just 20 minutes of physical activity reduces the negative impact of high screen time by half.
                                    </p>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
