import { Play } from 'lucide-react';

export default function Music() {
  const stations = [
    { 
      title: 'Midnight Focus', 
      desc: 'Deep bass, slow tempo, absolute isolation.', 
      img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop' 
    },
    { 
      title: 'Rain & Coffee', 
      desc: 'Acoustic elements mixed with urban rainfall.', 
      img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2865&auto=format&fit=crop' 
    },
    { 
      title: 'Neon Dreams', 
      desc: 'Synth-heavy lo-fi for late night coding.', 
      img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2940&auto=format&fit=crop' 
    },
  ];

  return (
    <section className="relative min-h-screen w-full px-6 pt-32 pb-24 bg-background">
      <div className="max-w-7xl mx-auto pt-10">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl text-foreground mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Curated Frequencies
            </h2>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
              Select a frequency to align with your current state of mind. Each station is mixed for infinite, distraction-free loops.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stations.map((station, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer bg-muted/20 border border-border/50">
              <img src={station.img} alt={station.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-110 opacity-60 group-hover:opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center mb-6 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Play fill="currentColor" size={18} className="text-foreground ml-1" />
                </div>
                <h3 className="text-3xl text-foreground mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{station.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{station.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
