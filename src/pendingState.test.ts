import { afterEach, describe, expect, it, vi } from "vitest";
import { createBlankData } from "./model";
import {
  clearPendingState,
  readPendingState,
  writePendingState,
} from "./pendingState";

describe("backup de alterações ainda não salvas", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("preserva a revisão mais recente quando uma gravação antiga termina depois", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const old = createBlankData("Atleta");
    const first = writePendingState("pessoa-a", old);
    const updated = { ...old, profile: { ...old.profile, weight: 81 } };
    const second = writePendingState("pessoa-a", updated);

    clearPendingState("pessoa-a", first);
    expect(readPendingState("pessoa-a")?.data.profile.weight).toBe(81);
    expect(readPendingState("pessoa-b")).toBeNull();

    clearPendingState("pessoa-a", second);
    expect(readPendingState("pessoa-a")).toBeNull();
  });
});
