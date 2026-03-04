<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Andina‑Fin Countdown & Glitch Experience

Proyecto interactivo en React/Vite que muestra una cuenta regresiva animada y un
estético estilo glitch hacia el 12 de marzo de 2026. Incluye efectos visuales
complejos, secciones de manifiesto y un "modo en vivo" con vídeo embebido.

---

## 🔍 Visión general

- **Tecnologías principales**: React 18, TypeScript, Vite, Motion (framer-motion
  / motion/react) y Lucide Icons.
- **Estructura**: Una sola página (`App.tsx`) con animaciones y componentes
  personalizados para efectos visuales (glitch, ruido, contadores, manifiesto).
- **Propósito**: Crear una experiencia inmersiva estilo "fin del mundo" y servir
  como front‑end promocional.

## 🚀 Ejecutar en local

### Requisitos previos
- Node.js (v16+ recomendable)
- npm o pnpm (el repositorio contiene `pnpm-lock.yaml` pero la mayoría de los
  comandos funcionan con npm)

### Pasos
1. Clona o descarga el repositorio.
2. En la raíz del proyecto, instala las dependencias:
   ```bash
   npm install      # o pnpm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev      # o pnpm dev
   ```
4. Abre tu navegador en http://localhost:5173 (o la URL que Vite muestre).

No hay variables de entorno obligatorias para esta versión; los pasos previos a
la migración desde AI Studio han sido removidos.

## 🛠️ Scripts útiles

| Comando           | Descripción                             |
|------------------|-----------------------------------------|
| `npm run dev`    | Ejecuta la aplicación en modo desarrollo|
| `npm run build`  | Genera los archivos de producción       |
| `npm run preview`| Visualiza la versión construida         |

## 📁 Estructura principal

```
/                   # raíz del proyecto
├─ public/          # activos estáticos (imágenes, fuentes)
└─ src/             # código fuente React
   ├─ App.tsx       # componente principal con toda la lógica
   ├─ main.tsx      # punto de entrada Vite
   └─ index.css     # estilos globales
```

## 🎨 Diseño y animaciones

- El fondo está compuesto con `<WireframeGlobe>`, `<SwirlBackground>`,
  `<NoiseOverlay>` y más.
- Contadores de días, horas, minutos y segundos con componentes que vibran y
  "caen" cuando cambian.
- Sección de manifiesto interactiva con tarjetas expansibles y efectos glitch.
- CTA (llamadas a la acción) con efectos hover glitch y copia de código.
- Modo "en vivo" reproduce un vídeo de YouTube y muestra botones para volver
  atrás y copiar un código.

## 📦 Dependencias destacadas

- `motion/react` para animaciones fluidas.
- `lucide-react` para iconos vectoriales.
- `react` y `react-dom`.

## 📄 Notas adicionales

- La cuenta regresiva termina el 12 de marzo de 2026 y luego dispara una
  transición hacia el modo en vivo.
- El repositorio se inicializó con `git init` en el entorno del usuario, por lo
  que se recomienda crear un repositorio remoto si se planea colaborar.

## 🧩 Personalización

Puedes modificar la fecha objetivo, los textos del manifiesto, o los enlaces de
las CTAs editando `src/App.tsx`.

---

¡Listo! La aplicación está preparada para ejecutarse y seguir siendo desarrollada
según tus necesidades. Si necesitas ayuda adicional o quieres que te asista con
alguna parte específica del código, házmelo saber.
