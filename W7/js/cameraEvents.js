(function(window) {
  'use strict'
  var App = window.App;
  var Camera = App.Camera;
  var CameraLayout = App.CameraLayout;

  var CameraEvents = (function() {
    var verbose = true
    var counterValue = -1;


    /*Get access of the DOMs elements*/
    var openOrCloseCameraButton = document.getElementById("openOrCloseCameraButton")
    var mirrorVideoButton = document.getElementById("mirrorVideoButton")

    /*open the camera and ask to update the UI accordingly*/
    var openCamera = function(callback) {

      if (Camera.isCameraOpen) {
        if (verbose) {
          console.log("CameraManager: Was asked to open the camera that was already open");
        }
        if (callback) {
          callback(true);
        }
        return;
      }

      if (verbose) {
        console.log("CameraEvents: Was asked to open the camera");
      }

      var cb = function(success) {
        if (success) {
          CameraLayout.setSrcForOpenCloseButton("images/closeCameraButton.png");
          if (callback) {
            callback(true);
          }
        } else {
          if (callback) {
            callback(false);
          }
        }
      }
      Camera.open(cb);
    }

    /*close the camera and change the image and alpha of the openCloseCameraButton accordingly*/
    var closeCamera = function(callback) {

      if (!Camera.isCameraOpen) {
        if (verbose) {
          console.log("CameraManager: Was asked to close the camera that was already closed");
        }
        if (callback) {
          callback(true);
        }
        return;
      }

      if (verbose) {
        console.log("CameraManager: Was asked to close the camera");
      }

      var cb = function(success) {
        if (success) {
          CameraLayout.setSrcForOpenCloseButton("images/openCameraButton.png");
          if (callback) {
            callback(true)
          }

        } else {
          if (callback) {
            callback(false)
          }
        }
      }
      Camera.close(cb)
    }



    /*Add an event listener on the mirror button that mirrors some elements*/
    mirrorVideoButton.addEventListener("click", function() {
      CameraLayout.mirrorElements();
    })

    /*add an event listener on the openCloseCameraButton to open or close the camera*/
    openOrCloseCameraButton.addEventListener("click", function() {
      if (Camera.isCameraOpen) {
        closeCamera()
      } else {
        openCamera()
      }
    })



    //---------------/*Some helpers variables*/
    var pictureAutomaticInterval = null

    var takePicture = function(callback, delay, inLoop) {

      /*First verify that the camera is open, if it is not the case, this function will be automatically called later once the camera will be open*/
      if (!Camera.isCameraOpen) {
        if (verbose) {
          console.log("CameraManager: Was asked to start taking pictures but need to open the camera before that");
        }

        var cb = function(success) {
          if (success) {
            if (verbose) {
              console.log("CameraManager: The camera is open, let's start to take pictures")
            }
            takePicture(callback, delay, inLoop);
          }
        }
        openCamera(cb, false)
        return;
      }

      if (verbose) {
        console.log("CameraManager: Was asked to start taking pictures with a delay of " + delay + "and inLoop = " + inLoop);
      }

      hideMirrorAndOpenCloseButton()
      if (pictureAutomaticInterval != null) {
        console.error("CameraManager: Cannot start to take pictures if it is already taking pictures")
        return;
      }

      startStopTakingPicturesButton.innerHTML = "stop taking pictures in loop"

      updateCounter(delay, callback, inLoop, delay)
    }

    var updateCounter = function(remainingTime, callback, inLoop, totalInterval) {
      counterDown = remainingTime;
      pictureAutomaticInterval = null;

      if (counterDown <= 0) {
        counterDown = 0;
        displayCounter();
        var data = Camera.takePicture()
        animePictureTaken()
        if (data != null) {
          callback(data)
        }
        if (inLoop) {
          updateCounter(totalInterval, callback, inLoop, totalInterval);
        }
        return;
      }
      displayCounter();

      var nextUpdateIn = 1000;
      if (remainingTime <= 1000) {
        nextUpdateIn = 100;
      }

      pictureAutomaticInterval = window.setTimeout(function() {
        updateCounter(remainingTime - nextUpdateIn, callback, inLoop, totalInterval)
      }, nextUpdateIn);

    }

    var stopTakingPictures = function() {
      showMirrorAndOpenCloseButton()
      startStopTakingPicturesButton.innerHTML = "start taking pictures"
      if (verbose) {
        console.log("CameraManager: killing the interval that took automatically pictures")
      }
      window.clearTimeout(pictureAutomaticInterval)
      pictureAutomaticInterval = null
      counterDown = -1000;
      displayCounter();
    }

    var showReadyToRecordButton = function() {
      startStopTakingPicturesButton.style.visibility = "visible";
    }

    var hideReadyToRecordButton = function() {
      startStopTakingPicturesButton.style.visibility = "hidden";
    }


    var displayCounter = function() {
      if (countDownDOMElement.classList.contains("notDisplayed")) {
        countDownDOMElement.classList.remove("notDisplayed");
      }
      countDownDOMElement.textContent = counterDown / 1000
    }

    return {
      openCamera: openCamera
    }

  })();

  App.CameraEvents = CameraEvents;
  window.App = App;

})(window);
