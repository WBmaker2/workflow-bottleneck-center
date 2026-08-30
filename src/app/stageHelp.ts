import type { LearningStage } from "./appTypes";

export interface StageHelp {
  title: string;
  whatToDo: string;
  successHint: string;
}

export const stageHelp: Record<LearningStage, StageHelp> = {
  briefing: {
    title: "안내 단계 도움말",
    whatToDo: "작업 카드에서 시간, 필요한 사람과 도구, 먼저 할 일을 살펴보세요.",
    successHint: "안전과 품질 조건을 확인한 뒤 ‘조건 확인’을 누르면 관계를 연결할 수 있어요.",
  },
  relations: {
    title: "관계 설계 단계 도움말",
    whatToDo: "어떤 작업을 먼저 끝내야 다음 작업을 시작할 수 있는지 선으로 연결하세요.",
    successHint: "필수 관계를 빠뜨리지 않고 서로 기다리는 순환을 만들지 않으면 일정표로 갈 수 있어요.",
  },
  schedule: {
    title: "일정표 단계 도움말",
    whatToDo: "모든 작업의 시작 시점과 필요한 역할을 정해 시간표에 배치하세요.",
    successHint: "모든 작업이 관계와 역할 조건에 맞게 놓이면 ‘실행’으로 결과를 살펴볼 수 있어요.",
  },
  simulation: {
    title: "가상 실행 단계 도움말",
    whatToDo: "시간을 한 칸씩 움직이며 작업이 시작하고 멈추는 순간을 관찰하세요.",
    successHint: "기다림이 보이면 왜 멈췄는지 예측하고 실행 기록과 비교해 보세요.",
  },
  analysis: {
    title: "병목 분석 단계 도움말",
    whatToDo: "뒤 작업을 늦춘 기다림의 원인을 찾아 병목으로 표시하세요.",
    successHint: "오래 걸린 작업이 아니라 다른 작업을 실제로 늦춘 원인을 고르면 수정할 수 있어요.",
  },
  revision: {
    title: "수정 단계 도움말",
    whatToDo: "찾은 병목을 줄이는 새 일정을 만들고 안전·품질·역할 조건도 지키세요.",
    successHint: "처음 일정과 수정 일정을 실행해 비교하면 무엇이 달라졌는지 알 수 있어요.",
  },
  report: {
    title: "개선 보고서 단계 도움말",
    whatToDo: "처음과 수정 결과를 비교하고, 왜 그렇게 바꿨는지 네 문장으로 설명하세요.",
    successHint: "안전·품질·협력·시간을 함께 지킨 근거를 모두 적으면 오늘 배운 내용을 정리할 수 있어요.",
  },
};
