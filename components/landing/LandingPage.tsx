
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

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

// --------------- ICONS ---------------

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

// --------------- VISUAL ASSETS (Quantum Grid) ---------------

const QuantumGrid: React.FC = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 perspective-grid opacity-[0.08] origin-top"></div>
        <div className="absolute top-[15%] left-[10%] w-16 h-16 bg-gradient-to-br from-blue-100 to-white rounded-xl shadow-2xl rotate-12 animate-float-slow opacity-80 border border-white/50 backdrop-blur-sm"></div>
        <div className="absolute top-[40%] right-[8%] w-24 h-24 bg-gradient-to-bl from-indigo-100 to-white rounded-2xl shadow-2xl -rotate-6 animate-float-medium opacity-70 border border-white/50"></div>
        <div className="absolute bottom-[20%] left-[15%] w-12 h-12 bg-gradient-to-tr from-cyan-50 to-white rounded-lg shadow-lg rotate-45 animate-float-fast opacity-60"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px] mix-blend-multiply"></div>
    </div>
);

// --------------- PAGE CONTENT COMPONENTS ---------------

const PublicFeaturesPage = ({ onStartTrial }: { onStartTrial: () => void }) => (
    <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">How CampaignGen Works</h1>
                <p className="text-xl text-slate-500">From strategy to execution in 4 simple steps. We don't just write content; we orchestrate entire marketing ecosystems.</p>
            </div>

            <div className="space-y-24">
                {[
                    {
                        step: "01",
                        title: "Define Strategy",
                        desc: "Input your campaign goal URL or a simple 3-line prompt. Our AI analyzes your audience, market trends, and past performance to build a strategy.",
                        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop"
                    },
                    {
                        step: "02",
                        title: "AI Orchestration",
                        desc: "Watch as the engine generates assets for 10+ channels simultaneously. Email sequences, social posts, and ad copy are created in parallel, perfectly synchronized.",
                        img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2340&auto=format&fit=crop"
                    },
                    {
                        step: "03",
                        title: "Refine & Polish",
                        desc: "Use our Brand Consistency Engine™ to ensure every word aligns with your voice. Make quick edits that ripple across all campaign assets automatically.",
                        img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2340&auto=format&fit=crop"
                    },
                    {
                        step: "04",
                        title: "Launch & Sync",
                        desc: "Push approved campaigns directly to HubSpot, Mailchimp, Meta Ads, and more. No copy-pasting. Just one click to go live.",
                        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                    }
                ].map((item, idx) => (
                    <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                        <div className="flex-1">
                            <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase mb-2 block">Step {item.step}</span>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">{item.title}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">{item.desc}</p>
                        </div>
                        <div className="flex-1">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-video bg-slate-100">
                                <img src={item.img} alt={item.title} className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-24 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Ready to orchestrate your next campaign?</h2>
                <button onClick={onStartTrial} className="px-8 py-4 bg-orange-600 text-white text-lg font-bold rounded-full hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-600/20">
                    Start Building for Free
                </button>
            </div>
        </div>
    </div>
);

const PublicPricingPage = ({ onStartTrial }: { onStartTrial: () => void }) => (
    <div className="pt-24 pb-16 bg-slate-50">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-slate-500">Stop paying for 5 different tools. Get everything you need to generate, manage, and launch campaigns in one place.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[
                    { name: "Individual", price: "$49", period: "/mo", features: ["10 Campaigns / month", "Basic Analytics", "Email & Social Support", "1 User Seat"] },
                    { name: "Small Team", price: "$149", period: "/mo", popular: true, features: ["25 Campaigns / month", "Advanced Analytics", "HubSpot Integration", "5 User Seats", "Priority Support"] },
                    { name: "Agency", price: "$399", period: "/mo", features: ["Unlimited Campaigns", "White-label Reports", "API Access", "Unlimited Seats", "Dedicated Account Manager"] }
                ].map((plan, idx) => (
                    <div key={idx} className={`relative bg-white rounded-2xl p-8 border ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-xl' : 'border-slate-200 shadow-sm'} flex flex-col`}>
                        {plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">Most Popular</div>}
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                            <span className="text-slate-500">{plan.period}</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {plan.features.map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-center text-slate-600 text-sm">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <button onClick={onStartTrial} className={`w-full py-3 rounded-lg font-bold transition-all ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                            Choose {plan.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ComparisonPage = ({ onStartTrial }: { onStartTrial: () => void }) => (
    <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">CampaignGen vs. The Others</h1>
                <p className="text-xl text-slate-500">Most AI tools just write text. We build entire marketing ecosystems. See how we stack up against generic AI writers.</p>
            </div>

            <div className="overflow-x-auto max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-6 text-sm font-bold text-slate-500 uppercase tracking-wider">Feature</th>
                            <th className="p-6 text-lg font-bold text-indigo-600 w-1/3 bg-indigo-50/50">CampaignGen</th>
                            <th className="p-6 text-lg font-bold text-slate-400 w-1/3">Generic AI Writers</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[
                            { feature: "Multi-Channel Synchronization", us: "✅ Automated", them: "❌ Manual Copy/Paste" },
                            { feature: "Brand Consistency Engine", us: "✅ Learned Style Profile", them: "⚠️ Basic Tone Settings" },
                            { feature: "Direct Integration (HubSpot/Ads)", us: "✅ One-Click Export", them: "❌ None" },
                            { feature: "Campaign Strategy Generation", us: "✅ Full Media Plan", them: "❌ Content Only" },
                            { feature: "Visual Asset Generation", us: "✅ Images & Video Scripts", them: "⚠️ Text Only (Mostly)" },
                            { feature: "Governance & Compliance Checks", us: "✅ Built-in", them: "❌ None" }
                        ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-6 font-medium text-slate-900">{row.feature}</td>
                                <td className="p-6 font-bold text-slate-800 bg-indigo-50/30">{row.us}</td>
                                <td className="p-6 text-slate-500">{row.them}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-16 text-center bg-slate-900 rounded-2xl p-12 text-white">
                <h2 className="text-3xl font-bold mb-6">Stop settling for fragmented tools.</h2>
                <button onClick={onStartTrial} className="px-8 py-4 bg-orange-600 text-white text-lg font-bold rounded-full hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20">
                    Switch to CampaignGen
                </button>
            </div>
        </div>
    </div>
);

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const faqs = [
        { q: "How does CampaignGen ensure brand consistency?", a: "We analyze your previous content and brand guidelines to create a unique style profile. Every asset generated is checked against this profile to ensure tone, voice, and terminology match your brand perfectly." },
        { q: "Can I export directly to my marketing tools?", a: "Yes! We support direct integration with major platforms including HubSpot, Mailchimp, Meta Ads, and Google Ads. You can push approved content with a single click." },
        { q: "Is there a free trial available?", a: "Absolutely. You can start a 7-day free trial with full access to all features. No credit card is required to get started." },
        { q: "How is this different from ChatGPT or Jasper?", a: "While other tools focus on generating single pieces of content, CampaignGen focuses on orchestration. We build entire, cohesive campaigns across multiple channels simultaneously, ensuring message alignment." }
    ];

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all">
                            <button 
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                            >
                                <span className="font-semibold text-slate-900">{faq.q}</span>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`px-6 text-slate-600 transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingHeader: React.FC<{ onStartTrial: () => void; onNavigate: (page: string) => void; activePage: string }> = ({ onStartTrial, onNavigate, activePage }) => {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <CubeTransparentIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">Campaign<span className="text-indigo-600">Gen</span></span>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    {['features', 'pricing', 'comparison'].map((item) => (
                        <button
                            key={item}
                            onClick={() => onNavigate(item)}
                            className={`text-sm font-medium capitalize transition-colors ${activePage === item ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button onClick={onStartTrial} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
                        Log In
                    </button>
                    <button
                        onClick={onStartTrial}
                        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                        Start Free Trial
                    </button>
                </div>
            </div>
        </header>
    );
};

const TestimonialsSection: React.FC = () => (
    <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Loved by Modern Marketers</h2>
                <p className="text-slate-500">Join thousands of teams scaling their output without scaling headcount.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        quote: "It used to take me 3 days to plan a campaign. Now I do it in 15 minutes. The consistency across channels is what sold me.",
                        author: "Sarah Jenkins",
                        role: "CMO, TechGrowth",
                        img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
                    },
                    {
                        quote: "Finally, an AI tool that understands 'brand voice' isn't just about being funny. The governance features are a lifesaver for enterprise.",
                        author: "Michael Chen",
                        role: "Director of Marketing, FinServe",
                        img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80"
                    },
                    {
                        quote: "The ability to push directly to HubSpot and Meta Ads saved our small team at least 20 hours a week. Incredible ROI.",
                        author: "Jessica Lee",
                        role: "Growth Lead, StartUp Inc",
                        img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80"
                    }
                ].map((item, idx) => (
                    <div key={idx} className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <p className="text-slate-700 mb-6 italic">"{item.quote}"</p>
                        <div className="flex items-center gap-4">
                            <img src={item.img} alt={item.author} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="text-sm font-bold text-slate-900">{item.author}</p>
                                <p className="text-xs text-slate-500">{item.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const LandingFooter: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
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
                    <button onClick={() => onNavigate('features')} className="hover:text-indigo-600 transition-colors">Features</button>
                    <button onClick={() => onNavigate('pricing')} className="hover:text-indigo-600 transition-colors">Pricing</button>
                    <button onClick={() => onNavigate('comparison')} className="hover:text-indigo-600 transition-colors">Comparison</button>
                    <button className="hover:text-indigo-600 transition-colors">Login</button>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-mono">
                &copy; {new Date().getFullYear()} CampaignGen Inc. All computational resources optimized.
            </div>
        </div>
    </footer>
);

// --------------- HOME PAGE VIEW ---------------

const HomePage: React.FC<{ onStartTrial: () => void }> = ({ onStartTrial }) => (
    <>
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-50">
            <QuantumGrid />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    
                    <AnimatedSection className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Trusted by 500+ Marketers
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={100}>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 leading-[1.1] mb-8">
                            Stop Writing One-Off Posts. <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-600">
                                Generate Campaigns.
                            </span>
                        </h1>
                    </AnimatedSection>

                    <AnimatedSection delay={200}>
                        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed font-light tracking-wide">
                            The first AI engine that synchronizes your email, social, and ads instantly. <br className="hidden md:block" />10x faster than agencies, 100% on-brand.
                        </p>
                    </AnimatedSection>

                    <AnimatedSection delay={300} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={onStartTrial} 
                            className="px-8 py-4 bg-orange-600 text-white text-lg font-bold rounded-full hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-600/20 w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            Start Free Trial <span className="text-xs font-normal opacity-80">(No Card Required)</span>
                        </button>
                    </AnimatedSection>

                    {/* Floating Dashboard Preview */}
                    <AnimatedSection delay={500} className="mt-24 relative max-w-5xl mx-auto perspective-1000">
                        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden transform rotate-x-6 hover:rotate-x-0 transition-transform duration-1000 ease-out p-2">
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[16/9] shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2340&q=80" 
                                    alt="CampaignGen Dashboard Interface" 
                                    className="object-cover w-full h-full opacity-90"
                                />
                                <div className="absolute inset-0 bg-indigo-900/5 mix-blend-multiply pointer-events-none"></div>
                            </div>
                            
                            {/* Floating Data Cards */}
                            <div className="absolute top-[20%] -right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-indigo-100 shadow-xl animate-float-slow hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <ChipIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Campaign Efficiency</p>
                                        <p className="text-lg font-bold text-slate-900">+400%</p>
                                    </div>
                                </div>
                            </div>

                             <div className="absolute bottom-[15%] -left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-green-100 shadow-xl animate-float-medium hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Brand Safety</p>
                                        <p className="text-lg font-bold text-slate-900">100% Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>

        <section className="py-24 bg-white border-b border-slate-100 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Marketing Fragmentation is Killing Your ROI.</h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        You have the strategy, but execution is a bottleneck. Copywriters are expensive, agencies are slow, and using generic AI tools leaves your messaging disjointed across channels.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <AnimatedSection delay={100} className="p-8 bg-red-50/50 rounded-3xl border border-red-100 hover:border-red-200 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">😫</div>
                            <h3 className="text-xl font-bold text-red-900">The Old Way</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-red-800/80">
                                <span className="mt-1 text-red-400">✗</span>
                                <span>Disconnected tools for Email, Social, & Ads</span>
                            </li>
                            <li className="flex items-start gap-3 text-red-800/80">
                                <span className="mt-1 text-red-400">✗</span>
                                <span>Inconsistent brand voice across platforms</span>
                            </li>
                            <li className="flex items-start gap-3 text-red-800/80">
                                <span className="mt-1 text-red-400">✗</span>
                                <span>Days (or weeks) to launch a single campaign</span>
                            </li>
                        </ul>
                    </AnimatedSection>

                    <AnimatedSection delay={200} className="p-8 bg-green-50/50 rounded-3xl border border-green-100 hover:border-green-200 transition-colors shadow-lg shadow-green-900/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">⚡️</div>
                            <h3 className="text-xl font-bold text-green-900">The CampaignGen Way</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-green-800/80">
                                <span className="mt-1 text-green-500">✓</span>
                                <span>One prompt generates assets for 10+ channels</span>
                            </li>
                            <li className="flex items-start gap-3 text-green-800/80">
                                <span className="mt-1 text-green-500">✓</span>
                                <span>AI trained on YOUR brand guidelines automatically</span>
                            </li>
                            <li className="flex items-start gap-3 text-green-800/80">
                                <span className="mt-1 text-green-500">✓</span>
                                <span>Launch complete campaigns in 5 minutes flat</span>
                            </li>
                        </ul>
                    </AnimatedSection>
                </div>
            </div>
        </section>

        <section className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white to-transparent opacity-50"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Orchestration over Creation</h2>
                    <p className="text-slate-500 text-lg">Most tools just write text. We build entire marketing ecosystems.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <AnimatedSection delay={0} className="group relative p-8 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <NetworkIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">One Prompt, Everywhere</p>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">The Omni-Channel Engine</h3>
                        <p className="text-slate-500 leading-relaxed flex-grow">Don't just generate a blog post. Input your goal, and instantly get the matching LinkedIn carousel, Instagram Reel script, Meta Ad copy, and Email nurture sequence.</p>
                    </AnimatedSection>
                    
                    <AnimatedSection delay={200} className="group relative p-8 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Goodbye, Generic Robot Text</p>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Brand Consistency Guardrails</h3>
                        <p className="text-slate-500 leading-relaxed flex-grow">Our Brand Consistency Engine™ learns your tone, voice, and style guidelines once, ensuring every asset feels like you.</p>
                    </AnimatedSection>

                    <AnimatedSection delay={400} className="group relative p-8 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <ChipIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">From Idea to Inbox</p>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Export</h3>
                        <p className="text-slate-500 leading-relaxed flex-grow">Push approved content directly to HubSpot, Mailchimp, and Meta Ads Manager. No copy-pasting required.</p>
                    </AnimatedSection>
                </div>
            </div>
        </section>

        <TestimonialsSection />
        <FAQSection />
    </>
);

// --------------- MAIN LAYOUT & ROUTER ---------------

interface LandingPageProps {
    onStartTrial: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartTrial }) => {
    const [activePage, setActivePage] = useState('home');

    const handleNavigate = (page: string) => {
        setActivePage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden flex flex-col">
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
            
            <LandingHeader onStartTrial={onStartTrial} onNavigate={handleNavigate} activePage={activePage} />
            
            <main className="flex-grow">
                {activePage === 'home' && <HomePage onStartTrial={onStartTrial} />}
                {activePage === 'features' && <PublicFeaturesPage onStartTrial={onStartTrial} />}
                {activePage === 'pricing' && <PublicPricingPage onStartTrial={onStartTrial} />}
                {activePage === 'comparison' && <ComparisonPage onStartTrial={onStartTrial} />}
            </main>
            
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
};
