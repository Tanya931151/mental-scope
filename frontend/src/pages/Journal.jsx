import { useState, useEffect } from 'react';
import { BookOpen, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Journal() {
    const [entry, setEntry] = useState('');
    const [entries, setEntries] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('journalEntries');
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, []);

    const handleSave = () => {
        if (!entry.trim()) {
            alert('Please write something before saving!');
            return;
        }

        const newEntry = {
            id: Date.now(),
            content: entry,
            timestamp: new Date().toISOString(),
        };

        const updated = [newEntry, ...entries];
        setEntries(updated);
        localStorage.setItem('journalEntries', JSON.stringify(updated));

        setEntry('');
        alert('Journal entry saved! 📝');
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            const updated = entries.filter((e) => e.id !== id);
            setEntries(updated);
            localStorage.setItem('journalEntries', JSON.stringify(updated));
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateText = (text, maxLength = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
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
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Express Yourself</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        Daily Journal
                    </h1>
                    <p className="text-gray-600">A safe space for your thoughts and reflections</p>
                </motion.div>

                {/* New Entry Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="card mb-8"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Write Your Thoughts</h3>

                    <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="What's on your mind today? Write freely without judgment..."
                        className="w-full mb-4 min-h-[200px]"
                        rows="8"
                    />

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {entry.length} characters
                        </p>
                        <button
                            onClick={handleSave}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save Entry
                        </button>
                    </div>
                </motion.div>

                {/* Past Entries */}
                {entries.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                            Past Entries ({entries.length})
                        </h2>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {entries.map((item, index) => {
                                    const isExpanded = expandedId === item.id;
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="card"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-purple-600 mb-1">
                                                        {formatDate(item.timestamp)}
                                                    </p>
                                                    <p className="text-gray-700 whitespace-pre-wrap">
                                                        {isExpanded ? item.content : truncateText(item.content)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                                {item.content.length > 150 && (
                                                    <button
                                                        onClick={() => toggleExpand(item.id)}
                                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="w-4 h-4" />
                                                                Show Less
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-4 h-4" />
                                                                Read More
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <div className="flex-1"></div>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {entries.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">No journal entries yet</p>
                        <p className="text-sm">Start writing your first entry above! ✍️</p>
                    </div>
                )}
            </div>
        </div>
    );
}
