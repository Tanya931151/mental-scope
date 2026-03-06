import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Dumbbell, Moon, Lightbulb, Smartphone, ShieldAlert, CheckCircle, Brain, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { predictHabits } from '../api/emotionApi';

export default function LifestyleTracker() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isPredicting, setIsPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);

    const [habits, setHabits] = useState({
        sleep_hours: 7,
        workout_minutes: 0,
        journaling: false,
        reading_minutes: 0,
        screen_time_minutes: 240 // 4 hours
    });

    // Calculate high/medium/low risk locally based on the returned score
    // Since the habit model returns a Mood Score (0-10, 10 being best), we invert it for Stress Risk
    const getStressRisk = (moodScore) => {
        if (moodScore >= 7.5) return { level: 'LOW', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
        if (moodScore >= 5.0) return { level: 'MEDIUM', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
        return { level: 'HIGH', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHabits(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handlePredict = async () => {
        setIsPredicting(true);
        setPrediction(null);
        try {
            const res = await predictHabits(habits);
            if (res && res.mood_score !== undefined) {
                setPrediction(res);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsPredicting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FE] pt-28 pb-20 px-6 sm:px-12 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-rose-200/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <header className="mb-12 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <h1 className="text-sm font-black text-indigo-600 tracking-[0.3em] uppercase mb-3">AI Prediction Engine</h1>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Stress Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Forecaster</span>
                        </h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
                            Enter your daily habits to predict your stress risk for tomorrow using our Student Stress ML Model.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* INPUT FORM */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 backdrop-blur-2xl border border-white rounded-[40px] p-8 md:p-10 shadow-xl shadow-indigo-100/20">
                        <div className="space-y-6">
                            {/* Sleep */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                                    <span className="flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-500" /> Sleep (Hours)</span>
                                    <span className="text-indigo-600">{habits.sleep_hours} hrs</span>
                                </div>
                                <input type="range" name="sleep_hours" min="0" max="14" step="0.5" value={habits.sleep_hours} onChange={handleChange} className="w-full form-range accent-indigo-600 cursor-pointer" />
                            </div>

                            {/* Workout */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                                    <span className="flex items-center gap-2"><Dumbbell className="w-4 h-4 text-emerald-500" /> Exercise (Minutes)</span>
                                    <span className="text-emerald-600">{habits.workout_minutes} min</span>
                                </div>
                                <input type="range" name="workout_minutes" min="0" max="180" step="5" value={habits.workout_minutes} onChange={handleChange} className="w-full form-range accent-emerald-600 cursor-pointer" />
                            </div>

                            {/* Screen Time */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                                    <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-rose-500" /> Screen Time (Minutes)</span>
                                    <span className="text-rose-600">{habits.screen_time_minutes} min</span>
                                </div>
                                <input type="range" name="screen_time_minutes" min="0" max="840" step="15" value={habits.screen_time_minutes} onChange={handleChange} className="w-full form-range accent-rose-600 cursor-pointer" />
                            </div>

                            {/* Reading */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                                    <span className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Reading/Study (Minutes)</span>
                                    <span className="text-amber-600">{habits.reading_minutes} min</span>
                                </div>
                                <input type="range" name="reading_minutes" min="0" max="480" step="10" value={habits.reading_minutes} onChange={handleChange} className="w-full form-range accent-amber-600 cursor-pointer" />
                            </div>

                            {/* Journaling Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${habits.journaling ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Did you journal today?</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Helps reduce mental clutter</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="journaling" checked={habits.journaling} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <button
                                onClick={handlePredict}
                                disabled={isPredicting}
                                className="w-full mt-6 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {isPredicting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                                {isPredicting ? 'Running ML Model...' : 'Predict Stress Risk'}
                            </button>
                        </div>
                    </motion.div>

                    {/* AI PREDICTION OUTPUT */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                        <AnimatePresence mode="wait">
                            {!prediction ? (
                                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-gray-50/50 backdrop-blur-md border border-gray-100 border-dashed rounded-[40px] h-full flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                                    <Brain className="w-16 h-16 text-gray-300 mb-6" />
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Awaiting Data</p>
                                    <p className="text-gray-500 font-medium mt-2 max-w-xs">Adjust your habits on the left and run the model to see your predicted stress risk for tomorrow.</p>
                                </motion.div>
                            ) : (
                                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative overflow-hidden bg-white/80 backdrop-blur-2xl border rounded-[40px] p-8 md:p-10 shadow-2xl h-full flex flex-col ${getStressRisk(prediction.mood_score).border}`}>

                                    {/* Decorative corner accent */}
                                    <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-50 ${getStressRisk(prediction.mood_score).bg}`} />

                                    <div className="relative z-10 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-3 bg-gray-900 text-white rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">ML Prediction Result</h3>
                                                <p className="text-xl font-black text-gray-900">Tomorrow's Forecast</p>
                                            </div>
                                        </div>

                                        <div className={`p-8 rounded-3xl mb-8 flex flex-col items-center justify-center text-center ${getStressRisk(prediction.mood_score).bg}`}>
                                            <p className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">Predicted Stress Risk</p>
                                            <h2 className={`text-6xl font-black tracking-tight mb-4 ${getStressRisk(prediction.mood_score).color}`}>
                                                {getStressRisk(prediction.mood_score).level}
                                            </h2>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
                                                <span className="text-xs font-bold text-gray-600">Model Confidence:</span>
                                                <span className="text-sm font-black text-gray-900">{(prediction.mood_score * 10).toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-amber-500" /> Personalized Output
                                            </h4>
                                            <p className="text-gray-700 font-medium leading-relaxed italic mb-6">
                                                "{prediction.message}"
                                            </p>

                                            <div className="space-y-3 mt-auto">
                                                {prediction.tips?.map((tip, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{idx + 1}</div>
                                                        <p className="text-sm font-medium text-gray-600">{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
