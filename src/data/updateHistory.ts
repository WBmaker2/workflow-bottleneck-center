export type IsoDate = `${number}-${number}-${number}`;

export interface UpdateEntry {
  date: IsoDate;
  category: "설계" | "개발" | "개선";
  description: string;
}

export const updateHistory: readonly UpdateEntry[] = Object.freeze([
  { date: "2026-08-26", category: "설계", description: "최초 설계 문서 작성" },
  { date: "2026-08-26", category: "개발", description: "MVP 구현과 네 시나리오 검수" },
  { date: "2026-08-27", category: "개선", description: "AppProvider 손상 저장 복구 개선" },
  { date: "2026-08-28", category: "개선", description: "학습자 안내·모바일 탐색 흐름 개선" },
  { date: "2026-08-29", category: "개선", description: "전체 학습 화면 계층과 모바일 읽기 순서 개선" },
  { date: "2026-08-30", category: "개선", description: "상태 강조 테두리와 근거 진행률 움직임 정돈" },
]);
