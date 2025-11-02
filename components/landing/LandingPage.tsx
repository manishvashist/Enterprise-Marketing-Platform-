
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
      rootMargin: '0px 0px -100px 0px'
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

const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { observe, isVisible } = useScrollAnimation();

    useEffect(() => {
        observe(ref.current);
    }, [observe]);

    const isElVisible = isVisible(ref.current);

    return (
        <div
            ref={ref}
            className={`${className || ''} transition-all duration-1000 ${isElVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
            {children}
        </div>
    );
};

// --------------- NEW ICONS ---------------

const SpeedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.5l-3-6-3 6h6z" />
  </svg>
);

const IntelligenceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.456-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.456-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const CompletenessIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CampaignArchitectureIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);
const PromptIntelligenceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h9.75z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 8.25l-4.5 4.5 4.5 4.5" />
  </svg>
);
const AudienceIntelligenceIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 10.5a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" transform="translate(-4, -4) scale(0.8)" />
    </svg>
);
const VersatilityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25a8.25 8.25 0 00-8.25 8.25c0 1.833.467 3.56 1.257 5.034M12 2.25a8.25 8.25 0 018.25 8.25c0 1.833-.467 3.56-1.257 5.034M12 21.75a8.25 8.25 0 005.27-15.023M12 21.75a8.25 8.25 0 01-5.27-15.023" />
  </svg>
);
const EnterpriseReadyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" />
  </svg>
);

// --------------- LANDING PAGE COMPONENTS ---------------

const LandingHeader: React.FC<{ onStartTrial: () => void }> = ({ onStartTrial }) => (
    <header className="absolute top-0 left-0 right-0 z-30 py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".5"/>
                    <path d="M12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
                <h1 className="text-xl font-bold text-white tracking-tight">AI Campaign Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={onStartTrial} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Login</button>
                <button onClick={onStartTrial} className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors">Start Free Trial</button>
            </div>
        </div>
    </header>
);

const HeroSection: React.FC<{ onStartTrial: () => void }> = ({ onStartTrial }) => (
    <section className="relative bg-gray-900 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-gray-900 to-gray-900 z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] rounded-full bg-indigo-500/10 blur-3xl z-0"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
            <AnimatedSection>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Generate Complete Marketing Campaigns with AI
                </h1>
            </AnimatedSection>
            <AnimatedSection>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
                    From high-level strategy and audience segmentation to multi-channel content and execution, build your next campaign in minutes, not weeks.
                </p>
            </AnimatedSection>
            <AnimatedSection>
                <button onClick={onStartTrial} className="mt-10 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg shadow-indigo-600/30">
                    Try Free - Create Your First Campaign
                </button>
            </AnimatedSection>
        </div>
        <AnimatedSection>
            <div className="relative mt-16">
                 <img src="https://i.imgur.com/sC36w6q.png" alt="Platform Interface" className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl shadow-indigo-900/50 border border-gray-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
            </div>
        </AnimatedSection>
    </section>
);

const StatsSection: React.FC = () => {
    const StatItem: React.FC<{ value: number, label: string, suffix?: string }> = ({ value, label, suffix }) => {
        const [count, setCount] = useState(0);
        const ref = useRef<HTMLDivElement>(null);
        const { observe, isVisible } = useScrollAnimation();

        useEffect(() => {
            observe(ref.current);
        }, [observe]);

        useEffect(() => {
            if (isVisible(ref.current)) {
                let start = 0;
                const end = value;
                if (start === end) return;
                const duration = 2000;
                const incrementTime = (duration / end);
                const timer = setInterval(() => {
                    start += Math.ceil(end / (duration / 10)); // speed up for large numbers
                    if (start >= end) {
                        setCount(end);
                        clearInterval(timer);
                    } else {
                        setCount(start);
                    }
                }, 10);
                return () => clearInterval(timer);
            }
        }, [isVisible(ref.current), value]);

        return (
            <div ref={ref} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-indigo-400">{count.toLocaleString()}{suffix}</p>
                <p className="text-sm text-gray-400 mt-2">{label}</p>
            </div>
        );
    };

    return (
        <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <StatItem value={800} label="Satisfied Users Trust Our Platform" suffix="+" />
                    <StatItem value={100} label="Companies Building Better Campaigns" suffix="+" />
                    <StatItem value={25000} label="Campaigns Created" suffix="+" />
                </AnimatedSection>
                <AnimatedSection className="mt-16">
                    <p className="text-center text-gray-500 text-sm">TRUSTED BY TEAMS AT</p>
                    <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-4 mt-6 grayscale opacity-60">
                         {['Momentum Digital', 'PixelCraft', 'Launchpad MKTG', 'Tidal Wave Creative', 'Sprout Socials'].map(name => (
                            <span key={name} className="text-xl font-semibold text-gray-500">{name}</span>
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};


const ValuePropsSection: React.FC = () => {
  const benefits = [
    { icon: SpeedIcon, title: "Unmatched Speed", description: "Build comprehensive campaigns in minutes, not weeks. Go from idea to execution faster than ever before." },
    { icon: IntelligenceIcon, title: "Strategic Intelligence", description: "Our AI understands marketing strategy and audience dynamics, ensuring every campaign is built on a solid foundation." },
    { icon: CompletenessIcon, title: "End-to-End Solution", description: "From strategy and budgeting to channel selection and content creation, everything you need is in one place." }
  ];
  return (
    <section className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Why Use Our Platform?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Our platform is more than just a tool—it's your AI-powered marketing co-pilot.</p>
        </AnimatedSection>
        <AnimatedSection className="grid md:grid-cols-3 gap-10 mt-16">
          {benefits.map(benefit => (
            <div key={benefit.title} className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center">
              <div className="inline-block p-4 bg-indigo-600/20 text-indigo-400 rounded-full">
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{benefit.title}</h3>
              <p className="mt-2 text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
};

const TopFeaturesSection: React.FC = () => {
    const features = [
        { icon: CampaignArchitectureIcon, title: "Comprehensive Campaign Architecture", description: "Automatically structures complete campaigns including strategy, budgeting, touchpoints, content themes, and channels, ensuring nothing is overlooked.", imgSrc: "https://picsum.photos/seed/arch/600/400" },
        { icon: PromptIntelligenceIcon, title: "Intelligent Prompt Interpretation", description: "Smartly handles both positive and negative instructions, correctly interpreting 'what not to do' guidance and adapting outputs accordingly.", imgSrc: "https://picsum.photos/seed/prompt/600/400" },
        { icon: AudienceIntelligenceIcon, title: "Advanced Audience Intelligence", description: "Automatically identifies and segments probable target groups, suggesting optimal channels and messaging for each audience.", imgSrc: "https://picsum.photos/seed/audience/600/400" },
        { icon: VersatilityIcon, title: "Cross-Platform Versatility", description: "Works equally well across different product categories and campaign types, with platform-aware content generation for social, search, display, and more.", imgSrc: "https://picsum.photos/seed/versatile/600/400" },
        { icon: EnterpriseReadyIcon, title: "Enterprise-Ready Solution", description: "A real-world marketing application, not just a concept generator. Scalable from solo marketers to enterprise teams, with capabilities that grow with your needs.", imgSrc: "https://picsum.photos/seed/enterprise/600/400" }
    ];

    return (
        <section className="py-24 bg-gray-800/40">
            <div className="container mx-auto px-6">
                <AnimatedSection className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Powerful Features, Effortless Results</h2>
                </AnimatedSection>
                <div className="mt-16 space-y-12">
                    {features.map((feature, index) => (
                        <AnimatedSection key={feature.title}>
                            <div className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="md:w-1/2">
                                    <div className="inline-flex items-center gap-4">
                                        <div className="p-3 bg-gray-700 rounded-lg"><feature.icon className="w-6 h-6 text-indigo-400" /></div>
                                        <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                                    </div>
                                    <p className="mt-4 text-lg text-gray-400">{feature.description}</p>
                                </div>
                                <div className="md:w-1/2 p-8 bg-gray-900 rounded-lg border border-gray-700">
                                   <div className="h-48 bg-gray-800 rounded-md overflow-hidden">
                                        <img src={feature.imgSrc} alt={`${feature.title} Visual`} className="w-full h-full object-cover" />
                                   </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

const HowItWorksSection: React.FC = () => (
    <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6">
            <AnimatedSection className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Get Started in 3 Simple Steps</h2>
            </AnimatedSection>
            <AnimatedSection className="relative mt-16">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-700 hidden md:block" />
                <div className="relative grid md:grid-cols-3 gap-12">
                    {[
                        { num: 1, title: "Describe", description: "Provide your campaign goals, target audience, and any specific constraints or negative instructions." },
                        { num: 2, title: "Generate", description: "Our AI builds a comprehensive strategy, journey, and content assets in seconds." },
                        { num: 3, title: "Launch", description: "Review, refine, and connect your accounts to launch your campaign directly from the platform." }
                    ].map(step => (
                        <div key={step.num} className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center z-10">
                            <div className="w-12 h-12 flex items-center justify-center mx-auto bg-indigo-600 text-white font-bold text-xl rounded-full mb-6">{step.num}</div>
                            <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                            <p className="mt-2 text-gray-400">{step.description}</p>
                        </div>
                    ))}
                </div>
            </AnimatedSection>
        </div>
    </section>
);

const TestimonialsSection: React.FC = () => (
     <section className="py-24 bg-gray-800/40">
        <div className="container mx-auto px-6">
            <AnimatedSection className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white">What Our Users Are Saying</h2>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-3 gap-8 mt-16">
                 {[
                    { name: "Sarah L.", role: "Marketing Director", quote: "This platform has become our single source of truth for campaign planning. The speed and strategic depth are simply unmatched." },
                    { name: "Mike R.", role: "PPC Specialist", quote: "I was skeptical about AI for strategy, but the audience intelligence is spot-on. It's saved us thousands in testing." },
                    { name: "Jessica Chen", role: "Founder, Bloom & Co.", quote: "As a small team, this tool is a game-changer. We can now execute campaigns that feel like they came from a massive agency." }
                ].map(testimonial => (
                    <div key={testimonial.name} className="bg-gray-900 p-8 rounded-lg border border-gray-700">
                        <p className="text-gray-300">"{testimonial.quote}"</p>
                        <div className="flex items-center mt-6">
                             <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">{testimonial.name.charAt(0)}</div>
                             <div className="ml-4">
                                <p className="font-semibold text-white">{testimonial.name}</p>
                                <p className="text-sm text-gray-400">{testimonial.role}</p>
                             </div>
                        </div>
                    </div>
                 ))}
            </AnimatedSection>
        </div>
     </section>
);

const CTASection: React.FC<{ onStartTrial: () => void }> = ({ onStartTrial }) => (
    <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6">
            <AnimatedSection>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Transform Your Marketing?</h2>
                    <p className="mt-4 text-lg text-indigo-200">Generate your first campaign for free. No credit card required.</p>
                    <button onClick={onStartTrial} className="mt-8 px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg">
                        Start Free Trial
                    </button>
                    <p className="mt-4 text-xs text-indigo-200/80">Free 7-day trial • No credit card needed • Cancel anytime</p>
                </div>
            </AnimatedSection>
        </div>
    </section>
);

const LandingFooter: React.FC = () => (
    <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} AI Campaign Generator. All rights reserved.</p>
        </div>
    </footer>
);


// --------------- MAIN LANDING PAGE COMPONENT ---------------

interface LandingPageProps {
    onStartTrial: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartTrial }) => {
    return (
        <div className="bg-gray-900">
            <style>{`
                html { scroll-behavior: smooth; }
            `}</style>
            <LandingHeader onStartTrial={onStartTrial} />
            <main>
                <HeroSection onStartTrial={onStartTrial} />
                <StatsSection />
                <ValuePropsSection />
                <TopFeaturesSection />
                <HowItWorksSection />
                <TestimonialsSection />
                <CTASection onStartTrial={onStartTrial} />
            </main>
            <LandingFooter />
        </div>
    );
};
