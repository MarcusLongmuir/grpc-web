// Shared Karma configuration

var fs = require("fs");

module.exports = function(useHttps, withBrowserStack) {
  function configPreprocessor(args, config, logger, helper) {
    return function(content, file, done) {
      var envContent = 'window.USE_HTTPS = ' + useHttps + ';';
      done(envContent + '\n' + content);
    };
  }

  var reporters = ['dots'];

  return {
    basePath: '',
    frameworks: ['jasmine'],
    browserStack: {
      forcelocal: true
    },
    files: [
      'ts/build/integration-tests.js'
    ],
    preprocessors: {
      '**/*.js': ['sourcemap', 'config-inject']
    },
    reporters: reporters,
    port: 9876,
    protocol: useHttps ? "https" : "http",
    httpsServerOptions: {
      key: fs.readFileSync('../misc/localhost.key', 'utf8'),
      cert: fs.readFileSync('../misc/localhost.crt', 'utf8')
    },
    colors: true,
    logLevel: 'DEBUG',
    client: {
      captureConsole: true,
      runInParent: true,
      useIframe: false
    },
    plugins: [
      require('./custom-karma-driver'),
      {'preprocessor:config-inject': ['factory', configPreprocessor]},
      "karma-sourcemap-loader",
      "karma-jasmine"
    ],
    autoWatch: true,
    captureTimeout: 120000,
    singlerun: withBrowserStack,
    concurrency: withBrowserStack ? 3 : Math.Infinity
  };
};
