(function(window) {
  'use strict';
  var App = window.App || {};

  var CameraLayout = (function() {

    //The DOMS elements

    //usefull to layout the buttons
    var videoElementContainer = document.getElementById("videoElementContainer");
    //the video element (needed in case we mirror it)
    var videoElement = document.getElementById("videoElement");
    //the canvas to display the points
    var canvasForLivePoints = document.getElementById("canvasForLivePoints");
    //in the videoElement
    var openOrCloseCameraButton = document.getElementById("openOrCloseCameraButton");
    var mirrorVideoButton = document.getElementById("mirrorVideoButton");
    var switchCameraWrapper = document.getElementById("switchCameraWrapper");
    var counter = document.getElementById("counter");
    //usefull only to resize
    var postureToAdoptImg = document.getElementById("postureToAdoptImg");

    postureToAdoptImg.addEventListener("click", function() {
      if (postureToAdoptImg.classList.contains("alpha04")) {
        postureToAdoptImg.classList.remove("alpha04");
      } else {
        postureToAdoptImg.classList.add("alpha04");
      }
    })

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
        case "openCloseButton":
          return openOrCloseCameraButton;
        case "mirrorButton":
          return mirrorVideoButton;
        case "switchCameraWrapper":
          return postureToAdoptImg;
        case "counter":
          return counter;
        default:
          console.err("CameraLayoutModule: No element to select that corresponds to " + nameOfElement);
          return;
      }
    }

    var hide = function(element) {
      if (!element.classList.contains("notDisplayed")) {
        element.classList.add("notDisplayed");
      }
    }

    var show = function(element) {
      if (element.classList.contains("notDisplayed")) {
        element.classList.remove("notDisplayed");
      }
    }

    var setSrcForOpenCloseButton = function(src) {
      openOrCloseCameraButton.src = src;
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

      openOrCloseCameraButton.style.left = offsetForLeftButton + "px";
      mirrorVideoButton.style.left = offsetForLeftButton + "px";

      var offsetForRightButton = offsetForLeftButton + videoElementWidth;

      postureToAdoptImg.style.right = offsetForLeftButton + "px";
      postureToAdoptImg.style.maxWidth = videoElementWidth / 5 + "px";

      counter.style.right = offsetForLeftButton + "px";
    }
    replaceButtonInVideoElement();

    window.addEventListener("resize", function() {
      console.log("resize");
      replaceButtonInVideoElement();
    })


    return {
      hideElement: hideElement,
      showElement: showElement,
      setSrcForOpenCloseButton: setSrcForOpenCloseButton,
      mirrorElements: mirrorElements,
      updateCounter: updateCounter,
      animePictureTaken: animePictureTaken,
      replaceButtonInVideoElement: replaceButtonInVideoElement
    }
  })();

  App.CameraLayout = CameraLayout;
  window.App = App;
})(window);
