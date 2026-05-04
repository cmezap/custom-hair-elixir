import type { Recommendation } from "./recommendation";

type Answers = Record<string, string>;

export const ENV_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY ?? "";

/** Labels for each question ID, used to build the readable summary sent to Gemini */
const QUESTION_LABELS: Record<string, string> = {
  tipo: "Tipo de cabello",
  grosor: "Grosor del cabello",
  densidad: "Densidad del cabello",
  dano: "Nivel de daño",
  frizz: "Nivel de frizz",
  calor: "Frecuencia de uso de calor",
  clima: "Clima del día",
  estadoHoy: "Estado del cabello hoy",
  objetivo: "Objetivo del día",
  brillo: "Necesita más brillo",
  manejabilidad: "Dificultad para manejar",
  quimicos: "Tratamientos químicos",
  tiempo: "Tiempo disponible",
  sensacion: "Sensación deseada",
  longitud: "Longitud del cabello",
};

const BOOSTERS_CONTEXT = `
BOOSTERS DISPONIBLES (SOLO estos 4 están formulados — NO recomendar Booster 5 ni Booster 6):
- Booster 1 — Alisado & Suavidad: aceite de pepita de uva 60%, proteína de suero de leche hidrolizada 39%, Vitamina E 1%. Función: rellena microfisuras de la cutícula, aplana la superficie de la fibra capilar.
- Booster 2 — Volumen & Ligereza: aceite de jojoba 79%, aceite de pepita de uva 20%, Vitamina E 1%. Función: hidrata sin pesar, aporta cuerpo y ligereza.
- Booster 3 — Protección térmica: aceite de argán 50%, aceite de aguacate 49%, Vitamina E 1%. Función: barrera antioxidante y protectora antes del uso de plancha o secador.
- Booster 4 — Nutrición profunda: aceite de aguacate 45%, aceite de argán 35%, aceite de arroz 19%, Vitamina E 1%. Función: nutrición lipídica profunda, ácido oleico y antioxidantes.

REGLAS ESTRICTAS DE DOSIFICACIÓN (dosis total = pumps + gotas_totales ≤ 10, mínimo 4):
- pumps: entre 2 y 5 (crema base hidratante, dosificador pump).
- gotas por booster: entre 2 y 6.
- Si recomiendas 2 boosters, la suma de pumps + gotas_booster1 + gotas_booster2 NO debe superar 10.
- Si recomiendas 1 booster, la suma de pumps + gotas_booster1 NO debe superar 10.
- El total (pumps + todas las gotas) debe estar entre 4 y 10.
`;

function buildPrompt(answers: Answers): string {
  const answerLines = Object.entries(answers)
    .map(([id, value]) => `- ${QUESTION_LABELS[id] ?? id}: ${value}`)
    .join("\n");

  return `Eres un experto en cosmética capilar luxury de la marca LUMIÈRE Hair System. 
Tu tarea es analizar el diagnóstico capilar de un usuario y generar una recomendación precisa de uso.

${BOOSTERS_CONTEXT}

RESPUESTAS DEL DIAGNÓSTICO DEL USUARIO:
${answerLines}

INSTRUCCIONES:
1. Analiza las respuestas y determina cuántos pumps de crema base recomiendas (2-5).
2. Selecciona 1 o 2 boosters de los disponibles (solo boosters 1, 2, 3 o 4).
3. Indica cuántas gotas de cada booster recomiendas.
4. Verifica que pumps + gotas_totales esté entre 4 y 10 inclusive.
5. Escribe una frase personalizada y elegante (máx 2 oraciones) en español, en tono luxury, dirigida al usuario con "tú".
6. Escribe una razón breve (máx 15 palabras) del por qué de cada booster elegido.

RESPONDE ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto extra, sin markdown, sin explicaciones:
{
  "pumps": <número entero>,
  "boosters": [
    {
      "id": <número entero 1-4>,
      "name": "<nombre del booster>",
      "drops": <número entero>,
      "reason": "<razón breve de máx 15 palabras>"
    }
  ],
  "phrase": "<frase personalizada en tono luxury, máx 2 oraciones>",
  "summary": "<resumen de la dosis: X pumps + Y gotas de Booster Z>"
}`;
}

export async function getGeminiRecommendation(
  answers: Answers,
  apiKey: string
): Promise<Recommendation> {
  const prompt = buildPrompt(answers);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } })?.error?.message ?? response.statusText;
    throw new Error(`Error del servicio de IA: ${msg}`);
  }

  const data = await response.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown code fences if Gemini adds them despite responseMimeType
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: Recommendation;
  try {
    parsed = JSON.parse(cleaned) as Recommendation;
  } catch {
    throw new Error("La IA devolvió una respuesta inesperada. Intenta de nuevo.");
  }

  // Validate & clamp just in case the model hallucinated
  parsed.pumps = Math.max(2, Math.min(5, Number(parsed.pumps) || 3));
  if (!Array.isArray(parsed.boosters) || parsed.boosters.length === 0) {
    throw new Error("La IA no devolvió boosters válidos.");
  }
  parsed.boosters = parsed.boosters.slice(0, 2).map((b) => ({
    ...b,
    id: Number(b.id),
    drops: Math.max(2, Math.min(6, Number(b.drops) || 3)),
  }));

  return parsed;
}
