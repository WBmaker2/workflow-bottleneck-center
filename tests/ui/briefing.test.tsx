import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef, useState } from "react";
import { axe } from "vitest-axe";
import * as axeMatchers from "vitest-axe/matchers";
import { App } from "../../src/App";
import { ModalDialog } from "../../src/components/ModalDialog";

expect.extend(axeMatchers);

function CallbackChangingDialog({ version = 1 }: { version?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>열기</button>
      <ModalDialog open={open} title={`대화 ${version}`} onClose={() => setOpen(false)}>
        <button type="button">첫 번째 조작</button>
        <button type="button">마지막 조작</button>
      </ModalDialog>
    </>
  );
}

function PairedDialogs() {
  const [closed, setClosed] = useState<string[]>([]);
  const [open, setOpen] = useState({ first: true, second: true });
  return (
    <>
      <p data-testid="closed-dialogs">{closed.join(",")}</p>
      <ModalDialog open={open.first} title="첫 번째 대화" onClose={() => { setClosed((items) => [...items, "first"]); setOpen((value) => ({ ...value, first: false })); }}>
        첫 번째 내용
      </ModalDialog>
      <ModalDialog open={open.second} title="두 번째 대화" onClose={() => { setClosed((items) => [...items, "second"]); setOpen((value) => ({ ...value, second: false })); }}>
        두 번째 내용
      </ModalDialog>
    </>
  );
}

function InertDialog({ existingInert = false }: { existingInert?: boolean }) {
  const [open, setOpen] = useState(false);
  const inertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (existingInert) inertRef.current?.setAttribute("inert", "preserved");
  }, [existingInert]);
  return (
    <div data-testid="dialog-parent">
      <button type="button" data-testid="background-control">배경 조작</button>
      <div ref={inertRef} data-testid="already-inert">배경 내용</div>
      <button type="button" onClick={() => setOpen(true)}>열기</button>
      <ModalDialog open={open} title="배경 보호" onClose={() => setOpen(false)}>내용</ModalDialog>
    </div>
  );
}

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
  expect(screen.getByRole("checkbox", { name: "이 기기에 진행 저장" })).not.toBeChecked();
});

it("keeps the briefing shell accessible", async () => {
  const { container } = render(<App />);
  expect((await axe(container)).violations).toHaveLength(0);
});

it("does not restore trigger focus when an open dialog rerenders with a new inline callback", async () => {
  const user = userEvent.setup();
  const view = render(<CallbackChangingDialog />);
  await user.click(screen.getByRole("button", { name: "열기" }));
  const closeButton = screen.getByRole("button", { name: "닫기" });
  expect(closeButton).toHaveFocus();
  view.rerender(<CallbackChangingDialog version={2} />);
  expect(closeButton).toHaveFocus();
});

it("returns focus inside the dialog when Tab starts outside it", async () => {
  const user = userEvent.setup();
  render(<CallbackChangingDialog />);
  const trigger = screen.getByRole("button", { name: "열기" });
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "대화 1" });
  const focusables = within(dialog).getAllByRole("button");
  const outside = document.createElement("button");
  outside.textContent = "외부 조작";
  document.body.append(outside);
  outside.focus();
  await user.tab();
  expect(document.activeElement).toBe(focusables[0]);
  outside.focus();
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(focusables.at(-1));
  outside.remove();
});

it("gives each dialog a unique label and only the topmost dialog handles Escape", async () => {
  const user = userEvent.setup();
  render(<PairedDialogs />);
  const dialogs = screen.getAllByRole("dialog");
  expect(new Set(dialogs.map((dialog) => dialog.getAttribute("aria-labelledby"))).size).toBe(2);
  expect(dialogs[0]).toHaveAttribute("aria-modal", "true");
  await user.keyboard("{Escape}");
  expect(screen.getByTestId("closed-dialogs")).toHaveTextContent("second");
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog", { name: "첫 번째 대화" })).toBeVisible();
});

it("makes background siblings inert and restores their original attributes", async () => {
  const user = userEvent.setup();
  const view = render(<InertDialog />);
  await user.click(screen.getByRole("button", { name: "열기" }));
  expect(screen.getByTestId("background-control")).toHaveAttribute("inert");
  expect(screen.getByTestId("already-inert")).toHaveAttribute("inert");
  await user.click(screen.getByRole("button", { name: "닫기" }));
  expect(screen.getByTestId("background-control")).not.toHaveAttribute("inert");
  expect(screen.getByTestId("already-inert")).not.toHaveAttribute("inert");

  view.rerender(<InertDialog existingInert />);
  await user.click(screen.getByRole("button", { name: "열기" }));
  await user.click(screen.getByRole("button", { name: "닫기" }));
  expect(screen.getByTestId("already-inert")).toHaveAttribute("inert", "preserved");
});

it("opens dated update history and restores focus on close", async () => {
  const user = userEvent.setup();
  render(<App />);
  const trigger = screen.getByRole("button", { name: "업데이트 내역" });
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "업데이트 내역" });
  expect(within(dialog).getAllByText("2026-08-26")).toHaveLength(2);
  expect(within(dialog).getAllByText("2026-08-27")).toHaveLength(1);
  expect(within(dialog).getByText("최초 설계 문서 작성")).toBeVisible();
  expect(within(dialog).getByText("MVP 구현과 네 시나리오 검수")).toBeVisible();
  expect(within(dialog).getByText("AppProvider 손상 저장 복구 개선")).toBeVisible();
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
