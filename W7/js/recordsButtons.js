(function(window) {
  'use strict';

  var App = window.App || {};

  var RecordsButtons = (function() {
    var verbose = true

    

    /*Explicitly reveal public pointers to the private functions
    that we want to reveal publicly*/
    return {
      open: openCamera,
      close: closeCamera,
      isCameraOpen: isCameraOpen,
      takePicture: takePicture,
      verbose: verbose
    }
  })();

  App.RecordsButtons = RecordsButtons;
  window.App = App;

})(window);
