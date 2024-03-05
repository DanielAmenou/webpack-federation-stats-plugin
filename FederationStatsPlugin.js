const PLUGIN_NAME = "FederationStatsPlugin"

const EXTENSION_REGEX = /\.[^/.]+$/

class FederationStatsPlugin {
  constructor(options = {fileName: "federation-stats.json"}) {
    if (!options.fileName) throw new Error("fileName option is required.")
    this._options = options
  }

  apply(compiler) {
    const federationPlugin = compiler.options.plugins.find((plugin) => plugin.constructor.name === "ModuleFederationPlugin")

    if (!federationPlugin) {
      throw new Error("No ModuleFederationPlugin found.")
    }

    const appName = federationPlugin._options.name
    const exposedFiles = new Map(Object.entries(federationPlugin._options.exposes || {}).map(([k, v]) => [v, k]))

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
        },
        async () => {
          const stats = compilation.getStats().toJson()
          const modules = stats.modules.filter((module) => {
            const moduleName = module.name.replace(EXTENSION_REGEX, "")
            return exposedFiles.has(moduleName)
          })

          const chunksReducer = (chunksArr, current) => {
            current.siblings.forEach((s) => {
              const chunk = stats.chunks.find((c) => c.id === s)
              if (chunk) {
                chunk.files.forEach((f) => chunksArr.push(f))
              }
            })
            current.files.forEach((f) => chunksArr.push(f))
            return chunksArr
          }

          const chunks = modules.reduce((acc, module) => {
            const moduleName = module.name.replace(EXTENSION_REGEX, "")
            let exposedAs = exposedFiles.get(moduleName)
            if (exposedAs.startsWith("./")) {
              exposedAs = exposedAs.substring(2)
            }

            const moduleChunks = module.chunks
              .map((chunkId) => stats.chunks.find((chunk) => chunk.id === chunkId))
              .filter((chunk) => chunk && chunk.runtime.includes(appName))
              .reduce(chunksReducer, [])

            acc[exposedAs] = [...new Set(moduleChunks)]
            return acc
          }, {})

          const statsResult = {
            name: appName,
            exposes: chunks,
            publicUrl: this._options.publicUrl || "",
          }

          const fileName = this._options.fileName
          compilation.emitAsset(fileName, {
            source: () => Buffer.from(JSON.stringify(statsResult, null, 2), "utf-8"),
            size: () => Buffer.byteLength(JSON.stringify(statsResult, null, 2)),
          })
        },
      )
    })
  }
}

module.exports = FederationStatsPlugin
