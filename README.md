# webpack-federation-stats-plugin

## Installation

`npm i --save-dev webpack-federation-stats-plugin`

`yarn add --dev webpack-federation-stats-plugin`

## Usage

```javascript
const FederationStatsPlugin = require("webpack-federation-stats-plugin");

module.exports = {
  plugins: [
    new FederationStatsPlugin({filename: "federation-stats.json"}),
  ],
};
```

### Example Output

```json
{
  "name": "AppName",
  "exposes": {
    "module1": [
      "vendors-node_modules_babel_runtime_helpers_esm_slicedToArray.js",
      "vendors-node_modules_core-js.js",
      "vendors-node_modules_prop-types_index_js.js",
    ],
    "module2": ["vendors-node_modules_core-js.js",],
    "module3": [
      "vendors-node_modules_babel.js",
      "vendors-node_modules_core-js.js",
    ]
  }
}

```
