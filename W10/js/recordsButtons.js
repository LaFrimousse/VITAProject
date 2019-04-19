(function(window) {
  'use strict';

  var App = window.App;
  var Camera = App.Camera;

  var RecordsButtons = (function() {
    var verbose = false
    var delay = null; //number
    var isLooping = null; //boolean
    var cameraEventModule = null;

    var takePictureButton = document.getElementById("takePictureButton");
    var delayIndicator = document.getElementById("delayIndicator");
    var slider = document.getElementById("delaySlider");
    var loopingCase = document.getElementById("loopingBox");
    var loopingWrapper = document.getElementById("loopingWrapper");


    slider.addEventListener("input", function() {
      delay = parseFloat(slider.value);
      delayIndicator.innerHTML = delay.toFixed(1);

      if (delay < 0.5) {
        hideCheckBox();
      } else {
        showCheckBox();
      }
    })

    loopingCase.addEventListener("change", function() {
      isLooping = loopingCase.checked;
      if (verbose) {
        console.log("RecordsButtons: isLoopingg? " + isLooping)
      }
    })

    var hideCheckBox = function() {
      if (!loopingWrapper.classList.contains("hidden")) {
        loopingWrapper.classList.add("hidden");
      }
    }

    var showCheckBox = function() {
      if (loopingWrapper.classList.contains("hidden")) {
        loopingWrapper.classList.remove("hidden");
      }
    }

    takePictureButton.addEventListener("click", function() {
      if (cameraEventModule) {
        cameraEventModule.userClickedRedButton();
      }
    })

    var setCameraEventModule = function(cevm) {
      if (verbose) {
        console.log("RecordsButtons: setting his cameraEventModule " + cevm);
      }
      cameraEventModule = cevm;
    }

    var getLooping = function() {
      return isLooping;
    }

    var getDelay = function() {
      return delay * 1000;
    }

    var setButtonRed = function() {
      takePictureButton.src = "images/takePictureButton.png";
    }

    var setButtonGray = function() {
      takePictureButton.src = "images/takePictureButtonGray.png";
    }

    var setInitialValues = function(multCamera) {
      if (multCamera) {
        delay = 0;
        isLooping = false;
      } else {
        isLooping = true;
        delay = 3;
      }
      delayIndicator.innerHTML = delay.toFixed(1);
      slider.value = delay;
      loopingCase.checked = isLooping;
    };

    setInitialValues(false);
    Camera.hasMultipleCameraAvailable(function(mult){
      setInitialValues(mult);
    })


    /*Explicitly reveal public pointers to the private functions
    that we want to reveal publicly*/
    return {
      setCameraEventModule: setCameraEventModule,
      isLooping: getLooping,
      delay: getDelay,
      setButtonRed: setButtonRed,
      setButtonGray: setButtonGray
    }
  })();

  App.RecordsButtons = RecordsButtons;
  window.App = App;

})(window);
