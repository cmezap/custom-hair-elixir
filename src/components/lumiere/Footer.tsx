import data from "@/data/site.json";

const Footer = () => {
  const f = data.footer;
  return (
    <footer id="contacto" className="bg-dark border-t border-border/60">
      {/* Trust bar */}
      <div className="border-b border-border/60">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-6 py-10">
          {data.trustBar.map((t) => (
            <div key={t.label} className="flex items-center gap-3 text-cream/70">
              <span className="text-gold text-lg">{t.icon}</span>
              <span className="text-[11px] tracking-[0.1em] uppercase leading-snug">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-luxe grid lg:grid-cols-4 gap-12 py-16">
        <div>
          <p className="font-display text-2xl tracking-[0.15em] text-cream">{data.brand.name}</p>
          <p className="text-[9px] tracking-[0.4em] text-gold mt-1 mb-6">{data.brand.tagline}</p>
          <p className="text-cream/60 text-xs leading-relaxed mb-6">{data.brand.description}</p>
          <div className="flex gap-3">
            {f.social.map((s) => (
              <a key={s} href="#" className="w-9 h-9 border border-border flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold transition-colors text-xs">
                {s[0].toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.2em] text-gold mb-5">{f.nav.title}</p>
          <ul className="space-y-3">
            {f.nav.links.map((l) => (
              <li key={l}><a href="#" className="text-cream/70 text-xs hover:text-gold transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.2em] text-gold mb-5">{f.ayuda.title}</p>
          <ul className="space-y-3">
            {f.ayuda.links.map((l) => (
              <li key={l}><a href="#" className="text-cream/70 text-xs hover:text-gold transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.2em] text-gold mb-5">{f.newsletter.title}</p>
          <p className="text-cream/60 text-xs mb-4">{f.newsletter.desc}</p>
          <form className="flex border border-border focus-within:border-gold transition-colors">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 bg-transparent px-3 py-3 text-xs text-cream placeholder:text-cream/40 outline-none"
            />
            <button className="bg-gold text-background px-4 text-sm">→</button>
          </form>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-luxe flex flex-col md:flex-row justify-between gap-3 py-6 text-[11px] text-cream/50">
          <p>{f.legal}</p>
          <ul className="flex gap-6">
            {f.legalLinks.map((l) => (
              <li key={l}><a href="#" className="hover:text-gold transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
