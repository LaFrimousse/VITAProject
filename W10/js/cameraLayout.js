(function(window) {
  'use strict';
  var App = window.App;
  var Camera = App.Camera;

  var CameraLayout = (function() {
    var verbose = false;

    var shouldDisplayCameraSwitch = false;
    Camera.hasMultipleCameraAvailable(function(multAvailable) {
      shouldDisplayCameraSwitch = multAvailable
    });

    //The DOMS elements
    //usefull to layout the buttons
    var videoElementContainer = document.getElementById("videoElementContainer");
    //the video element (needed in case we mirror it)
    var videoElement = document.getElementById("videoElement");
    //the canvas to display the points
    var canvasForLivePoints = document.getElementById("canvasForLivePoints");
    //in the videoElement
    var closeCameraButton = document.getElementById("closeCameraButton");
    var mirrorVideoButton = document.getElementById("mirrorVideoButton");
    var switchCameraWrapper = document.getElementById("switchBoxWrapper");
    var showLivePointsButton = document.getElementById("showLivePointsButton")
    var counter = document.getElementById("counter");
    //usefull only to resize
    var postureToAdoptImg = document.getElementById("postureToAdoptImg");



    var switchOpacityFunction = function() {
      if (postureToAdoptImg.classList.contains("alpha04")) {
        postureToAdoptImg.classList.remove("alpha04");
      } else {
        postureToAdoptImg.classList.add("alpha04");
      }
    }

    var addImageOpacityListener = function() {
      postureToAdoptImg.addEventListener("click", switchOpacityFunction);
    }

    var removeImageOpacityListener = function() {
      postureToAdoptImg.removeEventListener("click", switchOpacityFunction);
      if (postureToAdoptImg.classList.contains("alpha04")) {
        postureToAdoptImg.classList.remove("alpha04");
      }
    }

    var hideElement = function(toHide) {
      if (toHide == "points") {
        console.err("NOT IMPLEMENTED, BUT SHOULD CLEAR THE POINTS OF THE CANVAS HERE");
        return;
      }
      var elementToHide = getElementFromStringHelper(toHide);
      hide(elementToHide);
    }

    var showElement = function(toShow) {
      var elementToShow = getElementFromStringHelper(toShow);
      show(elementToShow);
    }

    var getElementFromStringHelper = function(nameOfElement) {
      switch (nameOfElement) {
        case "closeCameraButton":
          return closeCameraButton;
        case "mirrorButton":
          return mirrorVideoButton;
        case "switchCameraWrapper":
          return switchCameraWrapper;
        case "counter":
          return counter;
        case "skeletons":
          return showLivePointsButton;
        default:
          console.error("CameraLayoutModule: No element to select that corresponds to " + nameOfElement);
          return;
      }
    }

    var hide = function(element) {
      if (!element.classList.contains("notDisplayed")) {
        element.classList.add("notDisplayed");
      }
    }

    var show = function(element) {
      if (element == switchCameraWrapper && !shouldDisplayCameraSwitch) {
        if (verbose) {
          console.log("CameraLayout: not showing the switchCamera switch");
        }
        return;
      }

      if (element == mirrorVideoButton && Camera.isUsingBackCamera() &&
        Camera.hasMultipleCameraAvailable()) {
        if (verbose) {
          console.log("CameraLayout: not showing the mirror button for a back camera");
        }
        return;
      }

      if (element.classList.contains("notDisplayed")) {
        element.classList.remove("notDisplayed");
      }
    }


    var mirrorElements = function() {
      var elemsToMirror = [videoElement, canvasForLivePoints, mirrorVideoButton, postureToAdoptImg];

      elemsToMirror.forEach(function(el) {
        if (el.classList.contains("mirrored")) {
          el.classList.remove("mirrored");
        } else {
          el.classList.add("mirrored");
        }
      });
    }

    var updateCounter = function(newCounterValue) {
      if (typeof newCounterValue != 'number') {
        hide(counter);
      } else if (newCounterValue < 0) {
        hide(counter);
      } else if (newCounterValue < 1) {
        show(counter);
        makeCounterRed();
        counter.innerHTML = newCounterValue.toFixed(1);
      } else {
        show(counter);
        makeCounterBlack();
        counter.innerHTML = newCounterValue.toFixed(1);
      }
    }

    var makeCounterRed = function() {
      if (!counter.classList.contains("redCounter")) {
        counter.classList.add("redCounter");
      }
    }
    var makeCounterBlack = function() {
      if (counter.classList.contains("redCounter")) {
        counter.classList.remove("redCounter");
      }
    }

    var animePictureTaken = function() {

      if (!videoElement.classList.contains("hidden")) {
        videoElement.classList.add("hidden");
      }

      var myTimeout = window.setTimeout(function() {
        if (videoElement.classList.contains("hidden")) {
          videoElement.classList.remove("hidden");
        }
      }, 50);
    }



    var replaceButtonInVideoElement = function() {
      var videoElementContainerWidth = parseInt(getComputedStyle(videoElementContainer).width);
      var videoElementWidth = parseInt(getComputedStyle(videoElement).width);
      var offsetForLeftButton = (videoElementContainerWidth - videoElementWidth) / 2

      canvasForLivePoints.style.width = videoElementWidth + "px";
      canvasForLivePoints.style.left = offsetForLeftButton + "px";

      closeCameraButton.style.left = offsetForLeftButton + "px";
      mirrorVideoButton.style.left = offsetForLeftButton + "px";

      var offsetForRightButton = offsetForLeftButton + videoElementWidth;

      postureToAdoptImg.style.right = offsetForLeftButton + "px";
      var dividor = 5; // for phones
      if (window.innerWidth > 768) { //for browser
        dividor = 3;
      }
      postureToAdoptImg.style.maxWidth = videoElementWidth / dividor + "px";

      counter.style.right = offsetForLeftButton + "px";
    }


    window.addEventListener("resize", function() {
      console.log("Window is beeing resized");
      replaceButtonInVideoElement();
    })

    var replaceElementInVideoMoreThanOnce = function() {
      var initialResizeTime = [50, 100, 150, 200, 250, 500, 1000, 2000];
      initialResizeTime.forEach(function(updateIn) {
        window.setTimeout(replaceButtonInVideoElement, updateIn);
      });
    }

    replaceElementInVideoMoreThanOnce();

    return {
      hideElement: hideElement,
      showElement: showElement,
      mirrorElements: mirrorElements,
      updateCounter: updateCounter,
      animePictureTaken: animePictureTaken,
      replaceButtonInVideoElement: replaceElementInVideoMoreThanOnce,
      addImageOpacityListener: addImageOpacityListener,
      removeImageOpacityListener: removeImageOpacityListener
    }
  })();

  App.CameraLayout = CameraLayout;
  window.App = App;
})(window);
