import { useState, useEffect } from 'react';
import { Heart, Save, TrendingUp, Sparkles, Brain, Plus } from 'lucide-react';
import { predictEmotion } from '../api/emotionApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc } from 'firebase/firestore';

export default function MoodTracker() {
    const { currentUser } = useAuth();
    const [selectedMood, setSelectedMood] = useState(null);
    const [stressLevel, setStressLevel] = useState(5);
    const [note, setNote] = useState('');
    const [feelingText, setFeelingText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [moodHistory, setMoodHistory] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'users', currentUser.uid, 'moods'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setMoodHistory(items);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const moods = [
        { emoji: '😄', label: 'Great', value: 5, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { emoji: '😊', label: 'Good', value: 4, color: 'text-blue-500', bg: 'bg-blue-50' },
        { emoji: '😐', label: 'Okay', value: 3, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { emoji: '😟', label: 'Low', value: 2, color: 'text-orange-500', bg: 'bg-orange-50' },
        { emoji: '😢', label: 'Bad', value: 1, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    const handleAnalyzeFeeling = async () => {
        if (!feelingText.trim()) return;

        setIsAnalyzing(true);
        try {
            const { emotion } = await predictEmotion(feelingText);

            const emotionToMoodMap = {
                "Joy": "Great",
                "Neutral": "Good",
                "Sadness": "Bad",
                "Stress / Overwhelm": "Low",
                "Anxiety": "Low",
                "Anger": "Bad",
                "Fear": "Low"
            };

            const moodLabel = emotionToMoodMap[emotion] || "Okay";
            const detectedMood = moods.find(m => m.label === moodLabel);

            if (detectedMood) setSelectedMood(detectedMood);
            if (!note) setNote(`Feeling ${emotion}: ${feelingText}`);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!selectedMood || !currentUser) return;

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'moods'), {
                mood: selectedMood,
                stressLevel,
                note: note || feelingText,
                timestamp: new Date().toISOString(),
            });

            setSelectedMood(null);
            setStressLevel(5);
            setNote('');
            setFeelingText('');
        } catch (err) {
            console.error("Failed to save mood:", err);
            alert("Failed to save mood. Please try again.");
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen pb-20">
            <div className="container-custom py-12 md:py-20 max-w-5xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-sm font-bold text-rose-500 tracking-widest uppercase mb-2">Emotional Check-in</h1>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">How are you, really?</h2>
                    </motion.div>
                    <div className="flex gap-4">
                        <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/60 shadow-sm flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-bold text-gray-700">{moodHistory.length} Check-ins</span>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left: Input Form */}
                    <div className="lg:col-span-8 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <Plus className="w-6 h-6 text-purple-600" />
                                <h3 className="text-xl font-bold">New Entry</h3>
                            </div>

                            <div className="space-y-10">
                                {/* AI Assistance */}
                                <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-100 relative group transition-all hover:bg-purple-50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        <span className="text-xs font-black uppercase tracking-widest text-purple-700">AI Mood Assistant</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={feelingText}
                                        onChange={(e) => setFeelingText(e.target.value)}
                                        placeholder="Describe your current state in a sentence..."
                                        className="w-full bg-white border-none rounded-2xl px-6 py-4 shadow-sm focus:ring-2 focus:ring-purple-500/20 text-lg font-medium mb-4"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAnalyzeFeeling}
                                            disabled={isAnalyzing || !feelingText.trim()}
                                            className="btn-primary !py-2.5 !px-6 !text-sm !rounded-xl"
                                        >
                                            {isAnalyzing ? 'Decoding...' : 'Identity Mood'}
                                        </button>
                                    </div>
                                </div>

                                {/* Mood Picker */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Select your current vibration</label>
                                    <div className="grid grid-cols-5 gap-4">
                                        {moods.map((mood) => (
                                            <motion.button
                                                key={mood.label}
                                                whileHover={{ y: -4 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedMood(mood)}
                                                className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border-2 ${selectedMood?.label === mood.label
                                                    ? 'bg-white border-purple-600 shadow-xl'
                                                    : 'bg-transparent border-transparent hover:bg-gray-50'
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

                                {/* Stress Level */}
                                <div>
                                    <div className="flex justify-between items-end mb-6">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Stress Level</label>
                                        <span className="text-2xl font-black text-purple-600">{stressLevel}<span className="text-sm opacity-30 text-gray-900">/10</span></span>
                                    </div>
                                    <input
                                        type="range" min="1" max="10" value={stressLevel}
                                        onChange={(e) => setStressLevel(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <div className="flex justify-between mt-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                        <span>Serene</span>
                                        <span>Intense</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={!selectedMood}
                                    className="btn-primary w-full !py-5 !rounded-3xl flex items-center justify-center gap-3 disabled:opacity-30"
                                >
                                    <Save className="w-6 h-6" />
                                    Save Experience
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: History */}
                    <div className="lg:col-span-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Recent Shifts</h3>
                        <div className="space-y-4">
                            {moodHistory.length === 0 ? (
                                <div className="bg-white/40 rounded-[32px] p-10 text-center border border-white/60">
                                    <Heart className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Empty Canvas</p>
                                </div>
                            ) : (
                                moodHistory.slice(0, 6).map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
                                    >
                                        <div className="text-3xl">{item.mood.emoji}</div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{item.mood.label}</div>
                                            <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{formatDate(item.timestamp)}</div>
                                        </div>
                                        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
                                            <Brain className="w-3 h-3 text-gray-400" />
                                            <span className="text-[10px] font-black text-gray-600">{item.stressLevel}</span>
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
