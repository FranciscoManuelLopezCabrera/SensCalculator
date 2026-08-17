# Investigación: Matemática de sensibilidad de ratón y eDPI en juegos de PC

> Documento de investigación técnica que sirve de **especificación funcional** para la calculadora de eDPI / sensibilidad.
> Fecha de investigación: 2026-08-17.
> Documento hermano: `PLAN-IMPLEMENTACION.md` (plan de construcción de la web).

---

## 1. Resumen ejecutivo

- Todo motor de FPS traduce cuentas de ratón (*counts*) a grados de rotación mediante una constante llamada **yaw** (grados girados por cuenta cuando la sensibilidad in-game vale 1).
- Con esa constante, **toda** la matemática de sensibilidad es una única fórmula lineal invertible en cuatro direcciones (sens, eDPI, DPI, cm/360).
- **eDPI (`DPI × sens`) solo es comparable dentro del mismo juego.** Comparar eDPI entre juegos distintos es un error conceptual muy extendido. La magnitud realmente universal es **cm/360**.
- La web debe ofrecer las dos direcciones pedidas (sens → eDPI y eDPI → sens) y, además, la conversión entre juegos, porque es la misma matemática y es la funcionalidad que aporta valor real.
- **Hallazgo crítico de la investigación:** la mayoría de páginas que publican tablas de yaw son contenido SEO generado y **se contradicen entre sí** (ver §6). Por eso este documento clasifica cada juego en niveles de confianza (A/B/C) y la app incluye **calibración empírica** para los casos dudosos. Publicar una constante inventada como si fuera un dato verificado es el fallo de producto más grave posible en esta categoría.

---

## 2. Glosario

| Término | Definición |
|---|---|
| **DPI / CPI** | Cuentas que reporta el sensor por pulgada de movimiento físico. El nombre correcto es CPI; la industria usa DPI. |
| **counts** | Unidad discreta de movimiento que el ratón envía al SO. |
| **sens** | Valor de sensibilidad configurado dentro del juego. Su escala es arbitraria y propia de cada juego. |
| **yaw** | Grados de rotación horizontal por cuenta de ratón **con sens = 1**. Constante del motor. |
| **pitch** | Equivalente vertical. En casi todos los motores `pitch == yaw` (ratio Y/X = 1). |
| **eDPI** | *Effective DPI* = `DPI × sens`. Normaliza el DPI dentro de un mismo juego. |
| **cm/360** | Centímetros de movimiento físico necesarios para girar 360°. **Magnitud universal entre juegos.** |
| **in/360** | Lo mismo en pulgadas. `cm/360 = in/360 × 2.54`. |
| **ADS / zoom sens** | Multiplicador aplicado al apuntar con mira/óptica. |
| **MDH** | *Monitor Distance Horizontal*: criterio de coincidencia de sensibilidad al hacer zoom (§9). |

---

## 3. Modelo matemático central

### 3.1 Cadena de transformación

```
movimiento físico (cm)
  → counts        : counts = cm / 2.54 × DPI
  → grados        : grados = counts × sens × yaw
```

De ahí se derivan todas las fórmulas. Constante útil: `360 × 2.54 = 914.4`.

### 3.2 Fórmulas fundamentales

```
degPerCount = sens × yaw
countsPer360 = 360 / (sens × yaw)
in360  = 360 / (DPI × sens × yaw)
cm360  = 914.4 / (DPI × sens × yaw)
eDPI   = DPI × sens
```

### 3.3 Las cuatro inversiones (todas las que necesita la web)

| Se conoce | Se busca | Fórmula |
|---|---|---|
| DPI, sens | eDPI | `eDPI = DPI × sens` |
| DPI, eDPI | sens | `sens = eDPI / DPI` |
| DPI, sens, yaw | cm/360 | `cm360 = 914.4 / (DPI × sens × yaw)` |
| DPI, cm/360, yaw | sens | `sens = 914.4 / (DPI × yaw × cm360)` |
| eDPI, yaw | cm/360 | `cm360 = 914.4 / (eDPI × yaw)` |
| cm/360, yaw | eDPI | `eDPI = 914.4 / (yaw × cm360)` |

**Propiedad clave (y argumento de venta de la app):** las dos últimas filas **no dependen del DPI**. eDPI y cm/360 son biyectivos dentro de un juego. Es decir: fijado el juego, `eDPI` es simplemente `cm/360` expresado en otra unidad e invertido.

### 3.4 Conversión entre juegos

Preservar cm/360 es preservar la memoria muscular:

```
sensB = sensA × (yawA / yawB) × (dpiA / dpiB)
```

Y si se mantiene el mismo DPI:

```
sensB = sensA × yawA / yawB
```

En términos de eDPI:

```
eDPIB = eDPIA × yawA / yawB
```

### 3.5 eDPI normalizado (métrica propuesta para la web)

Como el eDPI crudo no es comparable entre juegos, se define un **eDPI normalizado a CS2**:

```
eDPInorm = eDPI × yaw / 0.022
```

Esto permite decir al usuario: *«tu 4000 eDPI de Overwatch 2 equivale a 1200 eDPI de CS2»*. Es una cifra que la comunidad entiende de inmediato y que ninguna calculadora mainstream muestra bien.

### 3.6 Sensibilidad vertical

`Y-sens = X-sens × ratio`. El ratio por defecto es 1 en prácticamente todos los juegos listados. Excepciones a tener en cuenta: Apex Legends y CS2 permiten cambiar `m_pitch`; Fortnite expone X e Y por separado.

---

## 4. Tabla de constantes yaw por juego

Yaw = grados por cuenta con sens = 1. Nivel de confianza:

- **A** — Coherente entre varias fuentes independientes **y** verificado por plausibilidad contra los cm/360 conocidos de jugadores profesionales.
- **B** — Fuente única o coherencia parcial. Se muestra en la app con aviso y con calibración ofrecida.
- **C** — Escala no lineal o fuentes contradictorias. **No se publica constante**; solo se ofrece calibración empírica.

### Tier A — listos para producción

| Juego | Motor | Yaw | Escala de sens | Notas |
|---|---|---|---|---|
| Counter-Strike 2 / CS:GO | Source 2 | **0.022** | 0.1–10+ | `m_yaw` es una cvar; el valor por defecto es 0.022. Referencia de la industria. |
| Apex Legends | Source modificado | **0.022** | 0.1–20 | Conversión 1:1 con CS2 en hipfire. |
| Valorant | UE4 | **0.07** | 0.001–10 | CS2 1.0 = Valorant 0.3142. |
| Overwatch 2 | Blizzard propietario | **0.0066** | 1–100 | CS2 1.0 = OW2 3.3333. |
| Marvel Rivals | UE5 | **0.0066** | — | Escala idéntica a OW2 (1:1). |
| Call of Duty (MW2019→BO7, Warzone) | IW 8/9 | **0.0066** | 1–20 (+ multiplicador) | Ver §4.1: el *Mouse Sensitivity Multiplier* multiplica el yaw efectivo. |
| Fortnite | UE5 | **0.005555 por 1%** | 0–100 % | Slider porcentual. Yaw efectivo = `0.005555 × porcentaje`. |
| Deadlock | Source 2 | **0.044** | — | Exactamente 2× el yaw de CS2. |
| Team Fortress 2 / Half-Life 2 / L4D2 / Portal 2 / Titanfall 2 | Source | **0.022** | — | `m_yaw` por defecto. |
| Quake Champions | id Tech | **0.022** | — | 1:1 con CS2. |
| Halo Infinite | Slipspace | **0.022** | — | 1:1 con CS2. |

Verificación de plausibilidad aplicada (todos dan cm/360 dentro del rango real de profesionales):

| Juego | eDPI típico pro | cm/360 resultante | ¿Coherente? |
|---|---|---|---|
| CS2 | 800 | 51.95 cm | Sí (rango pro real 40–60 cm) |
| Valorant | 260 | 50.24 cm | Sí (converge con CS2, como se sabe) |
| Apex | 1200 | 34.64 cm | Sí (rango pro 30–40 cm) |
| Overwatch 2 | 4000 | 34.64 cm | Sí (rango pro 30–40 cm) |
| Call of Duty | 4800 | 28.86 cm | Sí (rango pro 25–35 cm) |
| Fortnite | 5600 (7 % @800) | 29.38 cm | Sí (rango pro 25–35 cm) |

### Tier B — publicar con aviso

| Juego | Yaw declarado | Problema |
|---|---|---|
| Rainbow Six Siege | **0.00572958** | El valor es sospechosamente exacto: `(180/π)/10000`, firma de un motor que trabaja en radianes, lo que **apoya** su autenticidad. Pero múltiples fuentes indican dependencia del ajuste de FOV, y la prueba de plausibilidad da ~16 cm/360 con sens 12 @800 DPI, más rápido de lo esperado. Requiere parámetro de FOV y verificación. |
| Escape from Tarkov | **0.125** | Dos fuentes convergen indirectamente (una publica «CS2 1.0 → EFT 0.176», que implica yaw = 0.022/0.176 = 0.125). Plausibilidad: sens 0.2 @800 DPI → 45.7 cm/360, razonable para Tarkov. Aceptable pero no confirmado. |
| Battlefield 6 / 2042 | **0.0022 por 1 %** | Fuentes en conflicto (0.0022 vs 0.0066). Con 0.0022, CS2 1.0 = BF 10 %. Plausible pero sin confirmar. |
| Destiny 2 | **0.0066** | Además tiene un **tope de velocidad de giro al esprintar**, que rompe el modelo lineal en ese estado. |
| Delta Force | **0.022** | Fuente única, sin verificar. |
| Heroes & Generals | **0.15126** | Fuente única (medición de DPI Wizard: 1000 DPI, 23 cm/360, sens 0.262835). Pasa la prueba de plausibilidad, pero el cliente cambió el cálculo del ratón a finales de 2016 y los builds revividos abarcan 2013–2023. Ver §4.2. |

### Tier C — solo calibración, sin constante publicada

| Juego | Motivo |
|---|---|
| **PUBG: Battlegrounds** | Curva **no lineal** y sistema por-mira (general, ADS, cada óptica por separado). Las fuentes publican 0.022 y 0.002222; **ambas son imposibles**: con sens general 50 @800 DPI, 0.022 daría 1.04 cm/360. Descartado. |
| **The Finals** | Contradicción de ~30×. Se publica yaw 0.0066, pero las mismas fuentes dicen que los pros usan sens 18–35 @800 DPI (→ ~7 cm/360, absurdo) *y* eDPI 300–800 (→ sens ~0.5, incompatible con 18–35). Los datos disponibles no son fiables. |
| Rust, Roblox, Splitgate 2, FragPunk | Escalas propias, actualizaciones frecuentes de Unity/UE que cambian el escalado, y datos publicados no verificables. |

### 4.1 Casos especiales de fórmula

**Call of Duty** — el yaw efectivo incluye el multiplicador:
```
yawEff = 0.0066 × mouseSensitivityMultiplier    (por defecto 1.0)
degPerCount = sens × yawEff
```

**Fortnite** — el slider es porcentual y X/Y son independientes:
```
degPerCount = porcentajeX × 0.005555
```
Conversión directa a CS2: `sensCS2 = porcentajeX × 0.25250` (es decir `0.005555 / 0.022`).

**Rainbow Six Siege** — modelar con parámetro `fov`; hasta verificarlo empíricamente, tratar el yaw como constante y mostrar el aviso de Tier B.

### 4.2 Heroes & Generals — derivación del yaw y por qué es Tier B

Caso documentado aparte porque es el primer juego del catálogo cuyos servidores oficiales cerraron y que sobrevive mediante builds comunitarios.

**Datos verificados:**

- **Motor: Retox**, propietario de Reto-Moto. No es CryEngine; se comprobó expresamente porque varias fuentes secundarias lo dan por hecho.
- Servidores oficiales cerrados el **25-05-2023** por TLM Games.
- La sensibilidad numérica **solo se fija por consola** (tecla `\`), según DPI Wizard. El deslizador del menú no expone ningún número.

**Derivación del yaw.** El dato cuantitativo procede de una medición publicada en el foro de mouse-sensitivity.com: 1000 DPI, 23 cm por vuelta completa, sens in-game `0.262835`. Aplicando la calibración de §8:

```
yaw = 914.4 / (DPI × S × D) = 914.4 / (1000 × 0.262835 × 23) = 0.1512604…
```

Valor publicado: **0.15126**, redondeado a la precisión que soporta la medición de origen.

**Prueba de plausibilidad (§6.2).** El cm/360 de la propia medición, 23 cm, cae dentro del rango exigido de 15–70 cm. Como esa cifra viene de la misma fuente que la sensibilidad, se hace además una comprobación cruzada independiente: aiming.pro recomienda 28–43 cm/360 para este juego, lo que con yaw 0.15126 a 800 DPI exige sens de **0.176 a 0.270**. Ese intervalo contiene el `0.262835` documentado por DPI Wizard. Dos fuentes sin relación entre sí convergen en el mismo orden de magnitud de sensibilidad de consola, lo que respalda la constante.

**Por qué B y no A.** Tres reservas, ninguna de ellas suficiente para descartar el valor pero sí para publicarlo con aviso:

1. **Fuente única para la medición.** La comprobación cruzada usa aiming.pro, catalogado como fiabilidad **baja** en §13.1. Ningún conversor localizado (sensconvert, sensgod, egamersworld) expone la constante que emplea, así que no hay segunda medición directa.
2. **Sin verificación contra escena profesional.** El juego no tiene circuito competitivo ni base pública de eDPI, de modo que falta el contraste que sí valida a los juegos del Tier A.
3. **Divergencia de input entre versiones.** mouse-sensitivity.com documenta un cambio en el cálculo del movimiento del ratón a **finales de 2016**, con correcciones repetidas de su calculadora. Los builds revividos abarcan 2013 (dic 2024), 2014 (feb 2025), 2017 (may 2025) y 2023 (12-06-2026), es decir, a ambos lados de ese cambio. La constante corresponde al comportamiento posterior a 2016 y no debe asumirse válida en los builds de 2013 y 2014.

**Sobre las versiones comunitarias:** el sucesor activo es **HeroesNGenerals Sunrise**. Su web no declara que ejecute el cliente original sin modificar, por lo que la equivalencia de motor no puede darse por supuesta. Aparte, Insight Interactive desarrolla una **reconstrucción limpia en Unreal Engine 5**: motor distinto, yaw no transferible en ningún caso.

Build de referencia para la entrada del catálogo: **2023**, el último oficial. Al ser Tier B, la app ofrece calibración (§8) para que el usuario confirme la constante en el build concreto que juegue.

---

## 5. Cuantización: el valor exacto casi nunca es escribible

Un fallo habitual de las calculadoras existentes es devolver `sens = 3.847291` cuando el juego solo acepta enteros. La app debe devolver **tres cosas**: valor exacto, valor realmente introducible y error resultante en cm/360.

```
sensQ = clamp(round(sensExacta / step) × step, min, max)
errorPct = |sensQ − sensExacta| / sensExacta × 100
```

Ese error relativo es idéntico en sensibilidad, en eDPI y en velocidad de giro. El error correspondiente en cm/360 es `|sensExacta / sensQ − 1| × 100`, ligeramente distinto porque cm/360 es inversamente proporcional a la sensibilidad.

| Juego | Mín | Máx | Paso | Decimales | Nota |
|---|---|---|---|---|---|
| CS2 | 0.0001 | 100 | continuo | 6 | Vía consola acepta prácticamente cualquier decimal. |
| Valorant | 0.001 | 10 | 0.001 | 3 | Límite duro del cliente. |
| Apex Legends | 0.1 | 20 | 0.01 | 3 | Editable en config con más precisión. |
| Overwatch 2 | 1 | 100 | 1 | 0 | **Entero**; la cuantización importa mucho aquí. Verificar si versiones recientes admiten decimales. |
| Marvel Rivals | 0.01 | 100 | 0.01 | 2 | |
| Call of Duty | 1 | 20 | 1 | 0 | Precisión fina vía *multiplier* (0.01). |
| Fortnite | 0 | 100 | 0.1 | 1 | Porcentaje. |
| Rainbow Six Siege | 1 | 100 | 1 | 0 | Entero. |
| Deadlock | 0.01 | 30 | 0.01 | 2 | |
| Quake Champions / Halo Infinite / Source | 0.01 | 30 | 0.01 | 3 | |
| Escape from Tarkov | 0.01 | 5 | 0.01 | 2 | |
| Battlefield 6 | 0 | 100 | 1 | 0 | Porcentaje entero. |
| Heroes & Generals | 0.0001 | 100 | continuo | 6 | **Sin verificar** — ver aviso debajo. |

> Estos límites se han recopilado de documentación de comunidad y deben marcarse en la UI como verificables. Si un valor está mal, el impacto es acotado: la app siempre muestra también el valor exacto.

> **Excepción declarada — Heroes & Generals.** Estos límites **no** están verificados y no deben tratarse como dato. El único elemento observado es la cantidad de decimales: la sensibilidad se introduce por consola como decimal libre y el valor documentado (`0.262835`) tiene 6. El mínimo, el máximo y el carácter continuo se han tomado prestados del patrón de CS2 (entrada por consola, decimal continuo) como marcador de posición, porque el esquema de datos exige valores y ninguna fuente pública documenta el rango real: tres hilos distintos de Steam preguntando literalmente por la sensibilidad «en números» quedaron sin respuesta, la wiki oficial devuelve 402 y PCGamingWiki 403. Se registra aquí de forma explícita para que la divergencia sea visible en lugar de quedar disimulada como un dato más de la tabla. Corregir en cuanto se pueda leer el rango real en un cliente de HeroesNGenerals Sunrise.

---

## 6. Fiabilidad de las fuentes: contradicciones detectadas

Durante la investigación se contrastaron ~10 sitios de conversión. Contradicciones reales encontradas para el **mismo juego**:

| Juego | Valores publicados | Veredicto |
|---|---|---|
| Fortnite | 0.005555 vs **0.5555** | 0.5555 es un error tipográfico de un factor 100; 0.005555 pasa la prueba de plausibilidad. |
| Marvel Rivals | 0.0066 vs 0.022 | 0.0066 correcto: los pros usan sens ~5, incompatible con la escala 0.022. |
| PUBG | 0.022 vs 0.002222 | Ambos imposibles frente a cm/360 reales. |
| Escape from Tarkov | 0.022 vs 0.125 | 0.022 implicaría que EFT 1.0 = CS2 1.0, contradicho por la propia fuente en el mismo párrafo. |
| Battlefield 2042/6 | 0.0066 vs 0.0022 | Sin resolver. |
| The Finals | 0.0066 con datos de pros incompatibles entre sí | Sin resolver. |

**Metodología aplicada en este documento para aceptar un valor:**

1. Coincidencia entre al menos dos fuentes independientes.
2. **Prueba de plausibilidad**: calcular el cm/360 que resulta con el eDPI típico de profesionales y comprobar que cae en 15–70 cm. Cualquier valor que dé <5 cm o >150 cm se descarta.
3. Coherencia con relaciones ya asentadas en la comunidad (CS2 1.0 = Valorant 0.314; CS2 1.0 = OW2 3.33).

La herramienta más rigurosa del ecosistema es **KovaaK's SensitivityMatcher**, que mide el yaw empíricamente enviando N cuentas y observando la deriva acumulada tras muchos ciclos. Ese es el método de referencia y es el que inspira la calibración de §8.

---

## 7. Factores del sistema que invalidan el cálculo

La app debe advertir de todo esto antes de dar un resultado:

| Factor | Efecto | Recomendación mostrada |
|---|---|---|
| Velocidad del puntero de Windows ≠ 6/11 | Escala las cuentas antes de que lleguen al juego. Rompe todo el modelo. | Fijar en 6/11 (multiplicador 1.0). |
| «Mejorar la precisión del puntero» activado | Aceleración: la relación cuenta↔grado deja de ser constante. | Desactivar. |
| Aceleración in-game | Igual. | Desactivar. |
| Raw Input desactivado | El juego recibe cuentas ya procesadas por el SO. | Activar Raw Input. |
| DPI real ≠ DPI nominal | Los sensores desvían típicamente 1–5 %. Un DPI nominal de 800 puede ser 812 real. | Medir el DPI real; permitir introducirlo. |
| Polling rate | **No afecta** al cm/360. Solo a la latencia y suavidad. | Informar para desmontar el mito. |
| Resolución / escalado de monitor | No afecta al yaw. | — |
| FPS y frametime | No afectan al yaw en motores modernos con input desacoplado. | — |
| Ángulo de rotación (*angle snapping*) | Distorsiona trayectorias, no la magnitud del giro. | Desactivar. |

---

## 8. Calibración empírica (funcionalidad diferencial)

Para juegos Tier B/C, o cuando el usuario no se fía, se deriva el yaw a partir de una medición:

**Procedimiento que la app guía:**

1. Fijar DPI conocido, Windows en 6/11, aceleración desactivada, raw input activado.
2. Poner una sensibilidad concreta `S` en el juego.
3. Marcar un punto de referencia en pantalla y en la alfombrilla.
4. Mover el ratón en línea recta hasta completar exactamente 360° y volver al mismo punto de referencia. Medir la distancia física `D` en cm.
5. La app calcula:

```
yaw = 914.4 / (DPI × S × D)
```

**Mejora de precisión (método de múltiples vueltas):** medir `k` vueltas completas sobre un recorrido de ida y vuelta acumulado `D_total`, y usar `D = D_total / k`. El error de medición se divide por `k`.

El yaw calibrado se guarda en `localStorage` por juego y sustituye a la constante publicada, marcándose en la UI como **«calibrado por ti»**. Esto convierte una limitación de datos en una función de producto.

---

## 9. Sensibilidad al apuntar (ADS / zoom / miras)

Al hacer zoom el FOV cambia, y «mantener la misma sensibilidad» admite varias definiciones distintas. El criterio se parametriza con la **distancia de monitor** `p`:

```
sens%(p) = atan(p · tan(F2/2)) / atan(p · tan(F1/2))
```

donde `F1` = FOV horizontal en cadera y `F2` = FOV horizontal con zoom.

| `p` | Nombre | Qué preserva |
|---|---|---|
| 0 | *Crosshair matched* / 1:1 óptico | Límite: `tan(F2/2) / tan(F1/2)`. El movimiento en el centro de la pantalla coincide en píxeles. Es el criterio recomendado por la comunidad competitiva. |
| 1.0 | *Monitor match 100 %* | Un punto en el borde de la pantalla recorre la misma distancia. Coincide con el ratio simple de FOV: `F2/F1`. |
| 0–1 | Intermedio | Compromiso. |

Conversión de FOV vertical a horizontal según relación de aspecto:

```
hFOV = 2 · atan(ar · tan(vFOV / 2))
```

**Advertencia honesta:** no existe fuente oficial ni dato datamineado para los FOV de miras de la mayoría de juegos; son valores derivados por la comunidad mediante ingeniería inversa. Por eso el módulo ADS se marca como **v2** en el plan y no bloquea el lanzamiento.

---

## 10. Rangos orientativos de eDPI y cm/360

Para la funcionalidad de «¿es razonable mi sensibilidad?». Valores orientativos derivados de las medias públicas de jugadores profesionales; deben etiquetarse como orientativos en la UI.

| Juego | eDPI bajo | eDPI típico | eDPI alto | cm/360 típico |
|---|---|---|---|---|
| CS2 | 600 | 800 | 1100 | 38–69 cm |
| Valorant | 200 | 260 | 320 | 41–65 cm |
| Apex Legends | 800 | 1200 | 1600 | 26–52 cm |
| Overwatch 2 | 3000 | 4000 | 6000 | 23–46 cm |
| Marvel Rivals | 3000 | 4000 | 6000 | 23–46 cm |
| Call of Duty | 4000 | 4800 | 7000 | 20–35 cm |
| Fortnite (X %×DPI) | 4000 | 5600 | 8000 | 21–41 cm |

**Heroes & Generals queda deliberadamente fuera de esta tabla.** No existe escena profesional ni base pública de eDPI de la que derivar los tres valores. La única cifra localizada es una recomendación genérica de 28–43 cm/360 en aiming.pro, que es contenido SEO sin respaldo y además no permitiría calcular eDPI alguno sin la constante yaw, que tampoco se publica (§4.2). Sin `proEdpi`, la app simplemente no muestra el módulo de «¿es razonable mi sensibilidad?» para este juego.

Interpretación general por cm/360, válida para cualquier juego:

- **< 20 cm** — muy rápida. Arena shooters, movilidad alta.
- **20–35 cm** — rápida. Estándar en hero shooters y battle royale.
- **35–50 cm** — media. Zona más habitual en tácticos.
- **> 50 cm** — lenta. CS2/Valorant clásico, precisión sobre giro.

---

## 11. Vectores de prueba (usar como tests unitarios)

Todos verificados a mano con las fórmulas de §3.

| # | Entrada | Salida esperada |
|---|---|---|
| 1 | CS2, DPI 800, sens 1.0 | eDPI = 800; degPerCount = 0.022; counts/360 = 16363.6364; in/360 = 20.4545; cm/360 = 51.9545 |
| 2 | CS2, DPI 400, sens 2.0 | eDPI = 800; cm/360 = 51.9545 (idéntico al #1: cm/360 depende solo de eDPI) |
| 3 | Valorant, DPI 800, sens 0.314 | eDPI = 251.2; cm/360 = 52.0018 |
| 4 | CS2 sens 1.0 → Valorant, mismo DPI | 0.31428571… |
| 5 | CS2 sens 1.0 → Overwatch 2, mismo DPI | 3.33333333… |
| 6 | CS2 sens 2.0 → Valorant, mismo DPI | 0.62857142… |
| 7 | CS2 sens 1.0 @400 DPI → Valorant @800 DPI | 0.15714285… |
| 8 | Fortnite 7 % → CS2, mismo DPI | 1.767500 |
| 9 | CS2 sens 1.768 → Fortnite, mismo DPI | 7.00162… % |
| 10 | eDPI 800 → cm/360 en CS2 | 51.9545 cm |
| 11 | cm/360 = 30 en Overwatch 2 | eDPI = 4618.18; sens @800 DPI = 5.7727 |
| 12 | OW2 exacta 5.7727, cuantizada a paso 1 | sensQ = 6; error ≈ 3.94 % |
| 13 | Calibración: DPI 800, S = 1, medido 51.95 cm | yaw ≈ 0.022 |
| 14 | eDPI normalizado: OW2 eDPI 4000 | 1200 (equivalente CS2) |
| 15 | CoD sens 6, multiplier 1.0, DPI 800 | cm/360 = 28.8636 |
| 16 | hFOV desde vFOV 73.74° a 16:9 | 106.26° |

---

## 12. Decisiones de producto derivadas de la investigación

1. **cm/360 es el eje central del modelo de datos**, no el eDPI. eDPI se calcula como vista derivada.
2. **Mostrar nivel de confianza por juego.** Ninguna calculadora del mercado lo hace y es el único modo honesto de publicar estos datos.
3. **Calibración empírica integrada** para Tier B/C. Convierte el punto débil en el diferenciador.
4. **Mostrar siempre valor exacto + valor introducible + error**, por la cuantización de §5.
5. **La conversión entre juegos sale gratis** una vez implementado el núcleo; incluirla en v1.
6. **ADS/zoom queda fuera de v1**: los datos de FOV de miras no son verificables con la fiabilidad exigida arriba.
7. **Checklist de sistema visible** (§7): sin Windows 6/11 y raw input, cualquier resultado es falso.

---

## 13. Fuentes consultadas

Se listan con su fiabilidad evaluada. Los sitios marcados como **baja** se usaron solo para triangular, nunca como fuente única.

- [KovaaK's SensitivityMatcher (GitHub)](https://github.com/KovaaK/SensitivityMatcher) — **alta**. Metodología de medición empírica del yaw.
- [JorSanders/game-sens (GitHub)](https://github.com/JorSanders/game-sens) — **alta**. Matemática de coincidencia con zoom y distancia de monitor.
- [mouse-sensitivity.com](https://www.mouse-sensitivity.com/) — **alta**. Referencia histórica de la comunidad (DPI Wizard).
- [MouseTester.io — Sensitivity Converter](https://mousetester.io/sensitivity-converter/) — **media**. Tabla de yaw con errores detectados (Fortnite 0.5555).
- [SensLab — Mouse Sensitivity Converter](https://senslab.pro/sensitivity) — **media**. Tabla de yaw coherente en Tier A.
- [Recharge — Mouse Sensitivity Converter for 23 FPS Games](https://www.recharge.com/blog/en-gb/mouse-sensitivity-converter-calculator-for-23-fps-games) — **media**. Tabla amplia, con contradicciones.
- [3D Aim Trainer — Sensitivity Converter](https://www.3daimtrainer.com/mouse-sensitivity-converter/) — **media**.
- [Calculator Academy — cm/360](https://calculator.academy/cm-per-360-calculator/) — **media**. Confirmación de la fórmula base.
- [Dot Esports — CS2 a Fortnite Ballistic](https://dotesports.com/fortnite/news/how-to-convert-your-cs2-sensitivity-to-fortnite-ballistic) — **media**. Confirma el yaw porcentual de Fortnite.
- [activeplayer.io — juegos de PC más jugados](https://activeplayer.io/top-20-most-popular-pc-games/) — **media**. Selección del catálogo de juegos.
- [gurugamer — shooters con más jugadores 2026](https://gurugamer.com/pc-console/top-10-multiplayer-shooters-with-the-most-players-in-2026-26750) — **media**. Selección del catálogo.
- [edpi-calculator.org](https://edpi-calculator.org/tools/sensitivity-converter), [cs2sens.com](https://cs2sens.com/), [hypestkey.com](https://hypestkey.com/mouse-sensitivity-converter/), [sensconverter.app](https://sensconverter.app/) — **baja**. Contenido SEO; usados solo para triangular.

### 13.1 Fuentes específicas de Heroes & Generals (§4.2)

- [mouse-sensitivity.com — hilo de Heroes and Generals](https://www.mouse-sensitivity.com/forums/topic/179-heroes-and-generals/) — **alta**. Origen del único dato cuantitativo (1000 DPI, 23 cm/360, sens 0.262835) y de que la sensibilidad solo se fija por consola.
- [mouse-sensitivity.com — updates de Heroes and Generals](https://www.mouse-sensitivity.com/updates/updates/heroes-and-generals-r90/) — **alta**. Documenta el cambio del cálculo de movimiento del ratón a finales de 2016 y las correcciones sucesivas de la calculadora.
- [Wikipedia — Heroes & Generals](https://en.wikipedia.org/wiki/Heroes_%26_Generals) — **alta**. Motor Retox, cierre del 25-05-2023 y cronología de los builds revividos (2013, 2014, 2017, 2023).
- [HeroesNGenerals Sunrise](https://heroes-and-generals.com/) — **media**. Sucesor comunitario activo. No declara qué build ejecuta ni si el cliente está sin modificar.
- [Steam — «mouse sensitivity in numbers»](https://steamcommunity.com/app/227940/discussions/4/343786746008409431/), [Steam — «Config file to edit? Config through console?»](https://steamcommunity.com/app/227940/discussions/0/45350791340168325/), [Steam — «How to know my Exact Mouse Sensitivity?»](https://steamcommunity.com/app/227940/discussions/0/37470847934690116) — **media**. Los tres hilos preguntan por el valor numérico de la sensibilidad y quedan sin respuesta útil; es la evidencia de que el rango del deslizador no está documentado públicamente.
- [aiming.pro — Heroes & Generals](https://aiming.pro/mouse-sensitivity-calculator/heroes-generals), [sensgod](https://www.sensgod.com/mouse-sensitivity-converter/heroes-generals/), [sensconvert](https://sensconvert.com/gaming-sensitivity-converter/heroes-generals-sensitivity-calculator/), [egamersworld](https://egamersworld.com/gaming/mouse-sensitivity-converter/heroes-generals) — **baja**. Conversores que ofrecen el juego sin publicar la constante que usan; no sirven como segunda fuente.
