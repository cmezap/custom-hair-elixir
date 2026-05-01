import data from "@/data/site.json";
import { Link } from "react-router-dom";
import ritualImg from "@/assets/ritual-gotas.png";
import diagnosticoImg from "@/assets/diagnostico-mockup.png";

const RitualDiagnostico = () => {
  const r = data.ritual;
  const d = data.diagnosticoIA;
  return (
    <section id="sistema-ia" className="grid md:grid-cols-2">
      {/* Ritual / Guía */}
      <div className="bg-cream text-background grid grid-cols-1 sm:grid-cols-2 gap-0 items-stretch">
        <div className="p-8 md:p-10 lg:p-16 flex flex-col justify-center">
          <p className="eyebrow text-gold-dim">{r.eyebrow}</p>
          <h2 className="font-display text-4xl text-background mb-8 leading-tight">{r.title}</h2>
          <ol className="space-y-6">
            {r.pasos.map((p) => (
              <li key={p.num} className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-full border border-gold-dim/50 flex items-center justify-center text-gold-dim">
                  {p.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-background mb-1">
                    {p.num}. {p.title}
                  </p>
                  <p className="text-xs text-background/70 leading-relaxed">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-cream-2 overflow-hidden min-h-[280px] sm:min-h-full">
          <img
            src={ritualImg}
            alt="Ritual LUMIÈRE — gotas de booster sobre crema"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Diagnóstico IA */}
      <div className="bg-cream-2 text-background grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-0 items-stretch">
        <div className="p-8 md:p-10 lg:p-16 flex flex-col justify-center">
          <p className="eyebrow text-gold-dim">{d.eyebrow}</p>
          <h2 className="font-display text-4xl text-background mb-6 leading-tight">{d.title}</h2>
          <p className="text-background/70 text-sm leading-relaxed mb-8">{d.description}</p>
          <Link
            to="/diagnostico"
            className="inline-block bg-gold text-background px-6 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors mb-8"
          >
            {d.cta}
          </Link>
          <div className="grid grid-cols-3 gap-4">
            {d.features.map((f) => (
              <div key={f.label} className="text-center">
                <div className="w-9 h-9 mx-auto mb-2 rounded-full border border-gold-dim/50 flex items-center justify-center text-gold-dim">
                  {f.icon}
                </div>
                <p className="text-[10px] text-background/70 leading-snug">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-cream overflow-hidden min-h-[320px] sm:min-h-full">
          <img
            src={diagnosticoImg}
            alt="Mockup app diagnóstico LUMIÈRE"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default RitualDiagnostico;
