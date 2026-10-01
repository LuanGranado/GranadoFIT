import { useEffect, useState } from "react";
import { Accessibility, X } from "lucide-react";

type Settings = {
  scale: number;
  contrast: boolean;
  reduceMotion: boolean;
};

const storageKey = "granadofit-accessibility-v1";
const defaults: Settings = { scale: 1, contrast: false, reduceMotion: false };
const scales = [1, 1.15, 1.3, 1.5];

function readSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return {
      scale: scales.includes(saved?.scale) ? saved.scale : 1,
      contrast: saved?.contrast === true,
      reduceMotion: saved?.reduceMotion === true,
    };
  } catch {
    return defaults;
  }
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(readSettings);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ui-scale", String(settings.scale));
    root.dataset.uiScale = String(settings.scale);
    root.dataset.highContrast = String(settings.contrast);
    root.dataset.reduceMotion = String(settings.reduceMotion);
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {
      // Browsers with blocked storage can still use the controls in this session.
    }
  }, [settings]);

  return (
    <div className="accessibility-widget">
      {open && (
        <section
          className="accessibility-panel"
          aria-label="Acessibilidade"
          style={{ width: Math.min(345, viewportWidth / settings.scale - 32) }}
        >
          <div className="accessibility-heading">
            <div>
              <strong>Acessibilidade</strong>
              <span>Ajuste a leitura para você</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar opções de acessibilidade"
            >
              <X size={19} />
            </button>
          </div>
          <p id="text-size-label">Tamanho da interface</p>
          <div
            className="accessibility-sizes"
            role="group"
            aria-labelledby="text-size-label"
          >
            {scales.map((scale) => (
              <button
                type="button"
                key={scale}
                className={settings.scale === scale ? "selected" : ""}
                aria-pressed={settings.scale === scale}
                onClick={() =>
                  setSettings((current) => ({ ...current, scale }))
                }
              >
                {Math.round(scale * 100)}%
              </button>
            ))}
          </div>
          <label className="accessibility-switch">
            <span>Alto contraste</span>
            <input
              type="checkbox"
              checked={settings.contrast}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  contrast: event.target.checked,
                }))
              }
            />
          </label>
          <label className="accessibility-switch">
            <span>Reduzir animações</span>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  reduceMotion: event.target.checked,
                }))
              }
            />
          </label>
          <small>O zoom do navegador também funciona com o site.</small>
        </section>
      )}
      <button
        className="accessibility-trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir opções de acessibilidade"
        aria-expanded={open}
      >
        <Accessibility size={20} />
        <span>Acessibilidade</span>
      </button>
    </div>
  );
}
