/**
 * Tests for trigger_coderabbit.txt
 *
 * This file is a CodeRabbit trigger marker. Tests verify its existence,
 * content integrity, and format.
 *
 * Run: node --test tests/trigger_coderabbit.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE_PATH = resolve(__dirname, "..", "trigger_coderabbit.txt");
const EXPECTED_CONTENT =
  "Memicu peninjauan otomatis CodeRabbit untuk layout dan sinkronisasi panel kanan.";

test("trigger_coderabbit.txt exists", () => {
  assert.ok(
    existsSync(FILE_PATH),
    `Expected file to exist at: ${FILE_PATH}`,
  );
});

test("trigger_coderabbit.txt content matches expected text exactly", () => {
  const content = readFileSync(FILE_PATH, "utf8");
  assert.equal(
    content,
    EXPECTED_CONTENT,
    "File content must exactly match the expected Indonesian trigger phrase",
  );
});

test("trigger_coderabbit.txt has no trailing newline", () => {
  const raw = readFileSync(FILE_PATH);
  const lastByte = raw[raw.length - 1];
  assert.notEqual(
    lastByte,
    0x0a /* LF */,
    "File must not end with a newline (\\n)",
  );
  assert.notEqual(
    lastByte,
    0x0d /* CR */,
    "File must not end with a carriage return (\\r)",
  );
});

test("trigger_coderabbit.txt is non-empty", () => {
  const { size } = statSync(FILE_PATH);
  assert.ok(size > 0, "File must not be empty");
});

test("trigger_coderabbit.txt contains the CodeRabbit keyword", () => {
  const content = readFileSync(FILE_PATH, "utf8");
  assert.ok(
    content.includes("CodeRabbit"),
    'File must contain the string "CodeRabbit"',
  );
});

test("trigger_coderabbit.txt contains the layout sync phrase", () => {
  const content = readFileSync(FILE_PATH, "utf8");
  assert.ok(
    content.includes("layout dan sinkronisasi panel kanan"),
    'File must contain the phrase "layout dan sinkronisasi panel kanan"',
  );
});

test("trigger_coderabbit.txt is a single line (no embedded newlines)", () => {
  const content = readFileSync(FILE_PATH, "utf8");
  const lines = content.split("\n");
  assert.equal(
    lines.length,
    1,
    "File must contain exactly one line with no embedded newline characters",
  );
});

test("trigger_coderabbit.txt byte length matches expected UTF-8 encoding", () => {
  const raw = readFileSync(FILE_PATH);
  const expectedBytes = Buffer.byteLength(EXPECTED_CONTENT, "utf8");
  assert.equal(
    raw.length,
    expectedBytes,
    `File byte length must be ${expectedBytes} (UTF-8 encoded expected content)`,
  );
});
