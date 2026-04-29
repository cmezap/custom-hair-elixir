import data from "@/data/site.json";

type Answers = Record<string, string>;

export interface BoosterDose {
  id: number;
  name: string;
  drops: number;
  reason: string;
}

export interface Recommendation {
  pumps: number;
  boosters: BoosterDose[];
  phrase: string;
  summary: string;
}

const BOOSTER_BY_OBJECTIVE: Record<string, number> = {
  "Suavidad": 1,
  "Control de frizz": 1,
  "Volumen": 2,
  "Definición de rizos": 2,
  "Protección térmica": 3,
};

export function buildRecommendation(answers: Answers): Recommendation {
  const boosters = data.boosters.items;

  // Pumps based on length + density
  const longitud = answers.longitud;
  const densidad = answers.densidad;
  let pumps = 2;
  if (longitud === "Medio") pumps = 3;
  if (longitud === "Largo") pumps = 4;
  if (densidad === "Alta densidad") pumps += 1;
  if (densidad === "Baja densidad") pumps = Math.max(1, pumps - 1);

  // Primary booster from objective
  const primaryId = BOOSTER_BY_OBJECTIVE[answers.objetivo] ?? 4;

  // Secondary booster
  let secondaryId: number | null = null;
  if (answers.calor === "Frecuente" && primaryId !== 3) secondaryId = 3;
  else if (answers.dano === "Alto" && primaryId !== 4) secondaryId = 4;
  else if (answers.frizz === "Alto" && primaryId !== 1) secondaryId = 1;
  else if (answers.estadoHoy === "Seco" && primaryId !== 4) secondaryId = 4;

  // Drops based on length, damage, frizz
  const baseDropsByLength: Record<string, number> = { "Corto": 3, "Medio": 4, "Largo": 6 };
  let primaryDrops = baseDropsByLength[longitud] ?? 4;
  if (answers.dano === "Alto") primaryDrops += 1;
  if (answers.estadoHoy === "Graso") primaryDrops = Math.max(2, primaryDrops - 1);
  primaryDrops = Math.min(primaryDrops, 8);

  const dose: BoosterDose[] = [];
  const primary = boosters.find((b) => b.id === primaryId);
  if (primary) {
    dose.push({
      id: primary.id,
      name: primary.name,
      drops: primaryDrops,
      reason: `Elegido por tu objetivo: ${answers.objetivo ?? "cuidado integral"}.`,
    });
  }
  if (secondaryId) {
    const sec = boosters.find((b) => b.id === secondaryId);
    if (sec) {
      dose.push({
        id: sec.id,
        name: sec.name,
        drops: Math.max(2, Math.round(primaryDrops / 2)),
        reason:
          secondaryId === 3
            ? "Refuerzo: usas calor con frecuencia."
            : secondaryId === 4
            ? "Refuerzo: necesitas nutrición extra."
            : "Refuerzo: control de frizz adicional.",
      });
    }
  }

  // IA phrase
  const sensacion = answers.sensacion?.toLowerCase() ?? "equilibrado";
  const tipo = answers.tipo?.toLowerCase() ?? "tu cabello";
  const phrase = `Para tu cabello ${tipo}, hemos diseñado una mezcla ${sensacion} que potencia ${
    answers.objetivo?.toLowerCase() ?? "su belleza natural"
  } sin sacrificar ligereza.`;

  const summary = `${pumps} pump${pumps > 1 ? "s" : ""} de crema base + ${dose
    .map((d) => `${d.drops} gotas de Booster ${d.id}`)
    .join(" + ")}.`;

  return { pumps, boosters: dose, phrase, summary };
}
