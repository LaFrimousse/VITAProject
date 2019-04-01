(function(window) {
  'use strict';

  var App = window.App || {};

  var RecordsButtons = (function() {
    var verbose = true
    var delay = 3;
    var isLooping = false;
    var cameraEventModule = null;

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

      if (delay < 0.5) {
        hideCheckBox();
      } else {
        showCheckBox();
      }
    })

    loopingCase.addEventListener("change", function(){
      isLooping = loopingCase.checked;
      if(verbose){
        console.log("RecordsButtons: isLoopingg? "+ isLooping)
      }
    })

    var hideCheckBox = function() {
      if (!loopingWrapper.classList.contains("notDisplayed")) {
        loopingWrapper.classList.add("notDisplayed");
      }
    }

    var showCheckBox = function() {
      if (loopingWrapper.classList.contains("notDisplayed")) {
        loopingWrapper.classList.remove("notDisplayed");
      }
    }



    takePictureButton.addEventListener("click", function() {

      if (cameraEventModule) {
        cameraEventModule.userClickedRedButton();
      }

    })

    var setCameraEventModule = function(cevm) {
      if(verbose){
        console.log("RecordsButtons: setting his cameraEventModule " + cevm);
      }
      cameraEventModule = cevm;
    }

    var getLooping = function(){
      return isLooping;
    }

    var getDelay = function(){
      return delay;
    }

    /*Explicitly reveal public pointers to the private functions
    that we want to reveal publicly*/
    return {
      setCameraEventModule: setCameraEventModule,
      isLooping: getLooping,
      delay: getDelay
    }
  })();

  App.RecordsButtons = RecordsButtons;
  window.App = App;

})(window);
