/**
 * Tests for fix_dashboard_warga.mjs.
 *
 * PR changes (simplified from old version):
 *   Old:
 *     - try/catch around readFileSync
 *     - try/catch around writeFileSync
 *     - idempotency check: if both new patterns already present → skip
 *     - exits with 1 if neither old nor new patterns found
 *
 *   New:
 *     - no try/catch (throws on missing file)
 *     - no idempotency check
 *     - exits with 1 if oldEnding not found
 *     - exits with 1 if oldPatch not found
 *     - always applies replacements
 *     - writes file and logs success
 *
 * We run the script in a subprocess via spawnSync with a temp directory
 * containing a controlled HTML fixture so we can verify its behaviour.
 *
 * Run with: node --test fix_dashboard_warga.test.mjs
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(
  new URL("./fix_dashboard_warga.mjs", import.meta.url),
);

// ── Fixture strings (must match the literals in fix_dashboard_warga.mjs) ──

const OLD_ENDING = `    if (typeof window.gtRefreshDashboard === 'function') window.gtRefreshDashboard();
};`;

const NEW_ENDING = `    if (typeof window.gtRefreshDashboard === 'function') window.gtRefreshDashboard();
    try{ patchRekapArisan(); }catch(e){}
};
window.loadDashboardWarga.__gtV12 = true;`;

const OLD_PATCH = `if (typeof window.loadDashboardWarga === 'function' && !window.loadDashboardWarga.__gtV12) {
      var origDw = window.loadDashboardWarga;
      window.loadDashboardWarga = function(){
        var r = origDw.apply(this, arguments);
        try{ patchRekapArisan(); }catch(e){}
        return r;
      };
      window.loadDashboardWarga.__gtV12 = true;
      clearInterval(_dwi);
    }`;

const NEW_PATCH = `// patch wrapper dihapus - sudah terintegrasi di loadDashboardWarga`;

/** Build a minimal HTML string that contains both old patterns */
function buildValidHtml() {
  return `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<script>
${OLD_ENDING}
${OLD_PATCH}
</script>
</body>
</html>`;
}

// ── Subprocess runner ──────────────────────────────────────────────────────

let tmpDir = "";

/**
 * Create a temp directory that mimics the expected working-directory layout:
 *   <tmpDir>/artifacts/smart-portal-rt/index.html
 * Then run the script with cwd=tmpDir so its relative path resolves correctly.
 */
function runScript(htmlContent) {
  const htmlDir = join(tmpDir, "artifacts", "smart-portal-rt");
  mkdirSync(htmlDir, { recursive: true });
  const htmlPath = join(htmlDir, "index.html");
  writeFileSync(htmlPath, htmlContent, "utf8");

  const result = spawnSync(process.execPath, [SCRIPT_PATH], {
    cwd: tmpDir,
    encoding: "utf8",
  });

  let output = null;
  try {
    output = readFileSync(htmlPath, "utf8");
  } catch {
    // file may not have been written if the script errored
  }

  return { result, output, htmlPath };
}

// ── Setup / teardown ──────────────────────────────────────────────────────

before(() => {
  tmpDir = join(tmpdir(), `fix_dashboard_test_${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
});

after(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ── Tests ─────────────────────────────────────────────────────────────────

describe("fix_dashboard_warga.mjs – happy path", () => {
  it("exits with code 0 when both patterns are present", () => {
    const { result } = runScript(buildValidHtml());
    assert.equal(
      result.status,
      0,
      `Expected exit 0, got ${result.status}\nstderr: ${result.stderr}`,
    );
  });

  it("prints 'BERHASIL' to stdout on success", () => {
    const { result } = runScript(buildValidHtml());
    assert.match(result.stdout, /BERHASIL/);
  });

  it("replaces oldEnding with newEnding in the output file", () => {
    const { output } = runScript(buildValidHtml());
    assert.ok(output, "Output file should be written");
    assert.ok(output.includes(NEW_ENDING), "newEnding should be present");
    assert.ok(!output.includes(OLD_ENDING), "oldEnding should be removed");
  });

  it("replaces oldPatch with newPatch in the output file", () => {
    const { output } = runScript(buildValidHtml());
    assert.ok(output, "Output file should be written");
    assert.ok(output.includes(NEW_PATCH), "newPatch should be present");
    assert.ok(!output.includes(OLD_PATCH), "oldPatch should be removed");
  });

  it("leaves surrounding HTML intact after patching", () => {
    const { output } = runScript(buildValidHtml());
    assert.ok(output.includes("<!DOCTYPE html>"), "DOCTYPE should still be present");
    assert.ok(output.includes("</html>"), "closing html tag should still be present");
  });
});

describe("fix_dashboard_warga.mjs – error: oldEnding not found", () => {
  it("exits with code 1 when oldEnding is absent", () => {
    const htmlWithoutEnding = `<!DOCTYPE html><html><body>
<script>
${OLD_PATCH}
</script>
</body></html>`;

    const { result } = runScript(htmlWithoutEnding);
    assert.equal(result.status, 1, "Should exit 1 when oldEnding is not found");
  });

  it("prints 'GAGAL' and 'oldEnding' to stderr when oldEnding is absent", () => {
    const htmlWithoutEnding = `<!DOCTYPE html><html><body>
<script>${OLD_PATCH}</script></body></html>`;

    const { result } = runScript(htmlWithoutEnding);
    assert.match(result.stderr, /GAGAL/);
    assert.match(result.stderr, /oldEnding/);
  });

  it("does not modify the file when oldEnding is absent", () => {
    const original = `<!DOCTYPE html><html><body><script>${OLD_PATCH}</script></body></html>`;
    const { output } = runScript(original);
    // Script exits before writing — output file may still exist with original content
    // (readFileSync reads whatever is on disk; if the script didn't overwrite, it matches)
    if (output !== null) {
      assert.equal(output, original, "File should not be modified when script errors");
    }
    // If output is null the file was never written — also acceptable.
  });
});

describe("fix_dashboard_warga.mjs – error: oldPatch not found", () => {
  it("exits with code 1 when oldPatch is absent", () => {
    const htmlWithoutPatch = `<!DOCTYPE html><html><body>
<script>
${OLD_ENDING}
</script>
</body></html>`;

    const { result } = runScript(htmlWithoutPatch);
    assert.equal(result.status, 1, "Should exit 1 when oldPatch is not found");
  });

  it("prints 'GAGAL' and 'oldPatch' to stderr when oldPatch is absent", () => {
    const htmlWithoutPatch = `<!DOCTYPE html><html><body>
<script>${OLD_ENDING}</script></body></html>`;

    const { result } = runScript(htmlWithoutPatch);
    assert.match(result.stderr, /GAGAL/);
    assert.match(result.stderr, /oldPatch/);
  });
});

describe("fix_dashboard_warga.mjs – error: file does not exist", () => {
  it("throws/exits non-zero when the HTML file is missing", () => {
    // Run script in a directory that lacks the expected html file
    const emptyDir = join(tmpdir(), `fix_dash_empty_${Date.now()}`);
    mkdirSync(emptyDir, { recursive: true });

    const result = spawnSync(process.execPath, [SCRIPT_PATH], {
      cwd: emptyDir,
      encoding: "utf8",
    });

    // Node will throw ENOENT from readFileSync (no try/catch in new version)
    assert.notEqual(result.status, 0, "Should exit non-zero when file is missing");

    rmSync(emptyDir, { recursive: true, force: true });
  });
});

describe("fix_dashboard_warga.mjs – behaviour regression: no idempotency check", () => {
  it("re-applies replacements even when newEnding is already present (no idempotency)", () => {
    // The old version would skip if already patched; the new version does not.
    // If the file already has NEW_ENDING but still has OLD_PATCH, the script
    // will succeed because the oldEnding check happens first and OLD_ENDING
    // is not present → exits 1.
    //
    // The important regression to document: calling the script twice on a
    // fully-patched file (neither old pattern present) exits with code 1
    // instead of silently succeeding, because the idempotency guard was removed.

    // First run: patch the file
    const { result: firstRun, htmlPath } = runScript(buildValidHtml());
    assert.equal(firstRun.status, 0, "First run should succeed");

    // Second run on already-patched file: old patterns are gone → exits 1
    const secondRun = spawnSync(process.execPath, [SCRIPT_PATH], {
      cwd: tmpDir,
      encoding: "utf8",
    });
    assert.equal(
      secondRun.status,
      1,
      "Second run exits 1 because old patterns are gone and there is no idempotency check",
    );
    assert.match(secondRun.stderr, /GAGAL/);
  });
});