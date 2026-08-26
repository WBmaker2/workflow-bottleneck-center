import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import * as axeMatchers from "vitest-axe/matchers";
import { App } from "../../src/App";

expect.extend(axeMatchers);

it("shows every task-card judgment field before confirmation", () => {
  render(<App />);
  const card = screen.getByRole("article", { name: "글과 그림 부착" });
  expect(within(card).getByText("예상 시간 2단위")).toBeVisible();
  expect(within(card).getByText(/먼저: 글 인쇄, 그림 배치 준비/)).toBeVisible();
  expect(within(card).getByText("필요한 사람 2명")).toBeVisible();
  expect(within(card).getByText("동시에 진행: 단독 진행")).toBeVisible();
  expect(within(card).getByText(/통로를 막지 않는 책상/)).toBeVisible();
  expect(within(card).getByText("끝난 뒤 열림: 최종 점검")).toBeVisible();
  expect(card).toHaveAttribute("aria-labelledby");
});

it("uses exactly one active pulse target", () => {
  render(<App />);
  expect(screen.getAllByTestId("required-action")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "조건 확인" })).toHaveAttribute("data-pulse", "true");
});

it("shows transparent goals, human-centered guidance, and save default off", () => {
  render(<App />);
  expect(screen.getByText(/명령을 한 줄씩 실행하거나 물건을 나누는 활동이 아니라/)).toBeVisible();
  expect(screen.getByText(/도움 요청·확인·휴식은 낭비가 아닙니다/)).toBeVisible();
  expect(screen.getByText(/목표 시간 11단위/)).toBeVisible();
  expect(screen.getByText(/유일한 정답이 아닌 목표/)).toBeVisible();
  expect(screen.getByRole("checkbox", { name: /이 기기에 활동 저장/ })).not.toBeChecked();
});

it("keeps the briefing shell accessible", async () => {
  const { container } = render(<App />);
  expect((await axe(container)).violations).toHaveLength(0);
});

it("opens dated update history and restores focus on close", async () => {
  const user = userEvent.setup();
  render(<App />);
  const trigger = screen.getByRole("button", { name: "업데이트 내역" });
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "업데이트 내역" });
  expect(within(dialog).getAllByText("2026-08-26")).toHaveLength(2);
  expect(within(dialog).getByText("최초 설계 문서 작성")).toBeVisible();
  expect(within(dialog).getByText("MVP 구현과 네 시나리오 검수")).toBeVisible();
  await user.click(within(dialog).getByRole("button", { name: "닫기" }));
  expect(trigger).toHaveFocus();
});

it("preserves separate attempt state while navigating scenarios", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "조건 확인" }));
  expect(screen.getByText("현재 단계: 관계 설계")).toBeVisible();
  await user.click(screen.getByRole("button", { name: /도서 반납 카트/ }));
  expect(screen.getByRole("heading", { name: "도서 반납 카트" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: /과학 전시판 준비/ }));
  expect(screen.getByRole("heading", { name: "과학 전시판 준비" })).toBeVisible();
  expect(screen.getByText("현재 단계: 관계 설계")).toBeVisible();
  expect(screen.queryByRole("button", { name: "조건 확인" })).not.toBeInTheDocument();
});
