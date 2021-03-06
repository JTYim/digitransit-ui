/* eslint prefer-arrow-callback: 0, no-console: 0,
          no-param-reassign: 0, strict: 0, prefer-template: 0 */
'use strict';

module.exports = function (browser) {
  if (browser.ELEMENT_VISIBLE_TIMEOUT) return;
  const GLOBAL_TIMEOUT_MS = 180000;
  const ELEMENT_VISIBLE_TIMEOUT = 10000;
  browser.ELEMENT_VISIBLE_TIMEOUT = ELEMENT_VISIBLE_TIMEOUT;

  browser.finish = function finish(done) {
    browser.end(function () {
      done();
    });
  };

  browser.setCurrentPosition = function setCurrentPosition(lat, lon, heading, done) {
    browser.execute(function (lat2, lon2, heading2) {
      window.mock.geolocation.setCurrentPosition(lat2, lon2, heading2, true);
    }, [lat, lon, heading], function () {
      done();
    });
  };

  browser.url = (function makeUrl(ex) {
    return function url(urlArg, done) {
      let launchUrl = urlArg || `${browser.launch_url}/`;
      if (launchUrl.indexOf('http://') !== 0) {
        launchUrl = browser.launch_url + urlArg;
      }
      launchUrl = `${launchUrl}?mock`;
      ex(launchUrl, done);
    };
  }(browser.url));

  browser.init = (url, done) => {
    let launchUrl;
    if (typeof(url) === 'string') {
      launchUrl = url;
    } else {
      done = url;
    }

    console.log(`snap_commit_short=${process.env.SNAP_COMMIT_SHORT}`);
    console.log(`launchUrl=${launchUrl || 'default'}`);

    browser.timeouts('script', GLOBAL_TIMEOUT_MS, () => {
      browser.timeouts('implicit', GLOBAL_TIMEOUT_MS, () => {
        browser.timeouts('page load', GLOBAL_TIMEOUT_MS, () => {
          browser.url(launchUrl, () => {
            console.log('session id=' + browser.sessionId);
            done();
          });
        });
      });
    });
  };

  browser.expect.map = () => browser.expect.element('div.leaflet-map-pane');

  browser.stopsTab = {};
  browser.stopsTab.click = (done) => {
    browser.click('.tabs-row .nearby-stops', () => {
      done();
    });
  };

  browser.back = {};
  browser.back.click = (done) => {
    browser.expect.element('.cursor-pointer.back').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
    browser.click('.cursor-pointer.back', done);
  };

  browser.map = {
    click(done) {
      browser.click('div.map', done);
    },
  };

  browser.fakeSearch = {
    openSearch() {
      browser.expect.element('#front-page-search-bar')
        .to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('#front-page-search-bar');
    },
  };

  browser.origin = {
    popup: {
      click(done) {
        browser.expect.element('.origin-popup').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
        browser.click('.origin-popup', done);
      },
    },
    clear(done) {
      browser.expect.element('.clear-icon').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('.clear-icon', done);
    },
    selectOrigin() {
      browser.expect.element('#origin')
        .to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('#origin');
    },
    enterText(text) {
      browser.expect.element('#search-origin').to.be.enabled.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.setValue('#search-origin', text, () => {
        browser.pause(1000, () => {
          browser.setValue('#search-origin', browser.Keys.ENTER, () => {
            browser.pause(100);
          });
        });
      });
    },
  };

  browser.destination = {
    selectDestination() {
      browser.expect.element('#destination').to.be.enabled.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('#destination');
    },
    openSearch() {
      browser.expect.element('#destination').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('#destination');
    },
    enterText(text) {
      browser.setValue('#search-destination', text, () => {
        browser.pause(1000, () => {
          browser.setValue('#search-destination', browser.Keys.ENTER, () => {
            browser.pause(100);
          });
        });
      });
    },
  };
};
