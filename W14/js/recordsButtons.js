/*The DOM element where the user can select the delay of the pictures, if looping or not, ...*/
(function(window) {
  'use strict';

  var App = window.App;
  var Device = App.Device;

  var RecordsButtons = (function() {
    var verbose = false
    var delay = null; //number
    var isLooping = null; //boolean

    var takePictureButton = document.getElementById("takePictureButton");
    var delayIndicator = document.getElementById("delayIndicator");
    var slider = document.getElementById("delaySlider");
    var loopingCase = document.getElementById("loopingBox");
    var loopingWrapper = document.getElementById("loopingWrapper");


    (function () {//init code
      Device.hasMultipleCamera().then(function(res){
        setInitialValues(res);});
    }());

//----- Setting the initial event listeners-----
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

    takePictureButton.addEventListener("click", function() {
      App.CameraEvents.userClickedRedButton()
    })

    //-----------------------------------------

    var hideCheckBox = function() {
      loopingWrapper.classList.add("hidden");
    }

    var showCheckBox = function() {
      loopingWrapper.classList.remove("hidden");
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

    var setInitialValues = function(deviceHasMultipleCamera) {
      if (deviceHasMultipleCamera) {
        delay = 0;
        isLooping = false;
      } else {
        isLooping = true;
        delay = 0;
      }

      delayIndicator.innerHTML = delay.toFixed(1);
      slider.value = delay;
      loopingCase.checked = isLooping;
      if (delay < 0.5) {
        hideCheckBox();
      }
    };

    var hideElements = function(){
      document.getElementById("cameraRecordButtons").classList.add("notDisplayed")
    }

    var showElements = function(){
      document.getElementById("cameraRecordButtons").classList.remove("notDisplayed")
    }

    return {
      isLooping: getLooping,
      delay: getDelay,
      setButtonRed: setButtonRed,
      setButtonGray: setButtonGray,
      showElements: showElements,
      hideElements: hideElements,
    }
  })();

  App.RecordsButtons = RecordsButtons;
  window.App = App;
})(window);
