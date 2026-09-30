import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, Trash2, Utensils, X } from "lucide-react";
import { loadFoods, searchFoods, type CatalogFood } from "./catalog";
import {
  sumFoodPortions,
  type AppData,
  type CustomFood,
  type FoodPortion,
  type Meal,
} from "./model";

type Props = {
  meal?: Meal;
  custom: AppData["customFoods"];
  onSave: (meal: Meal, created: CustomFood[]) => void;
  onClose: () => void;
};
export default function MealEditor({ meal, custom, onSave, onClose }: Props) {
  const [catalog, setCatalog] = useState<CatalogFood[]>([]);
  const [error, setError] = useState("");
  const [name, setName] = useState(meal?.name || "Nova refeição");
  const [time, setTime] = useState(meal?.time || "12:00");
  const [portions, setPortions] = useState<FoodPortion[]>(meal?.foods || []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [grams, setGrams] = useState("100");
  const [selected, setSelected] = useState<CatalogFood | null>(null);
  const [creating, setCreating] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");
  const [customProtein, setCustomProtein] = useState("0");
  const [customCarbs, setCustomCarbs] = useState("0");
  const [customFat, setCustomFat] = useState("0");
  const [created, setCreated] = useState<CustomFood[]>([]);
  useEffect(() => {
    loadFoods()
      .then(setCatalog)
      .catch(() =>
        setError(
          "Não foi possível carregar os alimentos. Reabra a janela para tentar novamente.",
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
  const categories = useMemo(
    () =>
      Array.from(new Set(catalog.map((food) => food.category))).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [catalog],
  );
  const results = useMemo(
    () => searchFoods(catalog, [...custom, ...created], query, category),
    [catalog, custom, created, query, category],
  );
  const totals = sumFoodPortions(portions);
  function addFood(food: CatalogFood) {
    const amount = Number(grams);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) return;
    setPortions((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        foodId: food.id,
        name: food.name,
        grams: amount,
        kcal100: food.kcal,
        protein100: food.protein,
        carbs100: food.carbs,
        fat100: food.fat,
      },
    ]);
    setSelected(null);
  }
  function createFood(event: FormEvent) {
    event.preventDefault();
    const kcal = Number(customKcal),
      protein = Number(customProtein),
      carbs = Number(customCarbs),
      fat = Number(customFat);
    if (
      !customName.trim() ||
      !Number.isFinite(kcal) ||
      kcal < 0 ||
      kcal > 1000 ||
      [protein, carbs, fat].some(
        (value) => !Number.isFinite(value) || value < 0 || value > 100,
      )
    )
      return;
    const item: CustomFood = {
      id: crypto.randomUUID(),
      name: customName.trim(),
      category: "Meus alimentos",
      kcal,
      protein,
      carbs,
      fat,
    };
    setCreated((items) => [...items, item]);
    setCreating(false);
    setSelected({ ...item, originalName: item.name, featured: true });
    setQuery(item.name);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onSave(
      {
        id: meal?.id || crypto.randomUUID(),
        name: name.trim(),
        time,
        detail:
          portions.map((item) => `${item.name} (${item.grams} g)`).join(", ") ||
          meal?.detail ||
          "",
        calories: portions.length
          ? Math.round(totals.kcal)
          : meal?.calories || 0,
        done: meal?.done || false,
        foods: portions,
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
        className="catalog-modal meal-editor glass-card"
        role="dialog"
        aria-modal="true"
        aria-label={meal ? "Editar refeição" : "Adicionar refeição"}
      >
        <div className="catalog-head">
          <div>
            <span className="mini-eyebrow">PLANO ALIMENTAR</span>
            <h2>{meal ? "Editar refeição" : "Montar refeição"}</h2>
            <p>
              Escolha alimentos e informe a quantidade consumida ou planejada.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="catalog-layout">
          <div className="catalog-results">
            <div className="catalog-controls">
              <label className="catalog-search">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar alimento: arroz, ovo, banana..."
                  aria-label="Buscar alimento"
                />
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Categoria de alimentos"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="Meus alimentos">Meus alimentos</option>
              </select>
            </div>
            <button
              className="outline-button create-food-button"
              onClick={() => setCreating(true)}
            >
              <Plus size={16} /> Criar meu alimento
            </button>
            {error && <p className="catalog-message">{error}</p>}
            {!catalog.length && !error && (
              <p className="catalog-message">Carregando alimentos...</p>
            )}
            {catalog.length > 0 && (
              <p className="result-count">
                {results.length} alimentos encontrados · valores por 100 g
              </p>
            )}
            <div className="food-results">
              {results.slice(0, 100).map((food) => (
                <button
                  key={food.id}
                  className={`food-choice ${selected?.id === food.id ? "selected" : ""}`}
                  onClick={() => setSelected(food)}
                >
                  <span className="food-icon">
                    <Utensils size={18} />
                  </span>
                  <span>
                    <strong>{food.name}</strong>
                    <small>
                      {food.category} · P {food.protein} g · C {food.carbs} g ·
                      G {food.fat} g
                    </small>
                  </span>
                  <b>{food.kcal} kcal</b>
                </button>
              ))}
            </div>
            {catalog.length > 0 && !results.length && (
              <p className="catalog-message">
                Nenhum alimento encontrado. Tente outro termo ou crie o seu.
              </p>
            )}
          </div>
          <div className="catalog-detail">
            <form onSubmit={save} id="meal-form">
              <span className="mini-eyebrow">SUA REFEIÇÃO</span>
              <div className="form-row">
                <label>
                  Nome
                  <input
                    required
                    value={name}
                    maxLength={80}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label>
                  Horário
                  <input
                    required
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  />
                </label>
              </div>
              {selected && (
                <div className="selected-food">
                  <strong>{selected.name}</strong>
                  <p>{selected.kcal} kcal por 100 g</p>
                  <div className="form-row">
                    <label>
                      Quantidade (g)
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={grams}
                        onChange={(event) => setGrams(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="outline-button"
                      onClick={() => addFood(selected)}
                    >
                      <Plus size={16} /> Incluir
                    </button>
                  </div>
                </div>
              )}
              <div className="portion-list">
                <h3>Alimentos da refeição</h3>
                {portions.length ? (
                  portions.map((item) => (
                    <div className="portion-row" key={item.id}>
                      <span>
                        <strong>{item.name}</strong>
                        <small>
                          {Math.round((item.kcal100 * item.grams) / 100)} kcal
                        </small>
                      </span>
                      <label>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          value={item.grams}
                          aria-label={`Gramas de ${item.name}`}
                          onChange={(event) =>
                            setPortions((items) =>
                              items.map((portion) =>
                                portion.id === item.id
                                  ? {
                                      ...portion,
                                      grams: Number(event.target.value),
                                    }
                                  : portion,
                              ),
                            )
                          }
                        />{" "}
                        g
                      </label>
                      <button
                        type="button"
                        className="icon-button muted"
                        aria-label={`Remover ${item.name}`}
                        onClick={() =>
                          setPortions((items) =>
                            items.filter((portion) => portion.id !== item.id),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p>
                    Selecione alimentos à esquerda para compor esta refeição.
                  </p>
                )}
              </div>
              <div className="meal-totals">
                <strong>{Math.round(totals.kcal)} kcal</strong>
                <span>
                  Proteína {totals.protein} g · Carboidratos {totals.carbs} g ·
                  Gorduras {totals.fat} g
                </span>
              </div>
              <button className="primary-button" type="submit">
                Salvar refeição
              </button>
            </form>
          </div>
        </div>
        {creating && (
          <div className="submodal-backdrop">
            <form className="submodal glass-card" onSubmit={createFood}>
              <button
                type="button"
                className="icon-button modal-close"
                onClick={() => setCreating(false)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
              <span className="mini-eyebrow">EXCLUSIVO PARA SUA CONTA</span>
              <h3>Novo alimento</h3>
              <p>Informe os valores nutricionais por 100 g.</p>
              <label>
                Nome
                <input
                  required
                  maxLength={100}
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                />
              </label>
              <div className="form-row">
                <label>
                  Calorias
                  <input
                    required
                    type="number"
                    min="0"
                    max="1000"
                    step="0.1"
                    value={customKcal}
                    onChange={(event) => setCustomKcal(event.target.value)}
                  />
                </label>
                <label>
                  Proteína (g)
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={customProtein}
                    onChange={(event) => setCustomProtein(event.target.value)}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Carboidratos (g)
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={customCarbs}
                    onChange={(event) => setCustomCarbs(event.target.value)}
                  />
                </label>
                <label>
                  Gorduras (g)
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={customFat}
                    onChange={(event) => setCustomFat(event.target.value)}
                  />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Criar alimento
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
