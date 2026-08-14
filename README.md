# ⏱️ TempusConv — Conversor y Calculadora de Tiempo

Una suite de herramientas moderna, precisa y reactiva para el cálculo, conversión y manipulación de unidades de tiempo (`HH:MM:SS`, segundos, diferencias y sumas/restas temporales). Diseñada con una interfaz minimalista, soporte para modo oscuro, copiado rápido e importación inteligente desde el portapapeles.

---

## 🚀 Características Principales

### 1. 🔄 Segundos a Formato de Tiempo (Seconds to Time)
- Convierte cualquier cantidad de segundos en formato `HH:MM:SS`.
- Desglose detallado en **Años, Días, Horas, Minutos y Segundos**.
- Muestra métricas complementarias (minutos totales, horas totales, días totales y horas decimales).
- Botones de adición rápida de segundos (+30s, +1m, +5m, +15m, +1h, 1 día).

### 2. ⏳ Tiempo a Segundos (Time to Seconds)
- Introduce horas, minutos y segundos para calcular de inmediato el equivalente en **segundos totales**.
- Visualización de minutos totales y horas en formato decimal (`1.50 hrs`).
- Validación automática de límites (0-59 para minutos y segundos).

### 3. ⚖️ Diferencia entre Tiempos (Time Difference)
- Compara dos marcas de tiempo (**Tiempo A** vs **Tiempo B**).
- Calcula la diferencia absoluta y relativa en formato `HH:MM:SS`, segundos y horas decimales.
- Indicador visual automático de cuál tiempo es mayor.
- Botón rápido para intercambiar ambos tiempos (Swap).

### 4. ➕ Suma y Resta de Tiempos (Time Addition & Subtraction)
- Añade o resta segundos a una hora base especificada.
- Selector de modo: **Reloj 24 Horas** (ciclo diario `00:00:00 - 23:59:59` con indicador de día siguiente/anterior) o **Duración Continua** (acumulativa).
- Presets rápidos para sumar o restar lapsos comunes (15s, 30s, 1m, 5m, 15m, 30m, 1h).

### 5. 📋 Pegado Inteligente (Smart Paste)
- Soporte para clic derecho o `Ctrl+V` / `Cmd+V` directamente en las casillas.
- Detecta y distribuye automáticamente diversos formatos de texto:
  - Formato estándar `HH:MM:SS` (ej. `01:45:30`) o `HH:MM` (ej. `12:30`).
  - Formato textual (ej. `2h 15m 30s`, `45m 10s`).
  - Horas decimales (ej. `1.5h`).
  - Segundos brutos (ej. `5400`).

### 6. 📜 Historial de Cálculos y Favoritos
- Panel lateral deslizable que registra automáticamente cada conversión y cálculo.
- Filtrado por categorías (**Segundos a Tiempo**, **Tiempo a Segundos**, **Diferencia**, **Suma/Resta**).
- Marcador de elementos favoritos ⭐.
- Copiado individual de resultados y opción para limpiar historial.

### 7. 🌓 Modo Claro y Modo Oscuro
- Selector de tema en el encabezado con transición suave.
- Paleta de colores optimizada con alto contraste para legibilidad y descanso visual.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos y Diseño**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Animaciones**: [Motion](https://motion.dev/)
- **Herramienta de Construcción**: [Vite 6](https://vitejs.dev/)

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Barra superior con selector de tema e historial
│   │   ├── HistoryDrawer.tsx       # Panel lateral de historial de cálculos
│   │   ├── SecondsToTimeCard.tsx   # Conversor de Segundos a Tiempo
│   │   ├── TimeToSecondsCard.tsx   # Conversor de Tiempo a Segundos
│   │   ├── TimeDifferenceCard.tsx  # Calculadora de diferencia entre 2 tiempos
│   │   ├── TimeAdditionCard.tsx    # Calculadora de suma / resta temporal
│   │   └── Toast.tsx               # Notificaciones flotantes de retroalimentación
│   ├── utils/
│   │   └── timeUtils.ts            # Lógica matemática de tiempo y parseo de clipboard
│   ├── types.ts                    # Definiciones e interfaces de TypeScript
│   ├── App.tsx                     # Componente principal y gestor de estado
│   ├── index.css                   # Configuración y directivas de Tailwind CSS
│   └── main.tsx                    # Punto de entrada de la aplicación
├── index.html                      # Documento HTML principal
├── package.json                    # Dependencias y scripts del proyecto
├── tsconfig.json                   # Configuración de compilación TypeScript
└── vite.config.ts                  # Configuración del bundler Vite
```

---

## 💻 Instalación y Uso Local

Sigue estos sencillos pasos para clonar y ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

### 2. Instalar dependencias
Puedes usar `npm`, `pnpm`, `yarn` o `bun`:
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000` (o el puerto indicado en la consola).

### 4. Compilar para producción
```bash
npm run build
```
Los archivos estáticos optimizados se generarán en la carpeta `dist/`.

### 5. Verificar tipado / Linter
```bash
npm run lint
```

---

## 💡 Ejemplos de Uso

| Entrada | Formato Pegado | Resultado Obtenido |
| :--- | :--- | :--- |
| `01:30:00` | Pegar en Tiempo a Segundos | `5,400 segundos` (1.50 hrs) |
| `86400` | Pegar en Segundos a Tiempo | `24:00:00` (1 Día) |
| `08:15:30` y `12:45:00` | Pegar en Diferencia | `04:29:30` (16,170 seg) |
| `10:00:00` + `3600s` | Sumar tiempo (24h) | `11:00:00` |

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.
