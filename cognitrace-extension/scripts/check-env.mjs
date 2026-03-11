#!/usr/bin/env node

const [major, minor] = process.versions.node.split(".").map(Number)

const baselineMajor = 20
const minMinor = 11

if (major < baselineMajor || (major === baselineMajor && minor < minMinor)) {
  console.error(
    `[CogniTrace] Unsupported Node.js ${process.versions.node}. ` +
      `Use Node 20.11+ (see .nvmrc).`
  )
  process.exit(1)
}

if (major > baselineMajor) {
  console.warn(
    `[CogniTrace] Node.js ${process.versions.node} is newer than the baseline ` +
      `target (20.x). Continue with caution for reproducibility.`
  )
} else {
  console.log(`[CogniTrace] Node.js ${process.versions.node} is supported.`)
}
