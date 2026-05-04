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
  Waves,
  ShieldAlert,
  ShieldCheck,
  Wind,
  Thermometer,
  CloudSun,
  Target,
  Lightbulb,
  Lock,
  Pipette,
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

  // Diagnóstico — perfil de hoy
  Cabello: Waves,
  "Daño": ShieldAlert,
  Frizz: Wind,
  "Exposición al calor": Thermometer,
  Clima: CloudSun,
  Objetivo: Target,

  // Recomendación IA — fila de virtudes
  "Nutre en profundidad": Droplet,
  "Protege del calor": ShieldCheck,
  "Controla el frizz y aporta suavidad": Sparkles,

  // Otros
  Tips: Lightbulb,
  Lock,
  Pipette,
};

export { type LucideIcon };