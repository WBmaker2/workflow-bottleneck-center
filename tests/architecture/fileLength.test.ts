import { afterEach, describe, expect, it } from "vitest";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const scriptPath = join(process.cwd(), "scripts/check-file-length.mjs");
let temporaryRoot: string | undefined;

afterEach(() => {
  if (temporaryRoot) {
    rmSync(temporaryRoot, { recursive: true, force: true });
    temporaryRoot = undefined;
  }
});

describe("source file length checker", () => {
  it("accepts 499 lines", () => {
    temporaryRoot = mkdtempSync(join(tmpdir(), "workflow-file-length-"));
    writeFileSync(
      join(temporaryRoot, "within-limit.ts"),
      Array.from({ length: 499 }, () => "line").join("\n"),
    );

    const result = spawnSync(process.execPath, [scriptPath, temporaryRoot], {
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
  });

  it("rejects 500 lines with a deterministic diagnostic", () => {
    temporaryRoot = mkdtempSync(join(tmpdir(), "workflow-file-length-"));
    const filePath = join(temporaryRoot, "over-limit.ts");
    writeFileSync(
      filePath,
      Array.from({ length: 500 }, () => "line").join("\n"),
    );

    const result = spawnSync(process.execPath, [scriptPath, temporaryRoot], {
      encoding: "utf8",
    });

    expect(result.status).toBe(1);
    expect(`${result.stdout}${result.stderr}`).toContain(
      `${filePath}: 500 lines exceeds 499`,
    );
  });
});
