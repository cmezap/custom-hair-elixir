import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import quiz from "@/data/quiz-questions.json";
import data from "@/data/site.json";
import { buildRecommendation, type Recommendation } from "@/lib/recommendation";
import { getGeminiRecommendation, ENV_API_KEY } from "@/lib/gemini";
import cremaImg from "@/assets/crema-base.jpg";
import boosterImg from "@/assets/booster.jpg";

type Answers = Record<string, string>;
type AppState = "apikey" | "intro" | "quiz" | "loading" | "result";

const STORAGE_KEY = "lumiere-diagnostico-respuestas";
const APIKEY_STORAGE = "lumiere-gemini-api-key";

/** Resolve key: env var wins, then localStorage fallback */
function resolveApiKey(): string {
  if (ENV_API_KEY) return ENV_API_KEY;
  return localStorage.getItem(APIKEY_STORAGE) ?? "";
}

/* ─── Loading dots animation ─── */
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

/* ─── API Key screen ─── */
function ApiKeyScreen({ onSubmit }: { onSubmit: (key: string) => void }) {
  const [value, setValue] = useState(
    () => localStorage.getItem(APIKEY_STORAGE) ?? ""
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || !trimmed.startsWith("AIza")) {
      setError('La API key de Gemini debe comenzar con "AIza\u2026"');
      return;
    }
    localStorage.setItem(APIKEY_STORAGE, trimmed);
    onSubmit(trimmed);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-up text-center">
      <p className="eyebrow">CONFIGURACIÓN ✦</p>
      <h1 className="font-display text-4xl md:text-5xl text-cream mb-4 leading-tight">
        Conecta tu IA
      </h1>
      <p className="text-cream/60 text-sm leading-relaxed mb-2">
        Este sistema usa <strong className="text-gold">Google Gemini</strong>{" "}
        para generar tu recomendación capilar personalizada.
      </p>
      <p className="text-cream/50 text-xs leading-relaxed mb-8">
        Obtén tu API key gratuita en{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold underline underline-offset-2 hover:text-gold-light transition-colors"
        >
          aistudio.google.com
        </a>{" "}
        (capa gratuita: 1 500 req/día).
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input
            id="gemini-api-key"
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            placeholder="AIzaSy…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-dark-2 border border-border/60 text-cream text-sm px-5 py-4 placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/30 hover:text-gold text-lg transition-colors"
            >
              ×
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-400 text-xs text-left">{error}</p>
        )}
        <button
          type="submit"
          className="bg-gold text-background px-8 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
        >
          GUARDAR Y CONTINUAR →
        </button>
      </form>

      <p className="text-cream/30 text-[10px] mt-6 leading-relaxed">
        Tu API key se guarda sólo en este navegador (localStorage). No se envía a ningún servidor propio.
      </p>
    </div>
  );
}

/* ─── Loading screen ─── */
function LoadingScreen() {
  return (
    <div className="max-w-md mx-auto text-center animate-fade-up">
      <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-8 relative">
        <span className="text-3xl">✦</span>
        <span className="absolute inset-0 rounded-full border border-gold/20 animate-ping" />
      </div>
      <p className="eyebrow mb-4">ANALIZANDO TU CABELLO</p>
      <h2 className="font-display text-3xl text-cream mb-6 leading-snug">
        La IA está creando<br />
        <span className="italic text-gold">tu fórmula única</span>
      </h2>
      <p className="text-cream/50 text-sm mb-8">
        Gemini está procesando tus respuestas <LoadingDots />
      </p>
      <div className="space-y-2 text-left max-w-xs mx-auto">
        {[
          "Evaluando tipo y estado de tu cabello",
          "Seleccionando boosters ideales",
          "Calculando dosis perfecta",
          "Generando tu frase personalizada",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-xs text-cream/40">
            <span
              className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ─── */
const Diagnostico = () => {
  const questions = quiz.questions;
  const total = questions.length;

  const [appState, setAppState] = useState<AppState>(() =>
    resolveApiKey() ? "intro" : "apikey"
  );
  const [apiKey, setApiKey] = useState<string>(resolveApiKey);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const current = questions[step];

  const select = (value: string) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < total - 1) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      finalize(next);
    }
  };

  const finalize = async (final: Answers) => {
    // Persist answers
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      all.push({ submittedAt: new Date().toISOString(), answers: final });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all, null, 2));
    } catch { /* ignore */ }

    setAppState("loading");
    setAiError(null);

    try {
      const rec = await getGeminiRecommendation(final, apiKey);
      setRecommendation(rec);
      setAppState("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setAiError(msg);
      // Fallback to local recommendation
      setRecommendation(buildRecommendation(final));
      setAppState("result");
    }
  };

  const downloadJSON = () => {
    const payload = {
      brand: data.brand.name,
      submittedAt: new Date().toISOString(),
      answers,
      recommendation,
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
    setRecommendation(null);
    setAiError(null);
    setAppState("intro");
  };

  const changeApiKey = () => {
    setAppState("apikey");
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
          <div className="flex items-center gap-5">
            {appState !== "apikey" && (
              <button
                onClick={changeApiKey}
                className="text-[10px] tracking-[0.2em] text-cream/40 hover:text-gold transition-colors"
                title="Cambiar API key"
              >
                ⚙ API KEY
              </button>
            )}
            <Link to="/" className="text-[11px] tracking-[0.2em] text-cream/70 hover:text-gold transition-colors">
              ← VOLVER
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 flex items-center">
        <div className="container-luxe w-full py-16">

          {/* API KEY SCREEN */}
          {appState === "apikey" && (
            <ApiKeyScreen
              onSubmit={(key) => {
                setApiKey(key);
                setAppState("intro");
              }}
            />
          )}

          {/* INTRO */}
          {appState === "intro" && (
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
                <span className="w-1 h-1 rounded-full bg-gold/60" />
                <span className="text-gold">✦ IA Gemini</span>
              </div>
              <button
                onClick={() => setAppState("quiz")}
                className="bg-gold text-background px-8 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
              >
                {quiz.intro.cta}
              </button>
            </div>
          )}

          {/* QUIZ */}
          {appState === "quiz" && (
            <div className="max-w-3xl mx-auto">
              {/* Progress */}
              <div className="mb-12">
                <div className="flex justify-between text-[10px] tracking-[0.2em] text-cream/60 mb-3">
                  <span>PREGUNTA {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
                  <span className="text-gold">{Math.round((step / total) * 100)}%</span>
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

          {/* LOADING */}
          {appState === "loading" && <LoadingScreen />}

          {/* RESULT */}
          {appState === "result" && recommendation && (
            <div className="max-w-5xl mx-auto animate-fade-up">
              {/* AI error banner */}
              {aiError && (
                <div className="mb-8 border border-amber-500/40 bg-amber-500/10 p-4 flex gap-3 items-start">
                  <span className="text-amber-400 text-lg shrink-0">⚠</span>
                  <div>
                    <p className="text-amber-300 text-xs font-semibold tracking-[0.1em] mb-1">MODO OFFLINE — RECOMENDACIÓN LOCAL</p>
                    <p className="text-amber-200/70 text-xs leading-relaxed">
                      No se pudo conectar con Gemini: <span className="font-mono">{aiError}</span>
                      <br />Se usó la lógica local como alternativa. Verifica tu API key.
                    </p>
                    <button
                      onClick={changeApiKey}
                      className="mt-2 text-[10px] tracking-[0.2em] text-amber-400 hover:text-amber-200 transition-colors underline underline-offset-2"
                    >
                      CAMBIAR API KEY
                    </button>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-14">
                <p className="eyebrow">TU FÓRMULA {aiError ? "LOCAL" : "IA"} ✦</p>
                <h1 className="font-display text-4xl md:text-6xl text-cream mb-6 leading-tight">
                  Tu ritual <span className="italic text-gold">personalizado</span>
                </h1>
                <p className="text-cream/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                  {recommendation.summary}
                </p>
              </div>

              {/* AI Phrase */}
              <div className="relative bg-gradient-to-br from-dark-2 to-dark-3 border border-gold/30 p-8 md:p-10 mb-12 overflow-hidden">
                <div className="absolute top-4 left-6 text-gold/20 font-display text-7xl leading-none select-none">"</div>
                <div className="relative pl-8">
                  <p className="text-[10px] tracking-[0.3em] text-gold mb-4">
                    {aiError ? "RECOMENDACIÓN LOCAL" : "RECOMENDACIÓN IA — GEMINI"}
                  </p>
                  <p className="font-display text-xl md:text-2xl text-cream italic leading-relaxed">
                    {recommendation.phrase}
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
                    <span className="font-display text-5xl text-gold">{recommendation.pumps}</span>
                    <span className="text-cream/70 text-sm tracking-[0.15em] uppercase">
                      pump{(recommendation.pumps ?? 1) > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-cream/60 text-xs leading-relaxed mt-auto">
                    Dispensa en la palma de tu mano como base hidratante de tu mezcla.
                  </p>
                </article>

                {/* Boosters cards */}
                {recommendation.boosters.map((b, idx) => (
                  <article key={b.id} className="bg-dark-2 border border-border/60 p-6 flex flex-col">
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
                {recommendation.boosters.length === 1 && (
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

              {/* Dose summary chip */}
              <div className="flex justify-center mb-10">
                <div className="border border-gold/30 bg-gold/5 px-6 py-3 text-center">
                  <p className="text-[10px] tracking-[0.3em] text-gold mb-1">DOSIS TOTAL</p>
                  <p className="font-display text-lg text-cream">
                    {recommendation.pumps} pump{recommendation.pumps > 1 ? "s" : ""} + {" "}
                    {recommendation.boosters.reduce((acc, b) => acc + b.drops, 0)} gotas ={" "}
                    <span className="text-gold">
                      {recommendation.pumps + recommendation.boosters.reduce((acc, b) => acc + b.drops, 0)} unidades
                    </span>
                  </p>
                </div>
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
