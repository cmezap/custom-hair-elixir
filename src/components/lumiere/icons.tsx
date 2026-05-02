import {
  SlidersHorizontal,
  Leaf,
  FlaskConical,
  Sparkles,
  Droplet,
  Dumbbell,
  BatteryCharging,
  SprayCan,
  Hand,
  Microscope,
  FlaskRound,
  Ban,
  Rabbit,
  type LucideIcon,
} from "lucide-react";

export const lumiereIcons: Record<string, LucideIcon> = {
  // Hero badges
  Personalizable: SlidersHorizontal,
  "Ingredientes premium": Leaf,
  "Ciencia + Naturaleza": FlaskConical,
  "Resultados visibles": Sparkles,

  // Crema base benefits
  "Hidratación profunda": Droplet,
  "Mejora la manejabilidad": Sparkles,
  "Fortalece la fibra capilar": Dumbbell,
  "Prepara y potencia los boosters": BatteryCharging,

  // Ritual pasos
  "Aplica tu crema base": SprayCan,
  "Agrega tu booster": Droplet,
  "Mezcla y aplica": Hand,

  // Diagnóstico features
  "Análisis capilar avanzado": Microscope,
  "Recomendación personalizada": Sparkles,

  // Trust bar
  "Ingredientes premium y sostenibles": Leaf,
  "Desarrollado con ciencia": FlaskRound,
  "Libre de parabenos, sulfitos y siliconas": Ban,
  "Cruelty free & vegano": Rabbit,
};

export { type LucideIcon };