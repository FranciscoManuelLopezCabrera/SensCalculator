# Calculadora de eDPI y sensibilidad — Plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usa `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para implementar este plan tarea a tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para seguimiento.

**Goal:** Web estática que permite elegir un juego de PC y calcular en ambas direcciones — sensibilidad → eDPI y eDPI → sensibilidad — mostrando además cm/360, el valor realmente introducible en el juego y la conversión equivalente a otros juegos.

**Architecture:** Núcleo matemático puro en TypeScript dentro de `lib/`, sin ninguna dependencia de Vue ni de Nuxt, con cobertura de tests unitarios completa a partir de los vectores de prueba de la especificación. Encima, una capa de presentación Nuxt 4 (Vue 3) que solo lee el núcleo y gestiona estado de UI. El sitio se genera como estático (`nuxt generate`) con páginas prerenderizadas por juego y por par de juegos, porque este tipo de herramienta vive del tráfico de búsqueda.

**Tech Stack:** Nuxt 4, Vue 3.5, TypeScript (strict), Pinia, Tailwind CSS v4, Vitest 3, @vue/test-utils 2, happy-dom.

**Spec:** `INVESTIGACION-SENSIBILIDAD.md` — contiene el modelo matemático, la tabla de constantes yaw con niveles de confianza, los límites de entrada por juego y los vectores de prueba. **Este plan no repite la justificación de ningún número; toda constante procede de esa especificación.**

## Global Constraints

- Node.js >= 20.19.0. npm como gestor de paquetes.
- `nuxt@^4.0.0`, `vue@^3.5.0`, `pinia@^3.0.0`, `@pinia/nuxt@^0.11.0`, `tailwindcss@^4.0.0`, `@tailwindcss/vite@^4.0.0`, `vitest@^3.0.0`, `@vue/test-utils@^2.4.0`, `happy-dom@^15.0.0`, `typescript@^5.6.0`.
- TypeScript en modo `strict`. Prohibido `any` salvo en aserciones de test.
- **`lib/` no importa nada de `vue`, `nuxt`, `pinia` ni del DOM.** Es TypeScript puro y portable.
- **Todos los componentes `.vue` importan explícitamente de `vue`** (`import { computed, ref } from 'vue'`) en lugar de apoyarse en los auto-imports de Nuxt. Esto es lo que permite testearlos con Vitest plano sin el entorno Nuxt.
- Textos de interfaz en **español**. Identificadores, nombres de fichero, ramas y mensajes de commit en **inglés**.
- **Sin comentarios de documentación en el código** (JSDoc, bloques explicativos). El código va limpio; las explicaciones van en este plan y en la especificación.
- Ninguna constante yaw, límite de entrada o rango de eDPI puede inventarse. Si un valor no está en `INVESTIGACION-SENSIBILIDAD.md`, no se añade.
- Comparación de números en coma flotante en tests: `expect(x).toBeCloseTo(esperado, 4)`.
- Commits con Conventional Commits. Un commit por tarea como mínimo.
- El resultado de `npx vitest run` debe quedar en verde al final de **cada** tarea.
- **La sección «Dirección de diseño» es vinculante.** Ninguna tarea puede introducir un patrón de la lista de prohibiciones, ni siquiera «temporalmente para que se vea algo».

---

## Dirección de diseño

### Sujeto

Esto es un **instrumento de medida**, no una landing de producto. Lo que calcula es una distancia física sobre una alfombrilla: centímetros, cuentas del sensor, grados por cuenta. El vocabulario visual sale de ahí — ficha de calibración, regla graduada, marca de índice, constante de motor — y no del catálogo habitual de páginas de herramientas.

Público: jugadores que ya miden cosas. Gente que sabe qué es la desviación de DPI de su sensor. No hay que venderles nada; hay que darles una lectura fiable y decirles cuánto de fiable es.

### Elemento distintivo (uno solo)

**La barra de escala real.** El resultado principal no es un número dentro de una tarjeta: es una regla dibujada a escala, con marca cada centímetro, donde se ve el cm/360 del usuario tendido sobre el ancho de una alfombrilla de referencia (45 cm por defecto). Si el giro no cabe en la alfombrilla, la barra lo dice y calcula cuántos anchos de pad hacen falta.

Toda la audacia del diseño se gasta ahí. El resto de la página es tipografía disciplinada y reglas de un píxel. Regla de Chanel: antes de dar una tarea por terminada, quitar un elemento.

### Tokens

Van en `app/assets/css/main.css` con `@theme` de Tailwind v4. Ningún color ni tamaño fuera de esta tabla.

| Token | Valor | Uso |
|---|---|---|
| `--color-paper` | `#d8dcda` | Fondo de página. Gris frío verdoso de papel técnico. No es blanco puro. |
| `--color-paper-2` | `#cdd2cf` | Fondo de bloques de datos y campos. |
| `--color-ink` | `#14181a` | Texto principal, cifras, reglas gruesas. |
| `--color-ink-2` | `#4a5350` | Etiquetas, texto secundario. |
| `--color-rule` | `#a6aeaa` | Filetes de 1 px, marcas de escala menores. |
| `--color-index` | `#b8442a` | **Único acento.** Bermellón apagado de marca de índice. Solo en: la marca de la barra de escala, el aviso de cuantización y el nivel de confianza C. Nunca en botones ni enlaces decorativos. |

Tipografía — tres roles, ninguna de las familias vetadas:

| Rol | Familia | Uso |
|---|---|---|
| Display | **Archivo** 700, tracking `-0.02em` | Cifra grande del cm/360, `h1`. Figuras tabulares. |
| Cuerpo | **Public Sans** 400/600 | Texto de interfaz, párrafos, botones. |
| Datos | **DM Mono** 400/500 | Números de resultado, constantes yaw, códigos de nivel, marcas de la regla, etiquetas en mayúscula con `letter-spacing: 0.08em`. |

Se autoalojan en `public/fonts/` como `.woff2` con `font-display: swap` y fallback métrico declarado. Nada de `<link>` a Google Fonts.

Escala de tipo: `12 / 14 / 16 / 20 / 28 / 56` px. Sin tamaños intermedios improvisados.

Geometría: **radio de borde 0 en todo el sitio.** Separación por filete de 1 px `--color-rule` o por espacio en blanco, nunca por sombra. Rejilla base de 8 px.

### Prohibiciones y qué se hace en su lugar

Las 30 son restricciones duras. La columna derecha es la única alternativa aceptada.

| # | Prohibido | En su lugar |
|---|---|---|
| 1 | Degradados duros | Colores planos. Un único degradado permitido: el desvanecido del extremo de la barra de escala cuando el giro se sale de la alfombrilla, y solo en `--color-rule`. |
| 2 | Iconos Lucide | Sin librería de iconos. Las únicas formas son las marcas de la regla, dibujadas en SVG propio. |
| 3 | Fondo blanco puro | `--color-paper` (`#d8dcda`). |
| 4 | Coloreado arcoíris | Un solo acento. Los tres niveles de confianza se distinguen por **tipografía y palabra**, no por semáforo verde/ámbar/rojo. |
| 5 | Sombras | Filetes de 1 px. `box-shadow` prohibido salvo el anillo de foco de teclado. |
| 6 | Tres tarjetas de característica en fila | La página no tiene sección de características. Los datos van en una **lista de definición de dos columnas** (etiqueta a la izquierda, cifra alineada a la derecha), como una hoja de especificaciones. |
| 7 | Emojis | Ninguno, ni en la interfaz ni en los textos. |
| 8 | Liquid glass | Sin `backdrop-filter`. Sin fondos translúcidos. |
| 9 | Rayas (em dash) | Prohibido `—` en todo texto de interfaz. Frases separadas con punto. Para un valor ausente se escribe `sin datos`, no un guion. |
| 10 | Inter / Geist / Space Grotesk | Archivo, Public Sans, DM Mono. |
| 11 | Franja de color a la izquierda | Los avisos se marcan con **etiqueta en versalitas** en la línea superior, sin barra lateral. |
| 12 | Testimonios falsos | Ninguno. No hay prueba social inventada en el sitio. |
| 13 | Rejillas bento | Rejilla regular de dos columnas en escritorio, una en móvil. Todos los bloques con la misma anchura de columna. |
| 14 | Ventana de terminal | Ninguna. |
| 15 | «No es X, es Y» | Prohibido ese patrón retórico en todo el copy. Frases declarativas. |
| 16 | Viñetas de check | Listas numeradas cuando hay orden real (el procedimiento de calibración lo tiene). Sin viñeta cuando no lo hay. |
| 17 | Tres niveles de precio | El sitio es gratis y no tiene página de precios. |
| 18 | Sin demo real de producto | La calculadora funcional es lo primero de la página, sin héroe previo. No hay captura ni vídeo de nada. |
| 19 | Radios suaves | `border-radius: 0` global. Nada de `rounded-*` de Tailwind, ni siquiera `rounded-full` en etiquetas. |
| 20 | Morado y negro | Paleta de papel gris frío y tinta. Sin morado. El fondo no es negro. |
| 21 | Sin skeleton loaders | No hay carga asíncrona que justifique un skeleton: el cálculo es síncrono. La regla equivalente es **reserva de espacio**: la barra de escala y los bloques de resultado tienen altura fija, y la rehidratación desde `localStorage` no puede provocar salto de layout ni parpadeo. |
| 22 | Orbes radiales | Ninguno. |
| 23 | Rejillas de puntos | El único patrón repetido de la página son las marcas de centímetro de la regla, y son información. |
| 24 | Iconos de destello | Ninguno. |
| 25 | Flechas animadas | Ninguna flecha decorativa. |
| 26 | Sin términos de servicio | Página `/terminos` real. Task 16B. |
| 27 | Sin política de privacidad | Página `/privacidad` real. Task 16B. |
| 28 | Animaciones al pasar el ratón | Sin `transition` en `:hover`. El estado de hover cambia solo el color del filete, de forma instantánea. El foco de teclado sí es visible: contorno de 2 px en `--color-ink`. |
| 29 | Colores neón | El acento es bermellón apagado `#b8442a`, no verde ácido ni cian. |
| 30 | Pasteles básicos | Ninguno. |

**Única animación de toda la web:** la marca de índice de la barra de escala se desplaza a su nueva posición cuando cambia el resultado, en 180 ms. Sirve para leer la magnitud del cambio. Anulada bajo `prefers-reduced-motion: reduce`. Nada más se anima.

### Reglas de copy

- Voz activa. El botón dice qué pasa: `Guardar calibración`, y el mensaje posterior dice `Calibración guardada`.
- Nombrar las cosas por lo que el usuario controla, no por cómo está construido: `Sensibilidad del juego`, no `sens value`.
- Los errores explican qué falta y cómo arreglarlo. No piden perdón.
- Sin superlativos ni promesas. El texto describe la medida.
- Frases cortas, mayúscula solo al principio.

### Suelo de calidad

Responsive hasta 360 px de ancho. Foco de teclado visible en todo control. `prefers-reduced-motion` respetado. Contraste mínimo 4.5:1 en texto (`--color-ink-2` sobre `--color-paper` cumple; `--color-index` solo en texto de 16 px o más y en peso 600).

---

## Estructura de ficheros

Antes de empezar, este es el mapa completo. Cada fichero tiene una única responsabilidad.

```
/
├── INVESTIGACION-SENSIBILIDAD.md      (spec, ya existe)
├── PLAN-IMPLEMENTACION.md             (este fichero, ya existe)
├── package.json
├── nuxt.config.ts
├── vitest.config.ts
├── tsconfig.json
├── README.md
├── public/fonts/                      Archivo, Public Sans, DM Mono en .woff2
├── lib/                               núcleo puro, sin Vue
│   ├── types.ts                       tipos del dominio
│   ├── games.ts                       registro de juegos + constantes yaw
│   ├── routes.ts                      rutas a prerenderizar
│   ├── scale.ts                       geometría de la barra de escala
│   ├── index.ts                       barrel de exportación
│   └── math/
│       ├── core.ts                    eDPI ↔ sens ↔ cm/360
│       ├── quantize.ts                ajuste al paso real del juego
│       ├── convert.ts                 conversión entre juegos + eDPI normalizado
│       ├── calibrate.ts               yaw empírico a partir de una medición
│       └── fov.ts                     FOV y coincidencia con zoom (v2)
├── app/
│   ├── app.vue
│   ├── assets/css/main.css
│   ├── stores/settings.ts             Pinia: DPI, juego, calibraciones
│   ├── composables/useUrlState.ts     estado compartible por URL
│   ├── components/
│   │   ├── ConfidenceMark.vue         nivel de confianza, sin semáforo
│   │   ├── GameSelect.vue
│   │   ├── EdpiCalculator.vue
│   │   ├── ScaleBar.vue               elemento distintivo
│   │   ├── ResultCard.vue
│   │   ├── ConverterPanel.vue
│   │   ├── CalibrationDialog.vue
│   │   ├── SystemChecklist.vue
│   │   └── SiteFooter.vue
│   └── pages/
│       ├── index.vue
│       ├── terminos.vue
│       ├── privacidad.vue
│       ├── juego/[slug].vue
│       └── convertir/[from]/[to].vue
└── tests/
    ├── core.spec.ts
    ├── games.spec.ts
    ├── quantize.spec.ts
    ├── convert.spec.ts
    ├── calibrate.spec.ts
    ├── fov.spec.ts
    ├── scale.spec.ts
    ├── routes.spec.ts
    ├── settings.spec.ts
    ├── urlstate.spec.ts
    └── components/
        ├── ConfidenceMark.spec.ts
        ├── GameSelect.spec.ts
        ├── EdpiCalculator.spec.ts
        ├── ScaleBar.spec.ts
        ├── ResultCard.spec.ts
        ├── ConverterPanel.spec.ts
        └── CalibrationDialog.spec.ts
```

---

### Task 1: Andamiaje del proyecto y cadena de tests

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `vitest.config.ts`, `tsconfig.json`, `app/app.vue`, `app/assets/css/main.css`, `.gitignore`
- Test: `tests/smoke.spec.ts`

**Interfaces:**
- Consumes: nada.
- Produce: alias `~~` apuntando a la raíz del proyecto y `~` apuntando a `app/`, disponibles tanto en Nuxt como en Vitest. Comando de test `npm test`.

- [ ] **Step 1: Inicializar repositorio y proyecto**

```bash
git init
npm init -y
npm install nuxt@^4.0.0 vue@^3.5.0 pinia@^3.0.0 @pinia/nuxt@^0.11.0
npm install -D typescript@^5.6.0 vitest@^3.0.0 @vue/test-utils@^2.4.0 happy-dom@^15.0.0 tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0 @nuxt/kit
```

- [ ] **Step 2: Escribir la configuración**

`package.json` — sustituir el bloque `scripts` por:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "type": "module"
}
```

`nuxt.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  typescript: { strict: true },
  ssr: true,
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  }
})
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~~': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts']
  }
})
```

Instalar también el plugin de Vue para Vitest:

```bash
npm install -D @vitejs/plugin-vue
```

`tsconfig.json`:

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true
  },
  "include": ["lib/**/*", "tests/**/*", "app/**/*"]
}
```

`.gitignore`:

```
node_modules
.nuxt
.output
dist
.data
*.log
.DS_Store
```

Descargar las tres familias de la sección «Dirección de diseño» desde Google Fonts en formato `.woff2` (subconjunto latino) y colocarlas en `public/fonts/`:

```
public/fonts/archivo-700.woff2
public/fonts/public-sans-400.woff2
public/fonts/public-sans-600.woff2
public/fonts/dm-mono-400.woff2
public/fonts/dm-mono-500.woff2
```

`app/assets/css/main.css` — este fichero es la única fuente de verdad de color, tipo y geometría:

```css
@import "tailwindcss";

@font-face {
  font-family: "Archivo";
  src: url("/fonts/archivo-700.woff2") format("woff2");
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: "Public Sans";
  src: url("/fonts/public-sans-400.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: "Public Sans";
  src: url("/fonts/public-sans-600.woff2") format("woff2");
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: "DM Mono";
  src: url("/fonts/dm-mono-400.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: "DM Mono";
  src: url("/fonts/dm-mono-500.woff2") format("woff2");
  font-weight: 500;
  font-display: swap;
}

@theme {
  --color-paper: #d8dcda;
  --color-paper-2: #cdd2cf;
  --color-ink: #14181a;
  --color-ink-2: #4a5350;
  --color-rule: #a6aeaa;
  --color-index: #b8442a;

  --font-display: "Archivo", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Public Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "DM Mono", ui-monospace, monospace;

  --text-2xs: 12px;
  --text-xs: 14px;
  --text-sm: 16px;
  --text-md: 20px;
  --text-lg: 28px;
  --text-xl: 56px;

  --radius-none: 0px;
}

@layer base {
  *,
  *::before,
  *::after {
    border-radius: 0 !important;
    box-shadow: none;
  }

  html {
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-body);
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
  }

  h1,
  .display {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .data {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-ink-2);
  }

  .panel {
    border: 1px solid var(--color-rule);
    background: var(--color-paper);
  }

  .field {
    width: 100%;
    border: 1px solid var(--color-rule);
    background: var(--color-paper-2);
    padding: 8px 10px;
    font-family: var(--font-mono);
    color: var(--color-ink);
  }

  .field:read-only {
    color: var(--color-ink-2);
  }

  .btn {
    border: 1px solid var(--color-ink);
    background: var(--color-paper);
    padding: 8px 12px;
    font-weight: 600;
  }

  .btn[aria-pressed="true"] {
    background: var(--color-ink);
    color: var(--color-paper);
  }

  .btn:hover,
  .field:hover {
    border-color: var(--color-ink);
  }

  :focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none !important;
      animation: none !important;
    }
  }
}
```

La regla `border-radius: 0 !important` es deliberada: hace imposible que una tarea posterior introduzca esquinas redondeadas por descuido.

`app/app.vue`:

```vue
<template>
  <NuxtPage />
</template>
```

- [ ] **Step 3: Escribir el test de humo (fallará)**

`tests/smoke.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { INCH_TO_CM } from '~~/lib/math/core'

describe('toolchain', () => {
  it('resolves the ~~ alias into lib', () => {
    expect(INCH_TO_CM).toBe(2.54)
  })
})
```

- [ ] **Step 4: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run`
Esperado: FAIL con `Failed to resolve import "~~/lib/math/core"`.

- [ ] **Step 5: Crear el módulo mínimo**

`lib/math/core.ts`:

```ts
export const INCH_TO_CM = 2.54
```

- [ ] **Step 6: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run`
Esperado: PASS, 1 test.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold nuxt 4 project with vitest and tailwind"
```

---

### Task 2: Tipos del dominio y registro de juegos

**Files:**
- Create: `lib/types.ts`, `lib/games.ts`
- Test: `tests/games.spec.ts`

**Interfaces:**
- Consumes: nada.
- Produce:
  - `type Confidence = 'A' | 'B' | 'C'`
  - `interface SensInputSpec { min: number; max: number; step: number; decimals: number }`
  - `interface Game { slug: string; name: string; engine: string; yaw: number | null; scaleLabel: string; input: SensInputSpec; confidence: Confidence; confidenceNote?: string; proEdpi?: { low: number; typical: number; high: number }; aliases?: string[] }`
  - `const GAMES: Game[]`
  - `function getGame(slug: string): Game | undefined`
  - `function tierAGames(): Game[]`

`step === 0` significa entrada continua (sin cuantización). `yaw === null` significa Tier C: el juego solo funciona con calibración del usuario.

- [ ] **Step 1: Escribir el test que falla**

`tests/games.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { GAMES, getGame, tierAGames } from '~~/lib/games'

describe('game registry', () => {
  it('exposes the reference yaw values from the spec', () => {
    expect(getGame('cs2')?.yaw).toBe(0.022)
    expect(getGame('valorant')?.yaw).toBe(0.07)
    expect(getGame('overwatch-2')?.yaw).toBe(0.0066)
    expect(getGame('marvel-rivals')?.yaw).toBe(0.0066)
    expect(getGame('fortnite')?.yaw).toBe(0.005555)
    expect(getGame('deadlock')?.yaw).toBe(0.044)
  })

  it('has unique slugs', () => {
    const slugs = GAMES.map(g => g.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('gives every tier A and B game a positive yaw', () => {
    for (const game of GAMES.filter(g => g.confidence !== 'C')) {
      expect(game.yaw).not.toBeNull()
      expect(game.yaw as number).toBeGreaterThan(0)
    }
  })

  it('gives every tier C game a null yaw and a note', () => {
    for (const game of GAMES.filter(g => g.confidence === 'C')) {
      expect(game.yaw).toBeNull()
      expect(game.confidenceNote).toBeTruthy()
    }
  })

  it('declares coherent input specs', () => {
    for (const game of GAMES) {
      expect(game.input.max).toBeGreaterThan(game.input.min)
      expect(game.input.step).toBeGreaterThanOrEqual(0)
      expect(game.input.decimals).toBeGreaterThanOrEqual(0)
    }
  })

  it('lists only tier A games in tierAGames', () => {
    expect(tierAGames().every(g => g.confidence === 'A')).toBe(true)
    expect(tierAGames().length).toBeGreaterThanOrEqual(10)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getGame('nope')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/games.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/games`.

- [ ] **Step 3: Escribir los tipos**

`lib/types.ts`:

```ts
export type Confidence = 'A' | 'B' | 'C'

export interface SensInputSpec {
  min: number
  max: number
  step: number
  decimals: number
}

export interface ProEdpiRange {
  low: number
  typical: number
  high: number
}

export interface Game {
  slug: string
  name: string
  engine: string
  yaw: number | null
  scaleLabel: string
  input: SensInputSpec
  confidence: Confidence
  confidenceNote?: string
  proEdpi?: ProEdpiRange
  aliases?: string[]
}
```

- [ ] **Step 4: Escribir el registro**

`lib/games.ts` — todos los valores proceden de `INVESTIGACION-SENSIBILIDAD.md` §4, §5 y §10:

```ts
import type { Game } from './types'

export const REFERENCE_YAW = 0.022

export const GAMES: Game[] = [
  {
    slug: 'cs2',
    name: 'Counter-Strike 2',
    engine: 'Source 2',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.0001, max: 100, step: 0, decimals: 6 },
    confidence: 'A',
    proEdpi: { low: 600, typical: 800, high: 1100 },
    aliases: ['csgo', 'counter-strike']
  },
  {
    slug: 'valorant',
    name: 'Valorant',
    engine: 'Unreal Engine 4',
    yaw: 0.07,
    scaleLabel: 'sens',
    input: { min: 0.001, max: 10, step: 0.001, decimals: 3 },
    confidence: 'A',
    proEdpi: { low: 200, typical: 260, high: 320 }
  },
  {
    slug: 'apex-legends',
    name: 'Apex Legends',
    engine: 'Source modificado',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.1, max: 20, step: 0.01, decimals: 3 },
    confidence: 'A',
    proEdpi: { low: 800, typical: 1200, high: 1600 }
  },
  {
    slug: 'overwatch-2',
    name: 'Overwatch 2',
    engine: 'Motor propietario de Blizzard',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 1, max: 100, step: 1, decimals: 0 },
    confidence: 'A',
    proEdpi: { low: 3000, typical: 4000, high: 6000 },
    aliases: ['ow2', 'overwatch']
  },
  {
    slug: 'marvel-rivals',
    name: 'Marvel Rivals',
    engine: 'Unreal Engine 5',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 100, step: 0.01, decimals: 2 },
    confidence: 'A',
    proEdpi: { low: 3000, typical: 4000, high: 6000 }
  },
  {
    slug: 'call-of-duty',
    name: 'Call of Duty (MW / Warzone / Black Ops)',
    engine: 'IW 8/9',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 1, max: 20, step: 1, decimals: 0 },
    confidence: 'A',
    confidenceNote: 'El ajuste Mouse Sensitivity Multiplier multiplica el yaw efectivo.',
    proEdpi: { low: 4000, typical: 4800, high: 7000 },
    aliases: ['warzone', 'cod', 'black-ops']
  },
  {
    slug: 'fortnite',
    name: 'Fortnite',
    engine: 'Unreal Engine 5',
    yaw: 0.005555,
    scaleLabel: '%',
    input: { min: 0, max: 100, step: 0.1, decimals: 1 },
    confidence: 'A',
    confidenceNote: 'La sensibilidad es un porcentaje; el yaw indicado corresponde a 1 %.',
    proEdpi: { low: 4000, typical: 5600, high: 8000 }
  },
  {
    slug: 'deadlock',
    name: 'Deadlock',
    engine: 'Source 2',
    yaw: 0.044,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 2 },
    confidence: 'A'
  },
  {
    slug: 'quake-champions',
    name: 'Quake Champions',
    engine: 'id Tech',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 3 },
    confidence: 'A'
  },
  {
    slug: 'halo-infinite',
    name: 'Halo Infinite',
    engine: 'Slipspace',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 3 },
    confidence: 'A'
  },
  {
    slug: 'source-games',
    name: 'Juegos Source (TF2, HL2, L4D2, Titanfall 2)',
    engine: 'Source',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 3 },
    confidence: 'A',
    aliases: ['tf2', 'team-fortress-2', 'titanfall-2']
  },
  {
    slug: 'rainbow-six-siege',
    name: 'Rainbow Six Siege',
    engine: 'AnvilNext 2.0',
    yaw: 0.00572958,
    scaleLabel: 'sens',
    input: { min: 1, max: 100, step: 1, decimals: 0 },
    confidence: 'B',
    confidenceNote: 'Varias fuentes describen dependencia del ajuste de FOV. Calibra si el resultado no encaja.',
    aliases: ['r6', 'siege']
  },
  {
    slug: 'escape-from-tarkov',
    name: 'Escape from Tarkov',
    engine: 'Unity',
    yaw: 0.125,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 5, step: 0.01, decimals: 2 },
    confidence: 'B',
    confidenceNote: 'Valor derivado de forma indirecta y sin confirmación oficial.',
    aliases: ['tarkov', 'eft']
  },
  {
    slug: 'battlefield-6',
    name: 'Battlefield 6 / 2042',
    engine: 'Frostbite',
    yaw: 0.0022,
    scaleLabel: '%',
    input: { min: 0, max: 100, step: 1, decimals: 0 },
    confidence: 'B',
    confidenceNote: 'Las fuentes publican 0.0022 y 0.0066. Se usa 0.0022; calibra para confirmarlo.'
  },
  {
    slug: 'destiny-2',
    name: 'Destiny 2',
    engine: 'Tiger',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 1, max: 20, step: 1, decimals: 0 },
    confidence: 'B',
    confidenceNote: 'Tiene tope de velocidad de giro al esprintar, que rompe la linealidad en ese estado.'
  },
  {
    slug: 'delta-force',
    name: 'Delta Force',
    engine: 'Unreal Engine modificado',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 2 },
    confidence: 'B',
    confidenceNote: 'Fuente única sin verificar.'
  },
  {
    slug: 'pubg',
    name: 'PUBG: Battlegrounds',
    engine: 'Unreal Engine',
    yaw: null,
    scaleLabel: 'sens',
    input: { min: 1, max: 100, step: 1, decimals: 0 },
    confidence: 'C',
    confidenceNote: 'Escala no lineal y ajustes independientes por mira. Requiere calibración propia.'
  },
  {
    slug: 'the-finals',
    name: 'THE FINALS',
    engine: 'Unreal Engine 5',
    yaw: null,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 100, step: 0.01, decimals: 2 },
    confidence: 'C',
    confidenceNote: 'Los datos publicados se contradicen en un factor de ~30. Requiere calibración propia.'
  },
  {
    slug: 'rust',
    name: 'Rust',
    engine: 'Unity',
    yaw: null,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 10, step: 0.01, decimals: 2 },
    confidence: 'C',
    confidenceNote: 'El escalado ha cambiado entre actualizaciones. Requiere calibración propia.'
  }
]

export function getGame(slug: string): Game | undefined {
  return GAMES.find(game => game.slug === slug || game.aliases?.includes(slug))
}

export function tierAGames(): Game[] {
  return GAMES.filter(game => game.confidence === 'A')
}
```

- [ ] **Step 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/games.spec.ts`
Esperado: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/games.ts tests/games.spec.ts
git commit -m "feat: add domain types and game registry with confidence tiers"
```

---

### Task 3: Núcleo matemático (eDPI ↔ sens ↔ cm/360)

**Files:**
- Modify: `lib/math/core.ts`
- Test: `tests/core.spec.ts`

**Interfaces:**
- Consumes: nada de tareas previas.
- Produce:
  - `const INCH_TO_CM = 2.54`, `const FULL_TURN_CM = 914.4`
  - `edpiFromSens(dpi: number, sens: number): number`
  - `sensFromEdpi(dpi: number, edpi: number): number`
  - `degPerCount(sens: number, yaw: number): number`
  - `countsPer360(sens: number, yaw: number): number`
  - `cm360FromSens(dpi: number, sens: number, yaw: number): number`
  - `cm360FromEdpi(edpi: number, yaw: number): number`
  - `sensFromCm360(dpi: number, cm360: number, yaw: number): number`
  - `edpiFromCm360(cm360: number, yaw: number): number`
  - `cmToInches(cm: number): number`

Todas lanzan `RangeError` si algún argumento es <= 0 o no finito (salvo que se indique).

- [ ] **Step 1: Escribir los tests que fallan**

`tests/core.spec.ts` — los casos son los vectores de prueba de la spec §11:

```ts
import { describe, it, expect } from 'vitest'
import {
  INCH_TO_CM,
  FULL_TURN_CM,
  edpiFromSens,
  sensFromEdpi,
  degPerCount,
  countsPer360,
  cm360FromSens,
  cm360FromEdpi,
  sensFromCm360,
  edpiFromCm360,
  cmToInches
} from '~~/lib/math/core'

describe('core sensitivity math', () => {
  it('exposes the physical constants', () => {
    expect(INCH_TO_CM).toBe(2.54)
    expect(FULL_TURN_CM).toBeCloseTo(914.4, 6)
  })

  it('vector 1: cs2 at 800 dpi and sens 1.0', () => {
    expect(edpiFromSens(800, 1)).toBe(800)
    expect(degPerCount(1, 0.022)).toBeCloseTo(0.022, 6)
    expect(countsPer360(1, 0.022)).toBeCloseTo(16363.6364, 3)
    expect(cmToInches(cm360FromSens(800, 1, 0.022))).toBeCloseTo(20.4545, 4)
    expect(cm360FromSens(800, 1, 0.022)).toBeCloseTo(51.9545, 4)
  })

  it('vector 2: cm/360 depends only on edpi, not on the dpi split', () => {
    expect(cm360FromSens(400, 2, 0.022)).toBeCloseTo(51.9545, 4)
    expect(cm360FromSens(1600, 0.5, 0.022)).toBeCloseTo(51.9545, 4)
  })

  it('vector 3: valorant at 800 dpi and sens 0.314', () => {
    expect(edpiFromSens(800, 0.314)).toBeCloseTo(251.2, 4)
    expect(cm360FromSens(800, 0.314, 0.07)).toBeCloseTo(52.0018, 4)
  })

  it('vector 10: edpi 800 to cm/360 in cs2', () => {
    expect(cm360FromEdpi(800, 0.022)).toBeCloseTo(51.9545, 4)
  })

  it('vector 11: 30 cm/360 in overwatch 2', () => {
    expect(edpiFromCm360(30, 0.0066)).toBeCloseTo(4618.1818, 3)
    expect(sensFromCm360(800, 30, 0.0066)).toBeCloseTo(5.7727, 4)
  })

  it('vector 15: call of duty sens 6 at 800 dpi', () => {
    expect(cm360FromSens(800, 6, 0.0066)).toBeCloseTo(28.8636, 4)
  })

  it('inverts sens and edpi', () => {
    expect(sensFromEdpi(1600, 800)).toBeCloseTo(0.5, 6)
    expect(edpiFromSens(1600, sensFromEdpi(1600, 800))).toBeCloseTo(800, 6)
  })

  it('round-trips sens through cm/360', () => {
    const cm = cm360FromSens(800, 1.37, 0.022)
    expect(sensFromCm360(800, cm, 0.022)).toBeCloseTo(1.37, 6)
  })

  it('rejects non-positive and non-finite inputs', () => {
    expect(() => cm360FromSens(0, 1, 0.022)).toThrow(RangeError)
    expect(() => cm360FromSens(800, 0, 0.022)).toThrow(RangeError)
    expect(() => cm360FromSens(800, 1, 0)).toThrow(RangeError)
    expect(() => sensFromEdpi(0, 800)).toThrow(RangeError)
    expect(() => cm360FromSens(Number.NaN, 1, 0.022)).toThrow(RangeError)
    expect(() => cm360FromSens(Number.POSITIVE_INFINITY, 1, 0.022)).toThrow(RangeError)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/core.spec.ts`
Esperado: FAIL, `edpiFromSens is not a function` u error de importación.

- [ ] **Step 3: Implementar**

`lib/math/core.ts` — sustituir el contenido completo:

```ts
export const INCH_TO_CM = 2.54
export const FULL_TURN_DEGREES = 360
export const FULL_TURN_CM = FULL_TURN_DEGREES * INCH_TO_CM

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function cmToInches(cm: number): number {
  return requirePositive(cm, 'cm') / INCH_TO_CM
}

export function edpiFromSens(dpi: number, sens: number): number {
  return requirePositive(dpi, 'dpi') * requirePositive(sens, 'sens')
}

export function sensFromEdpi(dpi: number, edpi: number): number {
  return requirePositive(edpi, 'edpi') / requirePositive(dpi, 'dpi')
}

export function degPerCount(sens: number, yaw: number): number {
  return requirePositive(sens, 'sens') * requirePositive(yaw, 'yaw')
}

export function countsPer360(sens: number, yaw: number): number {
  return FULL_TURN_DEGREES / degPerCount(sens, yaw)
}

export function cm360FromSens(dpi: number, sens: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(dpi, 'dpi') * degPerCount(sens, yaw))
}

export function cm360FromEdpi(edpi: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(edpi, 'edpi') * requirePositive(yaw, 'yaw'))
}

export function sensFromCm360(dpi: number, cm360: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(dpi, 'dpi') * requirePositive(yaw, 'yaw') * requirePositive(cm360, 'cm360'))
}

export function edpiFromCm360(cm360: number, yaw: number): number {
  return FULL_TURN_CM / (requirePositive(yaw, 'yaw') * requirePositive(cm360, 'cm360'))
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/core.spec.ts`
Esperado: PASS, 10 tests.

- [ ] **Step 5: Borrar el test de humo, que ya es redundante**

```bash
rm tests/smoke.spec.ts
npx vitest run
```
Esperado: PASS, sin fallos.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: implement core edpi, sens and cm/360 math"
```

---

### Task 4: Cuantización al paso real del juego

**Files:**
- Create: `lib/math/quantize.ts`
- Test: `tests/quantize.spec.ts`

**Interfaces:**
- Consumes: `SensInputSpec` de `lib/types.ts`.
- Produce:
  - `interface QuantizedSens { exact: number; value: number; clamped: boolean; errorPct: number }`
  - `quantizeSens(exact: number, spec: SensInputSpec): QuantizedSens`
  - `formatSens(value: number, spec: SensInputSpec): string`

`errorPct` es el error relativo de sensibilidad: `|value − exact| / exact × 100`. Es el mismo error relativo que sufre el eDPI y la velocidad de giro (spec §5). `clamped` indica que el valor exacto quedaba fuera de `[min, max]`.

- [ ] **Step 1: Escribir el test que falla**

`tests/quantize.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { quantizeSens, formatSens } from '~~/lib/math/quantize'
import type { SensInputSpec } from '~~/lib/types'

const OW2: SensInputSpec = { min: 1, max: 100, step: 1, decimals: 0 }
const VALORANT: SensInputSpec = { min: 0.001, max: 10, step: 0.001, decimals: 3 }
const CS2: SensInputSpec = { min: 0.0001, max: 100, step: 0, decimals: 6 }

describe('quantizeSens', () => {
  it('vector 12: rounds overwatch 5.7727 to 6 with ~3.94% error', () => {
    const result = quantizeSens(5.7727, OW2)
    expect(result.value).toBe(6)
    expect(result.exact).toBeCloseTo(5.7727, 4)
    expect(result.errorPct).toBeCloseTo(3.9375, 3)
    expect(result.clamped).toBe(false)
  })

  it('leaves continuous scales untouched', () => {
    const result = quantizeSens(1.234567, CS2)
    expect(result.value).toBeCloseTo(1.234567, 6)
    expect(result.errorPct).toBeCloseTo(0, 6)
  })

  it('rounds to the valorant step', () => {
    expect(quantizeSens(0.3142857, VALORANT).value).toBeCloseTo(0.314, 6)
  })

  it('clamps below the minimum', () => {
    const result = quantizeSens(0.4, OW2)
    expect(result.value).toBe(1)
    expect(result.clamped).toBe(true)
  })

  it('clamps above the maximum', () => {
    const result = quantizeSens(140, OW2)
    expect(result.value).toBe(100)
    expect(result.clamped).toBe(true)
  })

  it('does not leak floating point noise', () => {
    expect(quantizeSens(0.30000000000000004, VALORANT).value).toBe(0.3)
  })

  it('rejects invalid input', () => {
    expect(() => quantizeSens(0, OW2)).toThrow(RangeError)
    expect(() => quantizeSens(Number.NaN, OW2)).toThrow(RangeError)
  })
})

describe('formatSens', () => {
  it('formats with the declared decimals', () => {
    expect(formatSens(6, OW2)).toBe('6')
    expect(formatSens(0.314, VALORANT)).toBe('0.314')
  })

  it('trims trailing zeros on continuous scales', () => {
    expect(formatSens(1.5, CS2)).toBe('1.5')
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/quantize.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/math/quantize`.

- [ ] **Step 3: Implementar**

`lib/math/quantize.ts`:

```ts
import type { SensInputSpec } from '../types'

export interface QuantizedSens {
  exact: number
  value: number
  clamped: boolean
  errorPct: number
}

function roundToStep(value: number, step: number, decimals: number): number {
  const stepped = Math.round(value / step) * step
  const guard = Math.max(decimals, 6)
  return Number(stepped.toFixed(guard))
}

export function quantizeSens(exact: number, spec: SensInputSpec): QuantizedSens {
  if (!Number.isFinite(exact) || exact <= 0) {
    throw new RangeError(`sens must be a finite positive number, received ${exact}`)
  }

  const stepped = spec.step > 0 ? roundToStep(exact, spec.step, spec.decimals) : exact
  const value = Math.min(Math.max(stepped, spec.min), spec.max)
  const clamped = exact < spec.min || exact > spec.max

  return {
    exact,
    value,
    clamped,
    errorPct: (Math.abs(value - exact) / exact) * 100
  }
}

export function formatSens(value: number, spec: SensInputSpec): string {
  if (spec.step > 0) {
    return value.toFixed(spec.decimals)
  }
  return String(Number(value.toFixed(spec.decimals)))
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/quantize.spec.ts`
Esperado: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/math/quantize.ts tests/quantize.spec.ts
git commit -m "feat: quantize sensitivity to each game's input step"
```

---

### Task 5: Conversión entre juegos y eDPI normalizado

**Files:**
- Create: `lib/math/convert.ts`
- Test: `tests/convert.spec.ts`

**Interfaces:**
- Consumes: `lib/math/core.ts`.
- Produce:
  - `interface ConvertInput { sens: number; fromYaw: number; toYaw: number; fromDpi?: number; toDpi?: number }`
  - `convertSens(input: ConvertInput): number`
  - `normalizedEdpi(edpi: number, yaw: number, referenceYaw?: number): number`
  - `convertEdpi(edpi: number, fromYaw: number, toYaw: number): number`

Si `fromDpi`/`toDpi` se omiten, se asume el mismo DPI en ambos juegos.

- [ ] **Step 1: Escribir el test que falla**

`tests/convert.spec.ts` — vectores 4 a 9 y 14 de la spec §11:

```ts
import { describe, it, expect } from 'vitest'
import { convertSens, convertEdpi, normalizedEdpi } from '~~/lib/math/convert'
import { cm360FromSens } from '~~/lib/math/core'

describe('convertSens', () => {
  it('vector 4: cs2 1.0 to valorant', () => {
    expect(convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.07 })).toBeCloseTo(0.3142857, 6)
  })

  it('vector 5: cs2 1.0 to overwatch 2', () => {
    expect(convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.0066 })).toBeCloseTo(3.3333333, 6)
  })

  it('vector 6: cs2 2.0 to valorant', () => {
    expect(convertSens({ sens: 2, fromYaw: 0.022, toYaw: 0.07 })).toBeCloseTo(0.6285714, 6)
  })

  it('vector 7: cs2 1.0 at 400 dpi to valorant at 800 dpi', () => {
    expect(convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.07, fromDpi: 400, toDpi: 800 }))
      .toBeCloseTo(0.1571428, 6)
  })

  it('vector 8: fortnite 7% to cs2', () => {
    expect(convertSens({ sens: 7, fromYaw: 0.005555, toYaw: 0.022 })).toBeCloseTo(1.7675, 4)
  })

  it('vector 9: cs2 1.768 to fortnite', () => {
    expect(convertSens({ sens: 1.768, fromYaw: 0.022, toYaw: 0.005555 })).toBeCloseTo(7.00162, 4)
  })

  it('is the identity when both games share a yaw', () => {
    expect(convertSens({ sens: 1.4, fromYaw: 0.022, toYaw: 0.022 })).toBeCloseTo(1.4, 6)
  })

  it('preserves cm/360 exactly', () => {
    const converted = convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0.07, fromDpi: 400, toDpi: 800 })
    expect(cm360FromSens(800, converted, 0.07)).toBeCloseTo(cm360FromSens(400, 1, 0.022), 6)
  })

  it('is reversible', () => {
    const there = convertSens({ sens: 2.3, fromYaw: 0.022, toYaw: 0.0066 })
    expect(convertSens({ sens: there, fromYaw: 0.0066, toYaw: 0.022 })).toBeCloseTo(2.3, 6)
  })

  it('rejects invalid input', () => {
    expect(() => convertSens({ sens: 0, fromYaw: 0.022, toYaw: 0.07 })).toThrow(RangeError)
    expect(() => convertSens({ sens: 1, fromYaw: 0.022, toYaw: 0 })).toThrow(RangeError)
  })
})

describe('normalizedEdpi', () => {
  it('vector 14: overwatch 2 edpi 4000 equals cs2 edpi 1200', () => {
    expect(normalizedEdpi(4000, 0.0066)).toBeCloseTo(1200, 6)
  })

  it('leaves cs2 untouched', () => {
    expect(normalizedEdpi(800, 0.022)).toBeCloseTo(800, 6)
  })

  it('accepts a custom reference yaw', () => {
    expect(normalizedEdpi(800, 0.022, 0.07)).toBeCloseTo(251.4285, 4)
  })
})

describe('convertEdpi', () => {
  it('scales edpi by the yaw ratio', () => {
    expect(convertEdpi(800, 0.022, 0.0066)).toBeCloseTo(2666.6666, 3)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/convert.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/math/convert`.

- [ ] **Step 3: Implementar**

`lib/math/convert.ts`:

```ts
import { REFERENCE_YAW } from '../games'

export interface ConvertInput {
  sens: number
  fromYaw: number
  toYaw: number
  fromDpi?: number
  toDpi?: number
}

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function convertSens(input: ConvertInput): number {
  const sens = requirePositive(input.sens, 'sens')
  const fromYaw = requirePositive(input.fromYaw, 'fromYaw')
  const toYaw = requirePositive(input.toYaw, 'toYaw')
  const fromDpi = requirePositive(input.fromDpi ?? 800, 'fromDpi')
  const toDpi = requirePositive(input.toDpi ?? input.fromDpi ?? 800, 'toDpi')

  return sens * (fromYaw / toYaw) * (fromDpi / toDpi)
}

export function convertEdpi(edpi: number, fromYaw: number, toYaw: number): number {
  return requirePositive(edpi, 'edpi') * (requirePositive(fromYaw, 'fromYaw') / requirePositive(toYaw, 'toYaw'))
}

export function normalizedEdpi(edpi: number, yaw: number, referenceYaw: number = REFERENCE_YAW): number {
  return requirePositive(edpi, 'edpi') * (requirePositive(yaw, 'yaw') / requirePositive(referenceYaw, 'referenceYaw'))
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/convert.spec.ts`
Esperado: PASS, 14 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/math/convert.ts tests/convert.spec.ts
git commit -m "feat: add cross-game sensitivity conversion and normalized edpi"
```

---

### Task 6: Calibración empírica del yaw

**Files:**
- Create: `lib/math/calibrate.ts`
- Test: `tests/calibrate.spec.ts`

**Interfaces:**
- Consumes: `lib/math/core.ts`.
- Produce:
  - `interface CalibrationInput { dpi: number; sens: number; measuredCm: number; turns?: number }`
  - `yawFromMeasurement(input: CalibrationInput): number`
  - `interface Calibration { gameSlug: string; yaw: number; dpi: number; sens: number; measuredCm: number; turns: number }`

`turns` por defecto 1. `measuredCm` es la distancia **total** recorrida para completar `turns` vueltas.

- [ ] **Step 1: Escribir el test que falla**

`tests/calibrate.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { yawFromMeasurement } from '~~/lib/math/calibrate'
import { cm360FromSens } from '~~/lib/math/core'

describe('yawFromMeasurement', () => {
  it('vector 13: recovers the cs2 yaw from a 51.95 cm measurement', () => {
    expect(yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 51.9545 })).toBeCloseTo(0.022, 6)
  })

  it('divides the measured distance by the number of turns', () => {
    expect(yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 519.545, turns: 10 }))
      .toBeCloseTo(0.022, 6)
  })

  it('round-trips against the core math', () => {
    const yaw = yawFromMeasurement({ dpi: 1600, sens: 0.5, measuredCm: 34.64 })
    expect(cm360FromSens(1600, 0.5, yaw)).toBeCloseTo(34.64, 6)
  })

  it('recovers the overwatch 2 yaw', () => {
    expect(yawFromMeasurement({ dpi: 800, sens: 5, measuredCm: 34.6363 })).toBeCloseTo(0.0066, 6)
  })

  it('rejects invalid input', () => {
    expect(() => yawFromMeasurement({ dpi: 0, sens: 1, measuredCm: 50 })).toThrow(RangeError)
    expect(() => yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 0 })).toThrow(RangeError)
    expect(() => yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 50, turns: 0 })).toThrow(RangeError)
    expect(() => yawFromMeasurement({ dpi: 800, sens: 1, measuredCm: 50, turns: 1.5 })).toThrow(RangeError)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/calibrate.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/math/calibrate`.

- [ ] **Step 3: Implementar**

`lib/math/calibrate.ts`:

```ts
import { FULL_TURN_CM } from './core'

export interface CalibrationInput {
  dpi: number
  sens: number
  measuredCm: number
  turns?: number
}

export interface Calibration {
  gameSlug: string
  yaw: number
  dpi: number
  sens: number
  measuredCm: number
  turns: number
}

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function yawFromMeasurement(input: CalibrationInput): number {
  const dpi = requirePositive(input.dpi, 'dpi')
  const sens = requirePositive(input.sens, 'sens')
  const measuredCm = requirePositive(input.measuredCm, 'measuredCm')
  const turns = requirePositive(input.turns ?? 1, 'turns')

  if (!Number.isInteger(turns)) {
    throw new RangeError(`turns must be an integer, received ${turns}`)
  }

  const cm360 = measuredCm / turns
  return FULL_TURN_CM / (dpi * sens * cm360)
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/calibrate.spec.ts`
Esperado: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/math/calibrate.ts tests/calibrate.spec.ts
git commit -m "feat: derive yaw empirically from a measured 360 distance"
```

---

### Task 7: FOV y coincidencia con zoom

**Files:**
- Create: `lib/math/fov.ts`
- Test: `tests/fov.spec.ts`

**Interfaces:**
- Consumes: nada.
- Produce:
  - `hFovFromVFov(vFovDeg: number, aspect: number): number`
  - `vFovFromHFov(hFovDeg: number, aspect: number): number`
  - `zoomSensRatio(hipHFovDeg: number, zoomHFovDeg: number, monitorDistance: number): number`

`monitorDistance` es el parámetro `p` de la spec §9: 0 = coincidencia en el centro (crosshair), 1 = coincidencia en el borde.

- [ ] **Step 1: Escribir el test que falla**

`tests/fov.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { hFovFromVFov, vFovFromHFov, zoomSensRatio } from '~~/lib/math/fov'

describe('fov conversion', () => {
  it('vector 16: 73.74 vertical at 16:9 is 106.26 horizontal', () => {
    expect(hFovFromVFov(73.74, 16 / 9)).toBeCloseTo(106.26, 2)
  })

  it('round-trips horizontal and vertical', () => {
    expect(vFovFromHFov(hFovFromVFov(73.74, 16 / 9), 16 / 9)).toBeCloseTo(73.74, 6)
  })
})

describe('zoomSensRatio', () => {
  it('returns 1 when the fov does not change', () => {
    expect(zoomSensRatio(103, 103, 0)).toBeCloseTo(1, 6)
    expect(zoomSensRatio(103, 103, 1)).toBeCloseTo(1, 6)
  })

  it('at monitor distance 1 it equals the plain fov ratio', () => {
    expect(zoomSensRatio(103, 51.5, 1)).toBeCloseTo(0.5, 6)
  })

  it('at monitor distance 0 it equals the tangent ratio', () => {
    const expected = Math.tan((51.5 * Math.PI) / 360) / Math.tan((103 * Math.PI) / 360)
    expect(zoomSensRatio(103, 51.5, 0)).toBeCloseTo(expected, 6)
  })

  it('is slower at 0 than at 1 when zooming in', () => {
    expect(zoomSensRatio(103, 51.5, 0)).toBeLessThan(zoomSensRatio(103, 51.5, 1))
  })

  it('rejects invalid input', () => {
    expect(() => zoomSensRatio(0, 51.5, 0)).toThrow(RangeError)
    expect(() => zoomSensRatio(103, 51.5, -0.1)).toThrow(RangeError)
    expect(() => zoomSensRatio(103, 51.5, 1.1)).toThrow(RangeError)
    expect(() => hFovFromVFov(200, 16 / 9)).toThrow(RangeError)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/fov.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/math/fov`.

- [ ] **Step 3: Implementar**

`lib/math/fov.ts`:

```ts
const DEG = Math.PI / 180

function requireFov(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0 || value >= 180) {
    throw new RangeError(`${name} must be a finite angle in (0, 180), received ${value}`)
  }
  return value
}

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function hFovFromVFov(vFovDeg: number, aspect: number): number {
  const v = requireFov(vFovDeg, 'vFovDeg')
  const ar = requirePositive(aspect, 'aspect')
  return (2 * Math.atan(ar * Math.tan((v * DEG) / 2))) / DEG
}

export function vFovFromHFov(hFovDeg: number, aspect: number): number {
  const h = requireFov(hFovDeg, 'hFovDeg')
  const ar = requirePositive(aspect, 'aspect')
  return (2 * Math.atan(Math.tan((h * DEG) / 2) / ar)) / DEG
}

export function zoomSensRatio(hipHFovDeg: number, zoomHFovDeg: number, monitorDistance: number): number {
  const hip = requireFov(hipHFovDeg, 'hipHFovDeg')
  const zoom = requireFov(zoomHFovDeg, 'zoomHFovDeg')

  if (!Number.isFinite(monitorDistance) || monitorDistance < 0 || monitorDistance > 1) {
    throw new RangeError(`monitorDistance must be within [0, 1], received ${monitorDistance}`)
  }

  const tanHip = Math.tan((hip * DEG) / 2)
  const tanZoom = Math.tan((zoom * DEG) / 2)

  if (monitorDistance === 0) {
    return tanZoom / tanHip
  }

  return Math.atan(monitorDistance * tanZoom) / Math.atan(monitorDistance * tanHip)
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/fov.spec.ts`
Esperado: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/math/fov.ts tests/fov.spec.ts
git commit -m "feat: add fov conversion and monitor-distance zoom matching"
```

---

### Task 8: API de alto nivel del núcleo

**Files:**
- Create: `lib/index.ts`
- Test: `tests/summary.spec.ts`

**Interfaces:**
- Consumes: todo `lib/math/*` y `lib/games.ts`.
- Produce:
  - `interface SensSummary { game: Game; dpi: number; sens: number; sensQuantized: QuantizedSens; edpi: number; normalizedEdpi: number; cm360: number; in360: number; countsPer360: number; degPerCount: number; yaw: number; yawSource: 'published' | 'calibrated'; verdict: 'lenta' | 'media' | 'rapida' | 'muy-rapida' }`
  - `summarizeFromSens(game: Game, dpi: number, sens: number, yawOverride?: number): SensSummary`
  - `summarizeFromEdpi(game: Game, dpi: number, edpi: number, yawOverride?: number): SensSummary`
  - `summarizeFromCm360(game: Game, dpi: number, cm360: number, yawOverride?: number): SensSummary`
  - `resolveYaw(game: Game, yawOverride?: number): { yaw: number; source: 'published' | 'calibrated' }`
  - Re-exportaciones de `lib/games.ts`, `lib/types.ts`, `lib/math/core.ts`, `lib/math/convert.ts`, `lib/math/quantize.ts`, `lib/math/calibrate.ts`, `lib/math/fov.ts`.

`resolveYaw` lanza `Error` si el juego es Tier C y no hay `yawOverride`. `verdict` sale de los umbrales de cm/360 de la spec §10: `< 20` muy-rapida, `20–35` rapida, `35–50` media, `> 50` lenta.

- [ ] **Step 1: Escribir el test que falla**

`tests/summary.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { summarizeFromSens, summarizeFromEdpi, summarizeFromCm360, resolveYaw } from '~~/lib/index'
import { getGame } from '~~/lib/games'

const cs2 = getGame('cs2')!
const ow2 = getGame('overwatch-2')!
const pubg = getGame('pubg')!

describe('summarizeFromSens', () => {
  it('summarizes cs2 at 800 dpi and sens 1', () => {
    const s = summarizeFromSens(cs2, 800, 1)
    expect(s.edpi).toBeCloseTo(800, 6)
    expect(s.cm360).toBeCloseTo(51.9545, 4)
    expect(s.in360).toBeCloseTo(20.4545, 4)
    expect(s.normalizedEdpi).toBeCloseTo(800, 6)
    expect(s.yawSource).toBe('published')
    expect(s.verdict).toBe('lenta')
  })

  it('classifies a fast setup', () => {
    expect(summarizeFromSens(cs2, 800, 2).verdict).toBe('rapida')
  })
})

describe('summarizeFromEdpi', () => {
  it('inverts edpi into the game sensitivity', () => {
    const s = summarizeFromEdpi(ow2, 800, 4000)
    expect(s.sens).toBeCloseTo(5, 6)
    expect(s.sensQuantized.value).toBe(5)
    expect(s.cm360).toBeCloseTo(34.6363, 4)
    expect(s.normalizedEdpi).toBeCloseTo(1200, 6)
  })

  it('reports the quantization error for integer scales', () => {
    const s = summarizeFromEdpi(ow2, 800, 4618.1818)
    expect(s.sens).toBeCloseTo(5.7727, 4)
    expect(s.sensQuantized.value).toBe(6)
    expect(s.sensQuantized.errorPct).toBeCloseTo(3.9375, 3)
  })
})

describe('summarizeFromCm360', () => {
  it('inverts cm/360 into sens and edpi', () => {
    const s = summarizeFromCm360(cs2, 800, 51.9545)
    expect(s.sens).toBeCloseTo(1, 5)
    expect(s.edpi).toBeCloseTo(800, 3)
  })
})

describe('resolveYaw', () => {
  it('uses the published yaw when there is no override', () => {
    expect(resolveYaw(cs2)).toEqual({ yaw: 0.022, source: 'published' })
  })

  it('prefers the override and marks it as calibrated', () => {
    expect(resolveYaw(cs2, 0.0215)).toEqual({ yaw: 0.0215, source: 'calibrated' })
  })

  it('throws for tier C games without a calibration', () => {
    expect(() => resolveYaw(pubg)).toThrow(/calibra/i)
  })

  it('accepts a tier C game once calibrated', () => {
    expect(resolveYaw(pubg, 0.0008)).toEqual({ yaw: 0.0008, source: 'calibrated' })
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/summary.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/index`.

- [ ] **Step 3: Implementar**

`lib/index.ts`:

```ts
import type { Game } from './types'
import {
  cm360FromSens,
  cmToInches,
  countsPer360,
  degPerCount,
  edpiFromSens,
  sensFromCm360,
  sensFromEdpi
} from './math/core'
import { normalizedEdpi } from './math/convert'
import { quantizeSens, type QuantizedSens } from './math/quantize'

export * from './types'
export * from './games'
export * from './math/core'
export * from './math/convert'
export * from './math/quantize'
export * from './math/calibrate'
export * from './math/fov'

export type YawSource = 'published' | 'calibrated'
export type SpeedVerdict = 'lenta' | 'media' | 'rapida' | 'muy-rapida'

export interface SensSummary {
  game: Game
  dpi: number
  sens: number
  sensQuantized: QuantizedSens
  edpi: number
  normalizedEdpi: number
  cm360: number
  in360: number
  countsPer360: number
  degPerCount: number
  yaw: number
  yawSource: YawSource
  verdict: SpeedVerdict
}

export function resolveYaw(game: Game, yawOverride?: number): { yaw: number; source: YawSource } {
  if (yawOverride !== undefined) {
    if (!Number.isFinite(yawOverride) || yawOverride <= 0) {
      throw new RangeError(`yawOverride must be a finite positive number, received ${yawOverride}`)
    }
    return { yaw: yawOverride, source: 'calibrated' }
  }

  if (game.yaw === null) {
    throw new Error(`${game.name} no tiene una constante fiable publicada. Calibra el juego para usarlo.`)
  }

  return { yaw: game.yaw, source: 'published' }
}

export function classifySpeed(cm360: number): SpeedVerdict {
  if (cm360 < 20) return 'muy-rapida'
  if (cm360 < 35) return 'rapida'
  if (cm360 <= 50) return 'media'
  return 'lenta'
}

export function summarizeFromSens(game: Game, dpi: number, sens: number, yawOverride?: number): SensSummary {
  const { yaw, source } = resolveYaw(game, yawOverride)
  const edpi = edpiFromSens(dpi, sens)
  const cm360 = cm360FromSens(dpi, sens, yaw)

  return {
    game,
    dpi,
    sens,
    sensQuantized: quantizeSens(sens, game.input),
    edpi,
    normalizedEdpi: normalizedEdpi(edpi, yaw),
    cm360,
    in360: cmToInches(cm360),
    countsPer360: countsPer360(sens, yaw),
    degPerCount: degPerCount(sens, yaw),
    yaw,
    yawSource: source,
    verdict: classifySpeed(cm360)
  }
}

export function summarizeFromEdpi(game: Game, dpi: number, edpi: number, yawOverride?: number): SensSummary {
  return summarizeFromSens(game, dpi, sensFromEdpi(dpi, edpi), yawOverride)
}

export function summarizeFromCm360(game: Game, dpi: number, cm360: number, yawOverride?: number): SensSummary {
  const { yaw } = resolveYaw(game, yawOverride)
  return summarizeFromSens(game, dpi, sensFromCm360(dpi, cm360, yaw), yawOverride)
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run`
Esperado: PASS, toda la suite en verde.

- [ ] **Step 5: Commit**

```bash
git add lib/index.ts tests/summary.spec.ts
git commit -m "feat: expose high-level sensitivity summary api"
```

---

### Task 9: Store de ajustes con persistencia

**Files:**
- Create: `app/stores/settings.ts`
- Test: `tests/settings.spec.ts`

**Interfaces:**
- Consumes: `lib/index.ts`.
- Produce store Pinia `useSettingsStore` con:
  - state: `dpi: number` (800), `gameSlug: string` ('cs2'), `mode: 'sens-to-edpi' | 'edpi-to-sens'`, `sens: number` (1), `edpi: number` (800), `calibrations: Record<string, number>`
  - getters: `game`, `yawOverride`, `summary` (o `null` si el cálculo lanza), `error: string | null`
  - actions: `setGame(slug)`, `setDpi(v)`, `setSens(v)`, `setEdpi(v)`, `setMode(m)`, `saveCalibration(slug, yaw)`, `clearCalibration(slug)`, `hydrate()`, `persist()`

`hydrate`/`persist` usan `localStorage` bajo la clave `sens-calc:v1` y no hacen nada si `window` no existe.

- [ ] **Step 1: Escribir el test que falla**

`tests/settings.spec.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'

describe('settings store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts on cs2 at 800 dpi', () => {
    const store = useSettingsStore()
    expect(store.gameSlug).toBe('cs2')
    expect(store.dpi).toBe(800)
    expect(store.summary?.cm360).toBeCloseTo(51.9545, 4)
  })

  it('keeps sens and edpi in sync when the mode changes', () => {
    const store = useSettingsStore()
    store.setSens(2)
    expect(store.edpi).toBeCloseTo(1600, 6)
    store.setEdpi(400)
    expect(store.sens).toBeCloseTo(0.5, 6)
  })

  it('recomputes edpi when the dpi changes in sens mode', () => {
    const store = useSettingsStore()
    store.setMode('sens-to-edpi')
    store.setSens(1)
    store.setDpi(1600)
    expect(store.edpi).toBeCloseTo(1600, 6)
  })

  it('recomputes sens when the dpi changes in edpi mode', () => {
    const store = useSettingsStore()
    store.setMode('edpi-to-sens')
    store.setEdpi(800)
    store.setDpi(1600)
    expect(store.sens).toBeCloseTo(0.5, 6)
  })

  it('surfaces an error for tier C games without calibration', () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    expect(store.summary).toBeNull()
    expect(store.error).toMatch(/calibra/i)
  })

  it('uses a saved calibration as the yaw', () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    store.saveCalibration('pubg', 0.0008)
    expect(store.error).toBeNull()
    expect(store.summary?.yaw).toBeCloseTo(0.0008, 8)
    expect(store.summary?.yawSource).toBe('calibrated')
  })

  it('persists and rehydrates', () => {
    const store = useSettingsStore()
    store.setDpi(1600)
    store.setGame('valorant')
    store.saveCalibration('pubg', 0.0008)

    setActivePinia(createPinia())
    const fresh = useSettingsStore()
    fresh.hydrate()
    expect(fresh.dpi).toBe(1600)
    expect(fresh.gameSlug).toBe('valorant')
    expect(fresh.calibrations.pubg).toBeCloseTo(0.0008, 8)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/settings.spec.ts`
Esperado: FAIL, no se resuelve `~/stores/settings`.

- [ ] **Step 3: Implementar**

`app/stores/settings.ts`:

```ts
import { defineStore } from 'pinia'
import { getGame, summarizeFromSens, type Game, type SensSummary } from '~~/lib/index'

const STORAGE_KEY = 'sens-calc:v1'

export type CalculatorMode = 'sens-to-edpi' | 'edpi-to-sens'

interface SettingsState {
  dpi: number
  gameSlug: string
  mode: CalculatorMode
  sens: number
  edpi: number
  calibrations: Record<string, number>
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    dpi: 800,
    gameSlug: 'cs2',
    mode: 'sens-to-edpi',
    sens: 1,
    edpi: 800,
    calibrations: {}
  }),

  getters: {
    game(state): Game {
      return getGame(state.gameSlug) ?? getGame('cs2')!
    },

    yawOverride(state): number | undefined {
      return state.calibrations[state.gameSlug]
    },

    summary(): SensSummary | null {
      try {
        return summarizeFromSens(this.game, this.dpi, this.sens, this.yawOverride)
      } catch {
        return null
      }
    },

    error(): string | null {
      try {
        summarizeFromSens(this.game, this.dpi, this.sens, this.yawOverride)
        return null
      } catch (err) {
        return err instanceof Error ? err.message : 'Error de cálculo'
      }
    }
  },

  actions: {
    setGame(slug: string) {
      this.gameSlug = slug
      this.persist()
    },

    setDpi(value: number) {
      if (!Number.isFinite(value) || value <= 0) return
      this.dpi = value
      if (this.mode === 'sens-to-edpi') {
        this.edpi = this.dpi * this.sens
      } else {
        this.sens = this.edpi / this.dpi
      }
      this.persist()
    },

    setSens(value: number) {
      if (!Number.isFinite(value) || value <= 0) return
      this.sens = value
      this.edpi = this.dpi * value
      this.persist()
    },

    setEdpi(value: number) {
      if (!Number.isFinite(value) || value <= 0) return
      this.edpi = value
      this.sens = value / this.dpi
      this.persist()
    },

    setMode(mode: CalculatorMode) {
      this.mode = mode
      this.persist()
    },

    saveCalibration(slug: string, yaw: number) {
      if (!Number.isFinite(yaw) || yaw <= 0) return
      this.calibrations = { ...this.calibrations, [slug]: yaw }
      this.persist()
    },

    clearCalibration(slug: string) {
      const next = { ...this.calibrations }
      delete next[slug]
      this.calibrations = next
      this.persist()
    },

    persist() {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          dpi: this.dpi,
          gameSlug: this.gameSlug,
          mode: this.mode,
          sens: this.sens,
          edpi: this.edpi,
          calibrations: this.calibrations
        })
      )
    },

    hydrate() {
      if (typeof window === 'undefined') return
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as Partial<SettingsState>
        if (typeof parsed.dpi === 'number') this.dpi = parsed.dpi
        if (typeof parsed.gameSlug === 'string') this.gameSlug = parsed.gameSlug
        if (parsed.mode === 'sens-to-edpi' || parsed.mode === 'edpi-to-sens') this.mode = parsed.mode
        if (typeof parsed.sens === 'number') this.sens = parsed.sens
        if (typeof parsed.edpi === 'number') this.edpi = parsed.edpi
        if (parsed.calibrations && typeof parsed.calibrations === 'object') {
          this.calibrations = parsed.calibrations as Record<string, number>
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }
})
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/settings.spec.ts`
Esperado: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add app/stores/settings.ts tests/settings.spec.ts
git commit -m "feat: add persisted settings store"
```

---

### Task 10: Componentes de selección y confianza

**Files:**
- Create: `app/components/ConfidenceMark.vue`, `app/components/GameSelect.vue`
- Test: `tests/components/ConfidenceMark.spec.ts`, `tests/components/GameSelect.spec.ts`

**Interfaces:**
- Consumes: `Game`, `Confidence` de `lib/types.ts`; `GAMES` de `lib/games.ts`.
- Produce:
  - `ConfidenceMark` con props `{ confidence: Confidence; note?: string }`. Renderiza el código de nivel en la familia de datos y la palabra: `Verificado` (A), `Sin confirmar` (B), `Requiere calibración` (C), más un `title` con la nota.
  - `GameSelect` con props `{ modelValue: string }`, emite `update:modelValue` con el slug. Agrupa las opciones por nivel de confianza.

**Diseño:** el nivel de confianza no es un semáforo (prohibición 4). Se distingue por la palabra y por el código en la familia mono. El único color permitido es `text-index`, y solo en el nivel C, porque es el único que cambia lo que el usuario puede hacer. Sin píldora, sin fondo, sin borde redondeado (prohibición 19).

- [ ] **Step 1: Escribir los tests que fallan**

`tests/components/ConfidenceMark.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfidenceMark from '~/components/ConfidenceMark.vue'

describe('ConfidenceMark', () => {
  it('labels tier A as verified', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'A' } }).text()).toContain('Verificado')
  })

  it('labels tier B as unconfirmed', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'B' } }).text()).toContain('Sin confirmar')
  })

  it('labels tier C as needing calibration', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'C' } }).text()).toContain('Requiere calibración')
  })

  it('shows the tier code in the data face', () => {
    const wrapper = mount(ConfidenceMark, { props: { confidence: 'B' } })
    expect(wrapper.find('.data').text()).toBe('B')
  })

  it('exposes the note as a title attribute', () => {
    const wrapper = mount(ConfidenceMark, { props: { confidence: 'B', note: 'Fuente única' } })
    expect(wrapper.attributes('title')).toBe('Fuente única')
  })

  it('uses the accent colour only on tier C', () => {
    expect(mount(ConfidenceMark, { props: { confidence: 'A' } }).html()).not.toContain('text-index')
    expect(mount(ConfidenceMark, { props: { confidence: 'B' } }).html()).not.toContain('text-index')
    expect(mount(ConfidenceMark, { props: { confidence: 'C' } }).html()).toContain('text-index')
  })

  it('never renders a pill or a rounded corner', () => {
    for (const confidence of ['A', 'B', 'C'] as const) {
      expect(mount(ConfidenceMark, { props: { confidence } }).html()).not.toMatch(/rounded/)
    }
  })
})
```

`tests/components/GameSelect.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameSelect from '~/components/GameSelect.vue'
import { GAMES } from '~~/lib/games'

describe('GameSelect', () => {
  it('renders one option per game', () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'cs2' } })
    expect(wrapper.findAll('option')).toHaveLength(GAMES.length)
  })

  it('groups options by confidence tier', () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'cs2' } })
    expect(wrapper.findAll('optgroup')).toHaveLength(3)
  })

  it('emits the selected slug', async () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'cs2' } })
    await wrapper.find('select').setValue('valorant')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['valorant'])
  })

  it('reflects the current value', () => {
    const wrapper = mount(GameSelect, { props: { modelValue: 'valorant' } })
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('valorant')
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/components`
Esperado: FAIL, no se resuelven los componentes.

- [ ] **Step 3: Implementar `ConfidenceMark.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Confidence } from '~~/lib/types'

const props = defineProps<{ confidence: Confidence; note?: string }>()

const label = computed(() => {
  if (props.confidence === 'A') return 'Verificado'
  if (props.confidence === 'B') return 'Sin confirmar'
  return 'Requiere calibración'
})

const tone = computed(() => (props.confidence === 'C' ? 'text-index' : 'text-ink-2'))
</script>

<template>
  <span :title="note" :class="['inline-flex items-baseline gap-2 text-2xs', tone]">
    <span class="data border border-current px-1 leading-none">{{ confidence }}</span>
    <span class="eyebrow" :class="tone">{{ label }}</span>
  </span>
</template>
```

- [ ] **Step 4: Implementar `GameSelect.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { GAMES } from '~~/lib/games'
import type { Confidence } from '~~/lib/types'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const groups: { tier: Confidence; label: string }[] = [
  { tier: 'A', label: 'Datos verificados' },
  { tier: 'B', label: 'Sin confirmar' },
  { tier: 'C', label: 'Requieren calibración' }
]

const byTier = computed(() =>
  groups.map(group => ({
    ...group,
    games: GAMES.filter(game => game.confidence === group.tier)
  }))
)

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <select :value="modelValue" aria-label="Juego" class="field text-sm" @change="onChange">
    <optgroup v-for="group in byTier" :key="group.tier" :label="group.label">
      <option v-for="game in group.games" :key="game.slug" :value="game.slug">
        {{ game.name }}
      </option>
    </optgroup>
  </select>
</template>
```

- [ ] **Step 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/components`
Esperado: PASS, 11 tests.

- [ ] **Step 6: Commit**

```bash
git add app/components tests/components
git commit -m "feat: add game selector and confidence mark components"
```

---

### Task 11: Calculadora bidireccional

**Files:**
- Create: `app/components/EdpiCalculator.vue`
- Test: `tests/components/EdpiCalculator.spec.ts`

**Interfaces:**
- Consumes: `useSettingsStore`, `GameSelect`.
- Produce: `EdpiCalculator` sin props. Contiene: `GameSelect`, campo DPI (`data-test="dpi"`), conmutador de modo (`data-test="mode-sens"` / `data-test="mode-edpi"`), campo de sensibilidad (`data-test="sens"`) y campo de eDPI (`data-test="edpi"`). En modo `sens-to-edpi` el campo eDPI es de solo lectura, y al revés.

- [ ] **Step 1: Escribir el test que falla**

`tests/components/EdpiCalculator.spec.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import EdpiCalculator from '~/components/EdpiCalculator.vue'
import { useSettingsStore } from '~/stores/settings'

function mountCalculator() {
  return mount(EdpiCalculator)
}

describe('EdpiCalculator', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('computes edpi from sens', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="sens"]').setValue('2')
    expect(useSettingsStore().edpi).toBeCloseTo(1600, 6)
  })

  it('computes sens from edpi', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="mode-edpi"]').trigger('click')
    await wrapper.find('[data-test="edpi"]').setValue('400')
    expect(useSettingsStore().sens).toBeCloseTo(0.5, 6)
  })

  it('marks the derived field as readonly', async () => {
    const wrapper = mountCalculator()
    expect(wrapper.find('[data-test="edpi"]').attributes('readonly')).toBeDefined()
    await wrapper.find('[data-test="mode-edpi"]').trigger('click')
    expect(wrapper.find('[data-test="sens"]').attributes('readonly')).toBeDefined()
  })

  it('updates the store when the dpi changes', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="dpi"]').setValue('1600')
    expect(useSettingsStore().dpi).toBe(1600)
  })

  it('ignores non-positive input', async () => {
    const wrapper = mountCalculator()
    await wrapper.find('[data-test="sens"]').setValue('0')
    expect(useSettingsStore().sens).toBe(1)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/components/EdpiCalculator.spec.ts`
Esperado: FAIL, no se resuelve el componente.

- [ ] **Step 3: Implementar**

`app/components/EdpiCalculator.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { formatSens } from '~~/lib/math/quantize'
import GameSelect from '~/components/GameSelect.vue'

const store = useSettingsStore()

const isSensMode = computed(() => store.mode === 'sens-to-edpi')
const sensLabel = computed(() => (store.game.scaleLabel === '%' ? 'Sensibilidad (%)' : 'Sensibilidad'))
const sensDisplay = computed(() => (isSensMode.value ? String(store.sens) : formatSens(store.sens, store.game.input)))

function readNumber(event: Event): number {
  return Number((event.target as HTMLInputElement).value)
}
</script>

<template>
  <section class="panel grid gap-4 p-5">
    <p class="eyebrow">Entrada</p>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="game">Juego</label>
      <GameSelect id="game" :model-value="store.gameSlug" @update:model-value="store.setGame" />
    </div>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="dpi">DPI del ratón</label>
      <input
        id="dpi"
        data-test="dpi"
        type="number"
        min="1"
        step="1"
        :value="store.dpi"
        class="field"
        @input="store.setDpi(readNumber($event))"
      >
    </div>

    <div class="grid grid-cols-2" role="group" aria-label="Modo de cálculo">
      <button
        data-test="mode-sens"
        type="button"
        class="btn border-r-0 text-xs"
        :aria-pressed="isSensMode"
        @click="store.setMode('sens-to-edpi')"
      >
        Sensibilidad a eDPI
      </button>
      <button
        data-test="mode-edpi"
        type="button"
        class="btn text-xs"
        :aria-pressed="!isSensMode"
        @click="store.setMode('edpi-to-sens')"
      >
        eDPI a sensibilidad
      </button>
    </div>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="sens">{{ sensLabel }}</label>
      <input
        id="sens"
        data-test="sens"
        type="number"
        :min="store.game.input.min"
        :max="store.game.input.max"
        :step="store.game.input.step || 'any'"
        :readonly="!isSensMode"
        :value="sensDisplay"
        class="field"
        @input="store.setSens(readNumber($event))"
      >
    </div>

    <div class="grid gap-2">
      <label class="text-xs text-ink-2" for="edpi">eDPI</label>
      <input
        id="edpi"
        data-test="edpi"
        type="number"
        min="1"
        step="any"
        :readonly="isSensMode"
        :value="Number(store.edpi.toFixed(2))"
        class="field"
        @input="store.setEdpi(readNumber($event))"
      >
    </div>
  </section>
</template>
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/components/EdpiCalculator.spec.ts`
Esperado: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add app/components/EdpiCalculator.vue tests/components/EdpiCalculator.spec.ts
git commit -m "feat: add bidirectional edpi calculator component"
```

---

### Task 11B: Barra de escala (elemento distintivo)

Se ejecuta entre la Task 11 y la Task 12, porque la Task 12 la consume.

**Files:**
- Create: `lib/scale.ts`, `app/components/ScaleBar.vue`
- Test: `tests/scale.spec.ts`, `tests/components/ScaleBar.spec.ts`

**Interfaces:**
- Consumes: nada de tareas previas.
- Produce:
  - `interface ScaleGeometry { cm360: number; padWidthCm: number; indexPct: number; overflows: boolean; padWidths: number; majorTicks: number[]; minorTicks: number[] }`
  - `buildScale(cm360: number, padWidthCm?: number): ScaleGeometry` con `padWidthCm` por defecto 45.
  - `ScaleBar` con props `{ cm360: number; padWidthCm?: number }`.

**Diseño:** es el único elemento con protagonismo de toda la web. Una regla horizontal a ancho completo con marca cada centímetro, marca larga y numerada cada 5 cm, y una marca de índice en `--color-index` en la posición del cm/360 del usuario. Cuando el giro no cabe en el ancho de alfombrilla de referencia, la regla se desvanece por el extremo derecho y se indica cuántos anchos de alfombrilla hacen falta. Es el único degradado permitido en el sitio y el único movimiento: la marca de índice se desplaza en 180 ms.

- [ ] **Step 1: Escribir el test de geometría que falla**

`tests/scale.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildScale } from '~~/lib/scale'

describe('buildScale', () => {
  it('places the index proportionally inside the pad', () => {
    const scale = buildScale(30)
    expect(scale.padWidthCm).toBe(45)
    expect(scale.indexPct).toBeCloseTo(66.6667, 3)
    expect(scale.overflows).toBe(false)
    expect(scale.padWidths).toBeCloseTo(0.6667, 4)
  })

  it('clamps and flags a turn wider than the pad', () => {
    const scale = buildScale(51.9545)
    expect(scale.indexPct).toBe(100)
    expect(scale.overflows).toBe(true)
    expect(scale.padWidths).toBeCloseTo(1.1545, 4)
  })

  it('emits a labelled tick every five centimetres', () => {
    expect(buildScale(30).majorTicks).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45])
  })

  it('emits an unlabelled tick on every other centimetre', () => {
    const scale = buildScale(30)
    expect(scale.minorTicks).toHaveLength(36)
    expect(scale.minorTicks).not.toContain(5)
    expect(scale.minorTicks).toContain(6)
  })

  it('accepts a custom pad width', () => {
    const scale = buildScale(30, 60)
    expect(scale.indexPct).toBeCloseTo(50, 6)
    expect(scale.majorTicks.at(-1)).toBe(60)
  })

  it('rejects invalid input', () => {
    expect(() => buildScale(0)).toThrow(RangeError)
    expect(() => buildScale(30, 0)).toThrow(RangeError)
    expect(() => buildScale(Number.NaN)).toThrow(RangeError)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/scale.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/scale`.

- [ ] **Step 3: Implementar la geometría**

`lib/scale.ts`:

```ts
export interface ScaleGeometry {
  cm360: number
  padWidthCm: number
  indexPct: number
  overflows: boolean
  padWidths: number
  majorTicks: number[]
  minorTicks: number[]
}

export const DEFAULT_PAD_WIDTH_CM = 45
export const MAJOR_TICK_EVERY_CM = 5

function requirePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number, received ${value}`)
  }
  return value
}

export function buildScale(cm360: number, padWidthCm: number = DEFAULT_PAD_WIDTH_CM): ScaleGeometry {
  const turn = requirePositive(cm360, 'cm360')
  const pad = requirePositive(padWidthCm, 'padWidthCm')

  const majorTicks: number[] = []
  const minorTicks: number[] = []

  for (let cm = 0; cm <= Math.floor(pad); cm += 1) {
    if (cm % MAJOR_TICK_EVERY_CM === 0) {
      majorTicks.push(cm)
    } else {
      minorTicks.push(cm)
    }
  }

  return {
    cm360: turn,
    padWidthCm: pad,
    indexPct: Math.min(turn / pad, 1) * 100,
    overflows: turn > pad,
    padWidths: turn / pad,
    majorTicks,
    minorTicks
  }
}
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/scale.spec.ts`
Esperado: PASS, 6 tests.

- [ ] **Step 5: Escribir el test del componente que falla**

`tests/components/ScaleBar.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScaleBar from '~/components/ScaleBar.vue'

describe('ScaleBar', () => {
  it('positions the index mark at the measured distance', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 22.5 } })
    expect(wrapper.find('[data-test="index"]').attributes('style')).toContain('50%')
  })

  it('draws every centimetre tick', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 30 } })
    expect(wrapper.findAll('[data-test="tick"]')).toHaveLength(46)
  })

  it('reports how many pad widths a long turn needs', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 90 } })
    expect(wrapper.find('[data-test="overflow"]').text()).toContain('2')
  })

  it('hides the overflow note when the turn fits', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 30 } })
    expect(wrapper.find('[data-test="overflow"]').exists()).toBe(false)
  })

  it('states the measured distance for assistive technology', () => {
    const wrapper = mount(ScaleBar, { props: { cm360: 30 } })
    expect(wrapper.attributes('aria-label')).toContain('30')
  })
})
```

- [ ] **Step 6: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/components/ScaleBar.spec.ts`
Esperado: FAIL, no se resuelve el componente.

- [ ] **Step 7: Implementar el componente**

`app/components/ScaleBar.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { buildScale } from '~~/lib/scale'

const props = defineProps<{ cm360: number; padWidthCm?: number }>()

const scale = computed(() => buildScale(props.cm360, props.padWidthCm))
const label = computed(
  () => `Recorrido de ${scale.value.cm360.toFixed(1)} centímetros sobre una alfombrilla de ${scale.value.padWidthCm} centímetros`
)

function pct(cm: number): string {
  return `${(cm / scale.value.padWidthCm) * 100}%`
}
</script>

<template>
  <figure class="grid gap-3" role="img" :aria-label="label">
    <p class="eyebrow">Recorrido para un giro completo</p>

    <p class="display text-xl leading-none">
      {{ scale.cm360.toFixed(1) }}<span class="data text-md text-ink-2"> cm</span>
    </p>

    <div class="relative h-16 border-b border-ink">
      <span
        v-for="cm in scale.minorTicks"
        :key="`m${cm}`"
        data-test="tick"
        class="absolute bottom-0 w-px bg-rule"
        :style="{ left: pct(cm), height: '10px' }"
      />
      <template v-for="cm in scale.majorTicks" :key="`M${cm}`">
        <span
          data-test="tick"
          class="absolute bottom-0 w-px bg-ink"
          :style="{ left: pct(cm), height: '20px' }"
        />
        <span class="data absolute bottom-6 text-2xs text-ink-2" :style="{ left: pct(cm) }">{{ cm }}</span>
      </template>

      <span
        data-test="index"
        class="absolute bottom-0 h-16 w-0.5 bg-index"
        :style="{ left: `${scale.indexPct}%`, transition: 'left 180ms linear' }"
      />

      <span
        v-if="scale.overflows"
        class="pointer-events-none absolute inset-y-0 right-0 w-16"
        style="background: linear-gradient(to right, transparent, var(--color-paper))"
      />
    </div>

    <figcaption v-if="scale.overflows" data-test="overflow" class="text-xs text-index">
      Ese giro no cabe en una alfombrilla de {{ scale.padWidthCm }} cm. Necesitas
      {{ scale.padWidths.toFixed(2) }} anchos de alfombrilla, o levantar el ratón.
    </figcaption>
  </figure>
</template>
```

- [ ] **Step 8: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/components/ScaleBar.spec.ts`
Esperado: PASS, 5 tests.

- [ ] **Step 9: Commit**

```bash
git add lib/scale.ts app/components/ScaleBar.vue tests/scale.spec.ts tests/components/ScaleBar.spec.ts
git commit -m "feat: add real-scale turn distance ruler"
```

---

### Task 12: Panel de resultados

**Files:**
- Create: `app/components/ResultCard.vue`
- Test: `tests/components/ResultCard.spec.ts`

**Interfaces:**
- Consumes: `SensSummary` de `lib/index.ts`, `ConfidenceMark`, `ScaleBar`.
- Produce: `ResultCard` con props `{ summary: SensSummary | null; error: string | null }`. Muestra `data-test="cm360"`, `data-test="edpi"`, `data-test="normalized"`, `data-test="sens-exact"`, `data-test="sens-usable"`, `data-test="quantize-warning"` (solo si `errorPct > 0.5`), `data-test="pro-range"` (solo si el juego declara `proEdpi`) y `data-test="error"` (solo si hay error).

**Diseño:** la barra de escala va arriba y es lo primero que se lee. Debajo, los datos van en una **lista de definición de dos columnas** al estilo de una hoja de especificaciones: etiqueta a la izquierda en la familia mono en versalitas, cifra a la derecha alineada, separadas por un filete de 1 px. No hay rejilla de tarjetas (prohibiciones 6 y 13). El aviso de cuantización se marca con una etiqueta en versalitas sobre el texto, sin franja lateral de color (prohibición 11). El bloque tiene altura reservada para que la rehidratación no mueva el layout (prohibición 21).

- [ ] **Step 1: Escribir el test que falla**

`tests/components/ResultCard.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultCard from '~/components/ResultCard.vue'
import { getGame, summarizeFromSens, summarizeFromEdpi } from '~~/lib/index'

const cs2 = getGame('cs2')!
const ow2 = getGame('overwatch-2')!

describe('ResultCard', () => {
  it('shows cm/360, edpi and normalized edpi', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="cm360"]').text()).toContain('51.95')
    expect(wrapper.find('[data-test="edpi"]').text()).toContain('800')
    expect(wrapper.find('[data-test="normalized"]').text()).toContain('800')
  })

  it('warns when the usable value differs from the exact one', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromEdpi(ow2, 800, 4618.1818), error: null }
    })
    expect(wrapper.find('[data-test="sens-usable"]').text()).toContain('6')
    expect(wrapper.find('[data-test="quantize-warning"]').exists()).toBe(true)
  })

  it('hides the warning when quantization is negligible', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="quantize-warning"]').exists()).toBe(false)
  })

  it('renders the pro range when the game declares one', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="pro-range"]').text()).toContain('800')
  })

  it('renders the error instead of results', () => {
    const wrapper = mount(ResultCard, { props: { summary: null, error: 'Calibra el juego' } })
    expect(wrapper.find('[data-test="error"]').text()).toContain('Calibra el juego')
    expect(wrapper.find('[data-test="cm360"]').exists()).toBe(false)
  })

  it('leads with the scale bar', () => {
    const wrapper = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    })
    expect(wrapper.find('[data-test="index"]').exists()).toBe(true)
  })

  it('honours the design constraints', () => {
    const html = mount(ResultCard, {
      props: { summary: summarizeFromSens(cs2, 800, 1), error: null }
    }).html()
    expect(html).not.toMatch(/rounded/)
    expect(html).not.toMatch(/shadow/)
    expect(html).not.toContain('—')
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/components/ResultCard.spec.ts`
Esperado: FAIL, no se resuelve el componente.

- [ ] **Step 3: Implementar**

`app/components/ResultCard.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { SensSummary } from '~~/lib/index'
import { formatSens } from '~~/lib/math/quantize'
import ConfidenceMark from '~/components/ConfidenceMark.vue'
import ScaleBar from '~/components/ScaleBar.vue'

const props = defineProps<{ summary: SensSummary | null; error: string | null }>()

const showQuantizeWarning = computed(() => (props.summary?.sensQuantized.errorPct ?? 0) > 0.5)

const verdictLabel: Record<string, string> = {
  'muy-rapida': 'Muy rápida',
  rapida: 'Rápida',
  media: 'Media',
  lenta: 'Lenta'
}

function round(value: number, digits: number): string {
  return value.toFixed(digits)
}

const rows = computed(() => {
  const s = props.summary
  if (!s) return []

  return [
    { key: 'cm360', label: 'cm por giro', value: `${round(s.cm360, 2)} cm` },
    { key: 'in360', label: 'pulgadas por giro', value: `${round(s.in360, 2)} in` },
    { key: 'edpi', label: 'eDPI', value: round(s.edpi, 0) },
    { key: 'normalized', label: 'eDPI equivalente en CS2', value: round(s.normalizedEdpi, 0) },
    { key: 'sens-exact', label: 'Sensibilidad exacta', value: round(s.sens, 6) },
    {
      key: 'sens-usable',
      label: 'Valor a escribir en el juego',
      value: formatSens(s.sensQuantized.value, s.game.input)
    },
    { key: 'counts', label: 'Cuentas por giro', value: round(s.countsPer360, 0) },
    { key: 'speed', label: 'Velocidad', value: verdictLabel[s.verdict] },
    {
      key: 'yaw',
      label: s.yawSource === 'calibrated' ? 'Yaw calibrado por ti' : 'Yaw publicado',
      value: String(s.yaw)
    }
  ]
})
</script>

<template>
  <section class="panel grid content-start gap-6 p-5 min-h-[32rem]">
    <p v-if="error" data-test="error" class="text-sm text-index">
      <span class="eyebrow block text-index">Sin resultado</span>
      {{ error }}
    </p>

    <template v-else-if="summary">
      <header class="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
        <h2 class="text-md font-semibold">{{ summary.game.name }}</h2>
        <ConfidenceMark :confidence="summary.game.confidence" :note="summary.game.confidenceNote" />
      </header>

      <ScaleBar :cm360="summary.cm360" />

      <dl class="grid">
        <div
          v-for="row in rows"
          :key="row.key"
          :data-test="row.key"
          class="flex items-baseline justify-between gap-4 border-b border-rule py-2"
        >
          <dt class="eyebrow">{{ row.label }}</dt>
          <dd class="data text-sm">{{ row.value }}</dd>
        </div>
      </dl>

      <p v-if="showQuantizeWarning" data-test="quantize-warning" class="text-xs">
        <span class="eyebrow block text-index">Valor no introducible</span>
        {{ summary.game.name }} no admite el valor exacto. El más cercano que sí acepta se desvía un
        {{ round(summary.sensQuantized.errorPct, 2) }} % de tu objetivo.
      </p>

      <p v-if="summary.game.proEdpi" data-test="pro-range" class="text-xs text-ink-2">
        <span class="eyebrow block">Referencia</span>
        Los profesionales se mueven entre {{ summary.game.proEdpi.low }} y
        {{ summary.game.proEdpi.high }} eDPI. El valor más habitual es {{ summary.game.proEdpi.typical }}.
      </p>
    </template>
  </section>
</template>
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/components/ResultCard.spec.ts`
Esperado: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add app/components/ResultCard.vue tests/components/ResultCard.spec.ts
git commit -m "feat: add result panel with quantization warning"
```

---

### Task 13: Conversión entre juegos en la interfaz

**Files:**
- Create: `app/components/ConverterPanel.vue`
- Test: `tests/components/ConverterPanel.spec.ts`

**Interfaces:**
- Consumes: `useSettingsStore`, `convertSens`, `quantizeSens`, `tierAGames`.
- Produce: `ConverterPanel` sin props. Muestra una fila por cada juego Tier A distinto del actual, con `data-test="row-<slug>"`, indicando el valor equivalente. Toma el DPI y la sensibilidad actuales del store.

- [ ] **Step 1: Escribir el test que falla**

`tests/components/ConverterPanel.spec.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ConverterPanel from '~/components/ConverterPanel.vue'
import { useSettingsStore } from '~/stores/settings'
import { tierAGames } from '~~/lib/games'

describe('ConverterPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('lists every tier A game except the current one', () => {
    const wrapper = mount(ConverterPanel)
    expect(wrapper.findAll('[data-test^="row-"]')).toHaveLength(tierAGames().length - 1)
    expect(wrapper.find('[data-test="row-cs2"]').exists()).toBe(false)
  })

  it('converts cs2 sens 1 into valorant 0.314', () => {
    const store = useSettingsStore()
    store.setSens(1)
    const wrapper = mount(ConverterPanel)
    expect(wrapper.find('[data-test="row-valorant"]').text()).toContain('0.314')
  })

  it('converts cs2 sens 1 into overwatch 3', () => {
    const store = useSettingsStore()
    store.setSens(1)
    const wrapper = mount(ConverterPanel)
    expect(wrapper.find('[data-test="row-overwatch-2"]').text()).toContain('3')
  })

  it('renders nothing when the current game has no usable yaw', () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    const wrapper = mount(ConverterPanel)
    expect(wrapper.findAll('[data-test^="row-"]')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/components/ConverterPanel.spec.ts`
Esperado: FAIL, no se resuelve el componente.

- [ ] **Step 3: Implementar**

`app/components/ConverterPanel.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { tierAGames } from '~~/lib/games'
import { convertSens } from '~~/lib/math/convert'
import { quantizeSens, formatSens } from '~~/lib/math/quantize'

const store = useSettingsStore()

const rows = computed(() => {
  const summary = store.summary
  if (!summary) return []

  return tierAGames()
    .filter(game => game.slug !== summary.game.slug && game.yaw !== null)
    .map(game => {
      const exact = convertSens({
        sens: summary.sens,
        fromYaw: summary.yaw,
        toYaw: game.yaw as number,
        fromDpi: store.dpi,
        toDpi: store.dpi
      })
      const quantized = quantizeSens(exact, game.input)

      return {
        slug: game.slug,
        name: game.name,
        scaleLabel: game.scaleLabel,
        exact,
        usable: formatSens(quantized.value, game.input),
        errorPct: quantized.errorPct
      }
    })
})
</script>

<template>
  <section class="panel grid gap-3 p-5">
    <p class="eyebrow">Equivalencias</p>
    <h2 class="text-md font-semibold">La misma sensibilidad en otros juegos</h2>
    <p class="text-xs text-ink-2">Mismo DPI ({{ store.dpi }}) y mismo recorrido por giro en todos.</p>

    <ul class="grid">
      <li
        v-for="row in rows"
        :key="row.slug"
        :data-test="`row-${row.slug}`"
        class="flex items-baseline justify-between gap-4 border-b border-rule py-2"
      >
        <span class="text-xs">{{ row.name }}</span>
        <span class="data text-right text-sm">
          {{ row.usable }}<span v-if="row.scaleLabel === '%'"> %</span>
          <span v-if="row.errorPct > 0.5" class="block text-2xs text-ink-2">
            exacto {{ row.exact.toFixed(4) }}
          </span>
        </span>
      </li>
    </ul>
  </section>
</template>
```

- [ ] **Step 4: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/components/ConverterPanel.spec.ts`
Esperado: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add app/components/ConverterPanel.vue tests/components/ConverterPanel.spec.ts
git commit -m "feat: add cross-game conversion panel"
```

---

### Task 14: Calibración y checklist de sistema

**Files:**
- Create: `app/components/CalibrationDialog.vue`, `app/components/SystemChecklist.vue`
- Test: `tests/components/CalibrationDialog.spec.ts`

**Interfaces:**
- Consumes: `useSettingsStore`, `yawFromMeasurement`.
- Produce:
  - `CalibrationDialog` sin props. Campos `data-test="cal-sens"`, `data-test="cal-cm"`, `data-test="cal-turns"`, botón `data-test="cal-save"`. Al guardar llama a `store.saveCalibration(store.gameSlug, yaw)`. Muestra `data-test="cal-yaw"` con el yaw calculado en vivo.
  - `SystemChecklist` sin props: lista estática con los puntos de la spec §7.

- [ ] **Step 1: Escribir el test que falla**

`tests/components/CalibrationDialog.spec.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CalibrationDialog from '~/components/CalibrationDialog.vue'
import { useSettingsStore } from '~/stores/settings'

describe('CalibrationDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('derives the yaw from the measurement', async () => {
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-sens"]').setValue('1')
    await wrapper.find('[data-test="cal-cm"]').setValue('51.9545')
    expect(wrapper.find('[data-test="cal-yaw"]').text()).toContain('0.022')
  })

  it('divides by the number of turns', async () => {
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-sens"]').setValue('1')
    await wrapper.find('[data-test="cal-cm"]').setValue('519.545')
    await wrapper.find('[data-test="cal-turns"]').setValue('10')
    expect(wrapper.find('[data-test="cal-yaw"]').text()).toContain('0.022')
  })

  it('saves the calibration into the store', async () => {
    const store = useSettingsStore()
    store.setGame('pubg')
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-sens"]').setValue('50')
    await wrapper.find('[data-test="cal-cm"]').setValue('30')
    await wrapper.find('[data-test="cal-save"]').trigger('click')
    expect(store.calibrations.pubg).toBeGreaterThan(0)
    expect(store.error).toBeNull()
  })

  it('does not save an incomplete measurement', async () => {
    const store = useSettingsStore()
    const wrapper = mount(CalibrationDialog)
    await wrapper.find('[data-test="cal-save"]').trigger('click')
    expect(Object.keys(store.calibrations)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/components/CalibrationDialog.spec.ts`
Esperado: FAIL, no se resuelve el componente.

- [ ] **Step 3: Implementar `CalibrationDialog.vue`**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { yawFromMeasurement } from '~~/lib/math/calibrate'

const store = useSettingsStore()

const sens = ref<number | null>(null)
const measuredCm = ref<number | null>(null)
const turns = ref(1)

const yaw = computed(() => {
  if (!sens.value || !measuredCm.value) return null
  try {
    return yawFromMeasurement({
      dpi: store.dpi,
      sens: sens.value,
      measuredCm: measuredCm.value,
      turns: turns.value
    })
  } catch {
    return null
  }
})

function save() {
  if (yaw.value === null) return
  store.saveCalibration(store.gameSlug, yaw.value)
}
</script>

<template>
  <section class="panel grid gap-3 p-5">
    <p class="eyebrow">Medición</p>
    <h2 class="text-md font-semibold">Calibrar {{ store.game.name }}</h2>

    <ol class="data grid gap-1 text-xs text-ink-2">
      <li>1. Deja el DPI en {{ store.dpi }}, Windows en 6/11 y sin aceleración.</li>
      <li>2. Pon en el juego la sensibilidad que vayas a indicar aquí.</li>
      <li>3. Marca un punto de referencia en pantalla y otro en la alfombrilla.</li>
      <li>4. Gira las vueltas indicadas y mide los centímetros recorridos.</li>
    </ol>

    <label class="text-xs text-ink-2" for="cal-sens">Sensibilidad usada</label>
    <input
      id="cal-sens"
      data-test="cal-sens"
      type="number"
      step="any"
      class="field"
      @input="sens = Number(($event.target as HTMLInputElement).value)"
    >

    <label class="text-xs text-ink-2" for="cal-cm">Distancia total medida en cm</label>
    <input
      id="cal-cm"
      data-test="cal-cm"
      type="number"
      step="any"
      class="field"
      @input="measuredCm = Number(($event.target as HTMLInputElement).value)"
    >

    <label class="text-xs text-ink-2" for="cal-turns">Vueltas completas</label>
    <input
      id="cal-turns"
      data-test="cal-turns"
      type="number"
      min="1"
      step="1"
      :value="turns"
      class="field"
      @input="turns = Number(($event.target as HTMLInputElement).value)"
    >

    <p data-test="cal-yaw" class="flex items-baseline justify-between border-b border-rule py-2">
      <span class="eyebrow">Yaw calculado</span>
      <span class="data text-sm">{{ yaw === null ? 'sin datos' : yaw.toFixed(6) }}</span>
    </p>

    <button
      data-test="cal-save"
      type="button"
      class="btn text-xs disabled:text-ink-2"
      :disabled="yaw === null"
      @click="save"
    >
      Guardar calibración
    </button>
  </section>
</template>
```

- [ ] **Step 4: Implementar `SystemChecklist.vue`**

```vue
<script setup lang="ts">
const items = [
  { label: 'Puntero de Windows', value: 'En 6/11, que es el multiplicador 1.0.' },
  { label: 'Precisión del puntero', value: 'Desactivada. Es aceleración.' },
  { label: 'Aceleración del juego', value: 'Desactivada.' },
  { label: 'Raw input', value: 'Activado.' },
  { label: 'DPI real', value: 'Puede desviarse entre un 1 y un 5 % del nominal.' },
  { label: 'Tasa de sondeo', value: 'No cambia el recorrido por giro. No la toques por esto.' }
]
</script>

<template>
  <section class="panel grid gap-2 p-5">
    <p class="eyebrow">Condiciones</p>
    <h2 class="text-md font-semibold">Antes de fiarte del resultado</h2>
    <dl class="grid">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-baseline justify-between gap-4 border-b border-rule py-2"
      >
        <dt class="eyebrow">{{ item.label }}</dt>
        <dd class="text-xs text-ink-2">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
```

- [ ] **Step 5: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run tests/components/CalibrationDialog.spec.ts`
Esperado: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add app/components/CalibrationDialog.vue app/components/SystemChecklist.vue tests/components/CalibrationDialog.spec.ts
git commit -m "feat: add empirical calibration dialog and system checklist"
```

---

### Task 15: Estado en la URL y página principal

**Files:**
- Create: `app/composables/useUrlState.ts`, `app/pages/index.vue`
- Test: `tests/urlstate.spec.ts`

**Interfaces:**
- Consumes: `useSettingsStore`.
- Produce:
  - `encodeState(state: { game: string; dpi: number; sens: number; mode: string }): string` — devuelve un query string sin `?`.
  - `decodeState(query: Record<string, string | undefined>): Partial<{ game: string; dpi: number; sens: number; mode: string }>` — descarta valores no válidos.
  - `useUrlState()` — composable que sincroniza el store con la ruta actual usando `useRoute`/`useRouter` de Nuxt.
  - `app/pages/index.vue` monta `EdpiCalculator`, `ResultCard`, `ConverterPanel`, `CalibrationDialog` y `SystemChecklist`.

Las funciones `encodeState`/`decodeState` son puras y viven en el mismo fichero para poder testearse sin Nuxt.

- [ ] **Step 1: Escribir el test que falla**

`tests/urlstate.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { encodeState, decodeState } from '~/composables/useUrlState'

describe('encodeState', () => {
  it('serializes the full state', () => {
    const encoded = encodeState({ game: 'valorant', dpi: 800, sens: 0.314, mode: 'sens-to-edpi' })
    expect(encoded).toBe('game=valorant&dpi=800&sens=0.314&mode=sens-to-edpi')
  })
})

describe('decodeState', () => {
  it('parses valid values', () => {
    expect(decodeState({ game: 'cs2', dpi: '1600', sens: '2', mode: 'edpi-to-sens' }))
      .toEqual({ game: 'cs2', dpi: 1600, sens: 2, mode: 'edpi-to-sens' })
  })

  it('drops unknown games', () => {
    expect(decodeState({ game: 'nope' })).toEqual({})
  })

  it('drops non-positive numbers', () => {
    expect(decodeState({ dpi: '0', sens: '-1' })).toEqual({})
  })

  it('drops unknown modes', () => {
    expect(decodeState({ mode: 'weird' })).toEqual({})
  })

  it('returns an empty object for an empty query', () => {
    expect(decodeState({})).toEqual({})
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/urlstate.spec.ts`
Esperado: FAIL, no se resuelve el composable.

- [ ] **Step 3: Implementar el composable**

`app/composables/useUrlState.ts`:

```ts
import { watch } from 'vue'
import { getGame } from '~~/lib/games'
import { useSettingsStore, type CalculatorMode } from '~/stores/settings'

export interface UrlState {
  game: string
  dpi: number
  sens: number
  mode: string
}

export function encodeState(state: UrlState): string {
  return new URLSearchParams({
    game: state.game,
    dpi: String(state.dpi),
    sens: String(state.sens),
    mode: state.mode
  }).toString()
}

export function decodeState(query: Record<string, string | undefined>): Partial<UrlState> {
  const result: Partial<UrlState> = {}

  if (query.game && getGame(query.game)) {
    result.game = query.game
  }

  const dpi = Number(query.dpi)
  if (query.dpi !== undefined && Number.isFinite(dpi) && dpi > 0) {
    result.dpi = dpi
  }

  const sens = Number(query.sens)
  if (query.sens !== undefined && Number.isFinite(sens) && sens > 0) {
    result.sens = sens
  }

  if (query.mode === 'sens-to-edpi' || query.mode === 'edpi-to-sens') {
    result.mode = query.mode
  }

  return result
}

export function useUrlState() {
  const store = useSettingsStore()
  const route = useRoute()
  const router = useRouter()

  const incoming = decodeState(route.query as Record<string, string | undefined>)
  if (incoming.game) store.setGame(incoming.game)
  if (incoming.dpi) store.setDpi(incoming.dpi)
  if (incoming.sens) store.setSens(incoming.sens)
  if (incoming.mode) store.setMode(incoming.mode as CalculatorMode)

  watch(
    () => [store.gameSlug, store.dpi, store.sens, store.mode],
    () => {
      router.replace({
        query: {
          game: store.gameSlug,
          dpi: String(store.dpi),
          sens: String(store.sens),
          mode: store.mode
        }
      })
    }
  )
}
```

- [ ] **Step 4: Implementar la página principal**

`app/pages/index.vue`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useUrlState } from '~/composables/useUrlState'
import EdpiCalculator from '~/components/EdpiCalculator.vue'
import ResultCard from '~/components/ResultCard.vue'
import ConverterPanel from '~/components/ConverterPanel.vue'
import CalibrationDialog from '~/components/CalibrationDialog.vue'
import SystemChecklist from '~/components/SystemChecklist.vue'

const store = useSettingsStore()

onMounted(() => {
  store.hydrate()
})

useUrlState()

useHead({
  title: 'Calculadora de eDPI y sensibilidad para juegos de PC',
  meta: [
    {
      name: 'description',
      content:
        'Calcula tu eDPI a partir de la sensibilidad, o la sensibilidad que necesitas para un eDPI objetivo, en CS2, Valorant, Apex, Overwatch 2, Fortnite y más.'
    }
  ]
})
</script>

<template>
  <main class="mx-auto grid max-w-5xl gap-8 px-4 py-10">
    <header class="grid gap-2 border-b border-ink pb-4">
      <p class="eyebrow">Instrumento de medida</p>
      <h1 class="text-lg">Calculadora de eDPI y sensibilidad</h1>
      <p class="max-w-prose text-xs text-ink-2">
        Elige tu juego y calcula en las dos direcciones: de sensibilidad a eDPI y de eDPI a
        sensibilidad. Cada juego indica cuánta confianza merece su constante.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-2">
      <EdpiCalculator />
      <ResultCard :summary="store.summary" :error="store.error" />
    </div>

    <ConverterPanel />

    <div class="grid gap-8 lg:grid-cols-2">
      <SystemChecklist />
      <CalibrationDialog />
    </div>
  </main>
</template>
```

`app/app.vue` queda así, sin clases de color propias: el fondo y la tinta ya vienen de `html` en `main.css`.

```vue
<template>
  <div class="min-h-screen">
    <NuxtPage />
  </div>
</template>
```

- [ ] **Step 5: Ejecutar los tests y arrancar el servidor**

Ejecutar: `npx vitest run`
Esperado: PASS, toda la suite.

Ejecutar: `npm run dev` y abrir `http://localhost:3000`.
Esperado: la calculadora carga en CS2, 800 DPI, sens 1 y muestra 51.95 cm/360. Cambiar a modo eDPI → Sensibilidad y escribir 4000 con Overwatch 2 seleccionado debe dar sens 5.

- [ ] **Step 6: Commit**

```bash
git add app/composables/useUrlState.ts app/pages/index.vue app/app.vue tests/urlstate.spec.ts
git commit -m "feat: assemble home page with shareable url state"
```

---

### Task 16: Páginas SEO por juego y por par de juegos

**Files:**
- Create: `app/pages/juego/[slug].vue`, `app/pages/convertir/[from]/[to].vue`
- Modify: `nuxt.config.ts`
- Test: `tests/routes.spec.ts`

**Interfaces:**
- Consumes: `GAMES`, `tierAGames`, `getGame`, `convertSens`.
- Produce:
  - `buildPrerenderRoutes(): string[]` exportada desde `lib/routes.ts`: `/`, más `/juego/<slug>` por cada juego, más `/convertir/<from>/<to>` por cada par ordenado de juegos Tier A distintos entre sí.

- [ ] **Step 1: Escribir el test que falla**

`tests/routes.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildPrerenderRoutes } from '~~/lib/routes'
import { GAMES, tierAGames } from '~~/lib/games'

describe('buildPrerenderRoutes', () => {
  const routes = buildPrerenderRoutes()

  it('includes the home page', () => {
    expect(routes).toContain('/')
  })

  it('includes the legal pages', () => {
    expect(routes).toContain('/terminos')
    expect(routes).toContain('/privacidad')
  })

  it('includes one page per game', () => {
    for (const game of GAMES) {
      expect(routes).toContain(`/juego/${game.slug}`)
    }
  })

  it('includes every ordered tier A pair', () => {
    const n = tierAGames().length
    const pairs = routes.filter(route => route.startsWith('/convertir/'))
    expect(pairs).toHaveLength(n * (n - 1))
    expect(routes).toContain('/convertir/cs2/valorant')
    expect(routes).toContain('/convertir/valorant/cs2')
  })

  it('never pairs a game with itself', () => {
    expect(routes).not.toContain('/convertir/cs2/cs2')
  })

  it('has no duplicates', () => {
    expect(new Set(routes).size).toBe(routes.length)
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/routes.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/routes`.

- [ ] **Step 3: Implementar el generador de rutas**

`lib/routes.ts`:

```ts
import { GAMES, tierAGames } from './games'

export function buildPrerenderRoutes(): string[] {
  const routes = ['/', '/terminos', '/privacidad']

  for (const game of GAMES) {
    routes.push(`/juego/${game.slug}`)
  }

  const tierA = tierAGames()
  for (const from of tierA) {
    for (const to of tierA) {
      if (from.slug === to.slug) continue
      routes.push(`/convertir/${from.slug}/${to.slug}`)
    }
  }

  return routes
}
```

- [ ] **Step 4: Conectar el prerender en `nuxt.config.ts`**

Añadir a la configuración existente:

```ts
import tailwindcss from '@tailwindcss/vite'
import { buildPrerenderRoutes } from './lib/routes'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  typescript: { strict: true },
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: buildPrerenderRoutes()
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  }
})
```

- [ ] **Step 5: Implementar `app/pages/juego/[slug].vue`**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { getGame } from '~~/lib/games'
import { useSettingsStore } from '~/stores/settings'
import EdpiCalculator from '~/components/EdpiCalculator.vue'
import ResultCard from '~/components/ResultCard.vue'
import ConverterPanel from '~/components/ConverterPanel.vue'

const route = useRoute()
const slug = String(route.params.slug)
const game = getGame(slug)

if (!game) {
  throw createError({ statusCode: 404, statusMessage: 'Juego no encontrado' })
}

const store = useSettingsStore()
store.setGame(game.slug)

onMounted(() => {
  store.hydrate()
  store.setGame(game.slug)
})

useHead({
  title: `Calculadora de eDPI y sensibilidad de ${game.name}`,
  meta: [
    {
      name: 'description',
      content: `Calcula el eDPI y la sensibilidad de ${game.name}, incluido el cm/360 y el valor exacto que debes escribir en el juego.`
    }
  ]
})
</script>

<template>
  <main class="mx-auto grid max-w-5xl gap-8 px-4 py-10">
    <header class="grid gap-2 border-b border-ink pb-4">
      <p class="eyebrow">{{ game!.engine }}</p>
      <h1 class="text-lg">Calculadora de eDPI de {{ game!.name }}</h1>
    </header>
    <div class="grid gap-8 lg:grid-cols-2">
      <EdpiCalculator />
      <ResultCard :summary="store.summary" :error="store.error" />
    </div>
    <ConverterPanel />
  </main>
</template>
```

- [ ] **Step 6: Implementar `app/pages/convertir/[from]/[to].vue`**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { getGame } from '~~/lib/games'
import { convertSens } from '~~/lib/math/convert'
import { quantizeSens, formatSens } from '~~/lib/math/quantize'
import { cm360FromSens } from '~~/lib/math/core'
import ScaleBar from '~/components/ScaleBar.vue'

const route = useRoute()
const from = getGame(String(route.params.from))
const to = getGame(String(route.params.to))

if (!from || !to || from.yaw === null || to.yaw === null) {
  throw createError({ statusCode: 404, statusMessage: 'Conversión no disponible' })
}

const dpi = ref(800)
const sens = ref(1)

const result = computed(() => {
  const exact = convertSens({ sens: sens.value, fromYaw: from!.yaw as number, toYaw: to!.yaw as number })
  const quantized = quantizeSens(exact, to!.input)
  return {
    exact,
    usable: formatSens(quantized.value, to!.input),
    errorPct: quantized.errorPct,
    cm360: cm360FromSens(dpi.value, sens.value, from!.yaw as number)
  }
})

useHead({
  title: `Convertir sensibilidad de ${from!.name} a ${to!.name}`,
  meta: [
    {
      name: 'description',
      content: `Convierte tu sensibilidad de ${from!.name} a ${to!.name} manteniendo el mismo cm/360.`
    }
  ]
})
</script>

<template>
  <main class="mx-auto grid max-w-3xl gap-8 px-4 py-10">
    <header class="grid gap-2 border-b border-ink pb-4">
      <p class="eyebrow">Conversión</p>
      <h1 class="text-lg">De {{ from!.name }} a {{ to!.name }}</h1>
    </header>

    <div class="panel grid gap-3 p-5">
      <label class="text-xs text-ink-2" for="conv-dpi">DPI</label>
      <input
        id="conv-dpi"
        type="number"
        min="1"
        :value="dpi"
        class="field"
        @input="dpi = Number(($event.target as HTMLInputElement).value)"
      >

      <label class="text-xs text-ink-2" for="conv-sens">Sensibilidad en {{ from!.name }}</label>
      <input
        id="conv-sens"
        type="number"
        step="any"
        :value="sens"
        class="field"
        @input="sens = Number(($event.target as HTMLInputElement).value)"
      >

      <p class="eyebrow border-t border-rule pt-3">Sensibilidad en {{ to!.name }}</p>
      <p class="display text-xl leading-none">
        {{ result.usable }}<span v-if="to!.scaleLabel === '%'" class="data text-md text-ink-2"> %</span>
      </p>

      <ScaleBar :cm360="result.cm360" />

      <p class="data text-2xs text-ink-2">
        Valor exacto {{ result.exact.toFixed(6) }}
      </p>
    </div>

    <NuxtLink to="/" class="text-xs underline">Ir a la calculadora completa</NuxtLink>
  </main>
</template>
```

- [ ] **Step 7: Ejecutar los tests y generar el sitio**

Ejecutar: `npx vitest run`
Esperado: PASS, toda la suite.

Ejecutar: `npm run generate`
Esperado: build correcto y `.output/public` con `index.html`, un directorio por juego bajo `juego/` y los pares bajo `convertir/`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: prerender per-game and per-pair seo pages"
```

---

### Task 16B: Páginas legales y pie de sitio

Cubre las prohibiciones 26 y 27. Se ejecuta entre la Task 16 y la Task 17.

**Antes de empezar:** preguntar al usuario el correo de contacto del operador del sitio y la jurisdicción aplicable. Si no responde, usar `contacto@` con el dominio del sitio y legislación española, y dejarlo anotado en el commit.

**Files:**
- Create: `lib/site.ts`, `app/components/SiteFooter.vue`, `app/pages/terminos.vue`, `app/pages/privacidad.vue`
- Modify: `app/app.vue`
- Test: `tests/components/SiteFooter.spec.ts`

**Interfaces:**
- Consumes: nada.
- Produce:
  - `lib/site.ts` con `export const SITE_CONTACT_EMAIL: string` y `export const SITE_JURISDICTION: string`.
  - `SiteFooter` sin props, con enlaces a `/terminos` y `/privacidad`.

**Contenido:** los textos legales describen el sitio tal como es. No se calcula nada en servidor, no hay cuentas, no hay cookies y el único almacenamiento es `localStorage` en el navegador del usuario. Los términos incluyen la limitación de responsabilidad que este producto sí necesita de verdad: las constantes de nivel B y C pueden ser incorrectas y el usuario debe verificarlas midiendo.

- [ ] **Step 1: Escribir el test que falla**

`tests/components/SiteFooter.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteFooter from '~/components/SiteFooter.vue'
import { SITE_CONTACT_EMAIL } from '~~/lib/site'

const stubs = { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }

describe('SiteFooter', () => {
  it('links to the terms page', () => {
    const wrapper = mount(SiteFooter, { global: { stubs } })
    expect(wrapper.find('a[href="/terminos"]').exists()).toBe(true)
  })

  it('links to the privacy page', () => {
    const wrapper = mount(SiteFooter, { global: { stubs } })
    expect(wrapper.find('a[href="/privacidad"]').exists()).toBe(true)
  })

  it('shows the contact address', () => {
    const wrapper = mount(SiteFooter, { global: { stubs } })
    expect(wrapper.text()).toContain(SITE_CONTACT_EMAIL)
  })

  it('honours the design constraints', () => {
    const html = mount(SiteFooter, { global: { stubs } }).html()
    expect(html).not.toMatch(/rounded/)
    expect(html).not.toContain('—')
  })
})
```

- [ ] **Step 2: Ejecutar y comprobar que falla**

Ejecutar: `npx vitest run tests/components/SiteFooter.spec.ts`
Esperado: FAIL, no se resuelve `~~/lib/site`.

- [ ] **Step 3: Implementar la configuración y el pie**

`lib/site.ts` — sustituir por los valores reales acordados con el usuario:

```ts
export const SITE_NAME = 'Calculadora de eDPI'
export const SITE_CONTACT_EMAIL = 'contacto@edpi.example'
export const SITE_JURISDICTION = 'España'
```

`app/components/SiteFooter.vue`:

```vue
<script setup lang="ts">
import { SITE_CONTACT_EMAIL, SITE_NAME } from '~~/lib/site'
</script>

<template>
  <footer class="mx-auto grid max-w-5xl gap-2 border-t border-ink px-4 py-6">
    <p class="eyebrow">{{ SITE_NAME }}</p>
    <nav class="flex flex-wrap gap-4 text-xs">
      <NuxtLink to="/terminos" class="underline">Términos de servicio</NuxtLink>
      <NuxtLink to="/privacidad" class="underline">Política de privacidad</NuxtLink>
    </nav>
    <p class="text-xs text-ink-2">
      Sin cuentas, sin cookies y sin seguimiento. Escribe a {{ SITE_CONTACT_EMAIL }}.
    </p>
  </footer>
</template>
```

- [ ] **Step 4: Implementar `app/pages/terminos.vue`**

```vue
<script setup lang="ts">
import { SITE_JURISDICTION, SITE_CONTACT_EMAIL, SITE_NAME } from '~~/lib/site'

useHead({
  title: 'Términos de servicio',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<template>
  <main class="mx-auto grid max-w-2xl gap-4 px-4 py-10">
    <header class="grid gap-2 border-b border-ink pb-4">
      <p class="eyebrow">Condiciones de uso</p>
      <h1 class="text-lg">Términos de servicio</h1>
    </header>

    <h2 class="text-sm font-semibold">Qué es este sitio</h2>
    <p class="text-xs text-ink-2">
      {{ SITE_NAME }} es una herramienta de cálculo gratuita. Convierte valores de sensibilidad de
      ratón entre juegos y calcula el recorrido físico necesario para un giro completo. No requiere
      registro y no vende ningún producto.
    </p>

    <h2 class="text-sm font-semibold">Exactitud de los datos</h2>
    <p class="text-xs text-ink-2">
      Las constantes de cada juego proceden de documentación de comunidad y de mediciones propias.
      Cada juego lleva un nivel de confianza visible. Los de nivel B pueden contener errores y los de
      nivel C no tienen constante publicada porque las fuentes disponibles se contradicen. Antes de
      competir con un valor calculado aquí, verifícalo midiendo en tu propio equipo con la función de
      calibración.
    </p>

    <h2 class="text-sm font-semibold">Límite de responsabilidad</h2>
    <p class="text-xs text-ink-2">
      El servicio se ofrece tal cual, sin garantía de exactitud ni de disponibilidad. No respondemos
      de decisiones tomadas a partir de los resultados, ni de cambios que los desarrolladores de cada
      juego introduzcan en sus escalas de sensibilidad.
    </p>

    <h2 class="text-sm font-semibold">Marcas de terceros</h2>
    <p class="text-xs text-ink-2">
      Los nombres de juegos citados pertenecen a sus titulares. Se usan para identificar a qué juego
      aplica cada cálculo. Este sitio no está afiliado a ninguno de ellos ni patrocinado por ellos.
    </p>

    <h2 class="text-sm font-semibold">Uso aceptable</h2>
    <p class="text-xs text-ink-2">
      Puedes usar la herramienta y enlazar sus resultados libremente. No está permitido automatizar
      peticiones masivas ni republicar la base de datos de constantes como si fuera propia.
    </p>

    <h2 class="text-sm font-semibold">Legislación aplicable</h2>
    <p class="text-xs text-ink-2">
      Estos términos se rigen por la legislación de {{ SITE_JURISDICTION }}. Para cualquier consulta,
      escribe a {{ SITE_CONTACT_EMAIL }}.
    </p>
  </main>
</template>
```

- [ ] **Step 5: Implementar `app/pages/privacidad.vue`**

```vue
<script setup lang="ts">
import { SITE_CONTACT_EMAIL } from '~~/lib/site'

useHead({
  title: 'Política de privacidad',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<template>
  <main class="mx-auto grid max-w-2xl gap-4 px-4 py-10">
    <header class="grid gap-2 border-b border-ink pb-4">
      <p class="eyebrow">Datos personales</p>
      <h1 class="text-lg">Política de privacidad</h1>
    </header>

    <h2 class="text-sm font-semibold">Qué datos recogemos</h2>
    <p class="text-xs text-ink-2">
      Ninguno. No hay cuentas, ni formularios de registro, ni analítica, ni píxeles de seguimiento,
      ni cookies de terceros.
    </p>

    <h2 class="text-sm font-semibold">Qué se guarda en tu navegador</h2>
    <p class="text-xs text-ink-2">
      Tus ajustes de DPI, juego, sensibilidad y calibraciones se guardan en el almacenamiento local
      de tu navegador, bajo la clave sens-calc:v1. Esa información no sale de tu equipo y no llega a
      ningún servidor. Puedes borrarla vaciando los datos del sitio desde tu navegador.
    </p>

    <h2 class="text-sm font-semibold">Cómo se sirve la web</h2>
    <p class="text-xs text-ink-2">
      El sitio es un conjunto de ficheros estáticos. Todo el cálculo se ejecuta en tu navegador. El
      proveedor de alojamiento puede registrar direcciones IP en sus propios registros técnicos, por
      necesidad de operación y por el tiempo que fije su política.
    </p>

    <h2 class="text-sm font-semibold">Enlaces que compartes</h2>
    <p class="text-xs text-ink-2">
      La calculadora refleja tus valores en la dirección de la página para que puedas compartirla. Si
      envías ese enlace a alguien, esa persona verá los valores que contiene. No se registra en
      ningún sitio quién comparte qué.
    </p>

    <h2 class="text-sm font-semibold">Contacto</h2>
    <p class="text-xs text-ink-2">
      Para cualquier duda sobre esta política, escribe a {{ SITE_CONTACT_EMAIL }}.
    </p>
  </main>
</template>
```

- [ ] **Step 6: Añadir el pie a `app/app.vue`**

```vue
<script setup lang="ts">
import SiteFooter from '~/components/SiteFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <div class="grow">
      <NuxtPage />
    </div>
    <SiteFooter />
  </div>
</template>
```

- [ ] **Step 7: Ejecutar y comprobar que pasa**

Ejecutar: `npx vitest run`
Esperado: PASS, toda la suite.

Ejecutar: `npm run generate`
Esperado: `.output/public/terminos/index.html` y `.output/public/privacidad/index.html` existen.

- [ ] **Step 8: Commit**

```bash
git add lib/site.ts app/components/SiteFooter.vue app/pages/terminos.vue app/pages/privacidad.vue app/app.vue tests/components/SiteFooter.spec.ts
git commit -m "feat: add terms, privacy policy and site footer"
```

---

### Task 17: Cierre — README y verificación final

**Files:**
- Create: `README.md`
- Test: toda la suite existente.

**Interfaces:**
- Consumes: todo lo anterior.
- Produce: documentación de arranque y verificación de que el proyecto entero funciona.

- [ ] **Step 1: Escribir el README**

`README.md`:

```markdown
# Calculadora de eDPI y sensibilidad

Web para calcular la sensibilidad de ratón en juegos de PC en las dos direcciones
(sensibilidad → eDPI y eDPI → sensibilidad), con cm/360, conversión entre juegos
y calibración empírica.

## Requisitos

Node.js >= 20.19

## Comandos

    npm install
    npm run dev        # servidor de desarrollo
    npm test           # suite de tests
    npm run generate   # sitio estático en .output/public

## Estructura

- `lib/` — núcleo matemático en TypeScript puro, sin dependencias de Vue.
- `app/` — capa Nuxt 4: páginas, componentes y store.
- `tests/` — Vitest, con los vectores de prueba de la especificación.

## Diseño

Todo el color, el tipo y la geometría viven en `app/assets/css/main.css`. No se
añaden colores ni tamaños fuera de esos tokens. Radio de borde cero en todo el
sitio, sin sombras, sin librería de iconos, con una sola animación: la marca de
índice de la barra de escala. Las restricciones completas están en la sección
«Dirección de diseño» de `PLAN-IMPLEMENTACION.md` y se auditan con los `grep` de
la Task 17.

## Documentación

- `INVESTIGACION-SENSIBILIDAD.md` — modelo matemático, constantes yaw por juego con
  nivel de confianza, y metodología de verificación.
- `PLAN-IMPLEMENTACION.md` — plan de construcción.

## Sobre los datos

Cada juego lleva un nivel de confianza. Los de nivel C no tienen constante publicada
porque las fuentes disponibles se contradicen; para esos, la web ofrece calibración
medida por el propio usuario.
```

- [ ] **Step 2: Verificación completa**

```bash
npx vitest run
npm run generate
```
Esperado: suite en verde y generación sin errores.

Comprobar manualmente con `npm run preview`:
- CS2, 800 DPI, sens 1 → 51.95 cm/360, eDPI 800.
- Overwatch 2 en modo eDPI → Sensibilidad, eDPI 4618 → sensibilidad exacta 5.77 y valor a escribir 6 con aviso de desviación.
- PUBG seleccionado → mensaje de calibración requerida, sin resultados.
- Calibrar PUBG con DPI 800, sens 50 y 30 cm → aparecen resultados.
- Compartir la URL con `?game=valorant&dpi=800&sens=0.314` → carga con esos valores.
- El pie enlaza a `/terminos` y `/privacidad`, y ambas cargan.

- [ ] **Step 3: Auditoría de diseño**

Comprobaciones automáticas sobre el código fuente. Todas deben devolver cero coincidencias:

```bash
grep -rn "rounded" app/ || echo OK
grep -rn "shadow" app/ || echo OK
grep -rn "backdrop-blur\|backdrop-filter" app/ || echo OK
grep -rn "—" app/ || echo OK
grep -rniE "inter|geist|space grotesk" app/ public/ || echo OK
grep -rniE "emerald|violet|purple|fuchsia|cyan|lime" app/ || echo OK
grep -rn "transition" app/ | grep -v "ScaleBar" || echo OK
```

La única coincidencia admitida en la última es la transición de 180 ms de la marca de índice en `ScaleBar.vue`.

Revisión manual contra la tabla de prohibiciones:

- Fondo `#d8dcda`, no blanco puro ni negro.
- Ningún borde redondeado en ningún control, incluidos `select` y botones.
- El nivel de confianza no forma un semáforo: solo el nivel C lleva color.
- Ninguna fila de tres tarjetas. Los datos son una lista de definición de dos columnas.
- Ningún icono, emoji, destello, orbe, rejilla de puntos ni ventana de terminal.
- Sin testimonios, sin precios, sin sección de características.
- El primer elemento interactivo de la página es la propia calculadora.
- La barra de escala no salta al rehidratar desde `localStorage`.
- Con `prefers-reduced-motion: reduce` activo, la marca de índice no se anima.
- Con el teclado: `Tab` recorre todos los controles y el foco siempre se ve.
- A 360 px de ancho no hay desbordamiento horizontal.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add project readme"
```

---

## Autorrevisión del plan

**Cobertura de la especificación:**

| Sección de la spec | Tarea que la implementa |
|---|---|
| §3 Modelo matemático | Task 3 |
| §3.4 Conversión entre juegos | Task 5, Task 13, Task 16 |
| §3.5 eDPI normalizado | Task 5, Task 12 |
| §4 Tabla de yaw + niveles de confianza | Task 2, Task 10 |
| §5 Cuantización | Task 4, Task 12 |
| §7 Factores del sistema | Task 14 (`SystemChecklist`) |
| §8 Calibración empírica | Task 6, Task 9, Task 14 |
| §9 ADS / zoom | Task 7 (núcleo listo; la interfaz queda para v2, decisión §12.6) |
| §10 Rangos orientativos | Task 2 (`proEdpi`), Task 12 (`pro-range`) |
| §11 Vectores de prueba | Tasks 3, 4, 5, 6, 7, 8 |
| §12.1 cm/360 como eje | Task 3, Task 8, Task 11B |
| §12.2 Confianza visible | Task 10, Task 12 |

**Cobertura de la dirección de diseño:**

| Requisito | Tarea |
|---|---|
| Tokens de color, tipo y geometría | Task 1 |
| Radio 0 forzado globalmente | Task 1 (`border-radius: 0 !important`) |
| Sin semáforo de confianza (prohibición 4) | Task 10 |
| Sin fila de tres tarjetas ni bento (6, 13) | Task 12 |
| Elemento distintivo, demo real, animación única (18, 25, 28) | Task 11B |
| Términos de servicio (26) | Task 16B |
| Política de privacidad (27) | Task 16B |
| Auditoría final de las 30 prohibiciones | Task 17, Step 3 |

**Fuera de alcance declarado (v2):** interfaz de sensibilidad con zoom/miras, dataset de FOV de ópticas, comparativa con ajustes de jugadores profesionales concretos, versión en inglés del sitio.

**Consistencia de tipos:** `Game`, `SensInputSpec` y `Confidence` se definen en Task 2 y se consumen sin cambios en las Tasks 4, 8, 9, 10, 12 y 13. `QuantizedSens` se define en Task 4 y se consume en las Tasks 8, 12 y 13. `SensSummary` se define en Task 8 y se consume en las Tasks 9, 12 y 13. `REFERENCE_YAW` se define en Task 2 y se consume en Task 5. `ScaleGeometry` y `buildScale` se definen en Task 11B y se consumen en la Task 12 y en la página de conversión de la Task 16.

**Orden de ejecución:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, **11B**, 12, 13, 14, 15, 16, **16B**, 17.

---

## Handoff de ejecución

Dos opciones para ejecutar este plan:

1. **Dirigido por subagentes (recomendado)** — un subagente nuevo por tarea, con revisión entre tareas. Sub-skill: `superpowers:subagent-driven-development`.
2. **Ejecución en línea** — las tareas se ejecutan en la misma sesión, por lotes con puntos de control. Sub-skill: `superpowers:executing-plans`.
