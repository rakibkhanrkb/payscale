/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Calculator, 
  MapPin, 
  User, 
  Banknote, 
  TrendingUp, 
  Info,
  CheckCircle2,
  Building2,
  Home,
  Waves,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Data ---

const GRADES = [
  { grade: 1, start2015: 78000, start2026: 160000, type: 'কর্মকর্তা' },
  { grade: 2, start2015: 66000, start2026: 132000, type: 'কর্মকর্তা' },
  { grade: 3, start2015: 56500, start2026: 113000, type: 'কর্মকর্তা' },
  { grade: 4, start2015: 50000, start2026: 100000, type: 'কর্মকর্তা' },
  { grade: 5, start2015: 43000, start2026: 86000, type: 'কর্মকর্তা' },
  { grade: 6, start2015: 35500, start2026: 71000, type: 'কর্মকর্তা' },
  { grade: 7, start2015: 29000, start2026: 58000, type: 'কর্মকর্তা' },
  { grade: 8, start2015: 23000, start2026: 47200, type: 'কর্মকর্তা' },
  { grade: 9, start2015: 22000, start2026: 45100, type: 'কর্মকর্তা' },
  { grade: 10, start2015: 16000, start2026: 32000, type: 'কর্মকর্তা' },
  { grade: 11, start2015: 12500, start2026: 25000, type: 'কর্মচারী' },
  { grade: 12, start2015: 11300, start2026: 24300, type: 'কর্মচারী' },
  { grade: 13, start2015: 11000, start2026: 24000, type: 'কর্মচারী' },
  { grade: 14, start2015: 10200, start2026: 23500, type: 'কর্মচারী' },
  { grade: 15, start2015: 9700, start2026: 22800, type: 'কর্মচারী' },
  { grade: 16, start2015: 9300, start2026: 21900, type: 'কর্মচারী' },
  { grade: 17, start2015: 9000, start2026: 21400, type: 'কর্মচারী' },
  { grade: 18, start2015: 8800, start2026: 21000, type: 'কর্মচারী' },
  { grade: 19, start2015: 8500, start2026: 20500, type: 'কর্মচারী' },
  { grade: 20, start2015: 8250, start2026: 20000, type: 'কর্মচারী' },
];

const LOCATIONS = [
  { id: 'dhaka', name: 'ঢাকা সিটি কর্পোরেশন এলাকা' },
  { id: 'other_city', name: 'চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট, বরিশাল, রংপুর, নারায়ণগঞ্জ ও গাজীপুর সিটি কর্পোরেশন এবং সাভার পৌর এলাকা' },
  { id: 'district_upazila', name: 'জেলা বা উপজেলা (অন্যান্য স্থান)' },
];

// --- Types ---

interface CalculationResult {
  newBasic: number;
  houseRent: number;
  medical: number;
  tiffin: number;
  washing: number;
  total: number;
  gradeData: typeof GRADES[0];
}

export default function App() {
  const [grade, setGrade] = useState<number>(9);
  const [currentBasic, setCurrentBasic] = useState<string>('');
  const [location, setLocation] = useState<string>('district_upazila');

  const calculation = useMemo((): CalculationResult | null => {
    const basicNum = parseFloat(currentBasic);
    if (isNaN(basicNum) || basicNum <= 0) return null;

    const gradeData = GRADES.find((g) => g.grade === grade);
    if (!gradeData) return null;

    // Formula: (Proposed Starting 2026 - 2015 Starting) * 50% + Current Basic
    const newBasic = Math.round((gradeData.start2026 - gradeData.start2015) * 0.5 + basicNum);

    // House Rent Rules (from image)
    let houseRent = 0;
    if (location === 'dhaka') {
      if (basicNum <= 9700) houseRent = Math.max(basicNum * 0.65, 5600);
      else if (basicNum <= 16000) houseRent = Math.max(basicNum * 0.60, 6400);
      else if (basicNum <= 35500) houseRent = Math.max(basicNum * 0.55, 9600);
      else houseRent = Math.max(basicNum * 0.50, 19500);
    } else if (location === 'other_city') {
      if (basicNum <= 9700) houseRent = Math.max(basicNum * 0.55, 5000);
      else if (basicNum <= 16000) houseRent = Math.max(basicNum * 0.50, 5400);
      else if (basicNum <= 35500) houseRent = Math.max(basicNum * 0.45, 8000);
      else houseRent = Math.max(basicNum * 0.40, 16000);
    } else { // district_upazila
      if (basicNum <= 9700) houseRent = Math.max(basicNum * 0.50, 4500);
      else if (basicNum <= 16000) houseRent = Math.max(basicNum * 0.45, 4800);
      else if (basicNum <= 35500) houseRent = Math.max(basicNum * 0.40, 7000);
      else houseRent = Math.max(basicNum * 0.35, 13800);
    }

    const medical = 1500;
    const tiffin = (grade >= 13 && grade <= 20) ? 200 : 0;
    const washing = (grade >= 13 && grade <= 20) ? 100 : 0;

    const total = newBasic + houseRent + medical + tiffin + washing;

    return {
      newBasic,
      houseRent,
      medical,
      tiffin,
      washing,
      total,
      gradeData
    };
  }, [grade, currentBasic, location]);

  const bngNum = (num: number) => {
    return num.toLocaleString('bn-BD');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none text-slate-800">বেতন নির্ধারন ২০২৬</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Proposed Fixation Calculator</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-700">সরকারি কর্মচারিদের-নবম পে-স্কেল</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700">
                <Info className="w-5 h-5 text-emerald-600" />
                তথ্য প্রদান করুন
              </h2>

              <div className="space-y-6">
                {/* Grade Search */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">গ্রেড সিলেক্ট করুন</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <select 
                      value={grade}
                      onChange={(e) => setGrade(parseInt(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer font-medium"
                    >
                      {GRADES.map((g) => (
                        <option key={g.grade} value={g.grade}>
                          {bngNum(g.grade)}ম গ্রেড ({g.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salary Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">জুলাই -২০২৬ এ মূল বেতন (টাকায়)</label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input 
                      type="number"
                      value={currentBasic}
                      onChange={(e) => setCurrentBasic(e.target.value)}
                      placeholder="যেমন: ৩০০০"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Location Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-3">পোস্টিং প্লেস বা অবস্থান</label>
                  <div className="grid grid-cols-1 gap-2">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => setLocation(loc.id)}
                        className={`text-left px-4 py-3 rounded-2xl border text-sm transition-all flex items-start gap-3 group ${
                          location === loc.id 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${location === loc.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="font-medium leading-relaxed">{loc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-3xl text-slate-300 shadow-lg">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                ফলাফল কিভাবে কাজ করে?
              </h3>
              <p className="text-xs leading-relaxed opacity-80">
                নতুন মূল বেতন = (২০২৬ এর শুরুর ধাপ - ২০১৫ এর শুরুর ধাপ) × ৫০% + বর্তমান মূল বেতন। এর সাথে বাড়ি ভাড়া, চিকিৎসা ও অন্যান্য ভাতা যুক্ত হয়ে গ্রস বেতন নির্ধারিত হবে।
              </p>
            </div>
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {calculation ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  {/* Results Dashboard */}
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 pb-4">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">প্রাক্কলিত সর্বমোট প্রাপ্তি</p>
                          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
                            <span className="text-emerald-600">৳</span> {bngNum(calculation.total)}
                          </h2>
                        </div>
                        <div className="bg-emerald-100 p-4 rounded-3xl">
                          <TrendingUp className="w-8 h-8 text-emerald-700" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">২০২৬ নির্ধারিত মূল বেতন</p>
                          <p className="text-xl font-bold text-slate-800">৳ {bngNum(calculation.newBasic)}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">মোট বাড়ি ভাড়া ভাতা</p>
                          <p className="text-xl font-bold text-slate-800">৳ {bngNum(calculation.houseRent)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 pb-8 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 border-b border-slate-100 pb-2">ভাতা সমূহের বিবরণ</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600">চিকিৎসা ভাতা</span>
                          </div>
                          <span className="text-sm font-bold">৳ {bngNum(calculation.medical)}</span>
                        </div>

                        {calculation.tiffin > 0 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Info className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-sm font-semibold text-slate-600">টিফিন ভাতা</span>
                            </div>
                            <span className="text-sm font-bold">৳ {bngNum(calculation.tiffin)}</span>
                          </div>
                        )}

                        {calculation.washing > 0 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                <Waves className="w-4 h-4 text-teal-600" />
                              </div>
                              <span className="text-sm font-semibold text-slate-600">ধোলাই ভাতা</span>
                            </div>
                            <span className="text-sm font-bold">৳ {bngNum(calculation.washing)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 p-6 bg-emerald-600 rounded-2xl text-white">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="w-10 h-10 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase opacity-80 mb-0.5">সব মিলিয়ে জুলাই ২০২৬-এ আপনার মোট বেতন হবে</p>
                            <p className="text-2xl font-black">৳ {bngNum(calculation.total)} /-</p>
                          </div>
                          <button 
                            onClick={() => window.print()}
                            className="bg-white/20 hover:bg-white/30 p-4 rounded-xl transition-all group border border-white/20"
                            title="রিপোর্ট প্রিন্ট করুন"
                          >
                            <Printer className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Print Report Template (Hidden on screen) */}
                  <div className="hidden print:block print:p-10 text-slate-900 bg-white min-h-screen">
                    <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                      <h1 className="text-2xl font-bold mb-1">বেতন নির্ধারণ বিবরণী (২০২৬)</h1>
                      <p className="text-sm font-medium">প্রস্তাবিত নতুন বেতন স্কেল অনুযায়ী প্রাক্কলন</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                        <span className="font-bold">তারিখ:</span>
                        <span className="text-right">{new Date().toLocaleDateString('bn-BD')}</span>
                        <span className="font-bold">গ্রেড:</span>
                        <span className="text-right">{bngNum(calculation.gradeData.grade)}ম ({calculation.gradeData.type})</span>
                        <span className="font-bold">অবস্থান:</span>
                        <span className="text-right">{LOCATIONS.find(l => l.id === location)?.name}</span>
                      </div>

                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-y border-slate-300">
                            <th className="py-2 px-4 text-left font-bold">বিবরণ</th>
                            <th className="py-2 px-4 text-right font-bold">পরিমাণ (টাকা)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100">
                            <td className="py-3 px-4 italic text-slate-500">পূর্বের মূল বেতন (জুলাই-২০২৬)</td>
                            <td className="py-3 px-4 text-right">৳ {bngNum(parseFloat(currentBasic))}</td>
                          </tr>
                          <tr className="border-b border-slate-200 font-bold bg-slate-50">
                            <td className="py-3 px-4 text-emerald-800 underline">নতুন স্কেলে মূল বেতন নির্ধারণ</td>
                            <td className="py-3 px-4 text-right text-emerald-800">৳ {bngNum(calculation.newBasic)}</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-3 px-4">বাড়ি ভাড়া ভাতা</td>
                            <td className="py-3 px-4 text-right">৳ {bngNum(calculation.houseRent)}</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-3 px-4">চিকিৎসা ভাতা</td>
                            <td className="py-3 px-4 text-right">৳ {bngNum(calculation.medical)}</td>
                          </tr>
                          {calculation.tiffin > 0 && (
                            <tr className="border-b border-slate-100">
                              <td className="py-3 px-4">টিফিন ভাতা</td>
                              <td className="py-3 px-4 text-right">৳ {bngNum(calculation.tiffin)}</td>
                            </tr>
                          )}
                          {calculation.washing > 0 && (
                            <tr className="border-b border-slate-100">
                              <td className="py-3 px-4">ধোলাই ভাতা</td>
                              <td className="py-3 px-4 text-right">৳ {bngNum(calculation.washing)}</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-900 text-white font-black">
                            <td className="py-4 px-4 text-lg">সর্বমোট প্রাপ্ত বেতন</td>
                            <td className="py-4 px-4 text-right text-xl">৳ {bngNum(calculation.total)} /-</td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="mt-20 grid grid-cols-2 gap-40">
                        <div className="border-t border-slate-400 pt-2 text-center text-xs">অফিসারের স্বাক্ষর ও সীল</div>
                        <div className="border-t border-slate-400 pt-2 text-center text-xs">বিভাগীয় প্রধানের স্বাক্ষর</div>
                      </div>

                      <div className="mt-12 text-[10px] text-slate-400 text-center border-t pt-4">
                        * এটি একটি প্রস্তাবিত ক্যালকুলেটর থেকে প্রাপ্ত খসড়া রিপোর্ট। চুরান্ত নির্ধারণের জন্য সরকারি গেজেট অনুসরণ করুন।
                        <br/>Calculated by Assistant Network Engineer, DoICT
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 text-[11px] text-slate-400 font-medium leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 text-slate-300" />
                    পরামর্শ: বাড়ি ভাড়া ক্যালকুলেশন করার সময় জুলাই -২০২৬ এর মূল বেতন ({currentBasic}) ব্যবহার করা হয়েছে, যা ২০১৫ স্কেলের ধাপ অনুযায়ী।
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white/50 border-2 border-dashed border-slate-300 rounded-[2.5rem]">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Banknote className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-slate-500 font-bold text-xl mb-3">বিস্তারিত স্যালারি ব্রেকডাউন</h3>
                  <p className="text-slate-400 text-sm max-w-[320px] leading-relaxed">বামে আপনার বর্তমান পদের গ্রেড এবং মূল বেতন ইনপুট দিলে স্বয়ংক্রিয়ভাবে ২০২৬ এর প্রাক্কলিত বেতন এখানে প্রদর্শিত হবে।</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-200 mt-12 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="font-bold text-slate-800 mb-2">গুরুত্বপূর্ণ তথ্য:</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              ১. বাড়ি ভাড়া ভাতা ২০১৫ স্কেলের মূল বেতন অনুযায়ী গণনা করা হয়েছে (প্রদত্ত চার্ট)।<br/>
              ২. মেডিকেল ভাতা ১,৫০০ টাকা ধরা হয়েছে (সকল গ্রেডের জন্য)।<br/>
              ৩. ১৩-২০ তম গ্রেড পর্যন্ত কর্মচারীদের ক্ষেত্রে টিফিন ও ধোলাই ভাতা যুক্ত আছে।<br/>
              ৪. এটি একটি বেসরকারি খসড়া প্রস্তাবনার আলোকে তৈরি প্রাক্কলন মাত্র।
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-3 text-slate-400">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">Calculated by Assistant Network Engineer, DoICT</span>
            </div>
            <p className="text-[10px] font-medium opacity-60">© ২০২৬ সরকারি বেতন বিশেষজ্ঞ টিম (প্রস্তাবিত)। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
