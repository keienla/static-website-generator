"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _plugin = require("@parcel/plugin");

var _pug = require("pug");

// @flow
var _default = new _plugin.Transformer({
  async loadConfig({
    config
  }) {
    let configFile = await config.getConfig(['.pugrc', '.pugrc.js', 'pug.config.js']);

    if (configFile) {
      let isJavascript = _path.extname(configFile.filePath) === '.js';

      if (isJavascript) {
        config.invalidateOnStartup();
      }

      return configFile.contents;
    }
  },

  async transform({
    asset,
    config
  }) {
    const pugConfig = config ?? {};
    const content = await asset.getCode();

    const render = _pug.compile(content, {
      compileDebug: false,
      basedir: _path.dirname(asset.filePath),
      filename: asset.filePath,
      ...pugConfig,
      pretty: pugConfig.pretty || false,
    });

    const html = render({'req': require})

    for (let filePath of render.dependencies) {
      await asset.invalidateOnFileChange(filePath);
    }

    asset.type = 'html';
    asset.setCode(render({
      ...pugConfig.locals,
      'req': require
    }));
    return [asset];
  }

});

exports.default = _default;