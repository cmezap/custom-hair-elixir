import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import quiz from "@/data/quiz-questions.json";
import data from "@/data/site.json";
import { buildRecommendation, type Recommendation } from "@/lib/recommendation";
import { getGeminiRecommendation, ENV_API_KEYS } from "@/lib/gemini";
import cremaImg from "@/assets/crema-pump.png";
import heroImg from "@/assets/hero-luxe.jpg";
import booster1 from "@/assets/Booster1.png";
import booster2 from "@/assets/Booster2.png";
import booster3 from "@/assets/Booster3.png";
import booster4 from "@/assets/Booster4.png";
import booster5 from "@/assets/Booster5.png";
import booster6 from "@/assets/Booster6.png";

import {
  Waves,
  ShieldAlert,
  Wind,
  Thermometer,
  CloudSun,
  Target,
  Droplet,
  Lock,
  Lightbulb,
  Pipette,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const boosterImages: Record<number, string> = {
  1: booster1,
  2: booster2,
  3: booster3,
  4: booster4,
  5: booster5,
  6: booster6,
};

const ALL_BOOSTERS = [
  { id: 1, name: "Alisado & Suavidad", short: "ALISADO &", short2: "SUAVIDAD" },
  { id: 2, name: "Volumen & Ligereza", short: "VOLUMEN &", short2: "LIGEREZA" },
  { id: 3, name: "Protección térmica", short: "PROTECCIÓN", short2: "TÉRMICA" },
  { id: 4, name: "Nutrición profunda", short: "NUTRICIÓN", short2: "PROFUNDA" },
  { id: 5, name: "Anti-frizz & Sellado", short: "ANTI-FRIZZ", short2: "& SELLADO" },
  { id: 6, name: "Definición de rizos", short: "DEFINICIÓN", short2: "DE RIZOS" },
];

const BOOSTER_VIRTUE: Record<number, { label: string; Icon: typeof Droplet }> = {
  1: { label: "Aporta suavidad y control", Icon: Sparkles },
  2: { label: "Aporta volumen y ligereza", Icon: Wind },
  3: { label: "Protege del calor", Icon: ShieldCheck },
  4: { label: "Nutre en profundidad", Icon: Droplet },
  5: { label: "Controla el frizz", Icon: ShieldCheck },
  6: { label: "Define los rizos", Icon: Sparkles },
};

type Answers = Record<string, string>;
type AppState = "apikey" | "intro" | "quiz" | "loading" | "result";

const STORAGE_KEY = "lumiere-diagnostico-respuestas";
const APIKEY_STORAGE = "lumiere-ia-api-key";

function resolveApiKeys(): string[] {
  // Prioridad 1: Variables de entorno (VITE_GEMINI_API_KEYS o VITE_GEMINI_API_KEY)
  if (ENV_API_KEYS.length > 0) return ENV_API_KEYS;

  // Prioridad 2: LocalStorage (para llaves manuales ingresadas por el usuario)
  const stored = localStorage.getItem(APIKEY_STORAGE);
  return stored ? [stored] : [];
}

/* ─── Loading dots ─── */
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

/* ─── API Key screen (genérico, sin mencionar proveedor) ─── */
function ApiKeyScreen({ onSubmit }: { onSubmit: (key: string) => void }) {
  const [value, setValue] = useState(
    () => localStorage.getItem(APIKEY_STORAGE) ?? ""
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Ingresa una clave válida.");
      return;
    }
    localStorage.setItem(APIKEY_STORAGE, trimmed);
    onSubmit(trimmed);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-up text-center">
      <p className="eyebrow">CONFIGURACIÓN ✦</p>
      <h1 className="font-display text-4xl md:text-5xl text-cream mb-4 leading-tight">
        Conecta tu motor de análisis
      </h1>
      <p className="text-cream/60 text-sm leading-relaxed mb-8">
        Introduce la clave de acceso al servicio de análisis para generar tu
        recomendación capilar personalizada.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          placeholder="Clave de acceso"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-dark-2 border border-border/60 text-cream text-sm px-5 py-4 placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors"
        />
        {error && <p className="text-red-400 text-xs text-left">{error}</p>}
        <button
          type="submit"
          className="bg-gold text-background px-8 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
        >
          GUARDAR Y CONTINUAR →
        </button>
      </form>

      <p className="text-cream/30 text-[10px] mt-6 leading-relaxed">
        Tu clave se guarda sólo en este navegador (localStorage).
      </p>
    </div>
  );
}

/* ─── Loading screen ─── */
function LoadingScreen() {
  return (
    <div className="max-w-md mx-auto text-center animate-fade-up">
      <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-8 relative">
        <span className="text-3xl text-gold">✦</span>
        <span className="absolute inset-0 rounded-full border border-gold/20 animate-ping" />
      </div>
      <p className="eyebrow mb-4">ANALIZANDO TU CABELLO</p>
      <h2 className="font-display text-3xl text-cream mb-6 leading-snug">
        Estamos creando<br />
        <span className="italic text-gold">tu fórmula única</span>
      </h2>
      <p className="text-cream/50 text-sm mb-8">
        Procesando tus respuestas <LoadingDots />
      </p>
      <div className="space-y-2 text-left max-w-xs mx-auto">
        {[
          "Evaluando tipo y estado de tu cabello",
          "Seleccionando boosters ideales",
          "Calculando dosis perfecta",
          "Generando tu recomendación",
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

/* ─── Profile bar ─── */
const PROFILE_FIELDS = [
  { key: "tipo", label: "Cabello", Icon: Waves },
  { key: "dano", label: "Daño", Icon: ShieldAlert },
  { key: "frizz", label: "Frizz", Icon: Wind },
  { key: "calor", label: "Exposición al calor", Icon: Thermometer },
  { key: "clima", label: "Clima", Icon: CloudSun },
  { key: "objetivo", label: "Objetivo", Icon: Target },
];

/* ─── Main component ─── */
const Diagnostico = () => {
  const questions = quiz.questions;
  const total = questions.length;

  const [appState, setAppState] = useState<AppState>(() =>
    resolveApiKeys().length > 0 ? "intro" : "apikey"
  );
  const [apiKeys, setApiKeys] = useState<string[]>(resolveApiKeys);
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
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      all.push({ submittedAt: new Date().toISOString(), answers: final });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all, null, 2));
    } catch { /* ignore */ }

    setAppState("loading");
    setAiError(null);

    try {
      const rec = await getGeminiRecommendation(final, apiKeys);
      setRecommendation(rec);
      setAppState("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setAiError(msg);
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

  const changeApiKey = () => setAppState("apikey");

  const totalDrops = useMemo(
    () => recommendation?.boosters.reduce((acc, b) => acc + b.drops, 0) ?? 0,
    [recommendation]
  );
  const totalMezcla = (recommendation?.pumps ?? 0) * 3 + totalDrops; // approx grams

  const pickedIds = useMemo(
    () => new Set(recommendation?.boosters.map((b) => b.id) ?? []),
    [recommendation]
  );

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
                title="Cambiar clave"
              >
                ⚙ CLAVE
              </button>
            )}
            <Link to="/" className="text-[11px] tracking-[0.2em] text-cream/70 hover:text-gold transition-colors">
              ← VOLVER
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className={`flex-1 ${appState === "result" ? "" : "flex items-center"}`}>
        {appState !== "result" && (
          <div className="container-luxe w-full py-16">
            {appState === "apikey" && (
              <ApiKeyScreen
                onSubmit={(key) => {
                  setApiKeys([key, ...apiKeys]);
                  setAppState("intro");
                }}
              />
            )}

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
                  <span className="text-gold">✦ Análisis IA</span>
                </div>
                <button
                  onClick={() => setAppState("quiz")}
                  className="bg-gold text-background px-8 py-4 text-[11px] tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
                >
                  {quiz.intro.cta}
                </button>
              </div>
            )}

            {appState === "quiz" && (
              <div className="max-w-3xl mx-auto">
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

            {appState === "loading" && <LoadingScreen />}
          </div>
        )}

        {/* RESULT */}
        {appState === "result" && recommendation && (
          <div className="w-full animate-fade-up">
            {/* ─── HERO DARK ─── */}
            <div className="bg-dark relative overflow-hidden">
              <div className="container-luxe pt-10 pb-14">
                {/* Stepper */}
                <div className="flex items-center justify-center gap-6 md:gap-10 mb-12">
                  {[
                    { n: 1, l: "DIAGNÓSTICO" },
                    { n: 2, l: "ANÁLISIS IA" },
                    { n: 3, l: "RESULTADO" },
                  ].map((s, i, arr) => {
                    const active = s.n === 3;
                    return (
                      <div key={s.n} className="flex items-center gap-3 md:gap-6">
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] ${
                              active
                                ? "border-gold bg-gold/10 text-gold"
                                : "border-cream/20 text-cream/40"
                            }`}
                          >
                            {s.n}
                          </span>
                          <span
                            className={`text-[9px] tracking-[0.25em] ${
                              active ? "text-gold" : "text-cream/40"
                            }`}
                          >
                            {s.l}
                          </span>
                        </div>
                        {i < arr.length - 1 && (
                          <span className="hidden md:block w-12 h-px bg-cream/15" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
                  <div>
                    <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05] mb-6">
                      Tu combinación<br />
                      <span className="italic text-gold">personalizada</span>
                    </h1>
                    <p className="text-cream/60 text-sm md:text-base leading-relaxed max-w-md">
                      Recomendada por <span className={aiError ? "text-gold" : ""}>nuestro sistema de IA</span><br />
                      para tu cabello hoy.
                    </p>
                  </div>
                  <div className="hidden lg:block relative">
                    <img
                      src={heroImg}
                      alt="LUMIÈRE — combinación personalizada"
                      className="w-full h-[320px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Profile bar */}
                <div className="mt-12 border border-gold/30 bg-dark-2/60 px-6 py-5">
                  <p className="text-[10px] tracking-[0.3em] text-gold mb-4">TU PERFIL DE HOY</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {PROFILE_FIELDS.map((f) => {
                      const Icon = f.Icon;
                      return (
                        <div key={f.key} className="flex items-center gap-3">
                          <span className="w-9 h-9 shrink-0 rounded-full border border-gold/40 flex items-center justify-center text-gold">
                            <Icon className="w-4 h-4" strokeWidth={1.5} />
                          </span>
                          <div className="leading-tight">
                            <p className="text-[10px] tracking-[0.15em] text-cream/50 uppercase">{f.label}</p>
                            <p className="text-xs text-cream font-medium">{answers[f.key] || "—"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* ─── MEZCLA — CREAM ─── */}
            <div className="bg-cream text-background">
              <div className="container-luxe py-16">
                <div className="flex items-center justify-center gap-4 mb-12">
                  <span className="h-px w-10 bg-background/30" />
                  <h2 className="text-[11px] tracking-[0.35em] text-background font-semibold">
                    TU MEZCLA RECOMENDADA
                  </h2>
                  <span className="h-px w-10 bg-background/30" />
                </div>

                <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
                  {/* Crema base card */}
                  <div className="bg-cream-2 p-6 flex flex-col">
                    <div className="text-center mb-4">
                      <span className="inline-block text-[10px] tracking-[0.3em] text-background/70 border border-background/20 px-3 py-1">
                        CREMA BASE
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center flex-1">
                      <div className="aspect-[3/4] bg-cream overflow-hidden">
                        <img
                          src={cremaImg}
                          alt="Crema base LUMIÈRE"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] tracking-[0.25em] text-background/60 mb-1">DOSIFICACIÓN</p>
                        <p className="font-display text-7xl text-background leading-none mb-1">
                          {recommendation.pumps}
                        </p>
                        <p className="text-[10px] tracking-[0.3em] text-background/60 mb-4">PUMPS</p>
                        <div className="h-px bg-background/15 my-3" />
                        <p className="text-xs text-background/70">
                          ≈ {recommendation.pumps * 3} g
                        </p>
                        <p className="text-[10px] text-background/50 mt-1">de crema base</p>
                      </div>
                    </div>
                  </div>

                  {/* Boosters card */}
                  <div className="bg-cream-2 p-6">
                    <div className="text-center mb-6">
                      <span className="inline-block bg-background text-cream text-[10px] tracking-[0.3em] px-5 py-2 rounded-full">
                        BOOSTERS RECOMENDADOS
                      </span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {ALL_BOOSTERS.map((b) => {
                        const picked = recommendation.boosters.find((p) => p.id === b.id);
                        const drops = picked?.drops ?? 0;
                        const isPicked = !!picked;
                        return (
                          <div
                            key={b.id}
                            className={`relative p-3 flex flex-col items-center text-center border ${
                              isPicked
                                ? "border-gold bg-cream"
                                : "border-background/10 bg-cream/40 opacity-60"
                            }`}
                          >
                            <span
                              className={`absolute -top-3 w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                                isPicked
                                  ? "bg-gold text-background"
                                  : "bg-cream-3 text-background/40"
                              }`}
                            >
                              {b.id}
                            </span>
                            <div className="aspect-[3/4] w-full mt-3 mb-3 overflow-hidden flex items-center justify-center relative">
                              <img
                                src={boosterImages[b.id]}
                                alt={b.name}
                                className={`w-full h-full object-contain ${
                                  isPicked ? "" : "grayscale opacity-50"
                                }`}
                              />
                              {!isPicked && (
                                <Lock
                                  className="absolute inset-0 m-auto w-5 h-5 text-background/40"
                                  strokeWidth={1.5}
                                />
                              )}
                            </div>
                            <p className={`text-[9px] tracking-[0.15em] leading-tight font-semibold ${
                              isPicked ? "text-background" : "text-background/40"
                            }`}>
                              {b.short}<br />{b.short2}
                            </p>
                            <div className="mt-3 flex items-center justify-center gap-0.5 min-h-[14px]">
                              {Array.from({ length: Math.min(drops, 6) }).map((_, i) => (
                                <Droplet
                                  key={i}
                                  className="w-2.5 h-2.5 fill-gold text-gold"
                                  strokeWidth={1.5}
                                />
                              ))}
                            </div>
                            <p className={`font-display text-3xl leading-none mt-1 ${
                              isPicked ? "text-background" : "text-background/30"
                            }`}>
                              {drops}
                            </p>
                            <p className="text-[9px] tracking-[0.25em] text-background/50 mt-1">GOTAS</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 grid grid-cols-2 bg-cream border border-background/10">
                      <div className="flex items-center gap-4 p-5 border-r border-background/10">
                        <span className="w-10 h-10 bg-background text-cream flex items-center justify-center">
                          <Droplet className="w-4 h-4 fill-cream" strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="text-[9px] tracking-[0.25em] text-background/50">TOTAL DE BOOSTERS</p>
                          <p className="font-display text-2xl text-background">{totalDrops} GOTAS</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-5">
                        <span className="w-10 h-10 bg-background text-cream flex items-center justify-center">
                          <Pipette className="w-4 h-4" strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="text-[9px] tracking-[0.25em] text-background/50">TOTAL DE MEZCLA</p>
                          <p className="font-display text-2xl text-background">{totalMezcla} g</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RECOMENDACIÓN IA ─── */}
            <div className="bg-dark text-cream">
              <div className="container-luxe py-14">
                <div className="grid lg:grid-cols-[1fr_2fr_1fr] gap-8 items-center">
                  <div className="text-center">
                    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full border border-gold/40" />
                      <span className="absolute inset-2 rounded-full border border-gold/20" />
                      <div className="text-center">
                        <p className="text-[10px] tracking-[0.3em] text-gold">RECOMENDACIÓN</p>
                        <p className="font-display italic text-4xl text-cream">IA</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-xl md:text-2xl text-cream/90 italic leading-relaxed">
                      {recommendation.phrase}
                    </p>
                    <div className="flex flex-wrap gap-6 mt-6">
                      {recommendation.boosters.map((b) => {
                        const v = BOOSTER_VIRTUE[b.id];
                        if (!v) return null;
                        const Icon = v.Icon;
                        return (
                          <div key={b.id} className="flex items-center gap-3 text-cream/70">
                            <span className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold">
                              <Icon className="w-4 h-4" strokeWidth={1.5} />
                            </span>
                            <span className="text-xs">{v.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={heroImg}
                        alt="Cabello"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── TIPS ─── */}
            <div className="bg-cream text-background">
              <div className="container-luxe py-6">
                <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-6 items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full border border-background/30 flex items-center justify-center text-background">
                      <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-[10px] tracking-[0.25em] text-background font-semibold">
                        TIPS PARA MEJORES RESULTADOS
                      </p>
                      <p className="text-[11px] text-background/60 mt-1">
                        Ajusta las gotas según la longitud y densidad de tu cabello.
                      </p>
                    </div>
                  </div>
                  {[
                    { drops: 2, label: "1-2 GOTAS", sub: "Cabello corto" },
                    { drops: 3, label: "3-5 GOTAS", sub: "Cabello medio" },
                    { drops: 4, label: "6-10 GOTAS", sub: "Cabello largo" },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.drops }).map((_, i) => (
                          <Droplet key={i} className="w-3 h-3 fill-gold text-gold" strokeWidth={1.5} />
                        ))}
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.2em] text-background font-semibold">{t.label}</p>
                        <p className="text-[10px] text-background/60">{t.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-dark py-10">
              <div className="container-luxe flex flex-wrap justify-center gap-4">
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
          </div>
        )}
      </section>

      <footer className="border-t border-border/40 py-6 text-center text-[10px] tracking-[0.2em] text-cream/40">
        {data.footer.legal}
      </footer>
    </main>
  );
};

export default Diagnostico;
