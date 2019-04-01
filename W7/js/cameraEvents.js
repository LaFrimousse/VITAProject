(function(window) {
  'use strict'
  var App = window.App;
  var Camera = App.Camera;
  var CameraLayout = App.CameraLayout;
  var RecordsButtons = App.RecordsButtons;

  var CameraEvents = (function() {
    var verbose = true
    var isTakingPicture = false


    /*Get access of the DOMs elements*/
    var openOrCloseCameraButton = document.getElementById("openOrCloseCameraButton")
    var mirrorVideoButton = document.getElementById("mirrorVideoButton")

    /*open the camera and ask to update the UI accordingly*/
    var openCamera = function(callback) {

      if (Camera.isCameraOpen) {
        if (verbose) {
          console.log("CameraEvents: Was asked to open the camera that was already open");
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
          CameraLayout.showElement("mirrorButton");
          noticeCameraJustOpenned();
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

      if (isTakingPicture) {
        stopTakingPicture();
      }

      if (!Camera.isCameraOpen) {
        if (verbose) {
          console.log("CameraEvents: Was asked to close the camera that was already closed");
        }
        if (callback) {
          callback(true);
        }
        return;
      }

      if (verbose) {
        console.log("CameraEvents: Was asked to close the camera");
      }

      var cb = function(success) {
        if (success) {
          CameraLayout.setSrcForOpenCloseButton("images/openCameraButton.png");
          if (callback) {
            callback(true)
          }
          CameraLayout.hideElement("mirrorButton");
          noticeCameraJustClosed();
        } else {
          if (callback) {
            callback(false)
          }
        }
      }
      Camera.close(cb)
    }


    var switchCamera = function() {
      if (!Camera.isCameraOpen) {
        Camera.switchCamera();
      } else {
        var callback = function(success) {
          if (success) {
            Camera.switchCamera();
            openCamera();
          }
        }
        closeCamera(callback);
      }
    }

    document.getElementById("switchCameraCheckBox").addEventListener("change", function() {
      switchCamera();
    })


    var noticeCameraJustOpenned = function() {
      console.log("CameraEvents: noticed that the camera just opened");
      /*var monTimeout = window.setTimeout(function(){
        takeInstantPicture(null, false)
      }, 1000);*/
      /*takePictureWithDelay(null, 3000, true);*/
    }

    var noticeCameraJustClosed = function() {
      cancelTakingPictureWithDelay();
      console.log("CameraEvents: noticed that the camera just closed")
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

    var takeInstantPicture = function(callback, animated) {
      Camera.takePicture(callback);
      if (animated) {
        CameraLayout.animePictureTaken();
      }
    }


    //---------------
    /*Some helpers variables*/
    var intervalBeforeCounterUpdate = null

    var takePictureWithDelay = function(callback, delay, inLoop) {

      /*First verify that the camera is open, if it is not the case, this function will be automatically called later once the camera will be open*/
      if (!Camera.isCameraOpen) {
        if (verbose) {
          console.log("CameraEvents: Was asked take a Picture With Delay but need to open the camera before that");
        }

        var cb = function(success) {
          if (success) {
            if (verbose) {
              console.log("CameraEvents: The camera is open, let's start to take pictures with delay")
            }
            takePicture(callback, delay, inLoop);
          }
        }
        openCamera(cb)
        return;
      }

      if (verbose) {
        console.log("CameraEvents: Was asked to start taking pictures with a delay of " + delay + "and inLoop = " + inLoop);
      }

      if (intervalBeforeCounterUpdate != null) {
        console.error("CameraEvents: Cannot start to take pictures if it is already taking pictures")
        return;
      }

      updateCounter(delay, callback, inLoop, delay)
    }

    var updateCounter = function(remainingTime, callback, inLoop, totalInterval) {

      //kill the previous time interval
      intervalBeforeCounterUpdate = null;

      //display the counter
      CameraLayout.updateCounter(remainingTime / 1000);

      if (remainingTime <= 0) {
        takeInstantPicture(callback, true);

        if (inLoop) {
          updateCounter(totalInterval, callback, inLoop, totalInterval);
        } else {
          //hide the counter
          CameraLayout.updateCounter(null);
        }
        return;
      }

      var nextUpdateIn = 1000;
      if (remainingTime <= 1000) {
        nextUpdateIn = 100;
      }

      intervalBeforeCounterUpdate = window.setTimeout(function() {
        updateCounter(remainingTime - nextUpdateIn, callback, inLoop, totalInterval)
      }, nextUpdateIn);

    }

    var cancelTakingPictureWithDelay = function() {
      if (verbose) {
        console.log("CameraEvents: canceling the task of taking pictures with delay");
      }
      window.clearTimeout(intervalBeforeCounterUpdate);
      intervalBeforeCounterUpdate = null;
      CameraLayout.updateCounter(null);
    }

    var showReadyToRecordButton = function() {
      startStopTakingPicturesButton.style.visibility = "visible";
    }

    var hideReadyToRecordButton = function() {
      startStopTakingPicturesButton.style.visibility = "hidden";
    }

    var startTakingPicture = function() {
      isTakingPicture = true;
      if (verbose) {
        console.log("CameraEvents: just started taking pictures");
      }

    }

    var stopTakingPicture = function() {
      isTakingPicture = false;
      if (verbose) {
        console.log("CameraEvents: just stopped taking pictures");
      }
    }

    var userClickedRedButton = function() {

      if(isTakingPicture){
        stopTakingPicture();
      }else{
        var delay = RecordsButtons.delay();
        var isLooping = RecordsButtons.isLooping();
        console.log(delay)
        console.log(isLooping)

      }

    }


    return {
      userClickedRedButton: userClickedRedButton
    }

  })();

  RecordsButtons.setCameraEventModule(CameraEvents);
  App.CameraEvents = CameraEvents;
  window.App = App;

})(window);
