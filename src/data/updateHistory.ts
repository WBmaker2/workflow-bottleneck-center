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
]);
