# webpack-federation-stats-plugin

[![npm version](https://img.shields.io/npm/v/webpack-federation-stats-plugin)](https://www.npmjs.com/package/webpack-federation-stats-plugin)
[![npm downloads](https://img.shields.io/npm/dt/webpack-federation-stats-plugin)](https://www.npmjs.com/package/webpack-federation-stats-plugin)
[![npm monthly downloads](https://img.shields.io/npm/dm/webpack-federation-stats-plugin)](https://www.npmjs.com/package/webpack-federation-stats-plugin)
[![license](https://img.shields.io/npm/l/webpack-federation-stats-plugin)](https://github.com/DanielAmenou/webpack-federation-stats-plugin/blob/main/LICENSE)

A Webpack plugin that extracts [Module Federation](https://webpack.js.org/concepts/module-federation/) stats into a JSON file. It maps each exposed module to its required chunks, making it useful for tools like [loadable-components](https://loadable-components.com/) that need to know which chunks to load for a given federated module.

## Installation

```bash
npm install --save-dev webpack-federation-stats-plugin
```

or

```bash
yarn add --dev webpack-federation-stats-plugin
```

## Usage

```javascript
const FederationStatsPlugin = require("webpack-federation-stats-plugin")

module.exports = {
  plugins: [new FederationStatsPlugin()],
}
```

> **Note:** The plugin requires `ModuleFederationPlugin` to be configured in the same Webpack config. It will throw an error if it is not found.

## Options

| Option      | Type     | Default                   | Description                                      |
| ----------- | -------- | ------------------------- | ------------------------------------------------ |
| `fileName`  | `string` | `"federation-stats.json"` | The name of the output JSON file.                |
| `publicUrl` | `string` | —                         | An optional public URL to include in the output. |

### Example with options

```javascript
const FederationStatsPlugin = require("webpack-federation-stats-plugin")

module.exports = {
  plugins: [
    new FederationStatsPlugin({
      fileName: "federation-stats.json",
      publicUrl: "https://cdn.example.com/",
    }),
  ],
}
```

## Output

The plugin generates a JSON file that maps each exposed module to the chunk files it needs at runtime. This is the information a consuming application needs to know **which scripts to load** before importing a federated module.

Given the following Module Federation config:

```javascript
const {ModuleFederationPlugin} = require("webpack").container
const FederationStatsPlugin = require("webpack-federation-stats-plugin")

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "shop",
      exposes: {
        "./ProductCard": "./src/components/ProductCard",
        "./CartIcon": "./src/components/CartIcon",
        "./useCart": "./src/hooks/useCart",
      },
    }),
    new FederationStatsPlugin(),
  ],
}
```

The plugin will emit a `federation-stats.json` like this:

```json
{
  "name": "shop",
  "exposes": {
    "ProductCard": ["vendors-node_modules_react-dom_index_js.js", "vendors-node_modules_styled-components_dist_index_js.js", "src_components_ProductCard_index_tsx.js"],
    "CartIcon": ["vendors-node_modules_react-dom_index_js.js", "src_components_CartIcon_index_tsx.js"],
    "useCart": ["src_hooks_useCart_ts.js"]
  }
}
```

Each key under `exposes` corresponds to an exposed module (without the `./` prefix), and its value is the list of chunk files that must be loaded for that module to work.

### With `publicUrl`

When a `publicUrl` is provided, it is included in the output so consumers can resolve the full URL for each chunk:

```json
{
  "name": "shop",
  "publicUrl": "https://cdn.example.com/shop/",
  "exposes": {
    "ProductCard": ["vendors-node_modules_react-dom_index_js.js", "vendors-node_modules_styled-components_dist_index_js.js", "src_components_ProductCard_index_tsx.js"],
    "CartIcon": ["vendors-node_modules_react-dom_index_js.js", "src_components_CartIcon_index_tsx.js"],
    "useCart": ["src_hooks_useCart_ts.js"]
  }
}
```

## License

[MIT](LICENSE)
