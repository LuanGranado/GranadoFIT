import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import {
  searchExercises,
  searchFoods,
  type CatalogExercise,
  type CatalogFood,
} from "./catalog";

const exercises = JSON.parse(
  readFileSync("public/data/exercises.json", "utf8"),
) as CatalogExercise[];
const foods = JSON.parse(
  readFileSync("public/data/foods.json", "utf8"),
) as CatalogFood[];

describe("catálogos locais", () => {
  it("inclui movimentos com e sem máquinas, fotos e músculos", () => {
    expect(exercises.length).toBeGreaterThan(800);
    expect(exercises.some((item) => item.equipment === "body only")).toBe(true);
    expect(exercises.some((item) => item.equipment === "machine")).toBe(true);
    expect(exercises.every((item) => item.primaryMuscles.length > 0)).toBe(
      true,
    );
    expect(
      exercises.filter(
        (item) => item.image && existsSync(`public${item.image}`),
      ).length,
    ).toBeGreaterThan(850);
    expect(
      searchExercises(
        exercises,
        [],
        "flexão de braço",
        "chest",
        "body only",
      ).some((item) => item.name === "Flexão de braço"),
    ).toBe(true);
    expect(
      searchExercises(
        exercises,
        [
          {
            id: "own",
            name: "Cardio em casa",
            primaryMuscles: ["cardio"],
            secondaryMuscles: [],
            equipment: "body only",
          },
        ],
        "",
        "cardio",
        "all",
      ).some((item) => item.id === "own"),
    ).toBe(true);
  });
  it("inclui alimentos com macros e encontra termos em português", () => {
    expect(foods.length).toBeGreaterThan(7500);
    expect(
      foods.every((item) =>
        [item.kcal, item.protein, item.carbs, item.fat].every(Number.isFinite),
      ),
    ).toBe(true);
    expect(
      searchFoods(foods, [], "arroz", "all").some(
        (item) => item.name === "Arroz branco cozido",
      ),
    ).toBe(true);
  });
});
