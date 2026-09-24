import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Languages, 
  Send, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  MessageSquare, 
  Zap, 
  Globe, 
  Settings, 
  Info, 
  Loader2, 
  BookOpen, 
  ShoppingBag, 
  Video, 
  Share2, 
  Volume2, 
  Maximize2, 
  Activity, 
  Copy, 
  CheckCircle2,
  Download,
  History,
  Trash2,
  Command,
  FileText,
  MousePointer2,
  Terminal,
  Cpu
} from 'lucide-react';

interface LocalizedSegment {
  segment_id: string;
  target_language: string;
  source_text: string;
  localized_text: string;
  timing_markers: string;
  adaptation_notes: string;
}

interface ProjectRecord {
  id: string;
  timestamp: number;
  type: 'localize' | 'produce' | 'radio';
  input: string;
  output: any;
  meta: any;
}

const LANGUAGES = [
  { code: 'DE', name: 'German', flag: '🇩🇪' },
  { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'FR', name: 'French', flag: '🇫🇷' },
  { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
];

const CONTENT_TYPES = [
  { id: 'ebook', label: 'E-Book Packaging', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'storefront', label: 'Storefront Copy', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'scripts', label: 'Media Scripts', icon: <Video className="w-4 h-4" /> },
  { id: 'social', label: 'Social Snippets', icon: <Share2 className="w-4 h-4" /> },
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('DE');
  const [contentType, setContentType] = useState('ebook');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [mode, setMode] = useState<'localize' | 'produce' | 'radio'>('localize');
  const [activeTab, setActiveTab] = useState('studio');
  const [dragonTime, setDragonTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [history, setHistory] = useState<ProjectRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  useEffect(() => {
    const saved = localStorage.getItem('d9_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('d9_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const totalSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
      const dHours = Math.floor(totalSeconds / (54 * 60));
      const dMinutes = Math.floor((totalSeconds % (54 * 60)) / 60);
      const dSeconds = totalSeconds % 60;
      setDragonTime({ hours: dHours, minutes: dMinutes, seconds: dSeconds });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setResults(null);
    try {
      const endpoint = mode === 'localize' ? '/api/localize' : '/api/content';
      const body = mode === 'localize' 
        ? { text: inputText, targetLanguage: targetLang }
        : { text: inputText, type: contentType };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setResults(data);
      
      const newRecord: ProjectRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: mode as 'localize' | 'produce',
        input: inputText,
        output: data,
        meta: mode === 'localize' ? { lang: targetLang } : { type: contentType }
      };
      setHistory(prev => [newRecord, ...prev].slice(0, 50));
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setLoading(false);
    }
  }, [inputText, mode, targetLang, contentType, loading]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleProcess();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [handleProcess]);

  const clearHistory = () => {
    if (confirm('Erase all temporal records?')) {
      setHistory([]);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `d9_synthesis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const readingTimeSeconds = Math.ceil((wordCount / 200) * 60);
  const dragonReadingTime = (readingTimeSeconds / 60) * (54 / 60);

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-slate-300 font-['Plus_Jakarta_Sans'] overflow-hidden selection:bg-amber-500/30 selection:text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <aside className="w-68 border-r border-slate-800/50 flex flex-col bg-[#0A0A0B]/80 backdrop-blur-3xl z-20">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight font-['Syne'] text-white uppercase leading-none">Dragon 9</span>
              <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase mt-1 block">Fluid Media</span>
            </div>
          </div>

          <div className="space-y-1 mb-8">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Studio Matrix</h3>
            <SidebarItem 
              icon={<Zap className="w-4 h-4" />} 
              label="Production Lab" 
              active={activeTab === 'studio' && !showHistory && (mode === 'localize' || mode === 'produce')} 
              onClick={() => { setActiveTab('studio'); setShowHistory(false); if (mode === 'radio') setMode('localize'); }} 
            />
            <SidebarItem 
              icon={<Volume2 className="w-4 h-4" />} 
              label="Rainstar Radio" 
              active={activeTab === 'studio' && !showHistory && mode === 'radio'} 
              onClick={() => { setActiveTab('studio'); setShowHistory(false); setMode('radio'); }} 
            />
            <SidebarItem 
              icon={<History className="w-4 h-4" />} 
              label="Temporal Archives" 
              active={showHistory} 
              onClick={() => setShowHistory(true)} 
            />
            <SidebarItem 
              icon={<Globe className="w-4 h-4" />} 
              label="Global Node" 
              active={activeTab === 'library'} 
              onClick={() => setActiveTab('library')} 
            />
          </div>

          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Temporal Sync</h3>
            <div className="mx-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">D9 Matrix</span>
                <div className="flex gap-0.5">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
              <div className="font-mono text-2xl text-white font-medium flex items-baseline gap-1 tabular-nums">
                {String(dragonTime.hours).padStart(2, '0')}
                <span className="text-amber-500 animate-pulse">:</span>
                {String(dragonTime.minutes).padStart(2, '0')}
                <span className="text-xs text-slate-500 font-bold ml-1 tracking-tighter">D9</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-amber-500"
                  animate={{ width: `${(dragonTime.minutes / 54) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="mx-3 p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              <Command className="w-3 h-3" /> Synthesis Cmd
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400 uppercase tracking-tighter">Execute</span>
              <span className="text-white font-mono bg-slate-800 px-1.5 rounded">⌘↵</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-3">
            <button 
              onClick={() => setIsAudioActive(!isAudioActive)}
              className={`p-2 rounded-lg transition-all ${isAudioActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <Activity className={`w-4 h-4 transition-colors ${isAudioActive ? 'text-amber-500 animate-pulse' : 'text-slate-700'}`} />
            <Maximize2 className="w-4 h-4 text-slate-700 hover:text-slate-500 cursor-pointer" />
          </div>
          <div className="space-y-1">
            <SidebarItem icon={<Settings className="w-4 h-4" />} label="System Config" />
            <SidebarItem icon={<Info className="w-4 h-4" />} label="Core Docs" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <motion.header 
          style={{ opacity: headerOpacity }}
          className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#0A0A0B]/90 backdrop-blur-xl sticky top-0 z-30"
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-slate-500">Node</span>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <span className="text-white">Dragon Studio</span>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <span className="text-amber-500 uppercase">
              {showHistory ? 'Archives' : activeTab === 'library' ? 'Global Node' : mode === 'localize' ? 'Comedy' : mode === 'produce' ? 'Production' : 'Radio'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-slate-800" />
            <button 
              onClick={downloadResults}
              disabled={!results}
              className="px-5 py-2 bg-white text-black text-[10px] font-black rounded-lg hover:bg-amber-500 hover:text-black transition-all uppercase tracking-[0.2em] shadow-xl shadow-white/5 disabled:opacity-30 flex items-center gap-2"
            >
              <Download className="w-3 h-3" /> Export Synthesis
            </button>
          </div>
        </motion.header>

        <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 relative">
          <div className="max-w-6xl mx-auto space-y-12 py-12">
            {showHistory ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white font-['Syne'] uppercase tracking-tighter mb-2">Temporal Archives</h2>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Record of past syntheses within the Dragon 9 timeline.</p>
                  </div>
                  <button 
                    onClick={clearHistory}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Erase Timeline
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {history.length > 0 ? history.map((record) => (
                    <button 
                      key={record.id}
                      onClick={() => { setResults(record.output); setInputText(record.input); setMode(record.type); setShowHistory(false); }}
                      className="group relative p-8 rounded-[2rem] bg-slate-900/30 border border-slate-800 hover:border-amber-500/30 transition-all text-left flex flex-col gap-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {record.type === 'localize' ? <Languages className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{record.type} SYNTHESIS</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600">{new Date(record.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-lg text-slate-300 font-medium line-clamp-3 leading-relaxed">"{record.input}"</p>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-800/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Restore Record</span>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  )) : (
                    <div className="col-span-full py-32 border-2 border-dashed border-slate-800/30 rounded-[3rem] flex flex-col items-center justify-center opacity-30">
                      <History className="w-16 h-16 mb-6" />
                      <h3 className="text-xl font-bold uppercase tracking-[0.2em]">Archival Node Empty</h3>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'library' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-black text-white font-['Syne'] uppercase tracking-tighter mb-2">Global Node</h2>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Cross-dimensional media library and global synthesis registry.</p>
                </div>
                <div className="py-32 border-2 border-dashed border-slate-800/30 rounded-[3rem] flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 border border-blue-500/20">
                    <Globe className="w-12 h-12 text-blue-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.2em]">Matrix Sync in Progress</h3>
                  <p className="max-w-md text-slate-500 text-sm leading-relaxed font-medium">
                    The Global Node is currently establishing connections with remote media repositories. Regional synchronization will be available in the next temporal cycle.
                  </p>
                  <button 
                    onClick={() => setActiveTab('studio')}
                    className="mt-10 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all"
                  >
                    Return to Production Lab
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <section className="relative rounded-[2rem] overflow-hidden aspect-[21/9] border border-slate-800/50 group shadow-2xl shadow-black">
                  <motion.img 
                    initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}
                    src="/src/assets/images/dragon9_studio_hero_1790229867540.jpg" 
                    alt="Dragon 9 Studio" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-12 max-w-2xl">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <h1 className="text-6xl font-black text-white mb-6 font-['Syne'] leading-[0.9] text-wrap-balance uppercase tracking-tighter">
                        {mode === 'localize' ? 'Sync your comedy.' : mode === 'produce' ? 'Architect your media.' : 'Rainstar Frequency.'} <br />
                        <span className="text-amber-500">Fluid Synchrony.</span>
                      </h1>
                      <p className="text-xl text-slate-400 mb-8 leading-relaxed font-medium">
                        {mode === 'radio' 
                          ? "Celestial frequencies by Dawn Rainstar Milazzo. Experience the music and message of the fluid era, synchronized to the Dragon 9 cadence."
                          : mode === 'localize' 
                            ? 'The standard 60-minute hour is a relic. Dragon 9 synchronizes your comedic timing with the natural 54-minute cadence of fluid media.'
                            : 'Advanced digital synthesis for the new era. Translate raw thought into high-impact digital artifacts with temporal precision.'}
                      </p>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Sparkles className="w-5 h-5 text-amber-500" /></div>
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Precision AI</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Activity className="w-5 h-5 text-blue-500" /></div>
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Temporal Sync</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </section>

                <div className="flex justify-center">
                  <div className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/50 backdrop-blur-md">
                    <button 
                      onClick={() => { setMode('localize'); setResults(null); setShowHistory(false); }}
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'localize' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Languages className="w-4 h-4" /> Comedy Localization
                    </button>
                    <button 
                      onClick={() => { setMode('produce'); setResults(null); setShowHistory(false); }}
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'produce' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Zap className="w-4 h-4" /> Content Production
                    </button>
                    <button 
                      onClick={() => { setMode('radio'); setResults(null); setShowHistory(false); }}
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'radio' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Volume2 className="w-4 h-4" /> Rainstar Radio
                    </button>
                  </div>
                </div>

                <div className="min-h-[600px]">
                  {mode === 'radio' ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                      <section className="relative rounded-[3rem] overflow-hidden aspect-[21/9] border border-slate-800/50 shadow-2xl group">
                        <motion.img 
                          src="/src/assets/images/rainstar_radio_flagship_1790231132473.jpg" 
                          alt="Rainstar Radio Flagship" 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/80 via-transparent to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="flex items-end gap-1 h-32">
                            {Array.from({ length: 40 }).map((_, i) => (
                              <motion.div key={i} className="w-1 bg-amber-500/60 rounded-full" animate={{ height: isAudioActive ? [20, Math.random() * 80 + 20, 20] : 4, opacity: isAudioActive ? [0.4, 0.8, 0.4] : 0.2 }} transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }} />
                            ))}
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 p-12 max-w-3xl">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="px-4 py-1.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full flex items-center gap-2">
                              <div className="w-2 h-2 bg-black rounded-full animate-pulse" /> Live Now
                            </div>
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Flagship Broadcast Node</span>
                          </div>
                          <h2 className="text-7xl font-black text-white font-['Syne'] leading-[0.8] uppercase tracking-tighter mb-6">Dawn Rainstar <br /><span className="text-amber-500">Milazzo</span></h2>
                          <p className="text-xl text-slate-300 font-medium max-w-xl leading-relaxed mb-8">Synchronized celestial frequencies. Dawn's message and music merge with the Dragon 9 cadence to deliver a profound temporal experience.</p>
                          <div className="flex items-center gap-4">
                            <button onClick={() => setIsAudioActive(!isAudioActive)} className={`h-16 px-10 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] transition-all ${isAudioActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40' : 'bg-white text-black hover:bg-amber-500'}`}>{isAudioActive ? 'Stop Frequency' : 'Initialize Stream'}<Volume2 className={`w-5 h-5 ${isAudioActive ? 'animate-bounce' : ''}`} /></button>
                            <button className="h-16 px-8 rounded-2xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Station Manifesto</button>
                          </div>
                        </div>
                      </section>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                          <div className="p-10 rounded-[2.5rem] bg-slate-900/20 border border-slate-800/50 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03]"><Globe className="w-64 h-64" /></div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><MessageSquare className="w-4 h-4 text-amber-500" /> Current Transmission</h3>
                            <div className="space-y-6 relative z-10">
                              <p className="text-3xl text-white font-bold leading-tight font-['Syne']">"We are the architects of our own time. Synchronize your heartbeat with the celestial rain."</p>
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-amber-500/20 p-1"><div className="w-full h-full rounded-full bg-amber-500/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-amber-500" /></div></div>
                                <div><p className="text-white text-xs font-black uppercase tracking-widest">Dawn's Insight</p><p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Transmission #0912-D</p></div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2rem] bg-slate-900/30 border border-slate-800/50 hover:border-amber-500/20 transition-all group">
                              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-black transition-all"><Activity className="w-6 h-6" /></div>
                              <h4 className="text-white font-bold uppercase tracking-widest mb-2">Sonic Clarity</h4>
                              <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-tighter">Optimized for the 54-minute Dragon hour. Every note lands in perfect fluid synchrony.</p>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-slate-900/30 border border-slate-800/50 hover:border-blue-500/20 transition-all group">
                              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-black transition-all"><Globe className="w-6 h-6" /></div>
                              <h4 className="text-white font-bold uppercase tracking-widest mb-2">Global Reach</h4>
                              <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-tighter">Broadcasting across the multi-dimensional studio matrix to all active D9 nodes.</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Up Next</h3>
                            <div className="space-y-6">
                              {[{ time: '01:24', title: 'Rainstar Echoes', artist: 'Dawn Milazzo' }, { time: '01:54', title: 'Dragon Cadence', artist: 'Fluid Motion' }, { time: '02:12', title: 'Temporal Drift', artist: 'The Architect' }].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                  <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-amber-500/40 group-hover:text-amber-500 transition-colors">{item.time}</span>
                                    <div><p className="text-white text-xs font-black uppercase tracking-widest group-hover:text-amber-500 transition-colors">{item.title}</p><p className="text-slate-600 text-[10px] font-bold uppercase">{item.artist}</p></div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Collaboration Node</h3>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">Dawn Rainstar Milazzo is the architect of this frequency. Use the tool below to invite her to sync her latest Facebook media and provide design input.</p>
                            <div className="space-y-3">
                              <button 
                                onClick={() => {
                                  const msg = `Hi Dawn, Timothy here! We've launched the Dragon 9 Studio and built a flagship radio station dedicated to your music and message. We'd love for you to see the design and help us sync your latest Facebook tracks to the Dragon cadence. Check it out here: ${window.location.href}`;
                                  navigator.clipboard.writeText(msg);
                                  alert('Invite message copied to clipboard! Send it to her on Facebook.');
                                }}
                                className="w-full py-4 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" /> Copy Invite Message
                              </button>
                              <a 
                                href="https://www.facebook.com/dawn.rainstar.milazzo" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-xl border border-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                              >
                                <Globe className="w-4 h-4" /> Visit Facebook Hub
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="p-10 rounded-[2.5rem] bg-slate-900/10 border border-slate-800/30 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-10">
                            <div>
                              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 flex items-center gap-3">
                                <Layers className="w-4 h-4 text-blue-500" /> Facebook Media Sync
                              </h3>
                              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Awaiting direct media stream from Dawn's Facebook Hub</p>
                            </div>
                            <div className="flex gap-2">
                              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-bold uppercase tracking-widest rounded-md">Facebook Node: Active</div>
                              <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-bold uppercase tracking-widest rounded-md">D9 Sync: Ready</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                              { title: 'Celestial Echoes', type: 'Video' },
                              { title: 'Rainstar Live #12', type: 'Stream' },
                              { title: 'Fluid Symphony', type: 'Audio' },
                              { title: 'Temporal Pulse', type: 'Video' }
                            ].map((media, i) => (
                              <div key={i} className="group relative aspect-square rounded-2xl bg-slate-800/40 border border-slate-700/50 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all">
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                    {media.type === 'Video' ? <Video className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                  </div>
                                  <p className="text-white text-xs font-black uppercase tracking-widest mb-1">{media.title}</p>
                                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter">{media.type} NODE</p>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-widest text-center">
                                  Initialize D9 Sync
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                      <motion.div layout className="space-y-8 bg-slate-900/20 border border-slate-800/40 rounded-[2rem] p-8 backdrop-blur-sm">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" /> Input Terminal</h2>
                            <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {wordCount} Words</span>
                              <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> {dragonReadingTime.toFixed(1)}m D9 Sync</span>
                            </div>
                          </div>
                          <div className="relative group">
                            <textarea 
                              className="w-full h-96 bg-[#050506] border border-slate-800/50 rounded-2xl p-8 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500/30 transition-all resize-none font-['Plus_Jakarta_Sans'] text-xl leading-relaxed shadow-inner"
                              placeholder={mode === 'localize' ? "Input your stand-up bit..." : "Input your essay, draft, or concept..."}
                              value={inputText} onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="absolute bottom-6 right-6 flex items-center gap-3">
                              <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden"><motion.div className="h-full bg-amber-500/50" animate={{ width: `${Math.min(100, (inputText.length / 1000) * 100)}%` }} /></div>
                              <span className="text-[10px] font-mono text-slate-600 tabular-nums uppercase">{inputText.length} CHARS</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {mode === 'localize' ? (
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Language Dialect</label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {LANGUAGES.map((lang) => (
                                  <button
                                    key={lang.code} onClick={() => setTargetLang(lang.code)}
                                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex flex-col items-center gap-2 ${targetLang === lang.code ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}`}
                                  >
                                    <span className="text-xl">{lang.flag}</span>{lang.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Output Architecture</label>
                              <div className="grid grid-cols-2 gap-3">
                                {CONTENT_TYPES.map((type) => (
                                  <button
                                    key={type.id} onClick={() => setContentType(type.id)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${contentType === type.id ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
                                  >
                                    <div className={`p-2 rounded-lg ${contentType === type.id ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}>{type.icon}</div>
                                    {type.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <button 
                            onClick={handleProcess} disabled={loading || !inputText.trim()}
                            className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-amber-500 transition-all duration-500 flex items-center justify-center gap-3 group shadow-2xl shadow-white/5 active:scale-[0.98] disabled:opacity-30"
                          >
                            {loading ? (
                              <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /><span className="animate-pulse">Synthesizing Matrix...</span></div>
                            ) : (
                              <>{mode === 'localize' ? 'Localize Sequence' : 'Synthesize Production'}<ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>
                            )}
                          </button>
                        </div>
                      </motion.div>

                      <div className="space-y-8">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3"><Activity className="w-4 h-4" /> Synthesized Assets</h2>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 group cursor-help" title="Engine Latency"><Cpu className="w-3 h-3 text-slate-700 group-hover:text-amber-500 transition-colors" /><span className="text-[8px] font-mono text-slate-800 uppercase tracking-tighter">Latency: Low</span></div>
                            <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className={`w-1 h-3 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`} style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
                          </div>
                        </div>
                        <div className="min-h-[500px] relative">
                          {loading ? (
                            <div className="space-y-6">
                              {[1,2,3].map(i => (
                                <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-8 space-y-4 animate-pulse">
                                  <div className="h-4 w-24 bg-slate-800 rounded" /><div className="h-8 w-full bg-slate-800 rounded" /><div className="h-4 w-1/2 bg-slate-800 rounded" />
                                </div>
                              ))}
                            </div>
                          ) : results ? (
                            <AnimatePresence mode="popLayout">
                              {mode === 'localize' ? (
                                <div className="space-y-4">
                                  {Array.isArray(results) && results.map((segment: any, idx: number) => (
                                    <motion.div key={segment.segment_id} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: idx * 0.08, type: 'spring', damping: 20 }}>
                                      <ResultCard segment={segment} />
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <motion.div initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] p-10 backdrop-blur-md shadow-2xl shadow-black/40">
                                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800/50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">{contentType.replace('_', ' ')}</span>
                                    <div className="flex items-center gap-3"><CopyButton text={JSON.stringify(results, null, 2)} /><Sparkles className="w-5 h-5 text-amber-500" /></div>
                                  </div>
                                  <div className="space-y-10">
                                    {Object.entries(results).map(([key, value]: [string, any]) => (
                                      <div key={key} className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2"><div className="w-1 h-1 bg-slate-700 rounded-full" />{key.replace(/_/g, ' ')}</h3>
                                        {typeof value === 'string' ? (
                                          <p className="text-lg text-white font-medium leading-relaxed whitespace-pre-wrap">{value}</p>
                                        ) : Array.isArray(value) ? (
                                          <ul className="grid grid-cols-1 gap-3">
                                            {value.map((item, i) => (
                                              <li key={i} className="text-slate-300 flex gap-4 p-4 rounded-xl bg-slate-800/20 border border-slate-800/40 hover:border-slate-700 transition-colors">
                                                <span className="text-amber-500 font-mono text-xs mt-1">0{i+1}</span><span className="text-base font-medium">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <pre className="text-sm bg-[#050506] p-6 rounded-2xl overflow-x-auto text-slate-400 font-mono border border-slate-800/50">{JSON.stringify(value, null, 2)}</pre>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          ) : (
                            <div className="h-full border-2 border-dashed border-slate-800/30 rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-center bg-slate-900/5">
                              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mb-8"><Activity className="w-12 h-12 text-slate-600" /></motion.div>
                              <h3 className="text-xl font-bold text-white mb-4 font-['Syne'] uppercase tracking-[0.2em]">Awaiting Synthesis</h3>
                              <p className="max-w-[320px] text-sm text-slate-500 leading-relaxed font-medium">Feed the Dragon 9 engine with raw source material to begin the temporal synchronization process.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group relative overflow-hidden ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}>
      {active && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent border-l-2 border-amber-500" />}
      <span className={`relative z-10 ${active ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={handleCopy} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all hover:bg-slate-700" title="Copy to clipboard">
      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function ResultCard({ segment }: { segment: LocalizedSegment }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700/50 transition-all hover:bg-slate-900/60 group">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-slate-600 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">SEG_{segment.segment_id}</span>
          <div className="flex items-center gap-3">
            <CopyButton text={segment.localized_text} />
            <span className="text-[10px] font-black text-amber-500 px-4 py-2 bg-amber-500/10 rounded-full uppercase tracking-[0.2em] border border-amber-500/20">{segment.target_language}</span>
          </div>
        </div>
        <div className="space-y-6">
          <div className="relative pl-6"><div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 rounded-full" /><p className="text-[10px] font-black text-slate-600 mb-3 uppercase tracking-widest">Source Context</p><p className="text-base text-slate-400 italic font-medium leading-relaxed">"{segment.source_text}"</p></div>
          <div className="relative pl-6"><div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/30 rounded-full" /><p className="text-[10px] font-black text-amber-500/60 mb-3 uppercase tracking-widest">Localized Synchrony</p><p className="text-2xl text-white font-bold leading-tight tracking-tight selection:bg-amber-500 selection:text-black">{segment.localized_text}</p></div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all pt-4 border-t border-slate-800/50 w-full">
          {expanded ? 'Collapse Matrix' : 'Analyze Timing & Logic'}<ChevronRight className={`w-4 h-4 transition-transform duration-500 ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-8 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-500 flex items-center gap-2 tracking-[0.2em] uppercase"><Clock className="w-4 h-4 text-amber-500" /> Timing Markers</p>
                    <div className="flex items-center gap-2"><CopyButton text={segment.timing_markers} /><span className="text-[10px] font-mono text-slate-700">SYNTH_LATENCY: 14MS</span></div>
                  </div>
                  <div className="p-6 bg-[#050506] rounded-2xl font-mono text-[13px] leading-[1.8] text-slate-300 border border-slate-800/50 shadow-inner">
                    {segment.timing_markers.split(/(\[pause: [\d.]+s\])/).map((part, i) => part.startsWith('[pause') ? <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-amber-500 font-bold px-2 py-0.5 bg-amber-500/10 rounded-lg mx-1.5 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] inline-block">{part}</motion.span> : <span key={i}>{part}</span>)}
                  </div>
                </div>
                <div><p className="text-[10px] font-black text-slate-500 mb-4 flex items-center gap-2 tracking-[0.2em] uppercase"><Info className="w-4 h-4 text-blue-500" /> Adaptation Logic</p><div className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-slate-800/40 relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-12 h-12" /></div>{segment.adaptation_notes}</div></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
