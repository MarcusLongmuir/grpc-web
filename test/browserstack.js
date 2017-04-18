const wd = require('wd');
const browserstack = require('browserstack-local');

const username = process.env.BROWSER_STACK_USERNAME;
const accessKey = process.env.BROWSER_STACK_ACCESS_KEY;
const tunnelIdentifier = "tunnel-" + Math.random();
const testUrl = "https://localhost:9876";
const seleniumHost = 'hub-cloud.browserstack.com';
const seleniumPort = 80;

const capabilities = {
  browserName: 'ie',
  browserVersion: 10,
  acceptSslCerts: true,
  defaultVideo: true,
  "browserstack.local": true,
  "browserstack.tunnel": true,
  "browserstack.debug": true,
  tunnelIdentifier: tunnelIdentifier,
  "browserstack.localIdentifier": tunnelIdentifier
};

const localConfig = {
  'key': accessKey,
  'localIdentifier': tunnelIdentifier
};

const bs_local = new browserstack.Local();
bs_local.start(localConfig, function(error) {
  if (error) return console.log(error);

  console.log('Connected. Now testing...');
  const browser = wd.remote(seleniumHost, seleniumPort, username, accessKey);
  browser.on('status', function(info) {
    console.log(info);
  });
  browser.on('command', function(eventType, command, response) {
    console.log(' > ' + eventType, command, (response || ''));
  });
  browser.on('http', function(meth, path, data) {
    console.log(' > ' + meth, path, (data || ''));
  });
  browser.init(capabilities, function() {
    browser.get("https://localhost:9100", function() {
      browser.sleep(2000, function() {
        browser.get("https://localhost:9105", function () {
          browser.sleep(2000, function () {
            browser.get(testUrl, function () {
              console.log("GOT TO TEST PAGE");
              setTimeout(function() {
                console.log("I WAITED FOR YOU");
              }, 120000);
            });
          });
        });
      });
    })
  });

  //On complete
  // bs_local.stop(function(){
  //   console.log("Stopped local tunnel");
  // });
  // return browser.quit();
});
