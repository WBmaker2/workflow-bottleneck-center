export type IsoDate = `${number}-${number}-${number}`;

export interface UpdateEntry {
  date: IsoDate;
  category: "설계" | "개발" | "개선";
  description: string;
}

export const updateHistory: readonly UpdateEntry[] = Object.freeze([
  { date: "2026-08-26", category: "설계", description: "최초 설계 문서 작성" },
  { date: "2026-08-26", category: "개발", description: "MVP 구현과 네 시나리오 검수" },
]);
