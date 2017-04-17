// Https Karma configuration - for browsers that support https on BrowserStack

var firefox = require('selenium-webdriver/firefox');
var sharedConfigGenerator = require("./shared-karma-conf.js");

var fs = require("fs");
module.exports = function(config) {
  const customLaunchers = {
    swd_firefox: {
      user: 'USERNAME',
      key: 'ACCESS_KEY',
      seleniumHost: 'hub-cloud.browserstack.com',
      seleniumPort: 80,
      base: 'SeleniumWebdriver',
      browserName: 'Firefox',
      getDriver: function(){
        // example from https://www.npmjs.com/package/selenium-webdriver#usage
        return new firefox.Driver();
      }
    }
  };
  const browsers = ['swd_firefox'];

  const useBrowserStack = process.env.BROWSER_STACK_USERNAME !== undefined;
  if (useBrowserStack) {
    Array.prototype.push.apply(browsers, Object.keys(customLaunchers));
  }

  var settings = sharedConfigGenerator(true, useBrowserStack);
  console.log("settings", settings);
  // settings.browsers = browsers;
  // settings.customLaunchers = customLaunchers;

  config.set(settings)
};
