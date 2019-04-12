//tuto : https://www.html5rocks.com/en/tutorials/getusermedia/intro/
(function(window) {
  'use strict';

  var App = window.App || {};

  var KNN = (function() {

    var K = 1;


    var normalize = function(toNormalize){
      return toNormalize
    }

    var nearestNeighboor(toClassify, neighboors){

      var toClassifyNormalized = normalize(toClassify);
      var neighboorsNormalized = normalize(neighboors);


    }

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

  App.KNN = KNN;
  window.App = App;

})(window);
