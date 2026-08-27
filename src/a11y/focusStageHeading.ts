import type { LearningStage } from "../domain/types";

const stageNames: Record<LearningStage, string> = {
  briefing: "안내",
  relations: "관계 설계",
  schedule: "일정표",
  simulation: "가상 실행",
  analysis: "병목 분석",
  revision: "수정",
  report: "개선 보고서",
};

/** Focuses the single app heading after a real stage transition. */
export function focusStageHeading(stage: LearningStage): void {
  const heading = document.querySelector<HTMLElement>("[data-stage-heading]");
  if (!heading) return;
  heading.setAttribute("aria-describedby", "current-stage-label");
  const stageLabel = document.getElementById("current-stage-label");
  if (stageLabel) stageLabel.textContent = `현재 단계 ${stageNames[stage]}`;
  heading.focus({ preventScroll: false });
}
