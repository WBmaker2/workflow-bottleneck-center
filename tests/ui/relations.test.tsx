import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
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
    renderRelationScreen([...requiredEdgesFromScenario(getScenario("science-display")), extra]);
    expect(screen.getByText(/학생이 추가한 관계는 안전하지만 기다림이 늘어날 수 있습니다/)).toBeVisible();
  });

  it("shows every missing required relation as a readable hint before validation", () => {
    const scenario = getScenario("science-display");
    const missing = requiredEdgesFromScenario(scenario);
    const attempt = { ...createInitialState().attempts[scenario.id]!, stage: "relations" as const, conditionsAcknowledged: true, relationEdges: [] };
    render(<RelationScreen scenario={scenario} attempt={attempt} onChange={() => undefined} onContinue={() => undefined} />);

    const heading = screen.getByRole("heading", { name: "필수 관계 힌트" });
    const requirementList = within(heading.parentElement!).getByRole("list");
    expect(within(requirementList).getAllByRole("listitem")).toHaveLength(missing.length);
    expect(within(requirementList).getAllByRole("listitem")[0]).toHaveTextContent("먼저 자료 확인, 그 다음 인쇄 글 정리 — 확인한 글만 인쇄 파일에 넣습니다");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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

  it.each([
    ["unknown", [{ beforeTaskId: "missing-task", afterTaskId: "verify-content" }], "알 수 없는 작업을 포함해 관계를 확인해야 합니다."],
    ["cycle", [{ beforeTaskId: "verify-content", afterTaskId: "prepare-print-file" }, { beforeTaskId: "prepare-print-file", afterTaskId: "verify-content" }], "작업이 서로를 기다리는 순환 관계라 확인해야 합니다."],
    ["duplicate", [{ beforeTaskId: "verify-content", afterTaskId: "prepare-print-file" }, { beforeTaskId: "verify-content", afterTaskId: "prepare-print-file" }], "같은 관계가 두 번 있어 하나만 남겨야 합니다."],
  ] as const)("describes %s invalid rows without safe extra wording", async (kind, edges, neutralMessage) => {
    const scenario = getScenario("science-display");
    const attempt = { ...createInitialState().attempts[scenario.id]!, stage: "relations" as const, conditionsAcknowledged: true, relationEdges: edges };
    const user = userEvent.setup();
    render(<RelationScreen scenario={scenario} attempt={attempt} onChange={() => undefined} onContinue={() => undefined} />);
    const relationList = within(document.querySelector("ol.relation-list")!);
    expect(relationList.getAllByRole("listitem").some((item) => item.textContent?.includes("이 관계는 안전하지만"))).toBe(false);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    expect(screen.getByRole("alert")).toHaveTextContent(neutralMessage);
    expect(relationList.getAllByRole("listitem").length).toBe(edges.length);
  });

  it("renders duplicate rows without React key warnings and allows deleting one", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const user = userEvent.setup();
    const scenario = getScenario("science-display");
    const edge = { beforeTaskId: "verify-content", afterTaskId: "prepare-print-file" } as const;
    function Fixture() {
      const [edges, setEdges] = useState<readonly DependencyEdge[]>([edge, edge]);
      const attempt = { ...createInitialState().attempts[scenario.id]!, stage: "relations" as const, conditionsAcknowledged: true, relationEdges: edges };
      return <RelationScreen scenario={scenario} attempt={attempt} onChange={setEdges} onContinue={() => undefined} />;
    }
    render(<Fixture />);
    const relationList = within(document.querySelector("ol.relation-list")!);
    expect(relationList.getAllByRole("listitem")).toHaveLength(2);
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining("Each child in a list should have a unique"));
    await user.click(relationList.getAllByRole("button", { name: "자료 확인과 인쇄 글 정리 관계 삭제" })[0]!);
    expect(relationList.getAllByRole("listitem")).toHaveLength(1);
    error.mockRestore();
  });

  it("shows the screen-level safe/wait summary only for valid-with-extra", async () => {
    const scenario = getScenario("science-display");
    const required = requiredEdgesFromScenario(scenario);
    const extra = { beforeTaskId: "verify-content", afterTaskId: "final-review" } as const;
    const safeText = "학생이 추가한 관계는 안전하지만 기다림이 늘어날 수 있습니다. 필요하다면 삭제하고 흐름을 비교해 보세요.";
    const user = userEvent.setup();
    const renderAttempt = (edges: readonly DependencyEdge[]) => { cleanup(); return render(<RelationScreen scenario={scenario} attempt={{ relationEdges: edges }} onChange={() => undefined} onContinue={() => undefined} />); };

    renderAttempt([...required, extra]);
    expect(screen.getByText(safeText)).toBeVisible();

    renderAttempt([...required, extra, required[0]!]);
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    expect(screen.queryByText(safeText)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("같은 관계가 두 번 있어 하나만 남겨야 합니다.");

    renderAttempt([...required, extra, { beforeTaskId: "prepare-print-file", afterTaskId: "verify-content" }]);
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    expect(screen.queryByText(safeText)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("작업이 서로를 기다리는 순환 관계라 확인해야 합니다.");

    renderAttempt([...required, extra, { beforeTaskId: "unknown-task", afterTaskId: "verify-content" }]);
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    expect(screen.queryByText(safeText)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("알 수 없는 작업을 포함해 관계를 확인해야 합니다.");

    renderAttempt([extra]);
    await user.click(screen.getByRole("button", { name: "관계 확인" }));
    expect(screen.queryByText(safeText)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("작업 카드에 공개된 관계를 다시 확인하세요: 글 인쇄 뒤에 글과 그림 부착을 시작합니다.");
  });
});
