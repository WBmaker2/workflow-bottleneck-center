import { describe, expect, it } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { RelationScreen } from "../../src/features/relations/RelationScreen";
import { getScenario } from "../../src/data/scenarios";
import { createInitialState } from "../../src/app/appReducer";
import { validateRelationMap } from "../../src/domain/relationValidator";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import type { DependencyEdge } from "../../src/domain/types";

const renderRelationScreen = (edges: readonly DependencyEdge[] = []) => {
  const scenario = getScenario("science-display");
  function Fixture() {
    const [currentEdges, setCurrentEdges] = useState(edges);
    const attempt = { ...createInitialState().attempts[scenario.id]!, stage: "relations" as const, conditionsAcknowledged: true, relationEdges: currentEdges };
    return <RelationScreen scenario={scenario} attempt={attempt} onChange={setCurrentEdges} onContinue={() => undefined} />;
  }
  render(<Fixture />);
};

describe("accessible relationship design", () => {
  it("adds and removes a relation without dragging", async () => {
    const user = userEvent.setup();
    renderRelationScreen();
    await user.selectOptions(screen.getByLabelText("먼저 끝낼 작업"), "verify-content");
    await user.selectOptions(screen.getByLabelText("다음에 시작할 작업"), "prepare-print-file");
    await user.click(screen.getByRole("button", { name: "관계 연결" }));
    expect(screen.getByRole("listitem", { name: /자료 확인 다음에 인쇄 글 정리/ })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "자료 확인과 인쇄 글 정리 관계 삭제" }));
    expect(screen.queryByRole("listitem", { name: /자료 확인 다음에 인쇄 글 정리/ })).not.toBeInTheDocument();
  });

  it("keeps selects reachable and reports public missing edges and safe extras", async () => {
    const user = userEvent.setup();
    renderRelationScreen();
    expect(screen.getByLabelText("먼저 끝낼 작업")).toHaveAttribute("name", "before-task");
    expect(screen.getByLabelText("다음에 시작할 작업")).toHaveAttribute("name", "after-task");
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    expect(screen.getByRole("alert")).toHaveTextContent("작업 카드에 공개된 관계를 다시 확인하세요: 글 인쇄 뒤에 글과 그림 부착을 시작합니다.");
    expect(document.activeElement).toBe(screen.getByRole("alert"));

    const extra: DependencyEdge = { beforeTaskId: "verify-content", afterTaskId: "final-review" };
    renderRelationScreen([extra]);
    expect(screen.getByText(/학생이 추가한 관계는 안전하지만 기다림이 늘어날 수 있습니다/)).toBeVisible();
  });

  it("keeps selected values after validation feedback", async () => {
    const user = userEvent.setup();
    renderRelationScreen();
    const before = screen.getByLabelText("먼저 끝낼 작업");
    const after = screen.getByLabelText("다음에 시작할 작업");
    await user.selectOptions(before, "print-text");
    await user.selectOptions(after, "attach-materials");
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    expect(before).toHaveValue("print-text");
    expect(after).toHaveValue("attach-materials");
  });

  it("renders an aria-hidden multimodal graph with semantic kind labels", () => {
    const scenario = getScenario("science-display");
    const edges = requiredEdgesFromScenario(scenario);
    const attempt = { ...createInitialState().attempts[scenario.id]!, stage: "relations" as const, conditionsAcknowledged: true, relationEdges: edges };
    render(<RelationScreen scenario={scenario} attempt={attempt} onChange={() => undefined} onContinue={() => undefined} />);
    const graph = document.querySelector("svg[aria-hidden='true']");
    expect(graph).toBeInTheDocument();
    expect(graph?.querySelector("marker")).toBeInTheDocument();
    expect(graph?.querySelector("path.relation-edge--quality.relation-edge--double")).toBeInTheDocument();
    expect(graph?.querySelector("text.relation-edge-label")?.textContent).toMatch(/먼저|안전 먼저|품질 먼저/);
    expect(validateRelationMap(scenario, edges).status).toBe("valid");
  });

  it("has no automated accessibility violations", async () => {
    const scenario = getScenario("science-display");
    const attempt = { ...createInitialState().attempts[scenario.id]!, stage: "relations" as const, conditionsAcknowledged: true, relationEdges: [] };
    const { container } = render(<RelationScreen scenario={scenario} attempt={attempt} onChange={() => undefined} onContinue={() => undefined} />);
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
