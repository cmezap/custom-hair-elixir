import data from "@/data/site.json";

const Hero = () => {
  const { headline, subtext, ctas, badges } = data.hero;
  return (
    <section id="inicio" className="relative pt-32 pb-0 overflow-hidden bg-gradient-to-br from-dark via-dark-2 to-dark">
      <div className="container-luxe grid lg:grid-cols-2 gap-12 items-center min-h-[640px] py-16">
        <div className="animate-fade-up">
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-8">
            {headline.map((line, i) => (
              <span key={i} className={`block ${i === 2 ? "text-gold italic" : "text-cream"}`}>
                {line}.
              </span>
            ))}
          </h1>
          <p className="text-cream/70 max-w-md mb-10 leading-relaxed text-sm">{subtext}</p>
          <div className="flex flex-wrap gap-4">
            {ctas.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className={`inline-flex items-center gap-2 px-7 py-4 text-[11px] font-semibold tracking-[0.2em] transition-all ${
                  c.type === "primary"
                    ? "bg-gold text-background hover:bg-gold-light"
                    : "border border-gold text-gold hover:bg-gold/10"
                }`}
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>
        <div className="img-placeholder aspect-[4/5] w-full rounded-sm">imagen hero · crema + booster</div>
      </div>

      <div className="border-t border-border/40 bg-dark-2/60">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-cream/80">
              <span className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold text-base">
                {b.icon}
              </span>
              <span className="text-[11px] tracking-[0.15em] uppercase">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
