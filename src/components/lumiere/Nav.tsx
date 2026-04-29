import data from "@/data/site.json";

const Nav = () => (
  <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
    <div className="container-luxe flex items-center justify-between h-20">
      <a href="#inicio" className="flex flex-col leading-none">
        <span className="font-display text-2xl tracking-[0.15em] text-cream">{data.brand.name}</span>
        <span className="text-[9px] tracking-[0.4em] text-gold mt-1">{data.brand.tagline}</span>
      </a>
      <ul className="hidden lg:flex items-center gap-10">
        {data.nav.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className={`text-[11px] tracking-[0.2em] font-medium transition-colors hover:text-gold ${
                l.active ? "text-gold border-b border-gold pb-1" : "text-cream/80"
              }`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <a
        href="#sistema-ia"
        className="hidden md:inline-flex items-center gap-2 px-5 py-3 border border-gold text-gold text-[11px] tracking-[0.2em] font-semibold hover:bg-gold hover:text-background transition-colors"
      >
        DIAGNÓSTICO IA ✦
      </a>
    </div>
  </nav>
);

export default Nav;
