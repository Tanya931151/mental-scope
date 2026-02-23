import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Heart, BookOpen, AlertCircle, LogIn, UserPlus, BarChart2, LayoutDashboard, Sparkles, LogOut, MapPin, Wind, Menu, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
    const location = useLocation();
    const { currentUser, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Hide global navigation on the new Mindo-styled dashboard to avoid clutter
    // The Dashboard now handles its own integrated navigation
    if (location.pathname === '/dashboard') return null;

    const navItems = [
        { path: '/', icon: Home, label: 'Explore' },
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/chat', icon: MessageCircle, label: 'AI Support' },
        { path: '/mood', icon: Heart, label: 'Moods' },
        { path: '/journal', icon: BookOpen, label: 'Insights' },
        { path: '/analytics', icon: BarChart2, label: 'Analytics' },
        { path: '/doctor-map', icon: MapPin, label: 'Doctors' },
        { path: '/facts', icon: Brain, label: 'Facts' },
        { path: '/meditation', icon: Wind, label: 'Breathe' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 md:py-6 pointer-events-none">
            <div className="max-w-7xl mx-auto w-full flex justify-between items-center pointer-events-auto">
                {/* Logo Capsule */}
                <Link to="/" className="bg-white/80 backdrop-blur-xl border border-white/60 p-2 pl-4 pr-6 rounded-full shadow-lg flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <span className="text-sm font-black tracking-tight text-gray-900 group-hover:text-purple-600 transition-colors">MentalScope</span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <Link to="/emergency">
                        <button className="bg-rose-600 text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:scale-105 transition-all">
                            SOS
                        </button>
                    </Link>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-white/80 backdrop-blur-xl border border-white/60 p-2.5 rounded-full shadow-lg text-gray-900"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Expansive Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 top-0 left-0 w-full h-full bg-[#F3F1FF]/95 backdrop-blur-2xl z-[90] p-10 flex flex-col items-center justify-center pointer-events-auto"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className="bg-white p-8 rounded-[40px] border border-white/60 shadow-xl hover:shadow-2xl transition-all flex flex-col items-center gap-4 group"
                                >
                                    <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-black text-gray-900 tracking-tight">{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-12 flex items-center gap-6">
                            {currentUser ? (
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="bg-rose-50 text-rose-600 px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest border border-rose-100"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <button className="bg-purple-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-200">
                                        Get Started
                                    </button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
