import { ChevronRight } from 'lucide-react';

export default function About() {
  return (
    <div className="relative min-h-screen w-full flex flex-col pt-32 pb-40 px-6 z-10">
      
      {/* Cinematic Background specifically for About */}
      <div className="fixed inset-0 bg-background z-[-2]"></div>
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{ willChange: 'transform, opacity' }}
        className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-20 mix-blend-screen"
      >
        <source src="/subtle-cinematic-animation-in-1080p-high-resolutio.mp4" type="video/mp4" />
      </video>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-[-1]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background/90 z-[-1] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full relative">
        <div className="animate-[fade-rise_0.6s_ease-out]">
          <header className="mb-24 text-center">
            <span className="text-primary tracking-widest uppercase text-sm font-mono mb-4 block">The Genesis</span>
            <h1 className="text-6xl md:text-8xl text-foreground mb-8" style={{ fontFamily: "'Lora', serif" }}>
              Savagers.
            </h1>
            <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto">
              A digital sanctuary for deep thinkers, nocturnal creators, and quiet rebels finding solace in the noise.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center mb-32">
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed animate-fade-rise-delay">
              <p>
                In a world obsessed with constant connection and endless scrolling, <strong className="text-foreground font-normal">Savagers.</strong> was born out of a profound need for disconnection. We believe that true creativity and deep insights are only forged in the crucible of silence.
              </p>
              <p>
                This space is deliberately stripped of algorithmic feeds, notifications, and social validation metrics. It is an empty canvas paired with carefully curated low-fidelity soundscapes.
              </p>
            </div>
            
            <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden liquid-glass border border-white/5 animate-fade-rise-delay-2 group">
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop" 
                alt="Circuit board representing technology and silence" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-[2000ms]"
              />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-foreground text-xl font-serif italic">"Silence is not empty. It is full of answers."</p>
              </div>
            </div>
          </div>

          <div className="border-y border-border/40 py-24 animate-fade-rise-delay-2">
            <h2 className="text-3xl md:text-5xl text-foreground mb-16 text-center" style={{ fontFamily: "'Lora', serif" }}>
              Our Core Pillars
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-border/50 flex items-center justify-center mb-6 text-2xl text-foreground">I</div>
                <h3 className="text-xl text-foreground mb-4 font-serif">Absolute Focus</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">No distractions. Only the tools and environments necessary for deep, uninterrupted cognitive labor.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-border/50 flex items-center justify-center mb-6 text-2xl text-foreground">II</div>
                <h3 className="text-xl text-foreground mb-4 font-serif">Sonic Curation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">A meticulously selected archive of ambient and low-fidelity frequencies designed to mask the chaos.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-border/50 flex items-center justify-center mb-6 text-2xl text-foreground">III</div>
                <h3 className="text-xl text-foreground mb-4 font-serif">Intellectual Depth</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">A repository of essays, chronicles, and thoughts honoring logic, philosophy, and software evolution.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-32 animate-fade-rise-delay-2">
            <p className="text-muted-foreground mb-8">Ready to disappear into the sound?</p>
            <a href="/mixtapes" className="liquid-glass rounded-full px-10 py-4 text-sm text-foreground hover:scale-[1.03] transition-transform inline-flex items-center gap-3">
              Enter The Archives <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}