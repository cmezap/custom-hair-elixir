import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import quiz from "@/data/quiz-questions.json";
import data from "@/data/site.json";
import { buildRecommendation } from "@/lib/recommendation";
import cremaImg from "@/assets/crema-base.jpg";
import boosterImg from "@/assets/booster.jpg";

type Answers = Record<string, string>;

const STORAGE_KEY = "lumiere-diagnostico-respuestas";

const Diagnostico = () => {
  const questions = quiz.questions;
  const total = questions.length;

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const current = questions[step];
  const progress = useMemo(() => Math.round(((step + (submitted ? 1 : 0)) / total) * 100), [step, submitted, total]);

  const recommendation = useMemo(
    () => (submitted ? buildRecommendation(answers) : null),
    [submitted, answers]
  );

  const select = (value: string) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < total - 1) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      finalize(next);
    }
  };

  const finalize = (final: Answers) => {
    const payload = {
      submittedAt: new Date().toISOString(),
      answers: final,
    };
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      all.push(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all, null, 2));
    } catch {
      /* ignore */
    }
    setSubmitted(true);
  };

  const downloadJSON = () => {
    const payload = {
      brand: data.brand.name,
      submittedAt: new Date().toISOString(),
      answers,
      labels: questions.reduce<Record<string, string>>((acc, q) => {
        acc[q.id] = q.label;
        return acc;
      }, {}),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostico-lumiere-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
    setSubmitted(false);
    setStarted(false);
  };

  return (
    <main className="min-h-screen bg-dark text-cream flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container-luxe flex items-center justify-between h-20">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-display text-2xl tracking-[0.15em] text-cream">{data.brand.name}</span>
            <span className="text-[9px] tracking-[0.4em] text-gold mt-1">{data.brand.tagline}</span>
          </Link>
          <Link
            to="/"
            className="text-[11px] tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
          >
            ← VOLVER
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 flex items-center">
        <div className="container-luxe w-full py-16">

          {/* INTRO */}
          {!started && !submitted && (
            <div className="max-w-2xl mx-auto text-center animate-fade-up">
              <p className="eyebrow">{quiz.intro.eyebrow}</p>
              <h1 className="font-display text-5xl md:text-6xl text-cream leading-tight mb-6">
                {quiz.intro.title}
              </h1>
              <p className="text-cream/70 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
                {quiz.intro.subtitle}
              </p>
              <div className="flex items-center justify-center gap-6 mb-10 text-cream/60 text-[11px] tracking-[0.15em] uppercase">
                <span>15 preguntas</span>
                <span className="w-1 h-1 rounded-full bg-gold/60" />
                <span>~ 2 minutos</span>
              </div>
              <button
                onClick={() => setStarted(true)}
                className="bg-gold text-background px-8 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
              >
                {quiz.intro.cta}
              </button>
            </div>
          )}

          {/* QUESTION */}
          {started && !submitted && (
            <div className="max-w-3xl mx-auto">
              {/* Progress */}
              <div className="mb-12">
                <div className="flex justify-between text-[10px] tracking-[0.2em] text-cream/60 mb-3">
                  <span>PREGUNTA {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
                  <span className="text-gold">{Math.round(((step) / total) * 100)}%</span>
                </div>
                <div className="h-[2px] bg-border/60 overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-500 ease-out"
                    style={{ width: `${(step / total) * 100}%` }}
                  />
                </div>
              </div>

              <div key={current.id} className="animate-fade-up">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center text-gold text-xl">
                    {current.icon}
                  </span>
                  <p className="eyebrow !mb-0">{current.id}</p>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-cream mb-10 leading-snug">
                  {current.label}
                </h2>

                <div className="grid sm:grid-cols-2 gap-3">
                  {current.options.map((opt) => {
                    const selected = answers[current.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => select(opt)}
                        className={`group text-left p-5 border transition-all flex items-center justify-between gap-4 ${
                          selected
                            ? "border-gold bg-gold/10 text-cream"
                            : "border-border/60 bg-dark-2 text-cream/80 hover:border-gold/60 hover:bg-dark-3"
                        }`}
                      >
                        <span className="text-sm">{opt}</span>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            selected ? "border-gold bg-gold" : "border-cream/30 group-hover:border-gold"
                          }`}
                        >
                          {selected && <span className="w-2 h-2 rounded-full bg-background" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-12">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="text-[11px] tracking-[0.2em] text-cream/60 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← ANTERIOR
                  </button>
                  <span className="text-[10px] tracking-[0.2em] text-cream/40">
                    SELECCIONA UNA OPCIÓN PARA CONTINUAR
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RESULT */}
          {submitted && (
            <div className="max-w-5xl mx-auto animate-fade-up">
              {/* Header */}
              <div className="text-center mb-14">
                <p className="eyebrow">TU FÓRMULA IA ✦</p>
                <h1 className="font-display text-4xl md:text-6xl text-cream mb-6 leading-tight">
                  Tu ritual <span className="italic text-gold">personalizado</span>
                </h1>
                <p className="text-cream/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                  {recommendation?.summary}
                </p>
              </div>

              {/* IA Phrase */}
              <div className="relative bg-gradient-to-br from-dark-2 to-dark-3 border border-gold/30 p-8 md:p-10 mb-12 overflow-hidden">
                <div className="absolute top-4 left-6 text-gold/20 font-display text-7xl leading-none select-none">"</div>
                <div className="relative pl-8">
                  <p className="text-[10px] tracking-[0.3em] text-gold mb-4">RECOMENDACIÓN IA</p>
                  <p className="font-display text-xl md:text-2xl text-cream italic leading-relaxed">
                    {recommendation?.phrase}
                  </p>
                </div>
              </div>

              {/* Recipe grid */}
              <div className="grid md:grid-cols-3 gap-5 mb-12">
                {/* Crema base card */}
                <article className="md:col-span-1 bg-dark-2 border border-border/60 p-6 flex flex-col">
                  <div className="aspect-[3/4] mb-5 overflow-hidden bg-dark-3 relative">
                    <img
                      src={cremaImg}
                      alt="Crema base LUMIÈRE"
                      width={768}
                      height={1024}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-gold text-background text-[9px] tracking-[0.2em] px-2 py-1 font-semibold">
                      BASE
                    </div>
                  </div>
                  <p className="text-[10px] tracking-[0.2em] text-gold mb-2">PASO 01</p>
                  <h3 className="font-display text-2xl text-cream mb-3">Crema base</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-display text-5xl text-gold">{recommendation?.pumps}</span>
                    <span className="text-cream/70 text-sm tracking-[0.15em] uppercase">
                      pump{(recommendation?.pumps ?? 1) > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-cream/60 text-xs leading-relaxed mt-auto">
                    Dispensa en la palma de tu mano como base hidratante de tu mezcla.
                  </p>
                </article>

                {/* Boosters cards */}
                {recommendation?.boosters.map((b, idx) => (
                  <article
                    key={b.id}
                    className="bg-dark-2 border border-border/60 p-6 flex flex-col"
                  >
                    <div className="aspect-[3/4] mb-5 overflow-hidden bg-dark-3 relative">
                      <img
                        src={boosterImg}
                        alt={`Booster ${b.id} - ${b.name}`}
                        width={768}
                        height={1024}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-cream text-background text-[9px] tracking-[0.2em] px-2 py-1 font-semibold">
                        BOOSTER {b.id}
                      </div>
                    </div>
                    <p className="text-[10px] tracking-[0.2em] text-gold mb-2">
                      PASO {String(idx + 2).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-2xl text-cream mb-3">{b.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-display text-5xl text-gold">{b.drops}</span>
                      <span className="text-cream/70 text-sm tracking-[0.15em] uppercase">gotas</span>
                    </div>
                    <p className="text-cream/60 text-xs leading-relaxed mt-auto">{b.reason}</p>
                  </article>
                ))}

                {/* Fill column if only 1 booster */}
                {recommendation && recommendation.boosters.length === 1 && (
                  <article className="bg-dark-2/40 border border-dashed border-border/60 p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-4 opacity-60">🤲</span>
                    <p className="text-[10px] tracking-[0.2em] text-gold mb-2">PASO 03</p>
                    <h3 className="font-display text-xl text-cream mb-3">Mezcla y aplica</h3>
                    <p className="text-cream/60 text-xs leading-relaxed">
                      Combina en tus manos y aplica de medios a puntas con movimientos suaves.
                    </p>
                  </article>
                )}
              </div>

              {/* Answers summary */}
              <details className="bg-dark-2 border border-border/60 mb-10">
                <summary className="cursor-pointer p-5 text-[11px] tracking-[0.2em] text-gold hover:bg-dark-3 transition-colors">
                  VER TUS RESPUESTAS DEL DIAGNÓSTICO
                </summary>
                <ul className="space-y-3 p-5 pt-0 max-h-72 overflow-auto">
                  {questions.map((q) => (
                    <li key={q.id} className="flex justify-between gap-4 text-xs border-b border-border/40 pb-2">
                      <span className="text-cream/60">{q.label}</span>
                      <span className="text-cream font-medium text-right shrink-0">{answers[q.id] || "—"}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={downloadJSON}
                  className="bg-gold text-background px-7 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
                >
                  DESCARGAR JSON ↓
                </button>
                <button
                  onClick={reset}
                  className="border border-gold text-gold px-7 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold/10 transition-colors"
                >
                  REPETIR DIAGNÓSTICO
                </button>
                <Link
                  to="/"
                  className="border border-border text-cream/80 px-7 py-4 text-[11px] tracking-[0.2em] font-semibold hover:border-gold hover:text-gold transition-colors"
                >
                  VOLVER AL INICIO
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border/40 py-6 text-center text-[10px] tracking-[0.2em] text-cream/40">
        {data.footer.legal}
      </footer>
    </main>
  );
};

export default Diagnostico;
