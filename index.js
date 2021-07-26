const PLUGIN_NAME = "FederationStatsPlugin"

const EXTENSION_REGEX = /\.[^/.]+$/

class FederationStatsPlugin {
  constructor(options = {fileName: "federation-stats.json"}) {
    if (!options || !options.fileName) throw new Error("fileName option is required.")
    this._options = options
  }

  apply(compiler) {
    const logger = compiler.getInfrastructureLogger(PLUGIN_NAME)
    const federationPlugin = compiler.options.plugins && compiler.options.plugins.find((plugin) => plugin.constructor.name === "ModuleFederationPlugin")

    if (!federationPlugin) throw new Error("No ModuleFederationPlugin found.")

    const exposedFiles = new Map(Object.entries(federationPlugin._options.exposes || {}).map(([k, v]) => (typeof v === "object" ? [v.import, k] : [v, k])))

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
        },
        async () => {
          const stats = compilation.getStats().toJson({})
          const modules = stats.modules.filter((module) => module.issuerName === "container entry" && exposedFiles.has(module.name.replace(EXTENSION_REGEX, "")))
          const chunksReducer = (chunksArr, current) => {
            current.siblings.forEach((s) => {
              const chunk = stats.chunks.find((c) => c.id === s)
              chunk.files.forEach((f) => chunksArr.push(f))
            })
            current.files.forEach((f) => chunksArr.push(f))
            return chunksArr
          }
          const chunks = modules.map((module) => {
            const exposedAs = exposedFiles.get(module.name.replace(EXTENSION_REGEX, ""))
            const chunks = module.chunks.map((chunkId) => stats.chunks.find((chunk) => chunk.id === chunkId)).reduce(chunksReducer, [])
            return {
              module: exposedAs,
              chunks: chunks,
              id: module.id
            }
          })

          const exposes = chunks.reduce((p, c) => Object.assign(p, {[c.module.replace("./", "")]: c.chunks}), {})
          const name = (federationPlugin._options.library && federationPlugin._options.library.name) || federationPlugin._options.name

          const statsResult = {
            name,
            exposes,
          }

          const fileName = this._options.fileName
          const statsBuffer = Buffer.from(JSON.stringify(statsResult), "utf-8")
          const stats = {
            source: () => statsBuffer,
            size: () => statsBuffer.length,
          }

          const asset = compilation.getAsset(fileName)
          if (asset) {
            compilation.updateAsset(fileName, stats)
          } else {
            compilation.emitAsset(fileName, stats)
          }
        }
      )
    })
  }
}

module.exports = FederationStatsPlugin
