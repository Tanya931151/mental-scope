import { useState, useEffect } from 'react';
import {
    Heart, Save, TrendingUp, Sparkles, Brain, Plus,
    Moon, Activity, BookOpen, Monitor, Footprints,
    Scale, Zap, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { predictEmotion, predictHabits, getDatasetSamples } from '../api/emotionApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit, serverTimestamp } from 'firebase/firestore';

export default function MoodTracker() {
    const { currentUser } = useAuth();
    const [selectedMood, setSelectedMood] = useState(null);
    const [stressLevel, setStressLevel] = useState(5);
    const [feelingText, setFeelingText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [wellnessHistory, setWellnessHistory] = useState([]);

    // Habit & Health States
    const [habits, setHabits] = useState({
        sleep_hours: '',
        workout_minutes: '',
        reading_minutes: '',
        screen_time_minutes: '',
        steps: '',
        heart_rate: '',
        bmi: ''
    });
    const [habitPrediction, setHabitPrediction] = useState(null);
    const [isPredictingHabits, setIsPredictingHabits] = useState(false);
    const [datasetSamples, setDatasetSamples] = useState({ train: [], val: [], test: [] });
    const [currentDatasetTab, setCurrentDatasetTab] = useState('train');

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'users', currentUser.uid, 'daily_wellness'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setWellnessHistory(items);
        });

        // Load dataset samples for insights
        const fetchSamples = async () => {
            const samples = await getDatasetSamples();
            setDatasetSamples(samples);
        };
        fetchSamples();

        return () => unsubscribe();
    }, [currentUser]);

    const moods = [
        { emoji: '😄', label: 'Joy / Happy', value: 10, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { emoji: '🥰', label: 'Love / Affection', value: 9.5, color: 'text-pink-500', bg: 'bg-pink-50' },
        { emoji: '✨', label: 'Hope / Optimism', value: 9, color: 'text-blue-400', bg: 'bg-blue-50' },
        { emoji: '🦁', label: 'Pride / Confidence', value: 8.5, color: 'text-amber-500', bg: 'bg-amber-50' },
        { emoji: '😐', label: 'Neutral', value: 6, color: 'text-slate-400', bg: 'bg-slate-50' },
        { emoji: '😲', label: 'Surprise / Shock', value: 5, color: 'text-purple-500', bg: 'bg-purple-50' },
        { emoji: '😢', label: 'Sadness', value: 4, color: 'text-blue-600', bg: 'bg-blue-50' },
        { emoji: '😫', label: 'Stress / Overwhelm', value: 3, color: 'text-orange-600', bg: 'bg-orange-50' },
        { emoji: '🤢', label: 'Disgust', value: 2, color: 'text-lime-600', bg: 'bg-lime-50' },
        { emoji: '😔', label: 'Shame / Guilt', value: 1, color: 'text-slate-600', bg: 'bg-slate-50' },
        { emoji: '😡', label: 'Anger', value: 0.5, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    const handleHabitChange = (field, value) => {
        setHabits(prev => ({ ...prev, [field]: value }));
    };

    const handleAnalyzeFeeling = async () => {
        if (!feelingText.trim()) return;

        setIsAnalyzing(true);
        try {
            const { emotion } = await predictEmotion(feelingText);

            const emotionToMoodMap = {
                "Joy": "Joy / Happy",
                "Love": "Love / Affection",
                "Love / Affection": "Love / Affection",
                "Affection": "Love / Affection",
                "Hope": "Hope / Optimism",
                "Hope / Optimism": "Hope / Optimism",
                "Optimism": "Hope / Optimism",
                "Pride": "Pride / Confidence",
                "Pride / Confidence": "Pride / Confidence",
                "Confidence": "Pride / Confidence",
                "Neutral": "Neutral",
                "Surprise": "Surprise / Shock",
                "Surprise / Shock": "Surprise / Shock",
                "Shock": "Surprise / Shock",
                "Sadness": "Sadness",
                "Stress": "Stress / Overwhelm",
                "Stress / Overwhelm": "Stress / Overwhelm",
                "Overwhelm": "Stress / Overwhelm",
                "Overwhelmed": "Stress / Overwhelm",
                "Anxiety": "Fear / Anxiety",
                "Fear / Anxiety": "Fear / Anxiety",
                "Fear": "Fear / Anxiety",
                "Disgust": "Disgust",
                "Shame": "Shame / Guilt",
                "Shame / Guilt": "Shame / Guilt",
                "Guilt": "Shame / Guilt",
                "Anger": "Anger"
            };

            const moodLabel = emotionToMoodMap[emotion] || "Neutral";
            const detectedMood = moods.find(m => m.label === moodLabel);

            if (detectedMood) setSelectedMood(detectedMood);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeHabits = async () => {
        setIsPredictingHabits(true);
        try {
            const result = await predictHabits({
                ...habits,
                journaling: feelingText.length > 0
            });
            if (result) {
                setHabitPrediction(result);
            }
        } catch (error) {
            console.error("Habit prediction failed:", error);
        } finally {
            setIsPredictingHabits(false);
        }
    };

    const getStressInterpretation = (level) => {
        if (level <= 3) return {
            label: "Low Stress",
            message: "Minimal impact. You're in a stable state.",
            color: "text-emerald-600",
            bg: "bg-emerald-50/50",
            icon: <CheckCircle className="w-4 h-4 text-emerald-500" />
        };
        if (level <= 6) return {
            label: "Moderate Stress",
            message: "Noticeable but manageable. Don't forget to take short breaks.",
            color: "text-amber-600",
            bg: "bg-amber-50/50",
            icon: <Info className="w-4 h-4 text-amber-500" />
        };
        if (level <= 8) return {
            label: "High Stress Detected",
            message: "You may be feeling overwhelmed. Consider a short breathing exercise.",
            color: "text-rose-600",
            bg: "bg-rose-50/50",
            icon: <AlertTriangle className="w-4 h-4 text-rose-500" />
        };
        return {
            label: "Critical Stress",
            message: "Urgent self-care needed. Please step away and prioritize your well-being.",
            color: "text-rose-700",
            bg: "bg-rose-100/50",
            icon: <AlertTriangle className="w-4 h-4 text-rose-600" />
        };
    };

    const handleSave = async () => {
        if (!selectedMood || !currentUser) return;

        try {
            // Unified Tier 4 Schema (Matching Tanya's Advice)
            const wellnessEntry = {
                mood_score: selectedMood.value,
                mood_label: selectedMood.label,
                emotionLabel: selectedMood.label.split(' / ')[0], // Alias for AI consistency
                stress_level: parseInt(stressLevel),
                sleep_hours: parseFloat(habits.sleep_hours) || 0,
                workout_minutes: parseInt(habits.workout_minutes) || 0,
                steps: parseInt(habits.steps) || 0,
                heart_rate: parseInt(habits.heart_rate) || 0,
                timestamp: new Date().toISOString(),
                createdAt: serverTimestamp(),
                journal_entry: feelingText
            };

            await addDoc(collection(db, 'users', currentUser.uid, 'daily_wellness'), wellnessEntry);

            // Reset for a fresh start
            setSelectedMood(null);
            setStressLevel(5);
            setFeelingText('');
            setHabitPrediction(null);
            setHabits({
                sleep_hours: '',
                workout_minutes: '',
                reading_minutes: '',
                screen_time_minutes: '',
                steps: '',
                heart_rate: '',
                bmi: ''
            });

            alert("Wellness Snapshot Saved! Your analytics will update shortly.");
        } catch (err) {
            console.error("Failed to save wellness data:", err);
            alert("Failed to save. Please try again.");
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-[#FDFCFE]">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />
            </div>

            <div className="container-custom py-12 md:py-20 max-w-6xl mx-auto relative z-10 px-6">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-sm font-black text-purple-600 tracking-[0.3em] uppercase mb-3">Daily Sync</h1>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                            Wellness <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Check-in</span>
                        </h2>
                        <p className="text-gray-400 font-bold mt-4 uppercase tracking-widest text-xs">Aligning your habits with your headspace</p>
                    </motion.div>
                </header>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Main Form Area */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* 1. Mood & AI Assistant */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 md:p-10 bg-white/70 backdrop-blur-3xl border border-white rounded-[40px] shadow-2xl shadow-purple-100/20">
                            <div className="flex items-center gap-3 mb-10">
                                <Sparkles className="w-8 h-8 text-purple-600" />
                                <h3 className="text-2xl font-black text-gray-900">How's your mood?</h3>
                            </div>

                            <div className="space-y-12">
                                {/* AI Prediction */}
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl border border-white shadow-inner">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Brain className="w-5 h-5 text-indigo-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Pandora AI Assistance</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={feelingText}
                                                onChange={(e) => setFeelingText(e.target.value)}
                                                placeholder="Write a sentence about how you feel..."
                                                className="w-full bg-white border border-purple-100 rounded-2xl px-6 py-4 shadow-sm focus:ring-4 focus:ring-purple-100/50 outline-none font-bold text-gray-700"
                                            />
                                            <button
                                                onClick={() => {
                                                    const allSamples = [...datasetSamples.train, ...datasetSamples.val, ...datasetSamples.test];
                                                    if (allSamples.length > 0) {
                                                        const randomSample = allSamples[Math.floor(Math.random() * allSamples.length)];
                                                        setFeelingText(randomSample.sentence);
                                                    }
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-purple-50 text-indigo-400 rounded-xl transition-all"
                                                title="Try an example"
                                            >
                                                <Zap className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAnalyzeFeeling}
                                            disabled={isAnalyzing || !feelingText.trim()}
                                            className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
                                        >
                                            {isAnalyzing ? 'Decoding...' : 'Identify Mood'}
                                        </button>
                                    </div>

                                    {/* Contextual Training Insight */}
                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Training Insights:</p>
                                        {selectedMood ? (
                                            <div className="px-4 py-2 bg-white/50 border border-indigo-100/50 rounded-2xl">
                                                <p className="text-[10px] font-bold text-gray-500 italic">
                                                    {(() => {
                                                        const relevantSamples = [...datasetSamples.train, ...datasetSamples.val, ...datasetSamples.test]
                                                            .filter(s => s.emotion.toLowerCase().includes(selectedMood.label.split(' ')[0].toLowerCase()));
                                                        return relevantSamples.length > 0
                                                            ? `"${relevantSamples[0].sentence}"`
                                                            : "Express your feelings naturally..."
                                                    })()}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] font-bold text-gray-400 italic">Select a mood to see training logic...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Manual Mood Picker */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {moods.map((mood) => (
                                        <motion.button
                                            key={mood.label}
                                            whileHover={{ y: -8, scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedMood(mood)}
                                            className={`flex flex-col items-center gap-4 p-6 rounded-[32px] transition-all border-2 ${selectedMood?.label === mood.label
                                                ? 'bg-white border-purple-600 shadow-2xl shadow-purple-100 scale-110'
                                                : 'bg-white/40 border-transparent hover:bg-white hover:border-purple-100'
                                                }`}
                                        >
                                            <span className="text-4xl">{mood.emoji}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMood?.label === mood.label ? 'text-purple-600' : 'text-gray-400'}`}>
                                                {mood.label}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Habits & Health (The New ML Data) */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="p-8 md:p-10 bg-white/70 backdrop-blur-3xl border border-white rounded-[40px] shadow-2xl shadow-purple-100/20">
                            <div className="flex items-center gap-3 mb-10">
                                <Activity className="w-8 h-8 text-indigo-600" />
                                <h3 className="text-2xl font-black text-gray-900">Habits & Health</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Sleep */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-xl"><Moon className="w-4 h-4 text-blue-600" /></div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sleep Hours</label>
                                    </div>
                                    <input
                                        type="number" value={habits.sleep_hours} onChange={(e) => handleHabitChange('sleep_hours', e.target.value)}
                                        placeholder="e.g. 7.5" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-300"
                                    />
                                </div>

                                {/* Workout */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 rounded-xl"><Zap className="w-4 h-4 text-emerald-600" /></div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workout (Min)</label>
                                    </div>
                                    <input
                                        type="number" value={habits.workout_minutes} onChange={(e) => handleHabitChange('workout_minutes', e.target.value)}
                                        placeholder="e.g. 45" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-300"
                                    />
                                </div>

                                {/* Reading */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 rounded-xl"><BookOpen className="w-4 h-4 text-amber-600" /></div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reading (Min)</label>
                                    </div>
                                    <input
                                        type="number" value={habits.reading_minutes} onChange={(e) => handleHabitChange('reading_minutes', e.target.value)}
                                        placeholder="e.g. 20" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-amber-300"
                                    />
                                </div>

                                {/* Screen Time */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-50 rounded-xl"><Monitor className="w-4 h-4 text-rose-600" /></div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Screen Time (Min)</label>
                                    </div>
                                    <input
                                        type="number" value={habits.screen_time_minutes} onChange={(e) => handleHabitChange('screen_time_minutes', e.target.value)}
                                        placeholder="e.g. 120" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-rose-300"
                                    />
                                </div>
                            </div>

                            {/* Habit Prediction Results */}
                            <AnimatePresence>
                                {habitPrediction && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="mt-10 p-8 bg-gradient-to-br from-indigo-900 to-gray-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                                            <Brain className="w-24 h-24" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Neural Habit Forecast</p>
                                                    <h4 className="text-3xl font-black tracking-tight">{habitPrediction.mood_range.split(' ')[1]}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Forecast Score</p>
                                                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{habitPrediction.mood_score}<span className="text-sm opacity-30 text-white ml-1">/10</span></p>
                                                </div>
                                            </div>

                                            <p className="text-sm font-bold text-gray-300 leading-relaxed mb-8 italic">"{habitPrediction.message}"</p>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                {habitPrediction.tips.map((tip, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                                        <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-400">{idx + 1}</div>
                                                        <p className="text-[11px] font-bold text-gray-300">{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8">
                                <button
                                    onClick={handleAnalyzeHabits}
                                    disabled={isPredictingHabits}
                                    className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-3xl font-black text-xs hover:bg-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isPredictingHabits ? 'Processing Neural Data...' : 'Analyze Habit Integration'}
                                </button>
                            </div>

                            {/* Advanced Physiological Data */}
                            <div className="mt-12 pt-10 border-t border-gray-100/50">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-8">Physiological Metrics (Optional for Deep Insights)</p>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Footprints className="w-3 h-3 text-gray-400" />
                                            <label className="text-[9px] font-black text-gray-400 uppercase">Steps</label>
                                        </div>
                                        <input type="number" placeholder="Steps" value={habits.steps} onChange={(e) => handleHabitChange('steps', e.target.value)} className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all focus:bg-white" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3 h-3 text-gray-400" />
                                            <label className="text-[9px] font-black text-gray-400 uppercase">HR (avg)</label>
                                        </div>
                                        <input type="number" placeholder="BPM" value={habits.heart_rate} onChange={(e) => handleHabitChange('heart_rate', e.target.value)} className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all focus:bg-white" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Scale className="w-3 h-3 text-gray-400" />
                                            <label className="text-[9px] font-black text-gray-400 uppercase">BMI</label>
                                        </div>
                                        <input type="number" placeholder="BMI" value={habits.bmi} onChange={(e) => handleHabitChange('bmi', e.target.value)} className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all focus:bg-white" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Global Stress Slider */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="p-8 md:p-10 bg-white/70 backdrop-blur-3xl border border-white rounded-[40px] shadow-2xl shadow-purple-100/20">
                            <div className="flex justify-between items-end mb-10">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-8 h-8 text-rose-500" />
                                    <h3 className="text-2xl font-black text-gray-900">Stress Intensity</h3>
                                </div>
                                <span className="text-4xl font-black text-purple-600 tracking-tighter">{stressLevel}<span className="text-sm opacity-30 text-gray-900 uppercase ml-1">/10</span></span>
                            </div>
                            <input
                                type="range" min="1" max="10" value={stressLevel}
                                onChange={(e) => setStressLevel(Number(e.target.value))}
                                className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full" /> Minimal</span>
                                <span className="flex items-center gap-2">Extreme <div className="w-2 h-2 bg-rose-500 rounded-full" /></span>
                            </div>

                            {/* Smart Interpretation */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stressLevel}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`mt-8 p-6 rounded-3xl border border-white/50 backdrop-blur-sm ${getStressInterpretation(stressLevel).bg} flex gap-4 items-start transition-colors duration-500`}
                                >
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        {getStressInterpretation(stressLevel).icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${getStressInterpretation(stressLevel).color}`}>
                                                {getStressInterpretation(stressLevel).label}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                            {getStressInterpretation(stressLevel).message}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={!selectedMood}
                            className="w-full py-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-[40px] font-black text-2xl shadow-2xl shadow-purple-200 transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale cursor-pointer group"
                        >
                            <Save className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                            Save Wellness Snapshot
                        </motion.button>
                    </div>

                    {/* Right Side: History & Motivation */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-gray-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-700">
                                <Brain className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-black mb-4 relative z-10">Why track this?</h3>
                            <p className="text-sm font-bold text-gray-400 leading-relaxed mb-8 relative z-10">
                                Connecting your <b>Sleep</b> and <b>Physical Activity</b> to your <b>Mood</b> allows Pandora AI to find the "Hidden Triggers" in your life.
                            </p>
                            <div className="p-5 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md relative z-10">
                                <p className="text-xs font-bold text-purple-300 italic">"Tomorrow is a clean slate. Your data today builds a better version of you."</p>
                            </div>
                        </div>

                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[.3em] pl-2">Recent Check-ins</h3>
                        <div className="space-y-4">
                            {wellnessHistory.length === 0 ? (
                                <div className="bg-white/40 border border-white rounded-[32px] p-12 text-center">
                                    <Heart className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No entries yet</p>
                                </div>
                            ) : (
                                wellnessHistory.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white border border-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex items-center gap-5 group"
                                    >
                                        <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{moods.find(m => m.label === item.mood_label)?.emoji || '✨'}</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-gray-900 group-hover:text-purple-600 transition-colors">{item.mood_label}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-indigo-600">{item.sleep_hours || 0}h Sleep</div>
                                            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-tight">{item.workout_minutes || 0}m Act</div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
