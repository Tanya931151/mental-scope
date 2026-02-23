import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, User, Brain, Heart, ChevronRight, Play, Star, Plus,
  MessageCircle, Smile, Activity, Zap, MapPin, BookOpen,
  LogOut, Settings, AlertTriangle, Send
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- Static Data ---
const moodTrendData = [
  { day: 'M', level: 3 }, { day: 'T', level: 4 }, { day: 'W', level: 3 },
  { day: 'T', level: 5 }, { day: 'F', level: 6 }, { day: 'S', level: 4 }, { day: 'S', level: 5 },
];

const emotionDistData = [
  { name: 'Calm', value: 45, color: '#8B5CF6' },
  { name: 'Happy', value: 25, color: '#10B981' },
  { name: 'Anxious', value: 20, color: '#F59E0B' },
  { name: 'Tired', value: 10, color: '#6B7280' },
];

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'User' });
  const [mood, setMood] = useState(7);
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) setUserData(userDoc.data());
        else if (currentUser.displayName) setUserData({ name: currentUser.displayName });
      };
      fetchProfile();
    }
  }, [currentUser]);

  const userName = userData.name?.split(' ')[0] || 'Sara';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-[#1F1F1F] font-sans overflow-x-hidden">
      {/* 🧭 PREMIUM NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-center">
        <div className="w-full max-w-[1440px] px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 shrink-0 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:rotate-6 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 hidden md:block">MentalScope</span>
            </div>

            <div className="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 w-64 group focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-3" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="hidden sm:flex p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500 shadow-sm transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm pr-4 hover:border-purple-200 transition-all"
              >
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-purple-600" /></div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-[60]"
                  >
                    <div className="px-4 py-3 border-b mb-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.email}</p>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-xl text-sm font-bold text-gray-700 transition-all"><User className="w-4 h-4" /> Profile</button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-xl text-sm font-bold text-gray-700 transition-all"><Settings className="w-4 h-4" /> Settings</button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 rounded-xl text-sm font-bold text-rose-600 mt-1 transition-all"><LogOut className="w-4 h-4" /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* 🏠 MAIN CONTENT */}
      <main className="max-w-[1440px] mx-auto px-6 pt-36 pb-20">

        {/* WELCOME */}
        <section className="mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Hello, {userName} 👋</h1>
            <p className="text-xl font-bold text-gray-400">How's your mood right now?</p>
          </motion.div>
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { label: 'Happy', emoji: '😊', color: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' },
              { label: 'Calm', emoji: '😌', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' },
              { label: 'Sad', emoji: '😔', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' },
              { label: 'Stressed', emoji: '🤯', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' },
              { label: 'Angry', emoji: '😤', color: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' },
            ].map(m => (
              <button
                key={m.label}
                onClick={() => setSelectedMood(m.label)}
                className={`flex items-center gap-3 px-8 py-4 bg-white border-2 rounded-3xl font-black text-sm whitespace-nowrap transition-all ${selectedMood === m.label ? 'border-purple-500 ring-4 ring-purple-100' : 'border-gray-50'} ${m.color}`}
              >
                <span className="text-2xl">{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>
        </section>

        {/* 📊 DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">

          {/* TRACKING COL */}
          <div className="lg:col-span-4 space-y-8">
            <div className="premium-card">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-2xl"><Smile className="w-6 h-6 text-purple-600" /></div>
                  <h3 className="text-2xl font-black text-gray-900">Mood Diary</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stress Index</span>
                    <span className="text-sm font-black text-purple-600">{mood}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(e.target.value)}
                    className="w-full accent-purple-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                  <div className="p-5 bg-purple-50 rounded-3xl border border-purple-100">
                    <p className="text-sm font-bold text-purple-900/60 leading-relaxed italic">"You're feeling {selectedMood.toLowerCase()} today. Take deep breaths if needed."</p>
                  </div>
                  <button className="btn-mindo-primary w-full">Save Entry</button>
                </div>
              </div>
            </div>

            <div className="premium-card bg-gray-900 !text-white border-none overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl"><MessageCircle className="w-6 h-6 text-purple-400" /></div>
                  <h3 className="text-2xl font-black">AI Therapist</h3>
                </div>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">"Ready to work through your thoughts today, {userName}?"</p>
                <button onClick={() => navigate('/chat')} className="btn-mindo-secondary w-full flex items-center justify-center gap-3">Start Session <Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* ANALYTICS COL */}
          <div className="lg:col-span-5 space-y-8">
            <div className="premium-card h-[480px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-2xl"><Activity className="w-6 h-6 text-blue-600" /></div>
                  <h3 className="text-2xl font-black text-gray-900">Analytics</h3>
                </div>
                <select className="bg-gray-50 border-none rounded-xl px-4 py-2 font-black text-[10px] outline-none">
                  <option>Last 7 Days</option>
                </select>
              </div>
              <div className="flex-1 space-y-12 overflow-hidden">
                <div className="h-40">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Mood Trend</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodTrendData}>
                      <Area type="monotone" dataKey="level" stroke="#8B5CF6" strokeWidth={4} fill="#8B5CF6" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-40 flex items-center justify-center relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Top Emotion</span>
                    <span className="text-lg font-black text-purple-600">Calm</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={emotionDistData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                        {emotionDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="premium-card">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-2xl"><Zap className="w-6 h-6 text-green-600" /></div>
                  <h3 className="text-2xl font-black text-gray-900">Weekly Progress</h3>
                </div>
                <span className="text-3xl font-black tracking-tighter">76%</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                {[
                  { label: 'Meditation', val: 50, color: 'bg-purple-500' },
                  { label: 'Exercise', val: 85, color: 'bg-green-500' },
                  { label: 'Journal', val: 60, color: 'bg-indigo-500' },
                  { label: 'Sleep', val: 70, color: 'bg-blue-500' },
                ].map(p => (
                  <div key={p.label}>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{p.label}</p>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${p.color}`} style={{ width: `${p.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INSIGHTS COL */}
          <div className="lg:col-span-3 space-y-8">
            <div className="premium-card">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-2xl"><BookOpen className="w-6 h-6 text-indigo-600" /></div>
                  <h3 className="text-2xl font-black text-gray-900">Journal</h3>
                </div>
                <button className="text-purple-600 hover:scale-110 transition-transform"><Plus /></button>
              </div>
              <div className="flex flex-col gap-6">
                {['Morning Flow', 'Anxiety Log', 'Gratitude'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                    <span className="font-bold text-sm text-gray-700">{item}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600" />
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/journal')} className="w-full mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[.2em] hover:text-purple-600 transition-all">View All Entries</button>
            </div>

            <div className="premium-card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
              <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block mb-6">Upcoming</span>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-white/20 p-1 rounded-2xl shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=drj" className="w-full h-full rounded-xl" /></div>
                <div>
                  <p className="text-lg font-black leading-tight">Dr. Jas Alther</p>
                  <p className="text-[10px] font-bold text-white/60">Expert Psychiatrist</p>
                </div>
              </div>
              <div className="text-4xl font-black tabular-nums mb-8 tracking-tighter">06:42<span className="text-xs text-white/50 ml-2">HRS LEFT</span></div>
              <button className="w-full py-4 bg-white text-purple-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-purple-900/10">Join Call</button>
            </div>
          </div>
        </div>

        {/* 🌟 RECOMMENDATIONS ROW */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 premium-card">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-2xl"><Star className="w-6 h-6 text-amber-500" /></div>
                <h3 className="text-2xl font-black text-gray-900">Personalized Support</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Box Breathing', icon: Heart, color: 'bg-purple-100 text-purple-600' },
                { name: '5-4-3-2-1 Fix', icon: Zap, color: 'bg-amber-100 text-amber-600' },
                { name: 'Lofi Chillmix', icon: Play, color: 'bg-blue-100 text-blue-600' },
                { name: 'Gratitude', icon: BookOpen, color: 'bg-rose-100 text-rose-600' },
              ].map((act, i) => (
                <div key={i} className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-50 rounded-[32px] hover:shadow-xl transition-all cursor-pointer group">
                  <div className={`p-4 rounded-2xl ${act.color} group-hover:scale-110 transition-transform`}><act.icon className="w-6 h-6" /></div>
                  <span className="text-[11px] font-black text-gray-900 uppercase text-center">{act.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 premium-card flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-rose-100 rounded-2xl"><MapPin className="w-6 h-6 text-rose-500" /></div>
              <h3 className="text-2xl font-black text-gray-900">Nearby Care</h3>
            </div>
            <div className="flex-1 min-h-[160px] bg-gray-50 rounded-[32px] border-4 border-white shadow-inner mb-6 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1/400x200?access_token=pk.placeholder')] opacity-20 bg-cover" />
              <div className="relative bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black uppercase">3 Clinics Near You</span>
              </div>
            </div>
            <button onClick={() => navigate('/doctor-map')} className="btn-mindo-secondary w-full">Find Doctors</button>
          </div>
        </section>
      </main>

      {/* ⚠️ EMERGENCY SOS */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsSOSModalOpen(true)}
        className="fixed bottom-10 right-10 w-20 h-20 bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[100] border-4 border-white overflow-hidden"
      >
        <AlertTriangle className="w-8 h-8 animate-pulse" />
      </motion.button>

      {/* SOS MODAL */}
      <AnimatePresence>
        {isSOSModalOpen && (
          <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-3xl max-w-lg w-full p-10 relative overflow-hidden text-center"
            >
              <div className="w-20 h-20 bg-rose-100 rounded-[28px] flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-10 h-10 text-rose-600" /></div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">Emergency Help</h3>
              <p className="text-sm font-bold text-gray-400 mb-10">You're not alone. Immediate help is a call away.</p>
              <div className="space-y-4">
                <button className="w-full p-6 bg-rose-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-rose-100">Call Emergency (911)</button>
                <button className="w-full p-6 bg-gray-900 text-white rounded-3xl font-black text-xl">Crisis Text Line</button>
              </div>
              <button onClick={() => setIsSOSModalOpen(false)} className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-900 font-black">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
