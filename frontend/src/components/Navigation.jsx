import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Heart, BookOpen, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation() {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
        { path: '/mood', icon: Heart, label: 'Mood' },
        { path: '/journal', icon: BookOpen, label: 'Journal' },
        { path: '/emergency', icon: AlertCircle, label: 'SOS' },
    ];

    const authItems = [
        { path: '/login', icon: LogIn, label: 'Sign In' },
        { path: '/signup', icon: UserPlus, label: 'Sign Up' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-100">
            <div className="container-custom">
                <div className="flex items-center justify-between py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" fill="white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            MentalScope
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link flex items-center gap-2 ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="w-px h-6 bg-gray-300 mx-2"></div>

                        {authItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link flex items-center gap-2 ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-4 flex flex-wrap gap-2">
                    {[...navItems, ...authItems].map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link flex items-center gap-1 text-sm ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <Icon className="w-3 h-3" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
