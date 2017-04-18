// Http Karma configuration - for all browsers that are tested

const sharedConfigGenerator = require("./shared-karma-conf.js");
const fs = require("fs");

module.exports = function(config) {
  const customLaunchers = {
    // 'SL_Safari_Latest': {
    //   base: 'SauceLabs',
    //   browserName: 'safari',
    //   platform: 'OS X 10.12'
    // },
    // SL_IE_11: {
    //   base: 'SauceLabs',
    //   browserName: 'internet explorer',
    //   platform: 'Windows 8.1',
    //   version: '11'
    // },
    bs_firefox_mac: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '52.0',
      os: 'OS X',
      os_version: 'Sierra'
    },
    // 'SL_Opera_12': { // FAILS DUE TO A BUFFER RangeError: Offset larger than array size at <anonymous function: jspb.BinaryWriter.prototype.getResultBuffer>([arguments not available])@google-protobuf/google-protobuf.js:331:0
    //   base: 'SauceLabs',
    //   browserName: 'opera',
    //   platform: 'Windows 7',
    // },
    // 'SL_Safari_8': {
    //   base: 'SauceLabs',
    //   browserName: 'safari',
    //   platform: 'OS X 10.10',
    //   version: '8'
    // },
    // 'SL_Edge': {
    //   base: 'SauceLabs',
    //   browserName: 'microsoftedge',
    //   platform: 'Windows 10'
    // }
  };

  const browsers = [];
  const useBrowserStack = process.env.BROWSER_STACK_USERNAME !== undefined;
  if (useBrowserStack) {
    Array.prototype.push.apply(browsers, Object.keys(customLaunchers));
  }
  const settings = sharedConfigGenerator(false, useBrowserStack);
  settings.browsers = browsers;
  settings.customLaunchers = customLaunchers;
  config.set(settings)
};
