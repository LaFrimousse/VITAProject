/*This module purpose is to deal with the layout all element that are related*/
(function(window) {
  'use strict'
  var App = window.App;
  var Camera = App.Camera;

  var CameraManager = (function() {
    var verbose = true

    /*Get access of the DOMs elements*/
    var openCloseCameraButton = document.getElementById("openCloseCameraButton")
    var mirrorVideoButton = document.getElementById("mirrorVideoButton")
    var startStopTakingPicturesButton = document.getElementById("startStopTakingPictures")
    //(needed for the animation only)
    var videoElement = document.getElementById("videoElement")



    /*open the camera and change the image and alpha of the openCloseCameraButton accordingly*/
    var openCamera = function(callback, showMirror) {

      if (verbose) {
        console.log("CameraManager: Was asked to open the camera");
      }

      var cb = function(success) {
        if (success) {
          openCloseCameraButton.src = "images/closeCameraButton.png"
          if (!openCloseCameraButton.classList.contains("alpha08")) {
            openCloseCameraButton.classList.add("alpha08");
          }

          if (typeof(callback) != "undefined") {
            callback(true)
          }
          if (showMirror != false) {
            showMirrorButton()
          }
        } else {
          if (typeof(callback) != "undefined") {
            callback(false)
          }
        }
      }
      Camera.open(cb)
    }

    /*close the camera and change the image and alpha of the openCloseCameraButton accordingly*/
    var closeCamera = function(callback) {

      if (verbose) {
        console.log("CameraManager: Was asked to close the camera");
      }

      var cb = function(success) {
        if (success) {
          openCloseCameraButton.src = "images/openCameraButton.png"
          if (openCloseCameraButton.classList.contains("alpha08")) {
            openCloseCameraButton.classList.remove("alpha08");
          }
          if (typeof(callback) != "undefined") {
            callback(true)
          }
          hideMirrorButton()
        } else {
          if (typeof(callback) != "undefined") {
            callback(false)
          }
        }
      }
      Camera.close(cb)
    }

    var showMirrorButton = function() {
      if (verbose) {
        console.log("CameraManager: Will show the mirror button");
      }
      if (mirrorVideoButton.classList.contains("notDisplayed")) {
        mirrorVideoButton.classList.remove("notDisplayed");
      }
    }

    var hideMirrorButton = function() {
      if (verbose) {
        console.log("CameraManager: Will hide the mirror button");
      }
      if (!mirrorVideoButton.classList.contains("notDisplayed")) {
        mirrorVideoButton.classList.add("notDisplayed");
      }
    }

    /*Add an event listener on the mirror button that mirrors some elements*/
    mirrorVideoButton.addEventListener("click", function() {
      var elemsToMirror = [videoElement, mirrorVideoButton, document.getElementById("videoPointsCanvas")]

      elemsToMirror.forEach(function(domElement) {
        if (domElement.classList.contains("mirrored")) {
          domElement.classList.remove("mirrored");
        } else {
          domElement.classList.add("mirrored");
        }
      })
    })

    /*add an event listener on the openCloseCameraButton to open or close the camera*/
    openCloseCameraButton.addEventListener("click", function() {
      if (Camera.isCameraOpen) {
        closeCamera()
      } else {
        openCamera()
      }
    })



    //---------------/*Some helpers variables*/
    var pictureAutomaticInterval = null

    /*open the camera if not and then take some pictures*/
    var willStartTakingPictures = function(timeIntervalBetweenPictures, callback) {

      if (Camera.isCameraOpen) {
        if (verbose) {
          console.log("CameraManager: Was asked to start taking pictures");
        }
        startTakingPictures(timeIntervalBetweenPictures, callback)
      } else {
        if (verbose) {
          console.log("CameraManager: Was asked to start taking pictures, but before we need to open the camera");
        }
        var cb = function(success) {
          if (success) {
            if (verbose) {
              console.log("CameraManager: The camera is open, let's start to take pictures")
            }
            startTakingPictures(timeIntervalBetweenPictures, callback)
          }
        }
        openCamera(cb, false)
      }
    }

    var startTakingPictures = function(timeIntervalBetweenPictures, callback) {
      hideMirrorAndOpenCloseButton()
      if (pictureAutomaticInterval != null) {
        console.error("CameraManager: Cannot start to take pictures if it is already taking pictures")
        return;
      }

      startStopTakingPicturesButton.innerHTML = "stop taking pictures"
      if (verbose) {
        console.log("CameraManager: creating an interval to take pictures each " + timeIntervalBetweenPictures + " ms")
      }
      pictureAutomaticInterval = window.setInterval(function() {
        var data = Camera.takePicture()
        animePictureTaken()
        if (data != null) {
          callback(data)
        }
      }, timeIntervalBetweenPictures);
    }

    var stopTakingPictures = function() {
      showMirrorAndOpenCloseButton()
      startStopTakingPicturesButton.innerHTML = "start taking pictures"
      if (verbose) {
        console.log("CameraManager: killing the interval that took automatically pictures")
      }
      window.clearInterval(pictureAutomaticInterval)
      pictureAutomaticInterval = null
    }

    var showReadyToRecordButton = function() {
      startStopTakingPicturesButton.style.visibility = "visible";
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

    var hideMirrorAndOpenCloseButton = function() {
      [mirrorVideoButton, openCloseCameraButton].forEach(function(element) {
        if (!element.classList.contains("notDisplayed")) {
          element.classList.add("notDisplayed");
        }
      })
    }

    var showMirrorAndOpenCloseButton = function() {
      [mirrorVideoButton, openCloseCameraButton].forEach(function(element) {
        if (element.classList.contains("notDisplayed")) {
          element.classList.remove("notDisplayed");
        }
      })
    }


    return {
      showReadyToRecordButton: showReadyToRecordButton,
      startTakingPictures: willStartTakingPictures,
      stopTakingPictures: stopTakingPictures
    }

  })();

  App.CameraManager = CameraManager;
  window.App = App;

})(window);
