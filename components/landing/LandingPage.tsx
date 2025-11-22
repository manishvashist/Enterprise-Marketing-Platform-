
import React, { useState, useEffect, useRef } from 'react';

// --------------- UTILITY & HOOKS ---------------

const useScrollAnimation = () => {
  const [elements, setElements] = useState<Map<Element, IntersectionObserverEntry>>(new Map());
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      setElements(prev => new Map(prev).set(entries[0].target, entries[0]));
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  const observe = (el: Element | null) => {
    if (el && observer.current) {
      observer.current.observe(el);
    }
  };

  const isVisible = (el: Element | null) => {
    return el ? elements.get(el)?.isIntersecting || false : false;
  };

  return { observe, isVisible };
};

const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { observe, isVisible } = useScrollAnimation();

    useEffect(() => {
        observe(ref.current);
    }, [observe]);

    const isElVisible = isVisible(ref.current);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`${className || ''} transition-all duration-1000 transform ${isElVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
            {children}
        </div>
    );
};

// --------------- ICONS (Minimalist / Technical) ---------------

const ChipIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75H1.5m18 0h-1.5m-15 3.75H1.5m18 0h-1.5" />
    <rect x="6" y="6" width="12" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CubeTransparentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const NetworkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

const MapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
);

const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
    </svg>
);

// --------------- VISUAL ASSETS (Quantum Shapes) ---------------

const QuantumGrid: React.FC = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Moving Floor Grid */}
        <div className="absolute inset-0 perspective-grid opacity-[0.08] origin-top"></div>
        
        {/* Floating Cubes (Qubits) */}
        <div className="absolute top-[15%] left-[10%] w-16 h-16 bg-gradient-to-br from-blue-100 to-white rounded-xl shadow-2xl rotate-12 animate-float-slow opacity-80 border border-white/50 backdrop-blur-sm"></div>
        <div className="absolute top-[40%] right-[8%] w-24 h-24 bg-gradient-to-bl from-indigo-100 to-white rounded-2xl shadow-2xl -rotate-6 animate-float-medium opacity-70 border border-white/50"></div>
        <div className="absolute bottom-[20%] left-[15%] w-12 h-12 bg-gradient-to-tr from-cyan-50 to-white rounded-lg shadow-lg rotate-45 animate-float-fast opacity-60"></div>
        
        {/* Soft Interference Gradients */}
        <div className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px] mix-blend-multiply"></div>
    </div>
);

// --------------- COMPONENTS ---------------

const LandingHeader: React.FC<{ onStartTrial: () => void }> = ({ onStartTrial }) => (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <CubeTransparentIcon className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                    Campaign<span className="font-light text-slate-500">Gen</span>
                </span>
            </div>
            <div className="flex items-center space-x-6">
                <button onClick={onStartTrial} className="hidden md:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Sign In</button>
                <button 
                    onClick={onStartTrial} 
                    className="relative group px-6 py-2.5 rounded-full overflow-hidden bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all hover:-translate-y-0.5"
                >
                    <span className="relative text-sm font-semibold tracking-wide flex items-center gap-2">
                        Start Trial <ArrowRightIcon className="w-3.5 h-3.5" />
                    </span>
                </button>
            </div>
        </div>
    </header>
);

const HeroSection: React.FC<{ onStartTrial: () => void }> = ({ onStartTrial }) => (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-50">
        <QuantumGrid />

        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
                
                <AnimatedSection className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-bold text-slate-600 tracking-widest uppercase font-mono">System Operational v2.5</span>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={100}>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 leading-[1.1] mb-8">
                        Deterministic Marketing in a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600">
                            Probabilistic World
                        </span>
                    </h1>
                </AnimatedSection>

                <AnimatedSection delay={200}>
                    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed font-light tracking-wide">
                        Harness the power of predictive AI to architect multi-channel campaigns. Calculate outcomes before you spend a dollar.
                    </p>
                </AnimatedSection>

                <AnimatedSection delay={300} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                        onClick={onStartTrial} 
                        className="px-12 py-5 bg-slate-900 text-white text-xl font-bold rounded-full hover:bg-slate-800 transition-all hover:scale-105 shadow-2xl shadow-slate-900/20 w-full sm:w-auto flex items-center justify-center gap-3"
                    >
                        <span>View Demo</span>
                        <ArrowRightIcon className="w-6 h-6" />
                    </button>
                </AnimatedSection>

                {/* Floating Dashboard Preview */}
                <AnimatedSection delay={500} className="mt-24 relative max-w-5xl mx-auto perspective-1000">
                    <div className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden transform rotate-x-6 hover:rotate-x-0 transition-transform duration-1000 ease-out p-2">
                        <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent mix-blend-multiply pointer-events-none"></div>
                             <img 
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                                alt="Dashboard Interface" 
                                className="w-full h-auto opacity-90 hover:scale-105 transition-transform duration-[2s]" 
                             />
                        </div>
                        
                        {/* Floating Data Cards */}
                        <div className="absolute top-1/4 -right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-indigo-100 shadow-xl animate-float-slow hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <NetworkIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Conversion Probability</p>
                                    <p className="text-lg font-bold text-slate-900">94.2%</p>
                                </div>
                            </div>
                        </div>

                         <div className="absolute bottom-12 -left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-cyan-100 shadow-xl animate-float-medium hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                                    <ChipIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Asset Generation</p>
                                    <p className="text-lg font-bold text-slate-900">Complete</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    </section>
);

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; delay: number }> = ({ title, description, icon, delay }) => (
    <AnimatedSection delay={delay} className="group relative p-8 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
        <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    </AnimatedSection>
);

const FeaturesGrid: React.FC = () => (
    <section className="py-32 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50 to-transparent opacity-50"></div>
        
        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Computational Creativity</h2>
                <p className="text-slate-500 text-lg">The platform separates logic from execution. First, we simulate the perfect strategy. Then, we generate the assets to match.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    delay={0}
                    title="AI-Prescribed Strategy"
                    description="Automated strategic planning that analyzes your goal and audience to prescribe the optimal approach before execution begins."
                    icon={<NetworkIcon className="w-6 h-6" />}
                />
                <FeatureCard 
                    delay={150}
                    title="Journey Orchestration"
                    description="Build complete, multi-step campaign journeys with automated triggers, decision points, and wait times."
                    icon={<MapIcon className="w-6 h-6" />}
                />
                <FeatureCard 
                    delay={300}
                    title="Governance & Compliance"
                    description="Automated checks ensure brand safety, regulatory compliance (GDPR/CCPA), and frequency capping."
                    icon={<ShieldCheckIcon className="w-6 h-6" />}
                />
                <FeatureCard 
                    delay={450}
                    title="Channel Strategy"
                    description="Generate data-driven channel selection strategies, prioritizing platforms based on audience reach and cost efficiency."
                    icon={<ChipIcon className="w-6 h-6" />}
                />
                <FeatureCard 
                    delay={600}
                    title="Dynamic Media Plan"
                    description="Generate comprehensive media plans with adjustable parameters. Modify budgets and constraints on the fly."
                    icon={<ChartBarIcon className="w-6 h-6" />}
                />
                <FeatureCard 
                    delay={750}
                    title="Creative Asset Generation"
                    description="Instantly generate production-ready copy, images, and video scripts tailored to each specific channel."
                    icon={<CubeTransparentIcon className="w-6 h-6" />}
                />
            </div>
        </div>
    </section>
);

const StatsTicker: React.FC = () => (
    <div className="bg-slate-900 py-24 relative overflow-hidden">
        {/* Abstract Light Beams */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent transform rotate-12 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-white/10">
                <div className="p-4">
                    <p className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">10<span className="text-indigo-400 text-3xl align-top">+</span></p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Models Ensembled</p>
                </div>
                <div className="p-4">
                    <p className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">0.4<span className="text-indigo-400 text-3xl align-top">s</span></p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inference Latency</p>
                </div>
                <div className="p-4">
                    <p className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">99<span className="text-indigo-400 text-3xl align-top">%</span></p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Safety</p>
                </div>
                <div className="p-4">
                    <p className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">∞<span className="text-indigo-400 text-3xl align-top"></span></p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scalability</p>
                </div>
            </div>
        </div>
    </div>
);

const LandingFooter: React.FC = () => (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white">
                        <CubeTransparentIcon className="h-3 w-3" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">CampaignGen</span>
                </div>
                
                <div className="flex gap-8 text-sm font-medium text-slate-500">
                    <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">System Status</a>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-mono">
                &copy; {new Date().getFullYear()} CampaignGen Inc. All computational resources optimized.
            </div>
        </div>
    </footer>
);

// --------------- MAIN LAYOUT ---------------

interface LandingPageProps {
    onStartTrial: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartTrial }) => {
    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <style>{`
                /* Custom Animations */
                .perspective-grid {
                    background-size: 60px 60px;
                    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
                    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
                    transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
                    animation: grid-move 20s linear infinite;
                }

                @keyframes grid-move {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(60px) translateZ(-200px); }
                }

                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(12deg); }
                    50% { transform: translateY(-20px) rotate(15deg); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px) rotate(-6deg); }
                    50% { transform: translateY(-15px) rotate(-3deg); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px) rotate(45deg); }
                    50% { transform: translateY(-10px) rotate(50deg); }
                }
                
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
                .perspective-1000 { perspective: 1000px; }
                
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                .animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }
            `}</style>
            
            <LandingHeader onStartTrial={onStartTrial} />
            
            <main>
                <HeroSection onStartTrial={onStartTrial} />
                <StatsTicker />
                <FeaturesGrid />
            </main>
            
            <LandingFooter />
        </div>
    );
};
