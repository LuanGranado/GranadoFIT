import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Pencil,
  Play,
  X,
} from "lucide-react";
import { equipmentNames, type CatalogExercise } from "./catalog";
import type { CustomExercise, Exercise } from "./model";
import MuscleFocus from "./MuscleFocus";
import MuscleMap from "./MuscleMap";

type Props = {
  exercise: Exercise;
  catalog?: CatalogExercise;
  custom?: CustomExercise;
  onClose: () => void;
  onEdit: () => void;
  onToggleDone: () => void;
};

export default function ExerciseDetailModal({
  exercise,
  catalog,
  custom,
  onClose,
  onEdit,
  onToggleDone,
}: Props) {
  const [mode, setMode] = useState<"video" | "photos">(
    catalog?.video ? "video" : "photos",
  );
  const [frame, setFrame] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const photos = [catalog?.image, catalog?.image2].filter(
    (path): path is string => !!path,
  );
  const primary = catalog?.primaryMuscles || custom?.primaryMuscles || [];
  const secondary = catalog?.secondaryMuscles || custom?.secondaryMuscles || [];
  const equipment = catalog?.equipment || custom?.equipment;
  const repsDescription = /[a-zA-ZÀ-ÿ:]/.test(exercise.reps)
    ? exercise.reps
    : `${exercise.reps} repetições`;

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="execution-modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Execução de ${exercise.name}`}
      >
        <header className="execution-header">
          <div>
            <span className="mini-eyebrow">GUIA DO EXERCÍCIO</span>
            <h2>{catalog?.name || exercise.name}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>
        <div className="execution-grid">
          <div className="execution-media-col">
            {catalog?.video && !videoFailed && (
              <div
                className="execution-media-tabs"
                role="tablist"
                aria-label="Visualização do exercício"
              >
                <button
                  role="tab"
                  aria-selected={mode === "video"}
                  className={mode === "video" ? "selected" : ""}
                  onClick={() => setMode("video")}
                >
                  <Play size={15} /> Vídeo
                </button>
                <button
                  role="tab"
                  aria-selected={mode === "photos"}
                  className={mode === "photos" ? "selected" : ""}
                  onClick={() => setMode("photos")}
                >
                  Fotos da execução
                </button>
              </div>
            )}
            <div className="execution-stage">
              {mode === "video" && catalog?.video && !videoFailed ? (
                <video
                  key={catalog.video.src}
                  controls
                  playsInline
                  preload="metadata"
                  poster={catalog.image || undefined}
                  onError={() => {
                    setVideoFailed(true);
                    setMode("photos");
                  }}
                >
                  <source src={catalog.video.src} type="video/mp4" />
                  Seu navegador não consegue reproduzir este vídeo.
                </video>
              ) : photos.length ? (
                <>
                  <img
                    src={photos[frame]}
                    alt={
                      catalog?.video
                        ? `${exercise.name}: quadro ${frame + 1} do vídeo`
                        : `${exercise.name}: ${frame === 0 ? "posição inicial" : "posição final"}`
                    }
                  />
                  <div className="execution-photo-label">
                    {photos.length > 1
                      ? `Imagem ${frame + 1} de ${photos.length}`
                      : "Imagem da execução"}
                  </div>
                </>
              ) : (
                <div className="execution-no-media">
                  <Dumbbell size={44} />
                  <p>Este exercício pessoal ainda não tem fotos ou vídeo.</p>
                </div>
              )}
            </div>
            {mode === "photos" && photos.length > 1 && (
              <div className="execution-frame-controls">
                <button
                  onClick={() =>
                    setFrame(
                      (value) => (value + photos.length - 1) % photos.length,
                    )
                  }
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  {catalog?.video
                    ? "Quadros do mesmo vídeo de execução"
                    : "Compare a posição inicial e a final"}
                </span>
                <button
                  onClick={() =>
                    setFrame((value) => (value + 1) % photos.length)
                  }
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
            {videoFailed && (
              <p className="execution-media-note">
                Não foi possível reproduzir o vídeo. As imagens da execução
                continuam disponíveis.
              </p>
            )}
            {catalog?.video && (
              <p className="execution-credit">
                Vídeo e quadros: {catalog.video.author} ·{" "}
                <a
                  href={catalog.video.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  fonte wger
                </a>{" "}
                ·{" "}
                <a
                  href={catalog.video.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {catalog.video.license}
                </a>
              </p>
            )}
          </div>
          <div className="execution-info-col">
            <div className="execution-plan">
              <span>NA SUA FICHA</span>
              <strong>
                {exercise.sets} séries · {repsDescription}
              </strong>
              <small>Descanso: {exercise.rest}</small>
            </div>
            <div className="execution-muscle">
              <MuscleFocus primary={primary} secondary={secondary} />
              {equipment && (
                <p className="execution-equipment">
                  <strong>Equipamento:</strong>{" "}
                  {equipmentNames[equipment] || equipment}
                </p>
              )}
              <details className="muscle-map-details">
                <summary>Ver mapa corporal</summary>
                <MuscleMap primary={primary} secondary={secondary} />
              </details>
            </div>
            {catalog?.instructions.length ? (
              <div className="execution-steps">
                <h3>Como executar</h3>
                <ol>
                  {catalog.instructions.map((step, index) => (
                    <li key={`${catalog.id}-${index}`}>{step}</li>
                  ))}
                </ol>
                <p>
                  Use uma carga que permita controlar o movimento. Em caso de
                  dúvida, peça orientação a um profissional.
                </p>
              </div>
            ) : (
              <div className="execution-steps">
                <h3>Como executar</h3>
                <p>
                  Consulte as imagens e peça orientação a um profissional para
                  ajustar a execução ao seu caso.
                </p>
              </div>
            )}
            <div className="execution-actions">
              <button className="outline-button" onClick={onEdit}>
                <Pencil size={16} /> Editar séries
              </button>
              <button className="primary-button" onClick={onToggleDone}>
                <Check size={16} />{" "}
                {exercise.done ? "Desmarcar conclusão" : "Marcar como feito"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
