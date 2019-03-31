(function(window) {
  'use strict';

  var App = window.App || {};

  var RecordsButtons = (function() {
    var verbose = true
    var delay = 3

    var takePictureButton = document.getElementById("takePictureButton");
    var delayIndicator = document.getElementById("delayIndicator");
    var slider = document.getElementById("delaySlider");
    var loopingCase = document.getElementById("loopingBox");
    var loopingWrapper = document.getElementById("loopingWrapper");

    //set the initialDelay of 3 sec
    delayIndicator.innerHTML = delay.toFixed(1);
    slider.value = delay;

    slider.addEventListener("input", function() {
      delay = parseFloat(slider.value);
      delayIndicator.innerHTML = delay.toFixed(1);

      if(delay < 0.5){
        hideCheckBox();
      }else{
        showCheckBox();
      }
    })

    var hideCheckBox = function(){
      if (!loopingWrapper.classList.contains("notDisplayed")) {
        loopingWrapper.classList.add("notDisplayed");
      }
    }

    var showCheckBox = function(){
      if (loopingWrapper.classList.contains("notDisplayed")) {
        loopingWrapper.classList.remove("notDisplayed");
      }
    }



    takePictureButton.addEventListener("click", function() {
      var looping = loopingCase.checked;
      if (delay < 0.5){
        looping = false;
      }

      var cameraEvent = new Object();
      cameraEvent.delay = delay;
      cameraEvent.looping = looping;
      console.log(cameraEvent);
    })





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
