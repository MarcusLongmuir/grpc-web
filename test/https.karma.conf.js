// Https Karma configuration - for browsers that support https on BrowserStack

const sharedConfigGenerator = require("./shared-karma-conf.js");
const fs = require("fs");

module.exports = function(config) {
  const customLaunchers = {
    swd_edge14: {
      base: 'CustomWebDriver',
      capabilities: {
        browserName: 'edge',
        browserVersion: 14,
        os: 'Windows',
        os_version: "10"
      }
    },
    swd_ie11: {
      base: 'CustomWebDriver',
      capabilities: {
        browserName: 'ie',
        browserVersion: 11,
        os: 'Windows',
        os_version: "8"
      }
    },
    swd_ie10: {
      base: 'CustomWebDriver',
      capabilities: {
        browserName: 'ie',
        browserVersion: 10,
        os: 'Windows',
        os_version: "7"
      }
    },
    swd_chrome: {
      base: 'CustomWebDriver',
      capabilities: {
        browserName: 'chrome',
        browserVersion: 57,
        os: 'Windows',
        os_version: "7"
      }
    }
  };
  const browsers = [];
  const useBrowserStack = process.env.BROWSER_STACK_USERNAME !== undefined;
  if (useBrowserStack) {
    Array.prototype.push.apply(browsers, Object.keys(customLaunchers));
  }
  const settings = sharedConfigGenerator(true, useBrowserStack);
  settings.browsers = browsers;
  settings.customLaunchers = customLaunchers;
  config.set(settings)
};
