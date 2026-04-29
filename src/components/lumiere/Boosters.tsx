import data from "@/data/site.json";

const Boosters = () => {
  const b = data.boosters;
  return (
    <section id="boosters" className="bg-dark py-24">
      <div className="container-luxe text-center mb-14">
        <p className="eyebrow">{b.eyebrow}</p>
        <h2 className="font-display text-4xl md:text-5xl text-cream mb-4">{b.title}</h2>
        <p className="text-cream/60 text-sm max-w-2xl mx-auto">{b.subtitle}</p>
      </div>

      <div className="container-luxe grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {b.items.map((item) => (
          <article
            key={item.id}
            className={`relative bg-dark-2 border border-border/60 p-5 flex flex-col transition-all hover:border-gold/60 ${
              !item.available ? "opacity-60" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gold text-background font-display text-lg flex items-center justify-center mb-4">
              {item.id}
            </div>
            <div className="img-placeholder aspect-[3/4] mb-5 relative">
              <span>booster {item.id}</span>
              {!item.available && (
                <span className="absolute top-2 right-2 text-[9px] tracking-widest bg-background/80 text-gold px-2 py-1">
                  PRÓXIMAMENTE
                </span>
              )}
            </div>
            <h3 className={`font-display text-xl mb-2 ${item.available ? "text-cream" : "text-gold/60"}`}>
              {item.name}
            </h3>
            <p className="text-cream/60 text-xs leading-relaxed mb-4 flex-1">{item.description}</p>
            {item.ingredientes.length > 0 && (
              <div className="border-t border-border/60 pt-4">
                <p className="text-[9px] tracking-[0.2em] text-gold mb-3">INGREDIENTES</p>
                <ul className="space-y-1.5">
                  {item.ingredientes.map((ing) => (
                    <li key={ing.nombre} className="flex justify-between text-[11px] text-cream/70">
                      <span>{ing.nombre}</span>
                      <span className="text-gold">{ing.pct}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="text-center mt-12">
        <button className="inline-flex items-center gap-3 px-7 py-4 border border-gold text-gold text-[11px] tracking-[0.2em] font-semibold hover:bg-gold hover:text-background transition-colors">
          COMPARAR BOOSTERS ⚖️
        </button>
      </div>
    </section>
  );
};

export default Boosters;
