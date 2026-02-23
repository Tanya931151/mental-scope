import { useState, useEffect } from 'react';
import { BookOpen, Save, Trash2, ChevronDown, ChevronUp, Sparkles, Brain } from 'lucide-react';
import { predictEmotion, getSuggestion } from '../api/emotionApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function Journal() {
    const { currentUser } = useAuth();
    const [entry, setEntry] = useState('');
    const [entries, setEntries] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedEmotion, setDetectedEmotion] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'users', currentUser.uid, 'journals'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setEntries(items);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleSave = async () => {
        if (!entry.trim() || !currentUser) return;

        setIsAnalyzing(true);
        try {
            const { emotion } = await predictEmotion(entry);
            const suggestion = getSuggestion(emotion);

            setDetectedEmotion(emotion);
            setAiSuggestion(suggestion);

            await addDoc(collection(db, 'users', currentUser.uid, 'journals'), {
                content: entry,
                emotion: emotion,
                suggestion: suggestion,
                timestamp: new Date().toISOString(),
            });

            setEntry('');
        } catch (error) {
            console.error("Failed to save entry:", error);
            // Fallback save without emotion
            await addDoc(collection(db, 'users', currentUser.uid, 'journals'), {
                content: entry,
                timestamp: new Date().toISOString(),
            });
            setEntry('');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this reflection?') && currentUser) {
            try {
                await deleteDoc(doc(db, 'users', currentUser.uid, 'journals', id));
            } catch (err) {
                console.error("Failed to delete:", err);
            }
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden bg-[#F8F9FE]">
            {/* 🌀 Zen Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-rose-200/30 rounded-full blur-[100px] animate-pulse delay-700" />
                <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[110px]" />
            </div>

            <div className="container-custom py-12 md:py-20 max-w-4xl mx-auto relative z-10 px-6">
                {/* Header */}
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-sm font-black text-purple-600 tracking-[0.3em] uppercase mb-3">Self Reflection</h1>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Journal</span>
                        </h2>
                    </motion.div>
                </header>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-3xl border border-white rounded-[40px] p-8 md:p-12 mb-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] group focus-within:shadow-[0_48px_80px_-20px_rgba(139,92,246,0.12)] transition-all duration-500"
                >
                    <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="What's floating in your mind today?"
                        className="w-full min-h-[160px] bg-transparent border-none focus:ring-0 text-xl font-medium text-gray-800 placeholder:text-gray-300 mb-8 resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between border-t border-gray-100/50 pt-8">
                        <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-bold text-[10px]">
                                <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{entry.length} characters</span>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!entry.trim() || isAnalyzing}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-purple-100 hover:scale-[1.02] active:scale-95"
                        >
                            {isAnalyzing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isAnalyzing ? 'Analyzing Wisdom...' : 'Capture Thought'}
                        </button>
                    </div>
                </motion.div>

                {/* AI Detection Callout */}
                <AnimatePresence>
                    {detectedEmotion && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white shadow-2xl mb-12 relative overflow-hidden"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Empathetic Analysis</div>
                                    <div className="text-2xl font-bold">You're feeling: {detectedEmotion}</div>
                                </div>
                                <button
                                    onClick={() => setDetectedEmotion(null)}
                                    className="ml-auto p-2 hover:bg-white/10 rounded-full"
                                >
                                    <Trash2 className="w-4 h-4 opacity-50" />
                                </button>
                            </div>
                            <div className="p-5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                                <p className="text-lg font-medium italic leading-relaxed">
                                    "{aiSuggestion}"
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Entries List */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        Historical Archive
                        <div className="h-px flex-1 bg-gray-100" />
                    </h3>

                    {entries.length === 0 ? (
                        <div className="bg-white/30 backdrop-blur-md border border-white rounded-[40px] py-24 text-center">
                            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Your archive is empty</p>
                            <p className="text-gray-300 text-sm mt-2">Start by capturing a thought above.</p>
                        </div>
                    ) : (
                        entries.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-8 md:p-10 shadow-sm group hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-500 relative"
                            >
                                {/* Emotion Accent */}
                                <div className={`absolute top-10 left-0 w-1.5 h-12 rounded-r-full ${item.emotion?.toLowerCase() === 'happy' ? 'bg-green-400' :
                                        item.emotion?.toLowerCase() === 'calm' ? 'bg-purple-400' :
                                            item.emotion?.toLowerCase() === 'anxious' ? 'bg-amber-400' :
                                                'bg-indigo-300'
                                    }`} />

                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50/50">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-gray-50 rounded-[22px] flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                            <Brain className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{item.emotion || 'Reflection'}</div>
                                            <div className="font-bold text-gray-900">{formatDate(item.timestamp)}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className={`text-gray-700 font-medium leading-[1.8] text-lg ${expandedId === item.id ? '' : 'line-clamp-4'}`}>
                                    {item.content}
                                </p>

                                {item.suggestion && expandedId === item.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 p-6 bg-purple-50 rounded-3xl border border-purple-100/50 text-purple-700 italic font-medium"
                                    >
                                        <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3" /> Digital insight
                                        </div>
                                        "{item.suggestion}"
                                    </motion.div>
                                )}

                                {item.content.length > 250 && (
                                    <button
                                        onClick={() => toggleExpand(item.id)}
                                        className="mt-6 text-sm font-black text-purple-600 flex items-center gap-2 group/btn"
                                    >
                                        <span className="bg-purple-50 px-4 py-2 rounded-full group-hover/btn:bg-purple-600 group-hover/btn:text-white transition-all">
                                            {expandedId === item.id ? 'Collapse Reflection' : 'Read Deeply'}
                                        </span>
                                        {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
