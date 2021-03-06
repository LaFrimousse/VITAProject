/*Manages the event that the user might trigger with the camera. Taking picture, stopping to take picture, opening, closing, the camera, switching the camera, updating the timer,...*/
(function(window) {
  'use strict'
  var App = window.App;
  var Device = App.Device;
  var Camera = App.Camera;
  var CameraLayout = App.CameraLayout;
  var RecordsButtons = App.RecordsButtons;
  var CategoriesLayout = App.CategoriesLayout;
  var CategoriesStorage = App.CategoriesStorage;

  var CameraEvents = (function() {
    var verbose = false
    var isTakingPicture = false
    var manager = null;
    var ALLOW_LIVE_POINTS = true;

    var systemPictureInterval = null;
    var systemPictureIntervalTime = 300;


    /*Get access of the DOMs elements*/
    var closeCameraButton = document.getElementById("closeCameraButton")
    var mirrorVideoButton = document.getElementById("mirrorVideoButton")
    var showLivePointsButton = document.getElementById("showLivePointsButton")
    var isMirrored = false;
    var livePointsWanted = false;



    /*open the camera and ask to update the UI accordingly*/
    var openCamera = function(callback, layoutWanted) {

      if (Camera.isCameraOpen()) {
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
          noticeCameraJustOpenned(layoutWanted == false);

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

      if (isTakingPicture) {
        stopTakingPicture();
      }

      if (!Camera.isCameraOpen()) {
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
          noticeCameraJustClosed();

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


    var switchCamera = function() {
      if (!Camera.isCameraOpen()) {
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


    var noticeCameraJustOpenned = function(layoutNotWanted) {
      /*Deal with the UI and restart the interval where the system automatically takes pictues of the user*/

      if (!layoutNotWanted) {
        CameraLayout.showElement("closeCameraButton");
      }

      if (ALLOW_LIVE_POINTS) {
        CameraLayout.showElement("skeletons");
      }


      Device.hasMultipleCamera().then(function(res) {
        if (res) {
          CameraLayout.showElement("switchCameraWrapper");
          if (!Camera.isUsingBackCamera()) {
            CameraLayout.showElement("mirrorButton");
          }
        } else {
          CameraLayout.showElement("mirrorButton");
        }
      });


      if (Device.isDeviceAMobile()) {
        CameraLayout.addImageOpacityListener();
      }



      CameraLayout.replaceButtonInVideoElement();

      if (systemPictureInterval != null) {
        window.clearInterval(systemPictureInterval);
      }
      if (verbose) {
        console.log("CameraEvents: noticed that the camera just opened");
      }
      systemPictureInterval = window.setInterval(function() {
        takeInstantPicture(false, true)
      }, systemPictureIntervalTime);

    }

    var noticeCameraJustClosed = function() {
      cancelTakingPictureWithDelay();
      window.clearInterval(systemPictureInterval);
      systemPictureInterval = null;

      stopLivePoints();

      CameraLayout.hideElement("closeCameraButton");
      CameraLayout.hideElement("mirrorButton");
      CameraLayout.hideElement("skeletons");
      CameraLayout.hideElement("switchCameraWrapper");
      if (Device.isDeviceAMobile()) {
        CameraLayout.removeImageOpacityListener();
      }

      if (isMirrored) {
        CameraLayout.mirrorElements();
        isMirrored = false;
      }

      CameraLayout.replaceButtonInVideoElement();
      if (verbose) {
        console.log("CameraEvents: noticed that the camera just closed")
      }
    }


    /*Add an event listener on the mirror button that mirrors some elements*/
    mirrorVideoButton.addEventListener("click", function() {
      CameraLayout.mirrorElements();
      isMirrored = !isMirrored;
    })

    /*add an event listener on the openCloseCameraButton to open or close the camera*/
    closeCameraButton.addEventListener("click", function() {
      if (Camera.isCameraOpen()) {
        closeCamera()
      }
    })

    showLivePointsButton.addEventListener("click", function() {
      if (livePointsWanted) {
        stopLivePoints()
      } else {
        startLivePoints()
      }
    })

    var startLivePoints = function() {
      if (verbose) {
        console.log("CameraEvents: was asked to start the live points")
      }
      livePointsWanted = true;
      showLivePointsButton.classList.remove("alpha04");
    }
    var stopLivePoints = function() {
      livePointsWanted = false;
      App.PifPafBuffer.stopSendingAndShowingPoints();
      if (verbose) {
        console.log("CameraEvents: was asked to stop the live points")
      }
      showLivePointsButton.classList.add("alpha04");
    }



    var takeInstantPicture = function(animationWanted, urlWanted) {
      //ask the camera module to take a picture

      if (animationWanted) {
        //user took a picture
        var userCallBack = function(data) {
          if (manager) {
            manager.userTookPicture(data);
          }
          CameraLayout.animePictureTaken();
        }
        Camera.takePictureAsBlob(userCallBack);

      } else {
        //system took a picture
        manager.systemTookPicture(Camera.takePictureAsURL(), livePointsWanted);
      }


    }


    //---------------
    /*Some helpers variables*/
    var intervalBeforeCounterUpdate = null

    var updateCounter = function(remainingTime) {

      //kill the previous time interval
      intervalBeforeCounterUpdate = null;

      //display the counter
      CameraLayout.updateCounter(remainingTime / 1000);

      if (remainingTime <= 0) {
        takeInstantPicture(true, false);

        if (RecordsButtons.isLooping()) {
          var nextDelay = RecordsButtons.delay();
          if (nextDelay > 0) {
            updateCounter(nextDelay);
          } else {
            CameraLayout.updateCounter(null);
            stopTakingPicture();
          }
        } else {
          //hide the counter
          CameraLayout.updateCounter(null);
          stopTakingPicture();
        }
        return;
      }

      var nextUpdateIn = 1000;

      if (remainingTime <= 1000) {
        nextUpdateIn = 100;
      } else if (remainingTime % 1000 != 0) {
        nextUpdateIn = remainingTime % 1000;
      }

      intervalBeforeCounterUpdate = window.setTimeout(function() {
        updateCounter(remainingTime - nextUpdateIn);
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
      RecordsButtons.setButtonGray();
      CameraLayout.hideElement("mirrorButton");
      CameraLayout.hideElement("closeCameraButton");
      CameraLayout.hideElement("switchCameraWrapper");
      CameraLayout.hideElement("skeletons");
      updateCounter(RecordsButtons.delay());
      if (verbose) {
        console.log("CameraEvents: just started taking pictures");
      }

    }

    var stopTakingPicture = function() {
      cancelTakingPictureWithDelay();
      CameraLayout.showElement("closeCameraButton");
      if (ALLOW_LIVE_POINTS) {
        CameraLayout.showElement("skeletons");
      }
      RecordsButtons.setButtonRed();

      Device.hasMultipleCamera().then(function(res) {
        if (res) {
          CameraLayout.showElement("switchCameraWrapper");
          if (!Camera.isUsingBackCamera()) {
            CameraLayout.showElement("mirrorButton");
          }
        } else {
          CameraLayout.showElement("mirrorButton");
        }
      });

      isTakingPicture = false;
      if (verbose) {
        console.log("CameraEvents: just stopped taking pictures");
      }
    }

    var userClickedRedButton = function(layoutWanted) {
      stopLivePoints()

      if (isTakingPicture) {
        stopTakingPicture();
      } else {
        var delay = RecordsButtons.delay();

        if (!Camera.isCameraOpen()) {
          openCamera(null, layoutWanted);
        } else {
          //check a category is selectedIndex
          if (CategoriesStorage.getActualCategory() == null) {
            alert("Please chose a category before considering to take a picture for some")
            return;
          }
          //the camera is open
          if (delay > 0) {
            startTakingPicture();
          } else {
            takeInstantPicture(true, false);
          }
        }
      }
    }

    var setManager = function(m) {
      if (verbose) {
        console.log("CameraEvents: setting his manager " + m);
      }
      manager = m;
    }

    var stopTakingPictureIfDoing = function() {
      if (isTakingPicture) {
        stopTakingPicture();
      }
    }

    openCamera();

    return {
      userClickedRedButton: userClickedRedButton,
      stopTakingPicture: stopTakingPictureIfDoing,
      setManager: setManager
    }

  })();


  App.CameraEvents = CameraEvents;
  window.App = App;

})(window);
