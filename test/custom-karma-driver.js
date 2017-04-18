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
function LocalTunnel(cb) {
  localTunnels.push(this);

  if (tunnelId !== null) {
    cb(null, tunnelId);
    return;
  }

  localCallbacks.push(cb);
  const tunnelIdentifier = "tunnel-" + Math.random();
  if (localCallbacks.length === 1) {
    bs_local = new browserstack.Local();
    bs_local.start({
      'key': accessKey,
      'localIdentifier': tunnelIdentifier
    }, function(error) {
      tunnelId = tunnelIdentifier;
      for(var i = 0; i < localCallbacks.length; i++) {
        localCallbacks[i](error, tunnelIdentifier);
      }
    });
  }

  this.dispose = function(cb){
    localTunnels.splice(localTunnels.indexOf(this), 1);
    if (localTunnels.length === 0) {
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
  var log = logger.create('launcher.selenium-webdriver');
  self.log = log;
  var browserName = args.browserName;
  var killingPromise;

  self.id = id;
  self.name = capabilities.browserName + ' - ' + capabilities.browserVersion + ' - ' + capabilities.platform + ' - ' + capabilities.platformVersion;

  self._start = function (testUrl) {
    log.info('starting '+self.name);

    self.localTunnel = new LocalTunnel(function(err, tunnelIdentifier) {
      if (err) {
        return log.info("Could not create local testing", err);
      }

      log.info('Connected. Now testing...');
      const browser = wd.remote(seleniumHost, seleniumPort, username, accessKey);
      self.browser = browser;
      browser.on('status', function(info) {
        log.info(info);
      });
      browser.on('command', function(eventType, command, response) {
        log.info(' > ' + eventType, command, (response || ''));
      });
      browser.on('http', function(meth, path, data) {
        log.info(' > ' + meth, path, (data || ''));
      });
      const bsCaps = Object.assign({
        acceptSslCerts: true,
        defaultVideo: true,
        "browserstack.local": true,
        "browserstack.tunnel": true,
        "browserstack.debug": true,
        tunnelIdentifier: tunnelIdentifier,
        "browserstack.localIdentifier": tunnelIdentifier
      }, capabilities);
      log.info("bsCaps", bsCaps);
      browser.init(bsCaps, function() {
        log.info("browser", browser);
        browser.get("https://localhost:9100", function() {
          browser.sleep(2000, function() {
            browser.get("https://localhost:9105", function () {
              browser.sleep(2000, function () {
                browser.get(testUrl, function () {
                  log.info("GOT TO TEST PAGE");
                  setTimeout(function() {
                    log.info("I WAITED FOR YOU");
                  }, 120000);
                });
              });
            });
          });
        })
      });
    });
  };

  self.kill = function(){
    if (killingPromise) {
      return killingPromise;
    }

    var deferred = q.defer();
    killingPromise = deferred.promise;

    self.localTunnel.dispose(function(){
      self.browser.quit(function() {
        deferred.resolve();
      });
    });

    return killingPromise;
  };

  self.forceKill = function() {
    self.kill();
    return killingPromise;
  };
}

CustomWebdriverBrowser.$inject = [ 'id', 'baseBrowserDecorator', 'args', 'logger' ];

module.exports = {
  'launcher:CustomWebDriver': ['type', CustomWebdriverBrowser]
};
