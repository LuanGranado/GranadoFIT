import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Dumbbell, Plus, Search, X } from "lucide-react";
import {
  categoryNames,
  equipmentFilters,
  equipmentNames,
  loadExercises,
  muscleNames,
  muscleTabs,
  searchExercises,
  type CatalogExercise,
} from "./catalog";
import type { AppData, CustomExercise, Exercise } from "./model";
import MuscleMap from "./MuscleMap";

type Props = {
  custom: AppData["customExercises"];
  onSave: (exercise: Exercise, custom?: CustomExercise) => void;
  onClose: () => void;
};

export default function ExercisePicker({ custom, onSave, onClose }: Props) {
  const [catalog, setCatalog] = useState<CatalogExercise[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [selected, setSelected] = useState<CatalogExercise | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [customMuscle, setCustomMuscle] = useState("chest");
  const [customEquipment, setCustomEquipment] = useState("body only");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("12");
  const [rest, setRest] = useState("60s");
  useEffect(() => {
    loadExercises()
      .then(setCatalog)
      .catch(() =>
        setError(
          "Não foi possível carregar os exercícios. Reabra a janela para tentar novamente.",
        ),
      );
  }, []);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);
  const results = useMemo(
    () => searchExercises(catalog, custom, query, muscle, equipment),
    [catalog, custom, query, muscle, equipment],
  );
  const shown = results.slice(0, 80);
  function add(event: FormEvent) {
    event.preventDefault();
    if (!sets.trim() || !reps.trim() || !rest.trim()) return;
    let item = selected;
    let created: CustomExercise | undefined;
    if (creating) {
      if (!name.trim()) return;
      created = {
        id: crypto.randomUUID(),
        name: name.trim(),
        primaryMuscles: [customMuscle],
        secondaryMuscles: [],
        equipment: customEquipment,
      };
      item = {
        ...created,
        originalName: created.name,
        instructions: [],
        category: "custom",
        level: "custom",
        image: null,
        image2: null,
      };
    }
    if (!item) return;
    onSave(
      {
        id: crypto.randomUUID(),
        name: item.name,
        catalogId: item.category === "custom" ? undefined : item.id,
        customId: item.category === "custom" ? item.id : undefined,
        sets: sets.trim(),
        reps: reps.trim(),
        rest: rest.trim(),
        done: false,
      },
      created,
    );
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="catalog-modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-label="Escolher exercício"
      >
        <div className="catalog-head">
          <div>
            <span className="mini-eyebrow">BIBLIOTECA DE MOVIMENTOS</span>
            <h2>Escolha seu exercício</h2>
            <p>Filtre por músculo, veja o movimento e ajuste suas séries.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div
          className="muscle-tabs"
          role="tablist"
          aria-label="Grupos musculares"
        >
          {muscleTabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={muscle === tab.id}
              className={muscle === tab.id ? "selected" : ""}
              onClick={() => {
                setMuscle(tab.id);
                setSelected(null);
                setCreating(false);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="catalog-controls">
          <label className="catalog-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar exercício"
              aria-label="Buscar exercício"
            />
          </label>
          <select
            value={equipment}
            onChange={(event) => setEquipment(event.target.value)}
            aria-label="Filtrar equipamento"
          >
            {equipmentFilters.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
          <button
            className="outline-button"
            onClick={() => {
              setCreating(true);
              setSelected(null);
              setCustomMuscle(
                muscle === "cardio"
                  ? "cardio"
                  : muscleTabs.find((tab) => tab.id === muscle)?.muscles[0] ||
                      "chest",
              );
            }}
          >
            <Plus size={16} /> Criar meu exercício
          </button>
        </div>
        <div className="catalog-layout">
          <div className="catalog-results">
            {error && <p className="catalog-message">{error}</p>}
            {!catalog.length && !error && (
              <p className="catalog-message">Carregando catálogo...</p>
            )}
            {catalog.length > 0 && (
              <p className="result-count">
                {results.length} exercícios encontrados
                {results.length > shown.length
                  ? ` · exibindo os primeiros ${shown.length}`
                  : ""}
              </p>
            )}
            <div className="exercise-cards">
              {shown.map((item) => (
                <button
                  key={item.id}
                  className={`exercise-choice ${selected?.id === item.id ? "selected" : ""}`}
                  onClick={() => {
                    setSelected(item);
                    setCreating(false);
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`Execução de ${item.name}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="exercise-choice-map">
                      <MuscleMap
                        primary={item.primaryMuscles}
                        secondary={item.secondaryMuscles}
                        compact
                      />
                    </div>
                  )}
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.primaryMuscles
                        .map((part) => muscleNames[part] || part)
                        .join(", ")}{" "}
                      · {equipmentNames[item.equipment] || item.equipment}
                    </small>
                  </span>
                  {selected?.id === item.id && <Check size={16} />}
                </button>
              ))}
            </div>
            {catalog.length > 0 && !results.length && (
              <p className="catalog-message">
                Nenhum exercício encontrado. Experimente outro filtro ou crie o
                seu.
              </p>
            )}
          </div>
          <div className="catalog-detail">
            {creating ? (
              <>
                <span className="mini-eyebrow">EXCLUSIVO PARA SUA CONTA</span>
                <h3>Novo exercício</h3>
                <p>Seu movimento ficará disponível na sua biblioteca.</p>
                <label>
                  Nome
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={80}
                    placeholder="Ex.: agachamento com mochila"
                    form="add-exercise-form"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Músculo principal
                    <select
                      value={customMuscle}
                      onChange={(event) => setCustomMuscle(event.target.value)}
                    >
                      {Object.entries(muscleNames).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Equipamento
                    <select
                      value={customEquipment}
                      onChange={(event) =>
                        setCustomEquipment(event.target.value)
                      }
                    >
                      {Object.entries(equipmentNames).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <MuscleMap primary={[customMuscle]} />
              </>
            ) : selected ? (
              <>
                <span className="mini-eyebrow">VISUALIZAÇÃO DO MOVIMENTO</span>
                <h3>{selected.name}</h3>
                <div className="detail-visual">
                  {selected.image ? (
                    <img
                      src={selected.image}
                      alt={`Execução de ${selected.name}`}
                    />
                  ) : (
                    <Dumbbell size={42} />
                  )}
                  <MuscleMap
                    primary={selected.primaryMuscles}
                    secondary={selected.secondaryMuscles}
                  />
                </div>
                <p>
                  <strong>Principal:</strong>{" "}
                  {selected.primaryMuscles
                    .map((part) => muscleNames[part] || part)
                    .join(", ")}
                </p>
                {selected.secondaryMuscles.length > 0 && (
                  <p>
                    <strong>Secundário:</strong>{" "}
                    {selected.secondaryMuscles
                      .map((part) => muscleNames[part] || part)
                      .join(", ")}
                  </p>
                )}
                <p>
                  {equipmentNames[selected.equipment] || selected.equipment} ·{" "}
                  {categoryNames[selected.category] || selected.category}
                </p>
              </>
            ) : (
              <div className="catalog-placeholder">
                <Dumbbell size={30} />
                <h3>Escolha um movimento</h3>
                <p>
                  Selecione um exercício para ver sua imagem e os músculos
                  trabalhados.
                </p>
              </div>
            )}
            {(selected || creating) && (
              <form
                id="add-exercise-form"
                onSubmit={add}
                className="catalog-add-form"
              >
                <div className="form-row">
                  <label>
                    Séries
                    <input
                      required
                      value={sets}
                      onChange={(event) => setSets(event.target.value)}
                      maxLength={12}
                    />
                  </label>
                  <label>
                    Reps ou tempo
                    <input
                      required
                      value={reps}
                      onChange={(event) => setReps(event.target.value)}
                      maxLength={24}
                    />
                  </label>
                </div>
                <label>
                  Descanso
                  <input
                    required
                    value={rest}
                    onChange={(event) => setRest(event.target.value)}
                    maxLength={20}
                  />
                </label>
                <button type="submit" className="primary-button">
                  <Plus size={16} /> Adicionar à ficha
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
