export type Exercise = { id: string; name: string; sets: string; reps: string; rest: string; done: boolean }
export type Workout = { title: string; focus: string; duration: number; exercises: Exercise[] }
export type Meal = { id: string; time: string; name: string; detail: string; calories: number; done: boolean }
export type WeightEntry = { date: string; weight: number }
export type AppData = { weekStart: string; profile: { name: string; height: number; weight: number; targetWeight: number; goal: string }; workouts: Workout[]; meals: Meal[][]; cardio: { date: string; seconds: number }[]; weights: WeightEntry[] }
export const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const ex = (name: string, sets: string, reps: string, rest = '60s'): Exercise => ({ id: crypto.randomUUID(), name, sets, reps, rest, done: false })
const meal = (time: string, name: string, detail: string, calories: number): Meal => ({ id: crypto.randomUUID(), time, name, detail, calories, done: false })
export function createInitialData(name = 'Atleta'): AppData {
  const baseMeals = [meal('07:00', 'Café da manhã', 'Ovos, pão integral e fruta', 420), meal('12:30', 'Almoço', 'Arroz, feijão, proteína e salada', 650), meal('16:00', 'Lanche', 'Iogurte natural e banana', 250), meal('20:00', 'Jantar', 'Proteína, legumes e carboidrato', 550)]
  return { weekStart: weekStartKey(), profile: { name, height: 175, weight: 78.4, targetWeight: 75, goal: 'Ganhar condicionamento' }, workouts: [
    { title: 'Peito & tríceps', focus: 'Força superior', duration: 55, exercises: [ex('Supino reto', '4', '8–10', '90s'), ex('Supino inclinado', '3', '10–12'), ex('Crucifixo máquina', '3', '12'), ex('Tríceps corda', '3', '12–15')] },
    { title: 'Costas & bíceps', focus: 'Força superior', duration: 50, exercises: [ex('Puxada frontal', '4', '10'), ex('Remada baixa', '4', '10–12'), ex('Rosca direta', '3', '12')] },
    { title: 'Pernas completas', focus: 'Força inferior', duration: 65, exercises: [ex('Agachamento livre', '4', '8–10', '90s'), ex('Leg press', '4', '12'), ex('Mesa flexora', '3', '12'), ex('Panturrilha', '4', '15')] },
    { title: 'Cardio & core', focus: 'Condicionamento', duration: 40, exercises: [ex('Esteira ou bicicleta', '1', '25 min'), ex('Prancha', '3', '45s'), ex('Abdominal infra', '3', '15')] },
    { title: 'Ombros & braços', focus: 'Força superior', duration: 50, exercises: [ex('Desenvolvimento', '4', '10'), ex('Elevação lateral', '3', '12'), ex('Rosca martelo', '3', '12'), ex('Tríceps testa', '3', '12')] },
    { title: 'Atividade leve', focus: 'Recuperação ativa', duration: 30, exercises: [ex('Caminhada', '1', '30 min')] },
    { title: 'Descanso', focus: 'Recuperação', duration: 0, exercises: [] }
  ], meals: days.map(() => baseMeals.map(item => ({ ...item, id: crypto.randomUUID() }))), cardio: [], weights: [{ date: new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10), weight: 80.2 }, { date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10), weight: 79.1 }, { date: new Date().toISOString().slice(0, 10), weight: 78.4 }] }
}
export function createBlankData(name = 'Atleta'): AppData { const sample = createInitialData(name); return { ...sample, profile: { name, height: 0, weight: 0, targetWeight: 0, goal: '' }, workouts: sample.workouts.map((workout, index) => ({ ...workout, title: index === 6 ? 'Descanso' : 'Treino livre', focus: index === 6 ? 'Recuperação' : 'A definir', duration: 0, exercises: [] })), meals: days.map(() => []), cardio: [], weights: [] } }
export function bmi(weight: number, heightCm: number) { if (weight <= 0 || heightCm <= 0) return null; return weight / ((heightCm / 100) ** 2) }
export function bmiLabel(value: number | null) { if (value === null) return 'Informe peso e altura'; if (value < 18.5) return 'Abaixo do peso'; if (value < 25) return 'Faixa adequada'; if (value < 30) return 'Sobrepeso'; return 'Obesidade' }
export function weekDayIndex(date = new Date()) { return (date.getDay() + 6) % 7 }
export function weekStartKey(date = new Date()) { const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekDayIndex(date)); return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}` }
export function normalizeWeek(data: AppData, date = new Date()): AppData { const week = weekStartKey(date); if (data.weekStart === week) return data; return { ...data, weekStart: week, workouts: data.workouts.map(workout => ({ ...workout, exercises: workout.exercises.map(exercise => ({ ...exercise, done: false })) })), meals: data.meals.map(day => day.map(meal => ({ ...meal, done: false }))) } }
export const formatTime = (seconds: number) => `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
