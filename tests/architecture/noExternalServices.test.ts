import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { scenarioCatalog } from "../../src/data/scenarios";
import { updateHistory } from "../../src/data/updateHistory";

const repositoryRoot = resolve(process.cwd());
const sourceRoot = join(repositoryRoot, "src");

function sourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(?:ts|tsx|css)$/.test(entry.name)) files.push(path);
  }
  return files.sort();
}

function sourceText(root: string): string {
  return sourceFiles(root)
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

describe("production architecture boundaries", () => {
  const allSource = sourceText(sourceRoot);
  const domainSource = sourceText(join(sourceRoot, "domain"));
  const simulatorSource = readFileSync(join(sourceRoot, "domain/simulator.ts"), "utf8");

  it("does not include external services or personal identity fields", () => {
    expect(allSource).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/);
    expect(allSource).not.toMatch(/studentName|learnerName|studentId|emailAddress/);
  });

  it("keeps domain functions pure and simulator execution deterministic", () => {
    expect(domainSource).not.toMatch(/from ["']react|localStorage|sessionStorage|setInterval|Math\.random|new Date/);
    expect(simulatorSource).not.toMatch(/Date\.|performance\.|crypto\.|Math\.random/);
  });

  it("does not publish speed, productivity, ranking, or rest-shaming claims", () => {
    // Check only the disallowed claims; explicit safety disclaimers remain valid copy.
    expect(allSource).not.toContain("가장 빠른 팀");
    expect(allSource).not.toContain("생산성 점수");
    expect(allSource).not.toContain("순위표");
    expect(allSource).not.toMatch(/휴식은 낭비(?!가 아닙니다)/);
  });

  it("exports exactly the four published scenario files", () => {
    const scenarioDirectory = join(sourceRoot, "data/scenarios");
    const scenarioFiles = readdirSync(scenarioDirectory)
      .filter((name) => name.endsWith(".ts") && name !== "index.ts")
      .sort();

    expect(scenarioFiles).toEqual([
      "classPresentation.ts",
      "ecoCampaignBooth.ts",
      "libraryCart.ts",
      "scienceDisplay.ts",
    ]);
    expect(scenarioCatalog.map(({ id }) => id)).toEqual([
      "science-display",
      "library-cart",
      "class-presentation",
      "eco-campaign-booth",
    ]);
  });

  it("records every update-history date in ISO calendar format", () => {
    expect(updateHistory.length).toBeGreaterThan(0);
    for (const entry of updateHistory) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
