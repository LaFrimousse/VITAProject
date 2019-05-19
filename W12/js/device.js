(function(window) {
  'use strict';
  var App = window.App;
  var Helper = App.Helper;
  var Device = (function() {

    var verbose = false;
    var CLIENT_ID_COOKIE_NAME = "clientIdCookieName";
    var clientId = null;
    var hasMultipleCamera = null;

    (function() { // init code

      /*Fetching the client ID  Cookie*/
      var previousClientId = Helper.getCookie(CLIENT_ID_COOKIE_NAME);
      if (previousClientId == null) {
        if (verbose) {
          console.log("Device: no previous cookie found acting as user identifier");
        }
        previousClientId = Helper.UUID();
      } else {
        if (verbose) {
          console.log("Device: a previous cookie has been found for this user : " + previousClientId);
        }
      }
      Helper.setCookie(CLIENT_ID_COOKIE_NAME, previousClientId, 100);
      clientId = previousClientId;

      /*And already looking if the device has multiple camera or not*/
      deviceHasMultipleCamera();
    })();

    async function deviceHasMultipleCamera() {

      if (typeof hasMultipleCamera === "boolean") {
        if (verbose) {
          console.log("Device: answering the question of multiple camera using a previous stored value: ", hasMultipleCamera);
        }
        return hasMultipleCamera;

      } else {
        hasMultipleCamera = await askSystemIfMultipleCameraAvailable();
        return hasMultipleCamera;
      }
    }

    async function askSystemIfMultipleCameraAvailable() {
      var videoDevices = []
      var foundDevices = await navigator.mediaDevices.enumerateDevices();
      foundDevices.forEach(function(dev) {
        if (dev.kind === "videoinput") {
          videoDevices.push(dev);
        }
      })
      var multipleAvailable = videoDevices.length > 1;
      if (verbose) {
        var negation = multipleAvailable ? "" : " not";
        console.log("Device: We noticed that this device has" + negation + " multiple input video devices");
      }
      return multipleAvailable;
    }

    /*Explicitly reveal public pointers to the private functions
    that we want to reveal publicly*/
    return {
      clientId: clientId,
      hasMultipleCamera: deviceHasMultipleCamera
    }
  })();
  App.Device = Device;
  window.App = App;
})(window);
