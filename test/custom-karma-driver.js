var q = require('q');
const wd = require('wd');
const browserstack = require('browserstack-local');

const username = process.env.BROWSER_STACK_USERNAME;
const accessKey = process.env.BROWSER_STACK_ACCESS_KEY;
const seleniumHost = 'hub-cloud.browserstack.com';
const seleniumPort = 80;

var tunnelId = null;
var bs_local = null;

var localCallbacks = [];
var localTunnels = [];
function LocalTunnel(logger, cb) {
  localTunnels.push(this);

  if (tunnelId !== null) {
    cb(null, tunnelId);
  } else {
    localCallbacks.push(cb);
    const tunnelIdentifier = "tunnel-" + Math.random();
    if (localCallbacks.length === 1) {
      bs_local = new browserstack.Local();
      bs_local.start({
        'key': accessKey,
        'localIdentifier': tunnelIdentifier
      }, function (error) {
        tunnelId = tunnelIdentifier;
        for (var i = 0; i < localCallbacks.length; i++) {
          localCallbacks[i](error, tunnelIdentifier);
        }
        localCallbacks = [];
      });
    }
  }

  this.dispose = function(cb){
    localTunnels.splice(localTunnels.indexOf(this), 1);
    if (localTunnels.length === 0) {
      tunnelId = null;
      bs_local.stop(function(){
        cb(null);
      });
    } else {
      cb(null);
    }
  }
}

function CustomWebdriverBrowser(id, baseBrowserDecorator, args, logger) {
  baseBrowserDecorator(this);
  var self = this;
  var capabilities = args.capabilities;
  self.name = capabilities.browserName + ' - ' + capabilities.browserVersion + ' - ' + capabilities.os + ' ' + capabilities.os_version;
  var log = logger.create('launcher.selenium-webdriver: ' + self.name);
  self.log = log;
  var captured = false;

  self.id = id;

  self._start = function (testUrl) {
    self.localTunnel = new LocalTunnel(log, function(err, tunnelIdentifier) {
      if (err) {
        return log.error("Could not create local testing", err);
      }

      log.debug('Local Tunnel Connected. Now testing...');
      const browser = wd.remote(seleniumHost, seleniumPort, username, accessKey);
      self.browser = browser;
      browser.on('status', function(info) {
        log.debug(info);
      });
      browser.on('command', function(eventType, command, response) {
        log.debug(' > ' + eventType, command, (response || ''));
      });
      browser.on('http', function(meth, path, data) {
        log.debug(' > ' + meth, path, (data || ''));
      });
      const bsCaps = Object.assign({
        acceptSslCerts: true,
        defaultVideo: true,
        "browserstack.local": true,
        "browserstack.tunnel": true,
        "browserstack.debug": true,
        tunnelIdentifier: tunnelIdentifier,
        "browserstack.localIdentifier": tunnelIdentifier,
        "browserstack.safari.driver": "2.48"
      }, capabilities);
      browser.init(bsCaps, function(err) {
        if (err) {
          log.error("browser.init", err);
          throw err;
        }
        browser.get("https://localhost:9100", function() {
          browser.sleep(2000, function() {
            browser.get("https://localhost:9105", function () {
              browser.sleep(2000, function () {
                browser.get(testUrl, function() {
                  captured = true;
                  // This will just wait on the page until the browser is killed
                });
              });
            });
          });
        })
      });
    });
  };

  this.on('kill', function(done){
    self.localTunnel.dispose(function(){
      self.browser.quit(function(err) {
        self._done();
        done();
      });
    });
  });

  self.isCaptured = function() {
    return captured;
  };

  // self.forceKill = function() {
  //   return self.kill();
  // };
}

CustomWebdriverBrowser.$inject = [ 'id', 'baseBrowserDecorator', 'args', 'logger' ];

module.exports = {
  'launcher:CustomWebDriver': ['type', CustomWebdriverBrowser]
};
