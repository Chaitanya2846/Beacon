import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bot, Sparkles, Database, Search, Cpu, MessageSquare, 
  Layers, Shield, Code2, BarChart3, ChevronRight, Send, 
  Terminal, Globe, Zap, LineChart, CheckCircle2, BookOpen
} from 'lucide-react';

// --- Reusable Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-[30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* --- Floating Navbar --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Beacon AI</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400 bg-white/[0.03] px-6 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
            {['Home', 'Customs', 'Community', 'Resets', 'Project', 'Apps', 'More ▾'].map((link) => (
              <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 pt-32">
        
        {/* --- Hero Section --- */}
        <section className="relative px-6 pb-32 lg:pb-48 pt-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Typography & CTAs */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
              <motion.div variants={fadeUp} className="flex gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                  <CheckCircle2 size={12} /> RAG Powered
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                  <Shield size={12} /> Enterprise Ready
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl lg:text-[4rem] font-bold text-white leading-[1.1] tracking-tight">
                Transform Customer Support with AI That Actually <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Understands Your Business.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-lg leading-relaxed">
                Your enterprise Customer support SaaS platform designed entirely for scale, security, and world-class accuracy.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex items-center gap-4">
                <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                  Live Section
                </Link>
                <a href="#demo" className="px-8 py-4 text-white font-medium hover:text-indigo-300 transition-colors flex items-center gap-2">
                  Learn more <ChevronRight size={16} />
                </a>
              </motion.div>
            </motion.div>

            {/* Right: Floating UI Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg mx-auto aspect-square"
            >
              {/* Main Chatbot Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#121620]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Bot size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Live Chatbot <span className="text-emerald-400 inline-block ml-1">●</span></h3>
                      <p className="text-slate-500 text-xs">Usually replies instantly</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="self-end bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 text-sm p-3 rounded-2xl rounded-tr-sm ml-auto w-3/4">
                    How do I integrate the API into my Next.js app?
                  </div>
                  <div className="self-start bg-white/5 border border-white/10 text-slate-300 text-sm p-4 rounded-2xl rounded-tl-sm w-5/6 relative">
                    Here is the exact code snippet based on the developer documentation. You can use the React hook provided in our SDK.
                    <div className="absolute -bottom-3 -right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-md">
                      <CheckCircle2 size={10} /> Confidence 94%
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-500">Send Message...</div>
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white"><Send size={14} /></div>
                </div>
              </motion.div>

              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-12 top-1/4 bg-[#121620]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Database size={14} /></div>
                <div>
                  <p className="text-xs font-bold text-white">RAG live</p>
                  <p className="text-[10px] text-slate-500">Vector Search active</p>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 bottom-1/4 bg-[#121620]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl"
              >
                <p className="text-xs font-bold text-white mb-2">Sources Cited</p>
                <div className="flex gap-1">
                  <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                  <div className="w-2 h-12 bg-emerald-400 rounded-full"></div>
                  <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-10 bg-cyan-400 rounded-full"></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* --- Trusted By --- */}
        <section className="py-10 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-slate-500 mb-6 tracking-widest uppercase">Trusted By</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Replace with actual logos, using placeholders for UI matching */}
              <div className="text-xl font-bold text-white flex items-center gap-2"><Globe size={24}/> Sandlty</div>
              <div className="text-xl font-bold text-white flex items-center gap-2"><Database size={24}/> YCM</div>
              <div className="text-xl font-bold text-white flex items-center gap-2"><Cpu size={24}/> Samprok</div>
              <div className="text-xl font-bold text-white flex items-center gap-2"><Layers size={24}/> Enceladic</div>
              <div className="text-xl font-bold text-white flex items-center gap-2"><Zap size={24}/> Gayu</div>
            </div>
          </div>
        </section>

        {/* --- Problem & Solution Overview --- */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-white mb-4">Solution Overview</h2>
              <p className="text-slate-400">Modern deterministic methods engineered to solve all support pain points.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Lucide', desc: 'Retrieval customer context and internal routing.', icon: Search, color: 'text-indigo-400' },
                { title: 'Embedding', desc: 'Secure internal layout map semantics and structures.', icon: Cpu, color: 'text-purple-400' },
                { title: 'Vector Search', desc: 'Real-time customer context mapping and filtering.', icon: Database, color: 'text-cyan-400' },
                { title: 'Agent to Answer', desc: 'Your final coordinating resolution strictly aligned to docs.', icon: Bot, color: 'text-emerald-400' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-[#121620] border border-white/5 rounded-2xl p-6 relative group overflow-hidden"
                >
                  {/* Hover Glow */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- AI Workflow --- */}
        <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-16">AI Workflow</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {[
                { title: 'User Query', icon: MessageSquare },
                { title: 'Embedding', icon: Cpu },
                { title: 'Vector Search', icon: Database },
                { title: 'LLM', icon: Bot },
                { title: 'Accurate Answer', icon: CheckCircle2 }
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#121620] border border-white/10 flex items-center justify-center mb-4 relative z-10 shadow-lg">
                      <step.icon size={24} className="text-indigo-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">{step.title}</span>
                  </div>
                  {idx !== 4 && (
                    <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500/50">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* --- Interactive Product Showcase (Bento Grid) --- */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">Interactive Product Showcase</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
              
              <div className="bg-[#121620] border border-white/5 rounded-3xl p-8 col-span-1 md:col-span-2 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-600/10 blur-[80px]" />
                <BookOpen size={32} className="text-indigo-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Knowledge Base</h3>
                <p className="text-slate-400">Direct integration with your internal documentation.</p>
              </div>

              <div className="bg-[#121620] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                <Bot size={32} className="text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">AI Playground</h3>
                <p className="text-slate-400 text-sm">Test prompts in real-time.</p>
              </div>

              <div className="bg-[#121620] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                <Layers size={32} className="text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Memory</h3>
                <p className="text-slate-400 text-sm">Contextual conversation recall.</p>
              </div>

              <div className="bg-[#121620] border border-white/5 rounded-3xl p-8 col-span-1 md:col-span-2 relative overflow-hidden">
                <LineChart size={32} className="text-emerald-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Analytics Showcase</h3>
                <p className="text-slate-400">Track queries, success rates, and token usage instantly.</p>
              </div>

            </div>
          </div>
        </section>

        {/* --- Widget Integration --- */}
        <section className="py-32 px-6 bg-white/[0.01] border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Widget Integration</h2>
              <p className="text-lg text-slate-400 mb-8">Deploy our smart widget directly into your React, Next.js, or Vue applications with one line of code.</p>
              
              <div className="flex gap-4 mb-8">
                <button className="px-6 py-2 rounded-lg bg-white/10 text-white font-medium border border-white/20">React</button>
                <button className="px-6 py-2 rounded-lg bg-transparent text-slate-400 font-medium hover:text-white transition-colors">Next.js</button>
                <button className="px-6 py-2 rounded-lg bg-transparent text-slate-400 font-medium hover:text-white transition-colors">Vue</button>
              </div>
            </div>

            <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-xs text-slate-500 font-mono">App.jsx</span>
              </div>
              <pre className="text-sm font-mono text-slate-300 overflow-x-auto p-4">
                <code>
{`import { BeaconWidget } from '@beacon/react';

export default function App() {
  return (
    <BeaconWidget 
      orgId="your-org-id" 
      theme="dark" 
    />
  );
}`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="py-40 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent z-0"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white mb-6">Transform Customer<br/>Support with us!</h2>
            <p className="text-xl text-slate-400 mb-10">Start your free trial today. No credit card required.</p>
            <Link to="/register" className="inline-flex px-10 py-5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)]">
              Get Started Now
            </Link>
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 pt-20 pb-10 px-6 relative z-10 bg-[#0A0C10]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-bold text-xl text-white">Beacon AI</span>
              </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Documentation</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integration Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Search there..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-indigo-500" />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-colors">Sign In</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600">
          <p>© 2026 Beacon AI. All Rights Reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}