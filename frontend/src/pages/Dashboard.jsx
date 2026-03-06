import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import {
  Brain, User, AlertTriangle, Send, Heart, Settings,
  LogOut, Search, Bell, ChevronDown, CheckCircle2, TrendingUp, Activity,
  Utensils, Moon, Briefcase, Dumbbell, MonitorSmartphone, Lightbulb, Save, History, Smartphone,
  FileText, ArrowRight, Bot, Zap, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'User' });
  const [entries, setEntries] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalLogs: 0,
    avgMood: 0,
    avgSleep: 0,
    avgProductivity: 0
  });
  const [chartData, setChartData] = useState([]);

  // 1-10 Scale Metrics State
  const [metrics, setMetrics] = useState({
    mood: 5,
    eating: 5,
    sleeping: 7,
    working: 6,
    fitness: 3,
    screenTime: 6,
    learning: 4
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const metricConfig = [
    { key: 'mood', label: 'Overall Mood', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', chartStroke: '#f43f5e' },
    { key: 'sleeping', label: 'Sleeping Hrs', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', chartStroke: '#6366f1' },
    { key: 'working', label: 'Working Hrs', icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50', chartStroke: '#f59e0b' },
    { key: 'fitness', label: 'Fitness/Gym', icon: Dumbbell, color: 'text-emerald-500', bg: 'bg-emerald-50', chartStroke: '#10b981' },
    { key: 'eating', label: 'Diet/Eating', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50', chartStroke: '#f97316' },
    { key: 'learning', label: 'Learning Skills', icon: Lightbulb, color: 'text-cyan-500', bg: 'bg-cyan-50', chartStroke: '#06b6d4' },
    { key: 'screenTime', label: 'Screen Time', icon: Smartphone, color: 'text-slate-500', bg: 'bg-slate-50', chartStroke: '#64748b' }
  ];

  const fetchEntriesData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, `users/${currentUser.uid}/entries`),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const rawEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter only new daily_metrics format
      const metricEntries = rawEntries.filter(e => e.type === 'daily_metrics');
      setEntries(metricEntries);
      processDashboardData(metricEntries);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) setUserData(userDoc.data());
          else if (currentUser.displayName) setUserData({ name: currentUser.displayName });
        } catch (err) {
          console.error("Error fetching user profile:", err);
          if (currentUser.displayName) setUserData({ name: currentUser.displayName });
        }
      };
      fetchProfile();
      fetchEntriesData();
    }
  }, [currentUser, fetchEntriesData]);

  const processDashboardData = (metricEntries) => {
    const total = metricEntries.length;
    if (total === 0) {
      // Dummy data if empty so UI looks premium
      setChartData([
        { name: 'Mon', mood: 5, sleeping: 6, working: 7, fitness: 2, eating: 6, learning: 3, screenTime: 8 },
        { name: 'Tue', mood: 7, sleeping: 8, working: 8, fitness: 4, eating: 7, learning: 4, screenTime: 7 },
        { name: 'Wed', mood: 6, sleeping: 7, working: 9, fitness: 3, eating: 6, learning: 5, screenTime: 6 },
        { name: 'Thu', mood: 8, sleeping: 7, working: 8, fitness: 5, eating: 8, learning: 6, screenTime: 5 },
        { name: 'Fri', mood: 9, sleeping: 8, working: 6, fitness: 6, eating: 9, learning: 4, screenTime: 7 },
        { name: 'Sat', mood: 10, sleeping: 9, working: 2, fitness: 8, eating: 8, learning: 8, screenTime: 9 },
        { name: 'Sun', mood: 9, sleeping: 8, working: 0, fitness: 7, eating: 9, learning: 7, screenTime: 8 }
      ]);
      setStats({ totalLogs: 0, avgMood: 0, avgSleep: 0, avgProductivity: 0 });
      return;
    }

    let tMood = 0, tSleep = 0, tWork = 0, tLearn = 0;

    const grouped = {};
    metricEntries.forEach(e => {
      tMood += (e.mood || 0);
      tSleep += (e.sleeping || 0);
      tWork += (e.working || 0);
      tLearn += (e.learning || 0);

      let dateStr = 'Unknown';
      if (e.timestamp && e.timestamp.toDate) {
        dateStr = e.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (!grouped[dateStr]) {
        grouped[dateStr] = { name: dateStr, count: 0, mood: 0, sleeping: 0, working: 0, fitness: 0, eating: 0, learning: 0, screenTime: 0 };
      }

      grouped[dateStr].mood += (e.mood || 0);
      grouped[dateStr].sleeping += (e.sleeping || 0);
      grouped[dateStr].working += (e.working || 0);
      grouped[dateStr].fitness += (e.fitness || 0);
      grouped[dateStr].eating += (e.eating || 0);
      grouped[dateStr].learning += (e.learning || 0);
      grouped[dateStr].screenTime += (e.screenTime || 0);
      grouped[dateStr].count++;
    });

    const avgMood = (tMood / total).toFixed(1);
    const avgSleep = (tSleep / total).toFixed(1);
    const avgProductivity = ((tWork + tLearn) / (2 * total)).toFixed(1);

    setStats({
      totalLogs: total,
      avgMood,
      avgSleep,
      avgProductivity
    });

    const formattedChartData = Object.keys(grouped).slice(0, 7).map(k => {
      const item = grouped[k];
      return {
        name: item.name,
        mood: Number((item.mood / item.count).toFixed(1)),
        sleeping: Number((item.sleeping / item.count).toFixed(1)),
        working: Number((item.working / item.count).toFixed(1)),
        fitness: Number((item.fitness / item.count).toFixed(1)),
        eating: Number((item.eating / item.count).toFixed(1)),
        learning: Number((item.learning / item.count).toFixed(1)),
        screenTime: Number((item.screenTime / item.count).toFixed(1)),
      };
    }).reverse();

    setChartData(formattedChartData);
  };

  const handleSliderChange = (e, key) => {
    setMetrics({ ...metrics, [key]: parseInt(e.target.value) });
  };

  const handleSaveMetrics = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, `users/${currentUser.uid}/entries`), {
        type: 'daily_metrics',
        ...metrics,
        timestamp: serverTimestamp()
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      fetchEntriesData(); // Refresh UI dynamically
    } catch (err) {
      console.error("Failed to save metrics:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const userName = userData.name || 'User';

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-gray-800">
      {/* 🟢 SIDEBAR */}
      <aside className="w-64 bg-white hidden lg:flex flex-col h-screen fixed left-0 top-0 border-r border-gray-100 z-40 px-6 py-8">
        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-xl">a</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-black tracking-tight text-gray-900">MentalScope</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Numero Unos</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 bg-indigo-600 text-white rounded-2xl shadow-md border border-indigo-500 font-bold text-sm transition-all">
            <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-md"><Activity className="w-3.5 h-3.5 text-white" /></span>
            Dashboard
          </Link>
          <button className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-2xl font-bold text-sm transition-all group text-left">
            <span className="w-5 h-5 flex items-center justify-center border border-gray-200 rounded-md group-hover:border-gray-300"><Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700" /></span>
            Settings
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-2xl font-bold text-sm transition-all group">
            <span className="w-5 h-5 flex items-center justify-center border border-rose-100 bg-rose-50 rounded-md group-hover:bg-rose-100"><LogOut className="w-3.5 h-3.5 text-rose-500" /></span>
            Log Out
          </button>
        </div>
      </aside>

      {/* 🟢 MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col overflow-hidden">

        {/* TOP HEADER */}
        <header className="h-24 bg-white/50 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-30 sticky top-0">
          <div className="flex-1 max-w-md">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-4" />
              <input
                type="text"
                placeholder="Ask Pandora AI anything..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#F4F7FE]"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-9 h-9 bg-gray-900 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                  {userName.charAt(0)}
                </div>
                <div className="flex flex-col text-left mr-2 hidden sm:block">
                  <span className="text-sm font-black text-gray-900 leading-tight">{userName}</span>
                  <span className="text-[10px] font-bold text-gray-400 truncate w-24">{currentUser?.email}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-[60] origin-top-right overflow-hidden"
                  >
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors"><User className="w-4 h-4" /> Profile</button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-sm font-bold text-rose-600 transition-colors"><LogOut className="w-4 h-4" /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8 flex-1 overflow-y-auto">

          {/* 1-10 METRICS LOGGER WIDGET */}
          <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 z-0"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Daily Habit & Mood Scale 📊</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">Rate your day across all dimensions from 1 to 10.</p>
                </div>
                <button
                  onClick={handleSaveMetrics}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center gap-2 group"
                >
                  {savedSuccess ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Save className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />}
                  {isSaving ? 'Saving...' : savedSuccess ? 'Logged!' : 'Save Today\'s Log'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-6">
                {metricConfig.map(({ key, label, icon: Icon, color, bg }) => (
                  <div key={key} className="flex flex-col gap-3 p-4 rounded-2xl hover:bg-gray-50/50 transition-colors border border-transparent hover:border-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
                        <span className="text-sm font-bold text-gray-700">{label}</span>
                      </div>
                      <span className={`text-xl font-black ${metrics[key] >= 8 ? 'text-green-500' : metrics[key] <= 3 ? 'text-rose-500' : 'text-gray-900'}`}>
                        {metrics[key]}<span className="text-xs text-gray-400">/10</span>
                      </span>
                    </div>
                    <input
                      type="range" min="1" max="10"
                      value={metrics[key]}
                      onChange={(e) => handleSliderChange(e, key)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      style={{ backgroundImage: `linear-gradient(to right, #4f46e5 ${(metrics[key] - 1) * 11.1}%, #e5e7eb ${(metrics[key] - 1) * 11.1}%)` }}
                    />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4 STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold text-gray-500">Total Logs</p>
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"><History className="w-4 h-4" /></div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{stats.totalLogs}</h3>
              <p className="text-xs font-bold text-green-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> All Time</p>
            </div>
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold text-gray-500">Avg Mood</p>
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200"><Heart className="w-4 h-4" /></div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{stats.avgMood}<span className="text-base text-gray-400 font-bold ml-1">/10</span></h3>
              <p className="text-xs font-bold text-indigo-500 flex items-center gap-1"><Activity className="w-3 h-3" /> Based on 1-10 scale</p>
            </div>
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold text-gray-500">Avg Sleep</p>
                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200"><Moon className="w-4 h-4" /></div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{stats.avgSleep}<span className="text-base text-gray-400 font-bold ml-1">/10</span></h3>
              <p className="text-xs font-bold text-green-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Healthy Range</p>
            </div>
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold text-gray-500">Productivity Index</p>
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200"><Briefcase className="w-4 h-4" /></div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{stats.avgProductivity}<span className="text-base text-gray-400 font-bold ml-1">/10</span></h3>
              <p className="text-xs font-bold text-indigo-500 flex items-center gap-1"><Activity className="w-3 h-3" /> Work + Learning</p>
            </div>
          </div>

          {/* MIDDLE SECTION - CHARTS & PANELS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Main Graph */}
            <div className="xl:col-span-2 bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Life Dimensions Over Time</h2>
                  <p className="text-xs font-bold text-gray-400">Tracking all your 1-10 entries</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100">
                    This Week <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full relative -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }} dx={-10} />
                    <Tooltip
                      cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      labelStyle={{ fontWeight: 'black', color: '#111827', marginBottom: '8px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />

                    {metricConfig.map(c => (
                      <Line key={c.key} type="monotone" dataKey={c.key} name={c.label} stroke={c.chartStroke} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: c.chartStroke }} activeDot={{ r: 6 }} />
                    ))}

                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Side Panels */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-md font-black text-gray-900 leading-tight">AI Insights</h2>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">Based on your logs</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-xl -mr-8 -mt-8 opacity-50"></div>
                  <p className="text-sm font-medium text-gray-700 relative z-10 italic leading-relaxed">
                    "Your mood seems highly correlated with your sleeping hours and fitness routines. Try to maintain +7 for sleep to keep your mood elevated."
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-6 rounded-2xl relative overflow-hidden group shadow-lg shadow-indigo-200 transition-all text-left"
              >
                <div className="absolute inset-y-0 right-0 p-4 opacity-20 transform translate-x-4 group-hover:scale-110 transition-transform flex items-center">
                  <Brain className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-black tracking-widest mb-1 flex items-center gap-2">CHAT WITH PANDORA <Send className="w-4 h-4 ml-1" /></h3>
                  <p className="text-xs font-medium text-indigo-100 max-w-[80%]">Discuss your metrics deeply with AI.</p>
                </div>
              </button>
            </div>
          </div>

          {/* AI FEATURE WIDGETS SECTION */}
          <div className="mb-8">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-600" /> MentalScope AI Core
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <Link to="/journal" className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[24px] p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black mb-1">AI Journal</h3>
                <p className="text-xs font-bold text-indigo-100 mb-4 opacity-90">NLP Emotion Detection</p>
                <div className="flex items-center text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                  Log Entry <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/lifestyle" className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-[24px] p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black mb-1">Stress Predictor</h3>
                <p className="text-xs font-bold text-emerald-100 mb-4 opacity-90">ML Risk Forecasting</p>
                <div className="flex items-center text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                  Run Model <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/analytics" className="bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-[24px] p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black mb-1">XAI Insights</h3>
                <p className="text-xs font-bold text-purple-100 mb-4 opacity-90">Explainable Analysis</p>
                <div className="flex items-center text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                  View Data <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/mental-score" className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[24px] p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black mb-1">Mental Index</h3>
                <p className="text-xs font-bold text-rose-100 mb-4 opacity-90">Survey Benchmarking</p>
                <div className="flex items-center text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                  Calculate <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>
          </div>

          {/* BOTTOM TRANSACTION TABLE */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-900">Historical Logs</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 w-48 sm:w-64 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Date</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Mood</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Sleep</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Work</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Fit</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Eat</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Screen</th>
                    <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">Learn</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-gray-900">{entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Just now'}</td>
                      <td className="py-4 text-sm font-bold text-gray-600"><span className="px-2 py-1 rounded-md bg-rose-50 text-rose-600">{entry.mood || '-'}</span></td>
                      <td className="py-4 text-sm font-bold text-gray-600"><span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-600">{entry.sleeping || '-'}</span></td>
                      <td className="py-4 text-sm font-bold text-gray-600"><span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600">{entry.working || '-'}</span></td>
                      <td className="py-4 text-sm font-bold text-gray-600"><span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">{entry.fitness || '-'}</span></td>
                      <td className="py-4 text-sm font-bold text-gray-600"><span className="px-2 py-1 rounded-md bg-orange-50 text-orange-600">{entry.eating || '-'}</span></td>
                      <td className="py-4 text-sm font-bold text-gray-600"><span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600">{entry.screenTime || '-'}</span></td>
                      <td className="py-4 text-sm font-bold text-gray-600"><span className="px-2 py-1 rounded-md bg-cyan-50 text-cyan-600">{entry.learning || '-'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {entries.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm font-bold text-gray-500">No logs yet. Start using the sliders above!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* EMERGENCY SOS */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsSOSModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-rose-500 text-white rounded-full shadow-lg shadow-rose-200 flex items-center justify-center z-[100] hover:bg-rose-600 transition-colors"
      >
        <AlertTriangle className="w-6 h-6" />
      </motion.button>

      {/* SOS MODAL */}
      <AnimatePresence>
        {isSOSModalOpen && (
          <div className="fixed inset-0 z-[110] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Breathe.</h3>
              <p className="text-sm font-medium text-gray-500 mb-8 px-4">Help is always available. You are not alone.</p>

              <div className="space-y-3">
                <a href="tel:911" className="block w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-lg transition-colors shadow-md shadow-rose-100">
                  Call 911
                </a>
                <button onClick={() => setIsSOSModalOpen(false)} className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl font-bold transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
