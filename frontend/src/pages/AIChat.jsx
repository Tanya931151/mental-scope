import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Brain, AlertTriangle, User, ChevronLeft, Heart, Moon, Sun, Coffee } from 'lucide-react';
import { predictEmotion, API_URL } from '../api/emotionApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function AIChat() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [detectedEmotion, setDetectedEmotion] = useState(null);
    const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
    const [chatbotState, setChatbotState] = useState(null);
    const [currentOptions, setCurrentOptions] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'users', currentUser.uid, 'chats'),
            orderBy('timestamp', 'asc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                // Initialize session if empty - use a local flag or similar to prevent repeats
                initBotSession();
            } else {
                const items = [];
                snapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() });
                });

                // Merge items with any temp messages not yet in Firestore
                setMessages(prev => {
                    const tempMsgs = prev.filter(m => m.id?.startsWith('temp-'));
                    // Only keep temp messages that aren't already represented in Firestore (by text/timestamp)
                    const uniqueTemp = tempMsgs.filter(tm => !items.some(im => im.text === tm.text && im.type === tm.type));
                    return [...items, ...uniqueTemp];
                });

                // Restore state and options from the last message if available
                const lastMessage = items[items.length - 1];
                if (lastMessage && lastMessage.type === 'ai') {
                    if (lastMessage.chatbotState) setChatbotState(lastMessage.chatbotState);
                    if (lastMessage.options) setCurrentOptions(lastMessage.options);
                }
            }
        }, (error) => {
            console.error("Firestore snapshot failed:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const initBotSession = async () => {
        if (!currentUser) return;
        setIsTyping(true);
        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "__start__", state: null }),
            });

            const rawText = await response.text();
            if (!response.ok) {
                console.error("Init Bot Session Error Raw Response:", rawText);
                throw new Error("API responded with error");
            }

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (pE) {
                console.error("FAILED TO PARSE INIT SESSION JSON. RAW RESPONSE:", rawText);
                throw pE;
            }

            setChatbotState(data.state);
            setCurrentOptions(data.options || []);

            await addDoc(collection(db, 'users', currentUser.uid, 'chats'), {
                type: 'ai',
                text: data.reply,
                timestamp: new Date().toISOString(),
                chatbotState: data.state,
                options: data.options || [],
                id: 'welcome-' + Date.now()
            });
        } catch (error) {
            console.error("Init session failed:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async (forcedText = null) => {
        const messageText = forcedText || input;
        if (!messageText.trim() || !currentUser) return;

        if (!forcedText) setInput('');

        // OPTIMISTIC UI: Add message to local state immediately
        const userMsg = {
            id: 'temp-' + Date.now(),
            type: 'user',
            text: messageText,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // FIRE AND FORGET: Save user message in background
            addDoc(collection(db, 'users', currentUser.uid, 'chats'), {
                type: 'user',
                text: messageText,
                timestamp: userMsg.timestamp,
            });

            // 2. Call AI Backend
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    message: messageText,
                    state: chatbotState
                }),
            });
            clearTimeout(timeoutId);

            const rawText = await response.text();
            if (!response.ok) {
                console.error("Chat API Error Raw Response:", rawText);
                throw new Error("Chat API failure");
            }

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (pE) {
                console.error("FAILED TO PARSE CHAT JSON. RAW RESPONSE:", rawText);
                throw pE;
            }

            const botReply = data.reply;
            const newState = data.state;
            const nextOptions = data.options || [];

            setChatbotState(newState);
            setCurrentOptions(nextOptions);

            // 3. Save AI response in background
            addDoc(collection(db, 'users', currentUser.uid, 'chats'), {
                type: 'ai',
                text: botReply,
                emotion: newState.emotion || detectedEmotion,
                timestamp: new Date().toISOString(),
                chatbotState: newState,
                options: nextOptions,
            });

            if (newState.topic) {
                setDetectedEmotion(newState.topic);
            }

            setIsTyping(false);

        } catch (error) {
            console.error("AI Response failed:", error);
            setIsTyping(false);
            const fallbackMsg = {
                type: 'ai',
                text: "I'm having a little trouble connecting, but I'm still here for you. 💙",
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, fallbackMsg]);
        }
    };

    const moodPrompts = [
        { label: "Anxious", icon: Moon, color: "bg-blue-50 text-blue-600", text: "I feel anxious" },
        { label: "Stressed", icon: Coffee, color: "bg-orange-50 text-orange-600", text: "I'm feeling stressed" },
        { label: "Sad", icon: Cloud, color: "bg-indigo-50 text-indigo-600", text: "I'm feeling a bit sad" },
        { label: "Happy", icon: Sun, color: "bg-yellow-50 text-yellow-600", text: "I'm having a great day!" },
    ];

    function Cloud(props) {
        return (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5C17.6 6.1 14.5 3 10.5 3 6.9 3 3.8 5.6 3.1 9 1.3 9.8 0 11.5 0 13.5 0 16 2 18 4.5 18h13" />
            </svg>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFE] text-[#1F1F1F] font-sans pb-24 relative overflow-hidden">
            {/* 🎨 Ambient Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/30 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />

            {/* 🧭 NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-purple-50 flex items-center justify-center h-20 px-6">
                <div className="w-full max-w-5xl flex justify-between items-center">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-purple-600 font-bold transition-all text-sm">
                        <ChevronLeft className="w-5 h-5" /> Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">Pandora AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-24 h-screen flex flex-col relative z-10">

                {/* 🧘 Mood Quick Selectors */}
                <div className="flex flex-wrap gap-3 justify-center mb-8 mt-4">
                    {moodPrompts.map((m, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ y: -4, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSend(m.text)}
                            className={`flex items-center gap-2 p-3 rounded-2xl border border-white shadow-sm font-bold text-xs transition-colors ${m.color} backdrop-blur-md bg-opacity-60`}
                        >
                            <m.icon className="w-4 h-4" />
                            {m.label}
                        </motion.button>
                    ))}
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col mb-8 overflow-hidden rounded-[40px] border border-white/60 bg-white/40 backdrop-blur-3xl shadow-2xl shadow-purple-100/20">

                    {/* Header Info */}
                    <div className="p-8 border-b border-purple-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-tr from-purple-50 to-indigo-50 rounded-[22px] flex items-center justify-center border border-white shadow-inner">
                                <Brain className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Safe Space</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Always listening, never judging</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-6 rounded-[34px] font-semibold text-[15px] leading-relaxed shadow-sm transition-all ${message.type === 'user'
                                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-lg shadow-purple-200'
                                            : 'bg-white border border-purple-50 text-gray-800 rounded-tl-lg shadow-sm'
                                            }`}>
                                            {message.text}
                                        </div>
                                        {message.type === 'ai' && message.emotion && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-2 mt-3 ml-2 text-[10px] font-black text-purple-600 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-50 shadow-sm italic tracking-widest"
                                            >
                                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                                ANALYSIS: {message.emotion.toUpperCase()}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-white border border-purple-50 p-6 rounded-[34px] rounded-tl-lg shadow-sm">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 🧠 Interactive Options Chips */}
                    {currentOptions.length > 0 && (
                        <div className="px-8 pb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {currentOptions.map((opt, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend(opt.label)}
                                    className="px-5 py-2.5 bg-white border border-purple-100 rounded-full text-xs font-bold text-purple-600 shadow-sm hover:shadow-md hover:border-purple-200 transition-all backdrop-blur-md bg-opacity-80"
                                >
                                    {opt.label}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-8 bg-white/60 backdrop-blur-xl border-t border-purple-50/50">
                        <div className="flex gap-4 relative max-w-3xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Share what's on your mind..."
                                className="flex-1 px-10 py-6 bg-white border border-purple-100 rounded-[30px] outline-none focus:ring-4 focus:ring-purple-100/50 focus:border-purple-300 transition-all font-bold text-sm shadow-inner"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-[26px] flex items-center justify-center shadow-xl shadow-purple-200 transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                <Send className="w-6 h-6" />
                            </motion.button>
                        </div>
                        <p className="text-[10px] text-center font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">Encrypted • Empathetic • AI Powered</p>
                    </div>
                </div>
            </main>

            {/* ⚠️ EMERGENCY SOS (Vibrant) */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 12 }} whileTap={{ scale: 0.9 }}
                onClick={() => setIsSOSModalOpen(true)}
                className="fixed bottom-10 right-10 w-20 h-20 bg-rose-500 text-white rounded-[28px] shadow-2xl shadow-rose-200 flex items-center justify-center z-[100] border-4 border-white"
            >
                <AlertTriangle className="w-8 h-8 animate-pulse" />
            </motion.button>

            {/* SOS MODAL */}
            <AnimatePresence>
                {isSOSModalOpen && (
                    <div className="fixed inset-0 z-[110] bg-purple-900/20 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                            className="bg-white rounded-[40px] shadow-3xl max-w-lg w-full p-12 relative overflow-hidden text-center border border-purple-50"
                        >
                            <div className="w-24 h-24 bg-rose-50 rounded-[34px] flex items-center justify-center mx-auto mb-8">
                                <AlertTriangle className="w-12 h-12 text-rose-500" />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Emergency Support</h3>
                            <p className="text-sm font-bold text-gray-400 mb-12">You're not alone. Immediate support is available.</p>
                            <div className="space-y-4">
                                <button className="w-full p-6 bg-rose-500 text-white rounded-3xl font-black text-xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-colors">Call Hotline (911)</button>
                                <button className="w-full p-6 bg-gray-900 text-white rounded-3xl font-black text-xl hover:bg-black transition-colors">Text Support Line</button>
                            </div>
                            <button onClick={() => setIsSOSModalOpen(false)} className="mt-10 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest">Close</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
