import { useState, useEffect } from 'react';
import { MapPin, Phone, Globe, Star, Navigation, Search, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MentalMap from '../components/MentalMap';

export default function DoctorMap() {
    const [clinics, setClinics] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedClinic, setSelectedClinic] = useState(null);

    const filteredClinics = clinics.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-20 bg-[#FBFBFE]">
            <div className="container-custom py-12 md:py-16 max-w-[1440px] mx-auto px-6">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-sm font-black text-rose-500 tracking-[0.3em] uppercase mb-3 px-1">Local Support</h1>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Care</span> Near You
                        </h2>
                    </motion.div>
                </header>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* 🌍 MAP SECTION */}
                    <div className="lg:col-span-8 sticky top-28">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[600px] lg:h-[700px] relative rounded-[40px] border-8 border-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden"
                        >
                            <MentalMap
                                clinics={filteredClinics}
                                setClinics={setClinics}
                                selectedClinic={selectedClinic}
                            />

                            {/* Floating Stats */}
                            <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-2xl flex items-center gap-5 transition-transform hover:scale-105">
                                <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                                    <Activity className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Coverage</div>
                                    <div className="text-2xl font-black text-gray-900">{filteredClinics.length} Facilities</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* 🏥 SIDEBAR SECTION */}
                    <div className="lg:col-span-4 h-full">
                        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-3xl p-6 rounded-[32px] border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] mb-8 group focus-within:ring-4 focus-within:ring-rose-100/50 transition-all">
                            <Search className="w-6 h-6 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or type..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-lg font-bold text-gray-800 placeholder:text-gray-300 w-full"
                            />
                        </div>

                        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode='popLayout'>
                                {filteredClinics.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-24 bg-white/40 rounded-[40px] border-4 border-dashed border-gray-100"
                                    >
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Search className="w-10 h-10 text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No Results Found</p>
                                        <p className="text-gray-300 text-sm mt-2">Try adjusting your search</p>
                                    </motion.div>
                                ) : (
                                    filteredClinics.map((clinic, idx) => (
                                        <motion.div
                                            key={clinic.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedClinic(clinic)}
                                            className={`p-8 rounded-[40px] border-4 transition-all cursor-pointer relative group overflow-hidden ${selectedClinic?.id === clinic.id
                                                    ? 'bg-rose-500 border-rose-500 text-white shadow-2xl shadow-rose-200 scale-105 z-10'
                                                    : 'bg-white border-white hover:border-rose-100 text-gray-900 shadow-sm'
                                                }`}
                                        >
                                            {selectedClinic?.id === clinic.id && (
                                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                                            )}

                                            <div className="flex items-start justify-between mb-5 relative z-10">
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${selectedClinic?.id === clinic.id ? 'text-rose-100' : 'text-rose-500'
                                                        }`}>
                                                        {clinic.type}
                                                    </p>
                                                    <h4 className="text-xl font-black leading-tight">{clinic.name}</h4>
                                                </div>
                                                <div className={`p-3 rounded-2xl ${selectedClinic?.id === clinic.id ? 'bg-white/20' : 'bg-rose-50'
                                                    }`}>
                                                    <Navigation className={`w-5 h-5 ${selectedClinic?.id === clinic.id ? 'text-white' : 'text-rose-500'
                                                        }`} />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mb-8 relative z-10 opacity-80">
                                                <MapPin className="w-4 h-4 shrink-0" />
                                                <p className="text-xs font-bold leading-relaxed line-clamp-2">{clinic.address}</p>
                                            </div>

                                            <div className="flex gap-3 relative z-10">
                                                <a
                                                    href={`https://www.google.com/maps?q=${clinic.lat},${clinic.lon}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center transition-all ${selectedClinic?.id === clinic.id
                                                            ? 'bg-white text-rose-600 hover:bg-opacity-90'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-rose-600 hover:text-white'
                                                        }`}
                                                >
                                                    Open Directions
                                                </a>
                                                <button className={`p-4 rounded-2xl transition-all ${selectedClinic?.id === clinic.id ? 'bg-white/20' : 'bg-gray-50 text-gray-400'
                                                    }`}>
                                                    <Globe className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
