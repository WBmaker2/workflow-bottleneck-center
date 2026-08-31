import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/App";

const testStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => { values.clear(); },
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } satisfies Storage;
};

describe("update history flow", () => {
  beforeEach(() => Object.defineProperty(window, "localStorage", { configurable: true, value: testStorage() }));
  afterEach(() => { cleanup(); window.localStorage.clear(); });

  it("connects the trigger to the dated dialog and keeps it in document flow", () => {
    render(<App />);
    const trigger = screen.getByTestId("update-history-trigger");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-controls", "update-history-dialog");
    expect(trigger.closest("footer")).toBeInTheDocument();
    expect(getComputedStyle(trigger).position).toBe("static");

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "업데이트 내역" });
    expect(dialog).toHaveAttribute("id", "update-history-dialog");
    expect(within(dialog).getByText("2026-08-28")).toBeVisible();
    expect(within(dialog).getByText("학습자 안내·모바일 탐색 흐름 개선")).toBeVisible();
    expect(within(dialog).getByText("2026-08-31")).toBeVisible();
    expect(within(dialog).getByText("첫 행동·반복 입력·예측 안내를 초등학생 흐름에 맞게 정돈")).toBeVisible();
  });

  it("keeps one required action pulse on the relations screen", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "조건 확인" }));
    expect(screen.getByRole("button", { name: "관계 확인" })).toHaveAttribute("data-pulse", "true");
    expect(document.querySelectorAll('[data-pulse="true"]')).toHaveLength(1);
  });
});
