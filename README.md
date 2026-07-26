# LUMIÈRE Hair System

> **Ciencia, naturaleza e inteligencia para un cabello extraordinario.**

🌐 **Demo en vivo:** [https://lumiere-one-livid.vercel.app](https://lumiere-one-livid.vercel.app)

---

## ¿Qué es LUMIÈRE Hair System?

**LUMIÈRE Hair System** es una landing page de producto para una marca de cuidado capilar premium. La propuesta de valor gira en torno a un **sistema capilar modular y personalizable**: el usuario combina una *crema base hidratante* con *boosters oleosos 100% puros* para adaptar su rutina capilar a sus necesidades de cada día.

La página incluye un **diagnóstico con Inteligencia Artificial** (Google Gemini) que analiza el tipo de cabello, el clima y el objetivo del día para recomendar la combinación ideal de crema base y boosters, indicando también la cantidad exacta de gotas a utilizar.

---

## ✨ Características principales

| Sección | Descripción |
|---|---|
| **Hero** | Presentación visual de la marca con imagen de fondo, headline animado y llamadas a la acción |
| **Crema Base** | Detalle del producto base: beneficios, ingredientes y formulación |
| **Boosters** | Catálogo de 6 boosters oleosos con ingredientes, porcentajes y descripción de cada uno |
| **Ritual de uso** | Guía paso a paso de cómo combinar la crema base con los boosters |
| **Diagnóstico IA** | Quiz de 15 preguntas + recomendación personalizada potenciada por Google Gemini |
| **Footer** | Navegación, suscripción a newsletter y redes sociales |

---

## 🧴 Los 6 Boosters Oleosos

El catálogo de boosters está pensado para responder a diferentes necesidades capilares:

1. **Alisado & Suavidad** — Aceite de pepita de uva + Proteína de suero hidrolizada + Vitamina E
2. **Volumen & Ligereza** — Aceite de jojoba + Aceite de pepita de uva + Vitamina E
3. **Protección Térmica** — Aceite de argán + Aceite de aguacate + Vitamina E
4. **Nutrición Profunda** — Aceite de aguacate + Aceite de argán + Aceite de arroz + Vitamina E
5. **Anti-frizz & Sellado** — Aceite de jojoba + Aceite de argán + Vitamina E
6. **Definición de Rizos** — Aceite de coco fraccionado + Aceite de almendras + Vitamina E

---

## 🤖 Diagnóstico IA (Google Gemini)

La ruta `/diagnostico` guía al usuario a través de **15 preguntas** sobre:

- Tipo, grosor y densidad del cabello
- Nivel de daño, frizz y uso de calor
- Clima actual y estado del cabello ese día
- Objetivo del día (suavidad, volumen, definición, etc.)
- Longitud y tiempo disponible para el ritual

Al finalizar, el sistema genera una recomendación con:
- **Número de pumps** de crema base
- **Booster(s) recomendados** con cantidad exacta de gotas
- **Explicación personalizada** generada por Gemini AI

> Si no se configura una API key de Gemini, el sistema utiliza un motor de recomendación local basado en reglas para garantizar que la experiencia siempre funcione.

---

## 🛠️ Stack Tecnológico

- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build tool:** [Vite 5](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Routing:** [React Router DOM v6](https://reactrouter.com/)
- **IA:** [Google Gemini API](https://aistudio.google.com/) (`gemini-2.0-flash`)
- **Testing:** [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- **Deploy:** [Vercel](https://vercel.com/)

---

## 🚀 Instalación y uso local

### Requisitos previos

- Node.js 18+
- `npm` o `bun`

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/custom-hair-elixir.git
cd custom-hair-elixir
```

### 2. Instala las dependencias

```bash
npm install
# o con bun
bun install
```

### 3. Configura las variables de entorno

Copia el archivo de ejemplo y añade tu API key de [Google AI Studio](https://aistudio.google.com/apikey):

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_GEMINI_API_KEY=tu_api_key_aqui
# Opcional: múltiples keys separadas por coma (rotación automática)
VITE_GEMINI_API_KEYS=key1,key2,key3
```

> **Nota:** Si no configuras una API key, el diagnóstico IA funciona igualmente usando el motor de recomendación local. También puedes ingresar la key directamente en la interfaz del diagnóstico.

### 4. Ejecuta el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📁 Estructura del proyecto

```
src/
├── assets/           # Imágenes de productos y hero
├── components/
│   ├── lumiere/      # Componentes específicos de la marca
│   │   ├── Hero.tsx
│   │   ├── Nav.tsx
│   │   ├── CremaBase.tsx
│   │   ├── Boosters.tsx
│   │   ├── RitualDiagnostico.tsx
│   │   ├── Footer.tsx
│   │   └── icons.tsx
│   └── ui/           # Componentes shadcn/ui (Radix)
├── data/
│   ├── site.json     # Contenido y datos de la marca
│   └── quiz-questions.json  # Preguntas del diagnóstico IA
├── lib/
│   ├── gemini.ts     # Integración con Google Gemini API
│   ├── recommendation.ts  # Motor de recomendación local (fallback)
│   └── utils.ts
├── pages/
│   ├── Index.tsx     # Landing page principal
│   ├── Diagnostico.tsx  # Página del quiz IA
│   └── NotFound.tsx
└── App.tsx
```

---

## 🧪 Tests

```bash
npm run test
# o en modo watch
npm run test:watch
```

---

## 🌿 Valores de la marca

- ✅ Ingredientes premium y sostenibles
- ✅ Desarrollado con ciencia
- ✅ Libre de parabenos, sulfatos y siliconas
- ✅ Cruelty free & vegano

---

## 📄 Licencia

Proyecto privado. Todos los derechos reservados © 2026 Lumière Hair System.
