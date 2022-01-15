// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  exclude: [
    "**/node_modules",
    "**/README.md",
    "**/*.json*",
    "snowpack.config.js"
  ],
  mount: {
    public: '/'
  },
  optimize: {
    minify: true,
  },
};
