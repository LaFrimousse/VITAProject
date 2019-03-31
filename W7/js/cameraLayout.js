(function(window) {
  'use strict';
  var App = window.App || {};

  var CameraLayout = (function() {

    //The DOMS elements

    //the title of the posture to take
    var postureToAdaptTitle = document.getElementById("postureToAdaptTitle");
    //the video element (needed in case we mirror it)
    var videoElement = document.getElementById("videoElement");
    //the canvas to display the points
    var canvasForLivePoints = document.getElementById("canvasForLivePoints");
    //in the videoElement
    var openOrCloseCameraButton = document.getElementById("openOrCloseCameraButton");
    var mirrorVideoButton = document.getElementById("mirrorVideoButton");
    var postureToAdoptImg = document.getElementById("postureToAdoptImg");
    var counter = document.getElementById("counter");

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
        case "title":
          return postureToAdaptTitle;
        case "openCloseButton":
          return openOrCloseCameraButton;
        case "mirrorButton":
          return mirrorVideoButton;
        case "postureImage":
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

    var setTitle = function(newTitle) {
      if (newTitle) {
        postureToAdaptTitle.innerHTML = newTitle;
        show(postureToAdaptTitle);
      } else {
        hide(postureToAdaptTitle);
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



    return {
      hideElement: hideElement,
      showElement: showElement,
      setTitle: setTitle,
      setSrcForOpenCloseButton: setSrcForOpenCloseButton,
      mirrorElements: mirrorElements,
      updateCounter: updateCounter,
      animePictureTaken: animePictureTaken
    }
  })();

  App.CameraLayout = CameraLayout;
  window.App = App;
})(window);
