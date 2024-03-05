interface FederationStatsPluginOptions {
  fileName: string;
  publicUrl: string;
}

declare class FederationStatsPlugin {
  constructor(options: FederationStatsPluginOptions);

  apply(compiler: any): void;
}

export = FederationStatsPlugin;
