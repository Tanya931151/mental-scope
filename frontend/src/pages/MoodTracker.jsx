import { useState, useEffect } from 'react';
import { Heart, Save, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MoodTracker() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [stressLevel, setStressLevel] = useState(5);
    const [note, setNote] = useState('');
    const [moodHistory, setMoodHistory] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('moodHistory');
        if (saved) {
            setMoodHistory(JSON.parse(saved));
        }
    }, []);

    const moods = [
        { emoji: '😄', label: 'Great', value: 5, color: 'from-green-400 to-emerald-500' },
        { emoji: '😊', label: 'Good', value: 4, color: 'from-blue-400 to-cyan-500' },
        { emoji: '😐', label: 'Okay', value: 3, color: 'from-yellow-400 to-amber-500' },
        { emoji: '😟', label: 'Low', value: 2, color: 'from-orange-400 to-red-500' },
        { emoji: '😢', label: 'Bad', value: 1, color: 'from-red-500 to-rose-600' },
    ];

    const handleSave = () => {
        if (!selectedMood) {
            alert('Please select a mood first!');
            return;
        }

        const entry = {
            id: Date.now(),
            mood: selectedMood,
            stressLevel,
            note,
            timestamp: new Date().toISOString(),
        };

        const updated = [entry, ...moodHistory];
        setMoodHistory(updated);
        localStorage.setItem('moodHistory', JSON.stringify(updated));

        // Reset form
        setSelectedMood(null);
        setStressLevel(5);
        setNote('');

        alert('Mood saved! 💙');
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-3 shadow-sm">
                        <Heart className="w-4 h-4 text-pink-600" fill="currentColor" />
                        <span className="text-sm font-medium text-pink-700">Track Your Emotions</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                        Mood Tracker
                    </h1>
                    <p className="text-gray-600">How are you feeling today?</p>
                </motion.div>

                {/* Mood Input Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="card mb-8"
                >
                    {/* Mood Selection */}
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Select Your Mood</h3>
                    <div className="flex justify-around mb-6 flex-wrap gap-4">
                        {moods.map((mood) => (
                            <div
                                key={mood.value}
                                onClick={() => setSelectedMood(mood)}
                                className={`mood-emoji ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                            >
                                <div className="text-center">
                                    <div className="text-5xl mb-2">{mood.emoji}</div>
                                    <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stress Level Slider */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-3">
                            Stress Level: <span className="text-purple-600 font-bold">{stressLevel}/10</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={stressLevel}
                            onChange={(e) => setStressLevel(Number(e.target.value))}
                            className="w-full h-3 bg-gradient-to-r from-green-300 via-yellow-300 to-red-400 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #86efac 0%, #fde047 50%, #f87171 100%)`,
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Low</span>
                            <span>High</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="What's on your mind? Any specific thoughts or events?"
                            className="w-full"
                            rows="3"
                        />
                    </div>

                    {/* Save Button */}
                    <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Mood Entry
                    </button>
                </motion.div>

                {/* Mood History */}
                {moodHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Your Mood History</h2>
                        </div>

                        <div className="space-y-3">
                            {moodHistory.slice(0, 10).map((entry, index) => {
                                const mood = moods.find((m) => m.value === entry.mood.value);
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="card-compact flex items-center gap-4"
                                    >
                                        <div className="text-4xl">{entry.mood.emoji}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-800">{entry.mood.label}</span>
                                                <span className="text-sm text-gray-500">• Stress: {entry.stressLevel}/10</span>
                                            </div>
                                            {entry.note && (
                                                <p className="text-sm text-gray-600 mb-1">{entry.note}</p>
                                            )}
                                            <p className="text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {moodHistory.length > 10 && (
                            <p className="text-center text-sm text-gray-500 mt-4">
                                Showing 10 most recent entries
                            </p>
                        )}
                    </motion.div>
                )}

                {moodHistory.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No mood entries yet. Start tracking your emotions above! 💙</p>
                    </div>
                )}
            </div>
        </div>
    );
}
