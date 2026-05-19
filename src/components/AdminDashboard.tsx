import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Globe, 
  ArrowLeft, 
  Shield, 
  Search,
  ChevronRight,
  TrendingUp,
  Monitor,
  Calendar,
  LogOut,
  Trash2,
  ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

interface VisitorLog {
  id: string;
  ip: string;
  timestamp: Timestamp;
  userAgent: string;
  page: string;
}

interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
  visitorCount: number | null;
}

export default function AdminDashboard({ onBack, onLogout, visitorCount }: AdminDashboardProps) {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewLimit, setViewLimit] = useState(50);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    // Increase fetch limit to allow for more searchability, 
    // but keep snapshot size reasonable for performance
    const q = query(
      collection(db, 'visitor_logs'),
      limit(1000) 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitorLog[];
      
      // Sort in memory to avoid index requirements
      data.sort((a, b) => {
        const t1 = a.timestamp?.toMillis() || 0;
        const t2 = b.timestamp?.toMillis() || 0;
        return t2 - t1;
      });

      setLogs(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching logs:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userAgent.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, viewLimit);

  const handleDelete = async (id: string) => {
    if (!window.confirm('এই লগটি নিশ্চিতভাবে ডিলেট করতে চান?')) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'visitor_logs', id));
    } catch (err) {
      console.error("Delete error:", err);
      alert('ডিলেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('সতর্কতা: সমস্ত লগ ডিলিট হয়ে যাবে! আপনি কি নিশ্চিত?')) return;
    const q = query(collection(db, 'visitor_logs'), limit(500));
    try {
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      alert('সর্বশেষ ৫০০টি লগ ডিলিট করা হয়েছে।');
    } catch (err) {
      console.error("Clear error:", err);
      alert('ক্লিয়ার করতে ব্যর্থ হয়েছে।');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '...';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors bg-white/5"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h1 className="font-black text-xl tracking-tight">অ্যাডমিন কন্ট্রোল প্যানেল</h1>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mt-1">Real-time Visitor Logistics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Session</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 hover:text-red-400 transition-all font-bold text-xs flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
            <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-emerald-400 border border-slate-700 shadow-inner">
              R
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'মোট ভিজিট', value: visitorCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'সিস্টেমে লগ', value: logs.length, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'বেস লিমিট', value: '৫০,০০০', icon: Shield, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'গ্রোথ রেট', value: '+৫.২%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5"
            >
              <div className={`${item.bg} p-4 rounded-2xl`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{item.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-12">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-emerald-600" />
                ভিজিটর আইপি লগ
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-slate-400 font-medium">দেখানো হচ্ছে: {filteredLogs.length} জন</p>
                <button 
                  onClick={handleClearAll}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  সমস্ত লগ মুছুন
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Limit Selector */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
                <ListFilter className="w-4 h-4 text-slate-400" />
                <select 
                  value={viewLimit}
                  onChange={(e) => setViewLimit(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value={10}>১০টি</option>
                  <option value={50}>৫০টি</option>
                  <option value={100}>১০০টি</option>
                  <option value={500}>৫০০টি</option>
                  <option value={1000}>১০০০টি</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="আইপি বা ব্রাউজার দিয়ে সার্চ..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-left">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">IP Address</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Access Time</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Browser Info</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-10 h-24 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <Globe className="w-5 h-5 text-blue-500" />
                          </div>
                          <span className="font-bold text-slate-700 tracking-tight font-mono text-sm">{log.ip}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(log.timestamp)}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium ml-5 mt-0.5">Automated timestamp</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 max-w-xs">
                        <div className="flex items-start gap-4">
                          <Monitor className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                          <div className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-100 p-2 rounded-xl border border-slate-200/50 line-clamp-2">
                            {log.userAgent}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeleting === log.id}
                          className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">
                      কোনো লগ পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
            <button 
              onClick={() => setViewLimit(prev => Math.min(prev + 50, 1000))}
              className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest"
            >
              See more history
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
