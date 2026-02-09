import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: "Hello! I'm here to support you. How are you feeling today? 💙",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const suggestedPrompts = [
        "I feel anxious",
        "Help me sleep better",
        "I'm feeling stressed",
        "I need motivation",
    ];

    const aiResponses = {
        anxious: "I understand that anxiety can feel overwhelming. Let's try a grounding technique together: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Take your time with each one. 🌿",
        sleep: "Sleep is so important for mental wellness. Here are some tips: Try to maintain a consistent sleep schedule, avoid screens 1 hour before bed, keep your room cool and dark, and consider a calming bedtime routine like reading or gentle stretching. Would you like to try a breathing exercise? 😴",
        stressed: "Stress is a natural response, but we can work through it together. First, take a deep breath with me: Breathe in for 4 counts, hold for 4, breathe out for 4. Remember, it's okay to take breaks and ask for help. What's causing you stress right now? 🌸",
        motivation: "You're already taking a positive step by being here! Remember: progress isn't always linear, and small steps count. What's one tiny thing you can do today that would make you feel good? Even something as simple as drinking water or stepping outside for a moment. You've got this! 💪",
        default: "Thank you for sharing that with me. Your feelings are valid, and I'm here to listen. Would you like to talk more about what's on your mind, or would you prefer some coping strategies? Remember, you're not alone in this journey. 💙",
    };

    const getAIResponse = (userMessage) => {
        const msg = userMessage.toLowerCase();
        if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('worried')) {
            return aiResponses.anxious;
        } else if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('tired')) {
            return aiResponses.sleep;
        } else if (msg.includes('stress') || msg.includes('overwhelm')) {
            return aiResponses.stressed;
        } else if (msg.includes('motivat') || msg.includes('inspire') || msg.includes('encourage')) {
            return aiResponses.motivation;
        } else {
            return aiResponses.default;
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: input,
            timestamp: new Date(),
        };

        setMessages([...messages, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking and response
        setTimeout(() => {
            const aiMessage = {
                id: messages.length + 2,
                type: 'ai',
                text: getAIResponse(input),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handlePromptClick = (prompt) => {
        setInput(prompt);
    };

    return (
        <div className="min-h-screen pb-4">
            <div className="container-custom max-w-4xl py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-3 shadow-sm">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">AI Mental Health Support</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Chat with AI Support
                    </h1>
                    <p className="text-gray-600">A safe space to share your thoughts and feelings</p>
                </motion.div>

                {/* Suggested Prompts */}
                {messages.length === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 flex flex-wrap gap-2 justify-center"
                    >
                        {suggestedPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => handlePromptClick(prompt)}
                                className="px-4 py-2 bg-white/70 hover:bg-purple-100 rounded-full text-sm text-gray-700 transition-all border border-purple-200"
                            >
                                {prompt}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Chat Container */}
                <div className="card min-h-[500px] max-h-[600px] flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                                        {message.text}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="chat-bubble-ai">
                                    <div className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    💡 This is an AI companion for support. For emergencies, please visit our{' '}
                    <a href="/emergency" className="text-purple-600 font-medium hover:underline">
                        Emergency Help
                    </a>{' '}
                    page.
                </p>
            </div>
        </div>
    );
}
