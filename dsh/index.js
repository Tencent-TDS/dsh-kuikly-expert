/**
 * Kuikly expert as a DeepSeek Harness (dsh) plugin.
 *
 * Registers one `ctx.skills` provider that publishes the four packaged
 * `skills/<name>/` trees. It deliberately does NOT reuse
 * `@deepseek-ai/dsh-skill-filesystem`: depending on an in-box package from an
 * out-of-tree bundle would install a second copy that drifts from the host's.
 * The provider contract (`list` / `get`) is the stable seam, so this file
 * implements it directly — the shape `superdesign-dsh` uses for its bundled
 * skill.
 *
 * Plain ESM with no build step, on purpose: `dsh plugin add github:...` fetches
 * sources, not build output, and a `prepare` script would make every user
 * allowlist a build before the first install succeeds.
 */

import { readdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PROVIDER_NAME = 'kuikly'
/** Rank of the `bundled` discovery source in dsh's own skill provider. */
const BUNDLED_SKILL_RANK = 600
const INVOCATION = { modelInvocable: true, userInvocable: true }

const SKILLS_DIR = fileURLToPath(new URL('../skills/', import.meta.url))

/**
 * Read a frontmatter field from SKILL.md.
 *
 * Supports two YAML shapes the bundled skills use: a double-quoted scalar
 * (`description: "..."`) and a folded block (`description: >\n  multi-line`).
 * The frontmatter is two flat keys (`name`, `description`), so a full YAML
 * parser (and its dependency) is more surface than the job needs.
 *
 * @param {string} body - the raw SKILL.md contents.
 * @param {string} field - the frontmatter key to read.
 * @returns {string | undefined} the field value, or undefined when absent.
 */
function readFrontmatter(body, field) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(body)
  if (!frontmatter) return undefined

  const block = frontmatter[1]

  // Folded block scalar: `field: >` followed by indented lines.
  const folded = new RegExp(`^${field}:\\s*>\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n\\S|\\r?\\n?$)`, 'm')
  const foldedMatch = folded.exec(block)
  if (foldedMatch) {
    return foldedMatch[1]
      .split(/\r?\n/)
      .map(line => line.replace(/^[ \t]+/, ''))
      .join(' ')
      .trim()
  }

  // Double-quoted scalar.
  const quoted = new RegExp(`^${field}:\\s*"((?:[^"\\\\]|\\\\.)*)"$`, 'm')
  const quotedMatch = quoted.exec(block)
  if (quotedMatch) {
    return quotedMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }

  // Plain scalar (single line).
  const plain = new RegExp(`^${field}:\\s*(.+)$`, 'm')
  const plainMatch = plain.exec(block)
  if (plainMatch) {
    return plainMatch[1].trim()
  }

  return undefined
}

/**
 * Discover packaged skill directories under `skills/`.
 *
 * Each immediate subdirectory containing a `SKILL.md` is one skill. `references/`
 * and other subtrees stay out of discovery.
 *
 * @returns {Promise<string[]>} absolute skill directory paths.
 */
async function discoverSkillDirs() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true })
  const dirs = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skillDir = join(SKILLS_DIR, entry.name)
    const skillFile = join(skillDir, 'SKILL.md')
    try {
      await readFile(skillFile, 'utf8')
      dirs.push(skillDir)
    } catch {
      // No SKILL.md — not a skill directory.
    }
  }
  return dirs
}

/**
 * Load one skill's metadata and body.
 *
 * @param {string} skillDir - absolute path to the skill directory.
 * @returns {Promise<{ name: string, description: string, content: string } | undefined>}
 */
async function loadSkill(skillDir) {
  const skillUrl = new URL('SKILL.md', `file://${skillDir}/`)
  const content = await readFile(skillUrl, { encoding: 'utf8' })
  const name = readFrontmatter(content, 'name')
  const description = readFrontmatter(content, 'description')
  if (name === undefined || description === undefined) return undefined
  return { name, description, content }
}

/**
 * Build the provider row for one skill directory.
 *
 * @param {string} skillDir - absolute path to the skill directory.
 * @returns {Promise<object | undefined>} a provider list entry.
 */
async function buildSkillEntry(skillDir) {
  const skill = await loadSkill(skillDir)
  if (skill === undefined) return undefined
  return {
    name: skill.name,
    description: skill.description,
    invocation: INVOCATION,
    provider: PROVIDER_NAME,
    source: 'bundled',
    resourceBase: { kind: 'directory', path: skillDir },
    rank: BUNDLED_SKILL_RANK,
    locator: new URL('SKILL.md', `file://${skillDir}/`),
  }
}

/**
 * Load all packaged skills, or `[]` when none can be read.
 *
 * @param {AbortSignal | undefined} [signal] - lookup cancellation.
 * @returns {Promise<object[]>}
 */
async function listSkills(signal) {
  if (signal?.aborted) return []
  const dirs = await discoverSkillDirs()
  const entries = await Promise.all(dirs.map(buildSkillEntry))
  return entries.filter(entry => entry !== undefined)
}

const provider = {
  name: PROVIDER_NAME,
  async list(options = {}) {
    return listSkills(options.signal)
  },
  async get(candidate, options = {}) {
    if (options.signal?.aborted) return undefined
    const dirs = await discoverSkillDirs()
    for (const skillDir of dirs) {
      const skill = await loadSkill(skillDir)
      if (skill === undefined) continue
      if (skill.name === candidate.name || skill.name === candidate.id) {
        return {
          name: skill.name,
          description: skill.description,
          invocation: INVOCATION,
          provider: PROVIDER_NAME,
          source: 'bundled',
          resourceBase: { kind: 'directory', path: skillDir },
          content: skill.content,
        }
      }
    }
    return undefined
  },
}

/** Cordis plugin name. */
export const name = 'dsh-kuikly-expert'
/** The registry this plugin contributes to. */
export const inject = ['skills']

/**
 * Register the packaged Kuikly skills on `ctx.skills`.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx - the plugin context.
 */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}
