import type { AppData, CustomExercise, CustomFood } from "./model";

export type CatalogExercise = {
  id: string;
  name: string;
  originalName: string;
  instructions: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  level: string;
  image: string | null;
  image2: string | null;
  video?: {
    src: string;
    author: string;
    source: string;
    license: string;
    licenseUrl: string;
  };
};
export type CatalogFood = {
  id: string;
  name: string;
  originalName: string;
  category: string;
  featured: boolean;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

let exercisePromise: Promise<CatalogExercise[]> | null = null;
let foodPromise: Promise<CatalogFood[]> | null = null;

export function loadExercises() {
  exercisePromise ??= fetch("/data/exercises.json")
    .then((response) => {
      if (!response.ok) throw new Error("Catálogo de exercícios indisponível");
      return response.json() as Promise<CatalogExercise[]>;
    })
    .catch((error) => {
      exercisePromise = null;
      throw error;
    });
  return exercisePromise;
}
export function loadFoods() {
  foodPromise ??= fetch("/data/foods.json")
    .then((response) => {
      if (!response.ok) throw new Error("Catálogo de alimentos indisponível");
      return response.json() as Promise<CatalogFood[]>;
    })
    .catch((error) => {
      foodPromise = null;
      throw error;
    });
  return foodPromise;
}

export const muscleTabs = [
  { id: "all", label: "Todos", muscles: [] },
  { id: "chest", label: "Peito", muscles: ["chest"] },
  {
    id: "back",
    label: "Costas",
    muscles: ["lats", "middle back", "lower back", "traps"],
  },
  { id: "shoulders", label: "Ombros", muscles: ["shoulders"] },
  { id: "biceps", label: "Bíceps", muscles: ["biceps"] },
  { id: "triceps", label: "Tríceps", muscles: ["triceps"] },
  { id: "abs", label: "Abdômen", muscles: ["abdominals"] },
  { id: "quads", label: "Quadríceps", muscles: ["quadriceps"] },
  { id: "hamstrings", label: "Posterior", muscles: ["hamstrings"] },
  {
    id: "glutes",
    label: "Glúteos",
    muscles: ["glutes", "abductors", "adductors"],
  },
  { id: "calves", label: "Panturrilha", muscles: ["calves"] },
  { id: "forearms", label: "Antebraço", muscles: ["forearms"] },
  { id: "cardio", label: "Cardio", muscles: [] },
] as const;
export const muscleNames: Record<string, string> = {
  chest: "Peito",
  lats: "Dorsais",
  "middle back": "Costas",
  "lower back": "Lombar",
  traps: "Trapézio",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebraços",
  abdominals: "Abdômen",
  quadriceps: "Quadríceps",
  hamstrings: "Posterior de coxa",
  glutes: "Glúteos",
  abductors: "Abdutores",
  adductors: "Adutores",
  calves: "Panturrilhas",
  neck: "Pescoço",
  cardio: "Corpo inteiro / cardio",
};
export const equipmentNames: Record<string, string> = {
  "body only": "Peso corporal",
  barbell: "Barra",
  dumbbell: "Halteres",
  cable: "Cabo",
  machine: "Máquina",
  kettlebells: "Kettlebell",
  bands: "Elástico",
  "e-z curl bar": "Barra W",
  medicine: "Bola medicinal",
  "medicine ball": "Bola medicinal",
  "exercise ball": "Bola suíça",
  "foam roll": "Rolo de liberação",
  exercise: "Acessório",
  other: "Outro",
};
export const categoryNames: Record<string, string> = {
  cardio: "Cardio",
  "olympic weightlifting": "Levantamento olímpico",
  plyometrics: "Pliometria",
  powerlifting: "Levantamento de força",
  strength: "Força",
  stretching: "Alongamento",
  strongman: "Força funcional",
  custom: "Meu exercício",
};
export const equipmentFilters = [
  { id: "all", label: "Todos os equipamentos" },
  { id: "body only", label: "Peso corporal" },
  { id: "dumbbell", label: "Halteres" },
  { id: "barbell", label: "Barra" },
  { id: "cable", label: "Cabo" },
  { id: "machine", label: "Máquina" },
  { id: "other", label: "Outros" },
] as const;

const foodAliases: Record<string, string[]> = {
  arroz: ["rice"],
  feijao: ["beans"],
  frango: ["chicken"],
  ovo: ["egg"],
  leite: ["milk"],
  queijo: ["cheese"],
  carne: ["beef", "pork", "meat"],
  peixe: ["fish"],
  pao: ["bread"],
  aveia: ["oats"],
  batata: ["potato"],
  macarrao: ["pasta"],
  banana: ["banana"],
  maca: ["apple"],
  laranja: ["orange"],
  brocolis: ["broccoli"],
  cenoura: ["carrot"],
  tomate: ["tomato"],
  azeite: ["olive oil"],
  amendoim: ["peanut"],
  cafe: ["coffee"],
};
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
export function localizeExerciseNames(
  data: AppData,
  catalog: CatalogExercise[],
): AppData {
  const names = new Map(catalog.map((item) => [item.id, item.name]));
  let changed = false;
  const workouts = data.workouts.map((workout) => ({
    ...workout,
    exercises: workout.exercises.map((exercise) => {
      const name = exercise.catalogId
        ? names.get(exercise.catalogId)
        : undefined;
      if (!name || name === exercise.name) return exercise;
      changed = true;
      return { ...exercise, name };
    }),
  }));
  return changed ? { ...data, workouts } : data;
}
export function searchExercises(
  catalog: CatalogExercise[],
  custom: CustomExercise[],
  query: string,
  muscle: string,
  equipment: string,
) {
  const term = normalizeSearch(query);
  const tab = muscleTabs.find((item) => item.id === muscle) ?? muscleTabs[0];
  const combined: CatalogExercise[] = [
    ...custom.map((item) => ({
      ...item,
      originalName: item.name,
      instructions: [],
      category: "custom",
      level: "custom",
      image: null,
      image2: null,
    })),
    ...catalog,
  ];
  return combined
    .filter((item) => {
      const matchesMuscle =
        tab.id === "all" ||
        (tab.id === "cardio"
          ? item.category === "cardio" || item.primaryMuscles.includes("cardio")
          : tab.muscles.some((part) => item.primaryMuscles.includes(part)));
      const matchesEquipment =
        equipment === "all" ||
        (equipment === "other"
          ? !["body only", "dumbbell", "barbell", "cable", "machine"].includes(
              item.equipment,
            )
          : item.equipment === equipment);
      const haystack = normalizeSearch(
        `${item.name} ${item.originalName} ${item.primaryMuscles.map((part) => muscleNames[part] || part).join(" ")}`,
      );
      return (
        matchesMuscle && matchesEquipment && (!term || haystack.includes(term))
      );
    })
    .sort((a, b) => {
      const aPt = a.name !== a.originalName || a.category === "custom";
      const bPt = b.name !== b.originalName || b.category === "custom";
      return Number(bPt) - Number(aPt) || a.name.localeCompare(b.name, "pt-BR");
    });
}
export function searchFoods(
  catalog: CatalogFood[],
  custom: CustomFood[],
  query: string,
  category: string,
) {
  const term = normalizeSearch(query);
  const aliases = foodAliases[term] || [];
  const combined: CatalogFood[] = [
    ...custom.map((item) => ({
      ...item,
      originalName: item.name,
      featured: true,
    })),
    ...catalog,
  ];
  return combined
    .filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!term) return item.featured;
      const haystack = normalizeSearch(
        `${item.name} ${item.originalName} ${item.category}`,
      );
      return (
        haystack.includes(term) ||
        aliases.some((alias) => haystack.includes(alias))
      );
    })
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.name.localeCompare(b.name, "pt-BR"),
    );
}
