interface FederationStatsPluginOptions {
  /** The name of the output JSON file. Defaults to `"federation-stats.json"`. */
  fileName?: string;
  /** An optional public URL to include in the output. */
  publicUrl?: string;
}

declare class FederationStatsPlugin {
  constructor(options: FederationStatsPluginOptions);

  apply(compiler: any): void;
}

export = FederationStatsPlugin;
