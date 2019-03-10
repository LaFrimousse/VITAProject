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
    var mirrorVideoButton = document.getElementById("mirrorVideoButton")


    /*open the camera and change the image and alpha of the openCloseCameraButton accordingly*/
    var openCamera = function(callback) {

      var cb = function(success) {
        if (success) {
          openCloseCameraButton.src = "images/closeCameraButton.png"
          if (!openCloseCameraButton.classList.contains("alpha08")) {
            openCloseCameraButton.classList.add("alpha08");
          }

          if (typeof(callback) != "undefined") {
            callback(true)
          }
          showMirrorButton()
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
      if (mirrorVideoButton.classList.contains("hidden")) {
        mirrorVideoButton.classList.remove("hidden");
      }
    }

    var hideMirrorButton = function() {
      if (!mirrorVideoButton.classList.contains("hidden")) {
        mirrorVideoButton.classList.add("hidden");
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
        if(verbose){
          console.log("The camera is open, let's start to take pictures")
        }
        startTakingPictures(timeIntervalBetweenPictures, callback)
      } else {
        if(verbose){
          console.log("The camera not is open, let's start to open it before taking pictures")
        }
        var cb = function(success) {
          if (success) {
            if(verbose){
              console.log("The camera is open, let's start to take pictures")
            }
            startTakingPictures(timeIntervalBetweenPictures, callback)
          }
        }
        openCamera(cb)
      }
    }

    var startTakingPictures = function(timeIntervalBetweenPictures, callback) {
      if(pictureAutomaticInterval != null){
        if (verbose){
          console.log("Cannot start to take pictures if it is already taking pictures")
        }
        return;
      }

      startStopTakingPicturesButton.innerHTML = "stop taking pictures"
      if (verbose) {
        console.log("starting to take pictures")
      }
      pictureAutomaticInterval = window.setInterval(function() {
        var data = Camera.takePicture()
        if (data != null) {
          callback(data)
        }
      }, timeIntervalBetweenPictures);
    }

    var stopTakingPictures = function() {
      startStopTakingPicturesButton.innerHTML = "start taking pictures"
      if (verbose) {
        console.log("stop taking pictures")
      }
      window.clearInterval(pictureAutomaticInterval)
      pictureAutomaticInterval = null
      console.log("Now the interval is " + pictureAutomaticInterval)
    }

    var showReadyToRecordButton = function() {
      startStopTakingPicturesButton.style.visibility = "visible";
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
