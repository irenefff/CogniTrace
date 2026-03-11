import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Analyzer } from "./analyzer"
import type { InputEvent } from "~types"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fixtureRoot = path.resolve(__dirname, "../../test-fixtures/analyzer")

async function loadFixture(name: string): Promise<InputEvent[]> {
  const raw = await readFile(path.join(fixtureRoot, name), "utf-8")
  return JSON.parse(raw) as InputEvent[]
}

test("S1 normal writing keeps high integrity score", async () => {
  const result = new Analyzer(await loadFixture("normal-writing.json")).analyze()

  assert.ok(result.totalEvents > 0)
  assert.ok(result.activeTime > 0)
  assert.ok(result.integrityScore >= 85)
  assert.equal(result.sourceBreakdown.pasted, 0)
})

test("S2 paste-assisted writing has moderate penalty", async () => {
  const result = new Analyzer(await loadFixture("paste-assisted.json")).analyze()
  const normal = new Analyzer(await loadFixture("normal-writing.json")).analyze()
  const botLike = new Analyzer(await loadFixture("bot-attack.json")).analyze()

  assert.ok(result.pasteCount >= 1)
  assert.ok(result.sourceBreakdown.pasted > 0)
  assert.ok(result.integrityScore <= 90)
  assert.ok(result.integrityScore < normal.integrityScore)
  assert.ok(result.integrityScore > botLike.integrityScore)
})

test("S3 bot-like burst receives severe penalty", async () => {
  const result = new Analyzer(await loadFixture("bot-attack.json")).analyze()

  assert.ok(result.pasteCount >= 3)
  assert.ok(result.sourceBreakdown.pasted >= 90)
  assert.ok(result.integrityScore <= 40)
})

test("S4 google-docs mixed stream remains stable", async () => {
  const result = new Analyzer(await loadFixture("google-docs-mixed.json")).analyze()

  assert.ok(result.totalEvents >= 10)
  assert.ok(result.activeTime > 0)
  assert.ok(result.integrityScore <= 95)
  assert.ok(result.integrityScore >= 5)
})
