import { render, screen } from "@testing-library/react";
import { App } from "../../src/App";

it("shows the Korean service name and virtual-time boundary", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "작업 순서 병목 해결소" }),
  ).toBeVisible();
  expect(screen.getByText(/교육용 가상 시간/)).toBeVisible();
});
