import { describe, expect, it } from "vitest";
import {
  bmi,
  bmiLabel,
  createBlankData,
  createInitialData,
  formatTime,
  normalizeWeek,
  migrateData,
  sumFoodPortions,
  weekDayIndex,
  weekStartKey,
} from "./model";
describe("indicadores e tempo", () => {
  it("calcula e classifica IMC com entradas válidas", () => {
    expect(bmi(75, 175)).toBeCloseTo(24.49, 2);
    expect(bmiLabel(bmi(75, 175))).toBe("Faixa adequada");
  });
  it("rejeita medidas inválidas", () => {
    expect(bmi(75, 0)).toBeNull();
    expect(bmiLabel(null)).toBe("Informe peso e altura");
  });
  it("exibe cronômetro e semana corretamente", () => {
    expect(formatTime(3661)).toBe("01:01:01");
    expect(weekDayIndex(new Date("2026-09-28T12:00:00"))).toBe(0);
  });
  it("reinicia marcações na nova semana e mantém histórico", () => {
    const state = createInitialData();
    state.weekStart = "2026-09-21";
    state.workouts[0].exercises[0].done = true;
    state.meals[0][0].done = true;
    state.cardio.push({ date: "2026-09-23", seconds: 120 });
    const next = normalizeWeek(state, new Date("2026-09-30T12:00:00"));
    expect(next.weekStart).toBe(weekStartKey(new Date("2026-09-30T12:00:00")));
    expect(next.workouts[0].exercises[0].done).toBe(false);
    expect(next.meals[0][0].done).toBe(false);
    expect(next.cardio).toHaveLength(1);
  });
  it("não apresenta dados corporais e dieta de exemplo como dados de uma conta real", () => {
    const state = createBlankData("Lu");
    expect(state.profile.weight).toBe(0);
    expect(state.weights).toHaveLength(0);
    expect(state.meals.every((day) => day.length === 0)).toBe(true);
    expect(state.workouts.every((day) => day.exercises.length === 0)).toBe(
      true,
    );
  });
  it("preserva fichas antigas e habilita os dias já usados", () => {
    const state = createInitialData();
    const old = structuredClone(state) as unknown as Record<string, unknown>;
    delete old.customExercises;
    delete old.customFoods;
    (old.workouts as Record<string, unknown>[]).forEach(
      (workout) => delete workout.enabled,
    );
    const next = migrateData(old as unknown as typeof state);
    expect(next.workouts[0].enabled).toBe(true);
    expect(next.workouts[6].enabled).toBe(false);
    expect(next.customExercises).toEqual([]);
    expect(next.workouts[0].exercises[0].catalogId).toBeTruthy();
  });
  it("calcula nutrientes por quantidade em gramas", () => {
    const total = sumFoodPortions([
      {
        id: "1",
        foodId: "arroz",
        name: "Arroz",
        grams: 150,
        kcal100: 130,
        protein100: 2.7,
        carbs100: 28,
        fat100: 0.3,
      },
    ]);
    expect(total).toEqual({ kcal: 195, protein: 4.1, carbs: 42, fat: 0.5 });
  });
});
