import type { LearningStage } from "../domain/types";

export interface LearnerCopy {
  stageLabels: Record<LearningStage, string>;
  analysisTerms: Record<string, string>;
  reportHints: Record<"dependency" | "parallel" | "bottleneck" | "tradeoff", string>;
}

/** 학생 화면에서 반복해서 쓰는 짧고 설명적인 문장입니다. */
export const learnerCopy: LearnerCopy = Object.freeze({
  stageLabels: {
    briefing: "안내",
    relations: "관계 설계",
    schedule: "일정표",
    simulation: "가상 실행",
    analysis: "병목 분석",
    revision: "수정",
    report: "개선 보고서",
  },
  analysisTerms: {
    bottleneck: "뒤 작업을 기다리게 만든 곳",
    bottleneckDescription: "긴 작업이 아니라 뒤 작업을 기다리게 만든 곳을 찾아보세요.",
    cause: "기다림의 원인",
    causeDescription: "어떤 원인 때문에 뒤 작업이 기다렸는지 살펴보세요.",
    prediction: "내가 먼저 예상한 이유",
    predictionDescription: "실행하기 전에 내가 먼저 예상한 이유를 적어 보세요.",
  },
  reportHints: {
    dependency: "앞 작업이 끝나야 다음 작업을 시작할 수 있는 까닭을 살펴보세요.",
    parallel: "서로 기다리지 않고 함께 할 수 있는 두 작업을 찾아보세요.",
    bottleneck: "뒤 작업을 기다리게 만든 원인을 찾아보세요.",
    tradeoff: "시간뿐 아니라 안전·품질·협력을 함께 지키는 방법을 생각해 보세요.",
  },
});
