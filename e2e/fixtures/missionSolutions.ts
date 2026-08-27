import { expect, type Page } from "@playwright/test";
import { requiredEdgesFromScenario } from "../../src/domain/scenarioValidation";
import { scenarioCatalog } from "../../src/data/scenarios";
import type { LearningEvidence } from "../../src/app/appTypes";
import type { ScenarioId, ScheduleEntry, ScheduleDraft } from "../../src/domain/types";

export interface MissionSolution {
  scenarioId: ScenarioId;
  initialEntries: readonly ScheduleEntry[];
  revisedEntries: readonly ScheduleEntry[];
  evidence: LearningEvidence;
}

type RoleId = "A" | "B" | "C";

const entry = (taskId: string, plannedStart: number, roleIds: readonly RoleId[]): ScheduleEntry => ({
  taskId,
  plannedStart,
  roleIds,
});

const evidenceByScenario: Readonly<Record<ScenarioId, LearningEvidence>> = {
  "science-display": {
    dependencyExplanation: "인쇄 글 정리가 끝나야 글 인쇄를 시작할 수 있는 이유는 확인한 글만 프린터로 보내야 하기 때문입니다.",
    parallelExplanation: "인쇄 글 정리와 그림 배치 준비를 함께 할 수 있는 이유는 서로 다른 역할이 맡고 프린터 사용도 겹치지 않기 때문입니다.",
    bottleneckExplanation: "자료 확인 때문에 인쇄 글 정리 작업이 2단위 기다렸습니다.",
    tradeoffExplanation: "작업 시작 시점을 실제 조건에 맞게 바꾸어 대기가 감소했고, 안전·품질·역할 공정성은 그대로 유지했습니다.",
  },
  "library-cart": {
    dependencyExplanation: "파손 여부 확인이 끝나야 수리 필요 책 표시를 시작할 수 있는 이유는 수리할 책을 먼저 구분해야 하기 때문입니다.",
    parallelExplanation: "선반 구역별 분류와 파손 여부 확인을 함께 할 수 있는 이유는 서로 다른 역할이 한 권씩 확인하고 반납 카트를 아직 사용하지 않기 때문입니다.",
    bottleneckExplanation: "반납 목록 확인 때문에 선반 구역별 분류 작업이 1단위 기다렸습니다.",
    tradeoffExplanation: "카트 사용 작업의 시작 시점을 바꾸어 자원 대기가 감소했고, 안전·품질·역할 공정성은 그대로 유지했습니다.",
  },
  "class-presentation": {
    dependencyExplanation: "자료 넘김 신호 정하기가 끝나야 자료 넘김 연습을 시작할 수 있는 이유는 말과 화면 전환 신호를 먼저 맞춰야 하기 때문입니다.",
    parallelExplanation: "발표 말하기 연습과 음향 점검을 함께 할 수 있는 이유는 서로 다른 역할이 맡고 음향 확인 기기는 한 작업만 사용하기 때문입니다.",
    bottleneckExplanation: "자료 넘김 신호 정하기 때문에 자료 넘김 연습 작업이 4단위 기다렸습니다.",
    tradeoffExplanation: "개별 준비 작업의 시작 시점을 바꾸어 대기가 감소했고, 안전·품질·역할 공정성은 그대로 유지했습니다.",
  },
  "eco-campaign-booth": {
    dependencyExplanation: "안전 통로 점검과 부스 배치 확인이 끝나야 최종 안전·품질 확인을 시작할 수 있는 이유는 통로와 역할 교대를 함께 확인해야 하기 때문입니다.",
    parallelExplanation: "안내판 준비와 역할 교대 순서 정하기를 함께 할 수 있는 이유는 역할과 사용하는 자료가 서로 겹치지 않기 때문입니다.",
    bottleneckExplanation: "안내판 꾸러미 사용 때문에 분리함 표지 준비 작업이 3단위 기다렸습니다.",
    tradeoffExplanation: "안내판 꾸러미 사용 순서를 바꾸어 자원 대기가 감소했고, 안전·품질·역할 공정성은 그대로 유지했습니다.",
  },
};

const rolePlans: Readonly<Record<ScenarioId, readonly (readonly RoleId[])[]>> = {
  "science-display": [["A"], ["B"], ["A"], ["C"], ["B", "C"], ["A", "B"]],
  "library-cart": [["A"], ["B"], ["C"], ["A"], ["A", "C"], ["B"], ["A", "B"]],
  "class-presentation": [["A", "B"], ["C"], ["A"], ["B"], ["B"], ["A", "B", "C"]],
  "eco-campaign-booth": [["A", "B"], ["A"], ["B"], ["B", "C"], ["A", "C"], ["A", "B", "C"], ["A", "B", "C"]],
};

const revisedStarts: Readonly<Record<ScenarioId, readonly number[]>> = {
  "science-display": [0, 2, 4, 2, 6, 8],
  "library-cart": [0, 1, 1, 3, 4, 6, 8],
  "class-presentation": [0, 2, 2, 4, 2, 6],
  "eco-campaign-booth": [0, 2, 5, 2, 8, 10, 12],
};

const makeSolution = (scenarioId: ScenarioId): MissionSolution => {
  const scenario = scenarioCatalog.find(({ id }) => id === scenarioId)!;
  const roles = rolePlans[scenarioId];
  const starts = revisedStarts[scenarioId];
  const revisedEntries = scenario.tasks.map((task, index) => entry(task.id, starts[index]!, roles[index]!));
  return {
    scenarioId,
    initialEntries: revisedEntries.map(({ taskId, roleIds }) => entry(taskId, 0, roleIds)),
    revisedEntries,
    evidence: evidenceByScenario[scenarioId],
  };
};

export const missionSolutions: Readonly<Record<ScenarioId, MissionSolution>> = Object.freeze({
  "science-display": makeSolution("science-display"),
  "library-cart": makeSolution("library-cart"),
  "class-presentation": makeSolution("class-presentation"),
  "eco-campaign-booth": makeSolution("eco-campaign-booth"),
});

export const draftFor = (scenarioId: ScenarioId, entries: readonly ScheduleEntry[]): ScheduleDraft => ({
  entries,
  learnerEdges: requiredEdgesFromScenario(scenarioCatalog.find(({ id }) => id === scenarioId)!),
});

export const installPointerFailureGuard = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const fail = (event: Event) => {
      throw new Error(`Pointer input is forbidden in this keyboard acceptance: ${event.type}`);
    };
    for (const eventName of ["pointerdown", "mousedown", "touchstart"]) {
      document.addEventListener(eventName, fail, true);
    }
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      const enabledIndexes = Array.from(target.options).map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);
      const currentPosition = enabledIndexes.indexOf(target.selectedIndex);
      const nextPosition = event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabledIndexes.length - 1
          : event.key === "ArrowDown"
            ? Math.min(currentPosition + 1, enabledIndexes.length - 1)
            : event.key === "ArrowUp"
              ? Math.max(currentPosition - 1, 0)
              : null;
      const nextIndex = nextPosition === null ? null : enabledIndexes[nextPosition]!;
      if (nextIndex === null || nextIndex === target.selectedIndex) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      target.selectedIndex = nextIndex;
      setTimeout(() => {
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));
      }, 0);
    }, true);
  });
};

export const installKeyboardSelectSupport = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      const enabledIndexes = Array.from(target.options).map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);
      const currentPosition = enabledIndexes.indexOf(target.selectedIndex);
      const nextPosition = event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabledIndexes.length - 1
          : event.key === "ArrowDown"
            ? Math.min(currentPosition + 1, enabledIndexes.length - 1)
            : event.key === "ArrowUp"
              ? Math.max(currentPosition - 1, 0)
              : null;
      const nextIndex = nextPosition === null ? null : enabledIndexes[nextPosition]!;
      if (nextIndex === null || nextIndex === target.selectedIndex) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      target.selectedIndex = nextIndex;
      setTimeout(() => {
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));
      }, 0);
    }, true);
  });
};

export const chooseSelectValue = async (page: Page, label: string, value: string): Promise<void> => {
  const select = page.getByLabel(label);
  await select.focus();
  const optionExists = await select.evaluate((element, wanted) => Array.from((element as HTMLSelectElement).options).some((option) => option.value === wanted), value);
  if (!optionExists) throw new Error(`Option ${value} is missing from ${label}`);
  await page.keyboard.press("Home");
  for (let step = 0; step < 20; step += 1) {
    await page.waitForTimeout(25);
    if (await select.inputValue() === value) break;
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Tab");
  await page.waitForTimeout(25);
  const selected = await select.inputValue();
  if (selected !== value) throw new Error(`Keyboard selection for ${label} stopped at ${selected}, expected ${value}`);
};

export const pressButton = async (page: Page, name: string | RegExp): Promise<void> => {
  const button = page.getByRole("button", { name });
  await expect(button).toBeEnabled();
  await button.focus();
  await page.keyboard.press("Enter");
};

const pressCheckable = async (page: Page, locator: ReturnType<Page["locator"]>): Promise<void> => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await locator.focus();
    if (await locator.isChecked()) return;
    await page.keyboard.press("Space");
    try {
      await expect(locator).toBeChecked({ timeout: 1000 });
      return;
    } catch {
      // React controlled inputs can commit after the browser's key event turn.
    }
  }
  await expect(locator).toBeChecked();
};

const selectRole = async (page: Page, roleId: RoleId): Promise<void> => {
  await pressCheckable(page, page.getByRole("checkbox", { name: `역할 ${roleId}` }));
};

const addRequiredRelations = async (page: Page, scenarioId: ScenarioId): Promise<void> => {
  const scenario = scenarioCatalog.find(({ id }) => id === scenarioId)!;
  for (const edge of requiredEdgesFromScenario(scenario)) {
    await chooseSelectValue(page, "다음에 시작할 작업", edge.afterTaskId);
    await chooseSelectValue(page, "먼저 끝낼 작업", edge.beforeTaskId);
    const beforeValue = await page.getByLabel("먼저 끝낼 작업").inputValue();
    const afterValue = await page.getByLabel("다음에 시작할 작업").inputValue();
    if (beforeValue !== edge.beforeTaskId || afterValue !== edge.afterTaskId) throw new Error(`Relation controls ended at ${beforeValue}->${afterValue}, expected ${edge.beforeTaskId}->${edge.afterTaskId}`);
    await pressButton(page, "관계 연결");
  }
  await pressButton(page, "관계 확인");
};

const placeEntries = async (page: Page, scenarioId: ScenarioId, entries: readonly ScheduleEntry[]): Promise<void> => {
  const scenario = scenarioCatalog.find(({ id }) => id === scenarioId)!;
  for (const planned of entries) {
    await chooseSelectValue(page, "배치할 작업", planned.taskId);
    await page.waitForTimeout(250);
    await expect(page.locator("input[name='placement-role']:checked")).toHaveCount(0);
    await chooseSelectValue(page, "시작 시점", String(planned.plannedStart));
    for (const roleId of [...planned.roleIds].reverse()) {
      await selectRole(page, roleId);
      await page.waitForTimeout(100);
    }
    await pressButton(page, "일정에 배치");
  }
  if (entries.length !== scenario.tasks.length) throw new Error(`${scenarioId} does not place every task`);
};

const firstParallelPair = (scenarioId: ScenarioId): readonly [string, string] => {
  const scenario = scenarioCatalog.find(({ id }) => id === scenarioId)!;
  const reachable = (from: string, target: string, seen = new Set<string>()): boolean => {
    if (from === target) return true;
    if (seen.has(from)) return false;
    seen.add(from);
    return scenario.tasks.find((task) => task.id === from)?.unlocks.some((next) => reachable(next, target, seen)) ?? false;
  };
  for (const first of scenario.tasks) for (const second of scenario.tasks) {
    if (first.id !== second.id && !reachable(first.id, second.id) && !reachable(second.id, first.id)) return [first.id, second.id];
  }
  throw new Error(`${scenarioId} has no independent task pair`);
};

const fillEvidence = async (page: Page, scenarioId: ScenarioId): Promise<void> => {
  const scenario = scenarioCatalog.find(({ id }) => id === scenarioId)!;
  const solution = missionSolutions[scenarioId];
  const firstRequired = requiredEdgesFromScenario(scenario)[0]!;
  const [parallelFirst, parallelSecond] = firstParallelPair(scenarioId);
  await chooseSelectValue(page, "선행 작업 선택", firstRequired.beforeTaskId);
  await chooseSelectValue(page, "시작 작업 선택", firstRequired.afterTaskId);
  await chooseSelectValue(page, "선행 이유 선택", "앞 작업의 결과가 필요해서");
  const dependencyText = page.getByLabel("선행 관계 설명");
  await dependencyText.focus();
  await page.keyboard.type("앞 작업의 결과를 확인하기 위해서");
  await chooseSelectValue(page, "함께 할 첫 작업", parallelFirst);
  await chooseSelectValue(page, "함께 할 둘째 작업", parallelSecond);
  await chooseSelectValue(page, "병렬 이유 선택", "서로 다른 역할로 진행할 수 있어서");
  const parallelText = page.getByLabel("병렬 관계 설명");
  await parallelText.focus();
  await page.keyboard.type("서로 기다리지 않고 준비할 수 있습니다");
  const findingSelect = page.getByLabel("병목 원인 선택");
  const findingId = await findingSelect.locator("option").nth(1).getAttribute("value");
  if (!findingId) throw new Error("A bottleneck must be selected before writing evidence");
  await chooseSelectValue(page, "병목 원인 선택", findingId);
  const waitText = await page.locator(".evidence-form p").filter({ hasText: "표시된 실제 지연" }).textContent().catch(() => null);
  const displayedUnits = waitText?.match(/(\d+)단위/)?.[1] ?? "1";
  await chooseSelectValue(page, "기다림 단위 선택", displayedUnits);
  const bottleneckText = page.getByLabel("병목 근거 설명");
  await bottleneckText.focus();
  await page.keyboard.type("실행 기록에서 확인한 기다림입니다");
  await chooseSelectValue(page, "바꾼 작업 선택", solution.revisedEntries[0]!.taskId);
  await chooseSelectValue(page, "수정 전략 선택", "순서 바꾸기");
  await chooseSelectValue(page, "시간/대기 변화 선택", "줄어들었");
  await chooseSelectValue(page, "조건 결과 선택", "지켰");
  const tradeoffText = page.getByLabel("절충 근거 설명");
  await tradeoffText.focus();
  await page.keyboard.type("조건을 함께 살피며 조정했습니다");
};

export const completeMissionByKeyboard = async (page: Page, solution: MissionSolution): Promise<void> => {
  const scenario = scenarioCatalog.find(({ id }) => id === solution.scenarioId)!;
  const missionButton = page.getByRole("button", { name: scenario.title });
  await missionButton.focus();
  await page.keyboard.press("Enter");
  await pressButton(page, "조건 확인");
  await addRequiredRelations(page, solution.scenarioId);
  await placeEntries(page, solution.scenarioId, solution.initialEntries);
  await pressButton(page, "실행");
  await page.locator("[aria-label='가상 실행 조작']").waitFor();
  await pressButton(page, "가상 실행 시작");
  await page.getByRole("group", { name: "기다림 원인 예측" }).waitFor();
  const waitReason = await page.locator("input[name='wait-reason']").first().getAttribute("value");
  if (!waitReason) throw new Error("No waiting reason choices are available");
  await pressCheckable(page, page.locator(`input[name='wait-reason'][value='${waitReason}']`));
  const prediction = page.getByLabel("기다림을 예상한 이유 (10자 이상)");
  await prediction.focus();
  await page.keyboard.type("작업 카드의 조건을 살펴보면 알 수 있습니다");
  await pressButton(page, "예측 저장");
  await pressButton(page, "분석으로 이동");
  const finding = page.locator("input[name='bottleneck-finding']").first();
  await finding.focus();
  await page.keyboard.press("Space");
  await pressButton(page, "병목 표시");
  await pressButton(page, "수정 시작");
  await placeEntries(page, solution.scenarioId, solution.revisedEntries);
  await pressButton(page, "수정안 실행·비교");
  await pressButton(page, "보고서 작성");
  await fillEvidence(page, solution.scenarioId);
  await pressButton(page, "근거 문장 확인");
  await pressButton(page, "개선 보고서 완성");
};
