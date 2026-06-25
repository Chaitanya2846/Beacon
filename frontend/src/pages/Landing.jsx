import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

    return(
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Navigation - Glassmorphism */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300 animate-fade-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Beacon</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Agent Access
            </Link>
            <Link to="/register" className="relative group bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-md hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
              <span className="relative z-10">Deploy Workspace</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-40 overflow-hidden">
        {/* Animated Background Mesh - Now with rotation */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[120px] mix-blend-multiply animate-blob pointer-events-none"></div>
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-violet-300/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          
          {/* Staggered Entry Animations using custom classes */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wide shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-default group animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="group-hover:text-indigo-700 transition-colors">Platform Engine v1.0 Online</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05] text-slate-900 animate-fade-in-up animation-delay-100">
            Scale your support.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 animate-gradient-x">
              Not your headcount.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium animate-fade-in-up animation-delay-200">
            Connect your company's knowledge base. Deploy a context-aware AI agent in minutes. Resolve up to 70% of customer queries instantly while keeping your data cryptographically secure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20 animate-fade-in-up animation-delay-300">
            <Link to="/register" className="group flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold text-sm px-8 py-4 rounded-full shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 transition-all duration-300 hover:-translate-y-1">
              Start Free Trial
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a href="#architecture" className="flex items-center justify-center bg-white text-slate-700 font-semibold text-sm px-8 py-4 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all duration-300 hover:-translate-y-1">
              Explore Architecture
            </a>
          </div>

          {/* CONTINUOUS FLOATING UI MOCKUP */}
          <div className="relative w-full max-w-4xl mx-auto perspective-1000 mt-8 animate-float animation-delay-400">
            {/* Fade out bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/80 to-transparent z-30 pointer-events-none rounded-b-[2.5rem]"></div>
            
            {/* BACK CARD (The Colorful "Shadow") */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-[2.5rem] translate-y-6 translate-x-6 rotate-2 shadow-[0_20px_50px_rgba(99,102,241,0.3)] opacity-90 border border-indigo-400/50"></div>
            
            {/* MIDDLE CARD */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-[2.5rem] translate-y-3 translate-x-3 rotate-1 border border-white/50"></div>

            {/* FRONT MAIN CARD (The UI) */}
            <div className="relative z-20 bg-white/80 backdrop-blur-2xl border border-white shadow-xl rounded-[2.5rem] overflow-hidden text-left">
              
              {/* Window Controls */}
              <div className="bg-white/40 border-b border-slate-100/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 hover:gap-3 transition-all duration-300">
                  <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm border border-red-500/20 hover:scale-125 transition-transform"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm border border-amber-500/20 hover:scale-125 transition-transform"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm border border-emerald-500/20 hover:scale-125 transition-transform"></div>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">Support Engine</div>
                <div className="w-16"></div>
              </div>
              
              {/* Chat Content */}
              <div className="p-8 space-y-6 pb-20 bg-gradient-to-b from-transparent to-slate-50/50">
                {/* User Message */}
                <div className="flex justify-end transform hover:-translate-y-1 transition-transform">
                  <div className="bg-slate-900 text-white text-sm px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg shadow-slate-900/10 font-medium">
                    How do I configure the API webhook for international payments?
                  </div>
                </div>
                
                {/* Agent Response */}
                <div className="flex gap-4">
                  {/* Glowing Agent Avatar */}
                  <div className="relative w-10 h-10 mt-1 shrink-0">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center border-2 border-white shadow-md">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 text-slate-700 text-sm px-6 py-5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm leading-relaxed hover:shadow-md transition-shadow">
                    To configure international payment webhooks, you need to enable the <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-mono text-xs font-semibold mx-1">CROSS_BORDER</code> flag in your dashboard settings and provide a valid endpoint URL supporting HTTPS.
                  </div>
                </div>

                {/* "Typing" indicator to make it feel alive */}
                <div className="flex gap-4 opacity-70">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-1">
                     <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce animation-delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce animation-delay-200"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ROI & Metrics Section */}
      <section className="bg-white z-20 relative pb-20 pt-16 border-b border-slate-200/60 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {[
              { value: '24/7', label: 'Automated Resolution' },
              { value: '< 2s', label: 'Average Response Time' },
              { value: '70%', label: 'Ticket Deflection Rate' },
              { value: 'Zero', label: 'Hallucination Architecture' }
            ].map((metric, idx) => (
              <div key={idx} className="flex flex-col items-center text-center px-4 group">
                <span className="text-4xl md:text-5xl font-black text-slate-900 mb-2 group-hover:scale-110 group-hover:text-indigo-600 transition-all duration-300">{metric.value}</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISUAL BENTO BOX UI */}
      <section id="architecture" className="py-24 bg-[#f8fafc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Visual Architecture</h2>
            <p className="text-lg text-slate-600">Everything you need to automate your support pipeline, built into a single platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Bento 1: Multi-Format Ingestion */}
            <div className="md:col-span-2 group rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-500 overflow-hidden relative flex flex-col md:flex-row items-center p-8">
              <div className="w-full md:w-1/2 z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ingest Anything</h3>
                <p className="text-slate-500 font-medium mb-6">Drag, drop, and auto-sync your entire knowledge base instantly.</p>
                <div className="flex gap-2">
                  {['.PDF', '.DOCX', '.TXT', 'URL'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 h-full relative mt-8 md:mt-0 perspective-1000">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-indigo-100/50">
                  <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                </div>
                {/* Floating animated files */}
                <div className="absolute right-32 top-4 w-16 h-20 bg-white shadow-lg border border-slate-100 rounded-lg -rotate-12 group-hover:translate-x-12 group-hover:-translate-y-4 group-hover:rotate-12 transition-all duration-700"></div>
                <div className="absolute right-28 bottom-4 w-16 h-20 bg-white shadow-lg border border-slate-100 rounded-lg rotate-12 group-hover:translate-x-10 group-hover:translate-y-4 group-hover:-rotate-12 transition-all duration-700 delay-100"></div>
              </div>
            </div>

            {/* Bento 2: Contextual Retrieval */}
            <div className="group rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 border border-indigo-400 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500 overflow-hidden relative p-8 flex flex-col justify-end transform hover:-translate-y-1">
              <div className="absolute top-8 right-8 w-20 h-20 border-2 border-white/20 rounded-full flex items-center justify-center group-hover:scale-[1.5] group-hover:border-white/30 transition-all duration-700">
                <div className="w-10 h-10 border-2 border-white/40 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                   <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Pinpoint RAG</h3>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">Retrieves exact context chunks with verifiable source citations.</p>
              </div>
            </div>

            {/* Bento 3: Smart Human Handoff */}
            <div className="group rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-200 hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden relative p-8 transform hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:-translate-x-2 transition-transform duration-500 text-xl font-bold text-indigo-600 shadow-inner">AI</div>
                <div className="flex-1 h-0.5 bg-dashed border-t-2 border-dashed border-slate-200 relative overflow-hidden">
                   <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-full">
                     <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-[shimmer_1.5s_infinite]"></div>
                   </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-500 text-emerald-600 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Smart Escalation</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Auto-creates tickets and routes full chat history to live agents.</p>
            </div>

            {/* Bento 4: Live Telemetry */}
            <div className="md:col-span-2 group rounded-[2rem] bg-slate-900 border border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-slate-900/40 transition-all duration-500 overflow-hidden relative flex flex-col md:flex-row items-center p-8 transform hover:-translate-y-1">
              <div className="w-full md:w-1/2 z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Live Telemetry</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Track resolution rates, deflection, and monitor agent performance instantly.</p>
              </div>
              <div className="w-full md:w-1/2 h-full relative mt-8 md:mt-0 flex items-end justify-center gap-3">
                {/* Animated Chart Bars */}
                <div className="w-8 bg-indigo-500/20 rounded-t-lg h-12 group-hover:h-20 group-hover:bg-indigo-500/40 transition-all duration-500"></div>
                <div className="w-8 bg-indigo-500/40 rounded-t-lg h-24 group-hover:h-32 group-hover:bg-indigo-500/60 transition-all duration-500 delay-75"></div>
                <div className="w-8 bg-indigo-500/60 rounded-t-lg h-16 group-hover:h-24 group-hover:bg-indigo-500/80 transition-all duration-500 delay-150"></div>
                <div className="w-8 bg-violet-500 rounded-t-lg h-32 group-hover:h-40 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-500 delay-200 relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all delay-300">70%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-bold tracking-widest uppercase">
                Enterprise Grade
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Data isolation at the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">cryptographic level.</span></h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Designed for strict compliance. Every uploaded document, vector embedding, and chat session is permanently locked to your unique Organization ID.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Role-Based Access Control (RBAC) enforced at the API layer.',
                  'Data isolation via cryptographic tenant partitioning.',
                  'Local embedding processing prevents data leakage.',
                  'Secure JWT Authentication & rate-limited endpoints.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 group">
                    <svg className="w-6 h-6 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/30 to-transparent group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/40 transition-colors duration-700 rounded-[2.5rem]"></div>
              <div className="relative p-8 rounded-[2.4rem] bg-slate-900 border border-slate-800 backdrop-blur-xl">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/50 flex items-center justify-between shadow-[0_0_30px_rgba(99,102,241,0.15)] group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                      <div>
                        <div className="text-sm font-semibold text-white">Tenant ID: org_9021a</div>
                        <div className="text-xs text-slate-400">Status: Isolated & Encrypted</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between opacity-60 group-hover:translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                      <div>
                        <div className="text-sm font-semibold text-white">Tenant ID: org_441bx</div>
                        <div className="text-xs text-slate-500">Status: Cross-Tenant Blocked</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <footer className="bg-white border-t border-slate-200 pt-32 pb-12 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-t from-indigo-50 to-transparent pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">Ready to transform your support?</h2>
          <p className="text-lg text-slate-600 mb-10">Deploy your secure workspace today. No credit card required.</p>
          <Link to="/register" className="inline-block bg-slate-900 text-white font-semibold text-sm px-10 py-4 rounded-full shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300">
            Deploy Organization Workspace
          </Link>
          <div className="mt-24 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <span>© 2026 Beacon Platform. All rights reserved.</span>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS Custom Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotateX(2deg); }
          50% { transform: translateY(-12px) rotateX(0deg); }
          100% { transform: translateY(0px) rotateX(2deg); }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -50px) scale(1.1) rotate(120deg); }
          66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Gradient Text Animation */
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Utility Classes Applied */
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 15s infinite alternate; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 5s ease infinite; }
        
        /* Delay Utilities */
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
      `}} />
    </div>
  );
}