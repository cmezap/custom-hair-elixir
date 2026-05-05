import type { Recommendation } from "./recommendation";

type Answers = Record<string, string>;

export const ENV_API_KEYS: string[] = (import.meta.env.VITE_GEMINI_API_KEYS ?? import.meta.env.VITE_GEMINI_API_KEY ?? "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

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
BOOSTERS DISPONIBLES 
- Booster 1 — Alisado & Suavidad: aceite de pepita de uva 60%, proteína de suero de leche hidrolizada 39%, Vitamina E 1%. Función: rellena microfisuras de la cutícula, aplana la superficie de la fibra capilar.
- Booster 2 — Volumen & Ligereza: aceite de jojoba 79%, aceite de pepita de uva 20%, Vitamina E 1%. Función: hidrata sin pesar, aporta cuerpo y ligereza.
- Booster 3 — Protección térmica: aceite de argán 50%, aceite de aguacate 49%, Vitamina E 1%. Función: barrera antioxidante y protectora antes del uso de plancha o secador.
- Booster 4 — Nutrición profunda: aceite de aguacate 45%, aceite de argán 35%, aceite de arroz 19%, Vitamina E 1%. Función: nutrición lipídica profunda, ácido oleico y antioxidantes.
- Booster 5 — Anti Frizz & Sellado: aceite de jojoba 55%, aceite de argán 44%, Vitamina E 1%. Función: Sella la cutícula y bloquea la humedad ambiental para un cabello sin frizz y con brillo.
- Booster 6 — Definición de Rizos: aceite de coco fraccionado 60%, aceite de almendras 39%, Vitamina E 1%. Función: Define y mantiene la forma del rizo sin rigidez, aportando nutrición y elasticidad.

REGLAS ESTRICTAS DE DOSIFICACIÓN (dosis total = pumps ≤ 10 + gotas_totales ≤ 10, mínimo 3 pumps y mímino 4 gotas):
- pumps: entre 4 y 10 (crema base hidratante, dosificador pump).
- gotas por booster: entre 2 y 4.
- El total de gotas (Todos los boosters juntos) no debe superar 10.
- No pueden repetir boosters.
- Mínimo se deben recomendar 2 y máximo 4 boosters.
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
1. Analiza las respuestas y determina cuántos pumps de crema base recomiendas (3-10).
2. Selecciona 2 o 4 boosters de los disponibles (1 a 6).
3. Indica cuántas gotas de cada booster recomiendas.
4. Verifica que pumps + gotas_totales esté entre 7 y 20.
5. Escribe una frase personalizada y elegante (máx 3 oraciones) en español, en tono luxury, dirigida al usuario con "tú", siempre mencionando los beneficios que obtendrá y justificando la elección de los boosters.
6. No uses palabras rebuscadas o técnico como melena o hebras, usa cabello y lenguaje un poco más natural y juvenil.
7. Recomienda los PUMPs en base a la longitud y densidad del cabello.
8. Se consistente en las respuestas si el usuario escoge "Frizz alto" o "Muy dañado" siempre incluye el booster 5 en la recomendación.

RESPONDE ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto extra, sin markdown, sin explicaciones:
{
  "pumps": <número entero>,
  "boosters": [
    {
      "id": <número entero 1-6>,
      "name": "<nombre del booster>",
      "drops": <número entero>
    }
  ],
  "phrase": "<frase personalizada en tono luxury, máx 3 oraciones>",
  "summary": "<resumen de la dosis: X pumps + Y gotas de Booster Z>"
}`;
}

const MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview"
];

export async function getGeminiRecommendation(
  answers: Answers,
  apiKeys: string | string[]
): Promise<Recommendation> {
  const keys = Array.isArray(apiKeys) ? apiKeys : [apiKeys];
  let lastError: Error | null = null;

  for (const key of keys) {
    if (!key) continue;

    for (const model of MODELS) {
      try {
        return await executeGeminiRequest(answers, key, model);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Error con API Key (${key.substring(0, 8)}) y modelo (${model}): ${errorMsg}`);
        lastError = err instanceof Error ? err : new Error(String(err));

        // Si el error es de "alta demanda" o "no encontrado", intentamos el siguiente modelo
        if (errorMsg.includes("high demand") || errorMsg.includes("not found") || errorMsg.includes("404")) {
          continue;
        }
        // Si es un error de API Key (401/403), saltamos directamente a la siguiente clave
        if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("401") || errorMsg.includes("403")) {
          break;
        }
      }
    }
  }

  throw lastError || new Error("No se pudo obtener recomendación con ninguna combinación de claves y modelos.");
}

async function executeGeminiRequest(
  answers: Answers,
  apiKey: string,
  modelName: string
): Promise<Recommendation> {
  const prompt = buildPrompt(answers);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  console.log(`Llamando a modelo ${modelName} con clave ${apiKey.substring(0, 8)}...`);

  try {
    const response = await fetch(
      url,
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
      console.error("Error detallado de Gemini API:", JSON.stringify(err, null, 2));
      const msg = (err as { error?: { message?: string } })?.error?.message ?? response.statusText;
      throw new Error(`Error del servicio de IA: ${msg}`);
    }

    const data = await response.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      console.error("Respuesta vacía de Gemini:", data);
      throw new Error("La IA no generó contenido.");
    }

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
  } catch (err) {
    console.error("Error en executeGeminiRequest:", err);
    throw err;
  }
}
