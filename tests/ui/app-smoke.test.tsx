import { render, screen } from "@testing-library/react";
import { App } from "../../src/App";

it("shows the Korean service name and virtual-time boundary", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "작업 순서 병목 해결소" }),
  ).toBeVisible();
  expect(screen.getByText(/교육용 가상 시간/)).toBeVisible();
});

it("keeps one main heading and avoids ranking language", () => {
  render(<App />);
  expect(screen.getAllByRole("main")).toHaveLength(1);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.queryByText(/순위|생산성|경쟁/)).not.toBeInTheDocument();
});

it("keeps the selected scenario status inside its meta line", () => {
  render(<App />);
  const selected = screen.getByRole("button", { name: /과학 전시판 준비/ });
  expect(selected).toHaveAccessibleName(/선택됨/);
  expect(selected.querySelector("small")).toHaveTextContent(/선택됨/);
  expect(selected.querySelector(".scenario-navigation__status")).toBeVisible();
});
