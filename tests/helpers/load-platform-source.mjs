import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import ts from "typescript"

let platformSource

export async function loadPlatformSource() {
  platformSource ??= compilePlatformSource()
  return platformSource
}

async function compilePlatformSource() {
  const outDir = await mkdtemp(join(tmpdir(), "xq-cy-platform-test-"))
  const configPath = "packages/cypress-platform/tsconfig.json"
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"))

  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, "packages/cypress-platform", { outDir })
  const program = ts.createProgram(parsed.fileNames, parsed.options)
  const emit = program.emit()
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emit.diagnostics)

  if (diagnostics.length > 0) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => "\n"
      })
    )
  }

  const module = await import(join(outDir, "plugin/index.js"))
  await rm(outDir, { recursive: true, force: true })
  return module
}
