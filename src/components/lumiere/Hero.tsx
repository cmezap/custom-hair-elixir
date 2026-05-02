import data from "@/data/site.json";
import heroImg from "@/assets/hero-luxe.jpg";
import { Link } from "react-router-dom";
import { SlidersHorizontal, Leaf, FlaskConical, Sparkles, type LucideIcon } from "lucide-react";

const badgeIcons: Record<string, LucideIcon> = {
  Personalizable: SlidersHorizontal,
  "Ingredientes premium": Leaf,
  "Ciencia + Naturaleza": FlaskConical,
  "Resultados visibles": Sparkles,
};

const Hero = () => {
  const { headline, subtext, ctas, badges } = data.hero;
  return (
    <section
      id="inicio"
      className="relative pt-32 overflow-hidden bg-dark"
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      {/* Gradient overlay: solid black left → transparent right */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/85 via-40% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-dark/40" />

      <div className="relative container-luxe min-h-[680px] flex items-center py-20">
        <div className="max-w-xl animate-fade-up">
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-8">
            {headline.map((line, i) => (
              <span key={i} className={`block ${i === 2 ? "text-gold italic" : "text-cream"}`}>
                {line}.
              </span>
            ))}
          </h1>
          <p className="text-cream/80 max-w-md mb-10 leading-relaxed text-sm">{subtext}</p>
          <div className="flex flex-wrap gap-4">
            {ctas.map((c) => {
              const cls = `inline-flex items-center gap-2 px-7 py-4 text-[11px] font-semibold tracking-[0.2em] transition-all ${
                c.type === "primary"
                  ? "bg-gold text-background hover:bg-gold-light"
                  : "border border-gold text-gold hover:bg-gold/10"
              }`;
              if (c.href === "#sistema-ia") {
                return (
                  <Link key={c.label} to="/diagnostico" className={cls}>
                    {c.label}
                  </Link>
                );
              }
              return (
                <a key={c.label} href={c.href} className={cls}>
                  {c.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* badges strip */}
      <div className="relative border-t border-border/40 bg-dark/80 backdrop-blur-sm">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-cream/80">
              <span className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold">
                {(() => {
                  const Icon = badgeIcons[b.label];
                  return Icon ? <Icon className="w-4 h-4" strokeWidth={1.5} /> : <span className="text-base">{b.icon}</span>;
                })()}
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
