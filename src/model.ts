export type Exercise = {
  id: string;
  name: string;
  catalogId?: string;
  customId?: string;
  sets: string;
  reps: string;
  rest: string;
  done: boolean;
};
export type Workout = {
  title: string;
  focus: string;
  duration: number;
  enabled: boolean;
  exercises: Exercise[];
};
export type CustomExercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
};
export type FoodPortion = {
  id: string;
  foodId: string;
  name: string;
  grams: number;
  kcal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
};
export type CustomFood = {
  id: string;
  name: string;
  category: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};
export type Meal = {
  id: string;
  time: string;
  name: string;
  detail: string;
  calories: number;
  done: boolean;
  foods?: FoodPortion[];
};
export type WeightEntry = { date: string; weight: number };
export type AppData = {
  weekStart: string;
  profile: {
    name: string;
    height: number;
    weight: number;
    targetWeight: number;
    goal: string;
  };
  workouts: Workout[];
  meals: Meal[][];
  customExercises: CustomExercise[];
  customFoods: CustomFood[];
  cardio: { date: string; seconds: number }[];
  weights: WeightEntry[];
};
export const days = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];
const ex = (
  name: string,
  sets: string,
  reps: string,
  rest = "60s",
): Exercise => ({
  id: crypto.randomUUID(),
  name,
  sets,
  reps,
  rest,
  done: false,
});
const meal = (
  time: string,
  name: string,
  detail: string,
  calories: number,
): Meal => ({
  id: crypto.randomUUID(),
  time,
  name,
  detail,
  calories,
  done: false,
});
export function createInitialData(name = "Atleta"): AppData {
  const baseMeals = [
    meal("07:00", "Café da manhã", "Ovos, pão integral e fruta", 420),
    meal("12:30", "Almoço", "Arroz, feijão, proteína e salada", 650),
    meal("16:00", "Lanche", "Iogurte natural e banana", 250),
    meal("20:00", "Jantar", "Proteína, legumes e carboidrato", 550),
  ];
  return {
    weekStart: weekStartKey(),
    profile: {
      name,
      height: 175,
      weight: 78.4,
      targetWeight: 75,
      goal: "Ganhar condicionamento",
    },
    workouts: [
      {
        title: "Peito & tríceps",
        focus: "Força superior",
        duration: 55,
        exercises: [
          ex("Supino reto", "4", "8–10", "90s"),
          ex("Supino inclinado", "3", "10–12"),
          ex("Crucifixo máquina", "3", "12"),
          ex("Tríceps corda", "3", "12–15"),
        ],
      },
      {
        title: "Costas & bíceps",
        focus: "Força superior",
        duration: 50,
        exercises: [
          ex("Puxada frontal", "4", "10"),
          ex("Remada baixa", "4", "10–12"),
          ex("Rosca direta", "3", "12"),
        ],
      },
      {
        title: "Pernas completas",
        focus: "Força inferior",
        duration: 65,
        exercises: [
          ex("Agachamento livre", "4", "8–10", "90s"),
          ex("Leg press", "4", "12"),
          ex("Mesa flexora", "3", "12"),
          ex("Panturrilha", "4", "15"),
        ],
      },
      {
        title: "Cardio & core",
        focus: "Condicionamento",
        duration: 40,
        exercises: [
          ex("Esteira ou bicicleta", "1", "25 min"),
          ex("Prancha", "3", "45s"),
          ex("Abdominal infra", "3", "15"),
        ],
      },
      {
        title: "Ombros & braços",
        focus: "Força superior",
        duration: 50,
        exercises: [
          ex("Desenvolvimento", "4", "10"),
          ex("Elevação lateral", "3", "12"),
          ex("Rosca martelo", "3", "12"),
          ex("Tríceps testa", "3", "12"),
        ],
      },
      {
        title: "Atividade leve",
        focus: "Recuperação ativa",
        duration: 30,
        exercises: [ex("Caminhada", "1", "30 min")],
      },
      { title: "Descanso", focus: "Recuperação", duration: 0, exercises: [] },
    ].map((workout, index) => ({ ...workout, enabled: index !== 6 })),
    meals: days.map(() =>
      baseMeals.map((item) => ({ ...item, id: crypto.randomUUID() })),
    ),
    customExercises: [],
    customFoods: [],
    cardio: [],
    weights: [
      {
        date: new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10),
        weight: 80.2,
      },
      {
        date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
        weight: 79.1,
      },
      { date: new Date().toISOString().slice(0, 10), weight: 78.4 },
    ],
  };
}
export function createBlankData(name = "Atleta"): AppData {
  const sample = createInitialData(name);
  return {
    ...sample,
    profile: { name, height: 0, weight: 0, targetWeight: 0, goal: "" },
    workouts: sample.workouts.map((workout, index) => ({
      ...workout,
      title: index === 6 ? "Descanso" : "Treino livre",
      focus: index === 6 ? "Recuperação" : "A definir",
      duration: 0,
      exercises: [],
    })),
    meals: days.map(() => []),
    cardio: [],
    weights: [],
  };
}
export function bmi(weight: number, heightCm: number) {
  if (weight <= 0 || heightCm <= 0) return null;
  return weight / (heightCm / 100) ** 2;
}
export function bmiLabel(value: number | null) {
  if (value === null) return "Informe peso e altura";
  if (value < 18.5) return "Abaixo do peso";
  if (value < 25) return "Faixa adequada";
  if (value < 30) return "Sobrepeso";
  return "Obesidade";
}
export function weekDayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}
export function weekStartKey(date = new Date()) {
  const monday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - weekDayIndex(date),
  );
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}
export function normalizeWeek(data: AppData, date = new Date()): AppData {
  const week = weekStartKey(date);
  if (data.weekStart === week) return data;
  return {
    ...data,
    weekStart: week,
    workouts: data.workouts.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        done: false,
      })),
    })),
    meals: data.meals.map((day) =>
      day.map((meal) => ({ ...meal, done: false })),
    ),
  };
}
const legacyExerciseIds: Record<string, string> = {
  "Supino reto": "Barbell_Bench_Press_-_Medium_Grip",
  "Supino inclinado": "Incline_Dumbbell_Press",
  "Crucifixo máquina": "Butterfly",
  "Tríceps corda": "Triceps_Pushdown_-_Rope_Attachment",
  "Puxada frontal": "Wide-Grip_Lat_Pulldown",
  "Remada baixa": "Seated_Cable_Rows",
  "Rosca direta": "Barbell_Curl",
  "Agachamento livre": "Barbell_Squat",
  "Leg press": "Leg_Press",
  "Mesa flexora": "Lying_Leg_Curls",
  Panturrilha: "Standing_Calf_Raises",
  Prancha: "Plank",
  "Abdominal infra": "Hanging_Leg_Raise",
  Desenvolvimento: "Dumbbell_Shoulder_Press",
  "Elevação lateral": "Side_Lateral_Raise",
  "Rosca martelo": "Hammer_Curls",
  "Tríceps testa": "Lying_Triceps_Press",
  Caminhada: "Walking_Treadmill",
};
export function migrateData(data: AppData): AppData {
  return {
    ...data,
    workouts: data.workouts.map((workout, index) => ({
      ...workout,
      enabled: workout.enabled ?? index !== 6,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        catalogId: exercise.catalogId ?? legacyExerciseIds[exercise.name],
      })),
    })),
    customExercises: Array.isArray(data.customExercises)
      ? data.customExercises
      : [],
    customFoods: Array.isArray(data.customFoods) ? data.customFoods : [],
  };
}
export function sumFoodPortions(portions: FoodPortion[]) {
  const total = portions.reduce(
    (sum, item) => {
      const factor = item.grams / 100;
      sum.kcal += item.kcal100 * factor;
      sum.protein += item.protein100 * factor;
      sum.carbs += item.carbs100 * factor;
      sum.fat += item.fat100 * factor;
      return sum;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return Object.fromEntries(
    Object.entries(total).map(([key, value]) => [
      key,
      Math.round(value * 10) / 10,
    ]),
  ) as typeof total;
}
export const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
