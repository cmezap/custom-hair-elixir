import data from "@/data/site.json";
import cremaImg from "@/assets/crema-lumiere.png";

const CremaBase = () => {
  const c = data.cremaBase;
  return (
    <section id="producto" className="bg-cream text-background">
      <div className="grid lg:grid-cols-[1fr_1.2fr_1fr] min-h-[600px]">
        <div className="min-h-[420px] lg:min-h-full bg-cream-2 overflow-hidden">
          <img
            src={cremaImg}
            alt="Crema base LUMIÈRE"
            loading="lazy"
            width={768}
            height={1024}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-12 lg:p-16 flex flex-col justify-center">
          <p className="eyebrow text-gold-dim">{c.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-background mb-6 leading-tight">{c.title}</h2>
          <p className="text-background/70 text-sm leading-relaxed mb-10 max-w-md">{c.description}</p>
          <div className="grid grid-cols-2 gap-5">
            {c.benefits.map((b) => (
              <div key={b.label} className="flex items-start gap-3">
                <span className="w-9 h-9 shrink-0 rounded-full border border-gold-dim/40 flex items-center justify-center text-gold-dim">
                  {b.icon}
                </span>
                <span className="text-xs text-background/80 leading-snug pt-2">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cream-2/70 p-12 lg:p-14 flex flex-col justify-center">
          <p className="eyebrow text-gold-dim">INGREDIENTES CLAVE</p>
          <ul className="space-y-3 mb-10">
            {c.ingredientes.map((i) => (
              <li key={i} className="text-sm text-background/80 border-b border-background/10 pb-2">
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CremaBase;
