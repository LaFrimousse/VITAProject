(function(window) {
  'use strict'
  var App = window.App;
  var Camera = App.Camera;
  var CameraLayout = App.CameraLayout;
  var RecordsButtons = App.RecordsButtons;
  var CategoriesLayout = App.CategoriesLayout;
  var CategoriesStorage = App.CategoriesStorage;

  var CameraEvents = (function() {
    var verbose = true
    var isTakingPicture = false
    var manager = null;

    var systemPictureInterval = null;
    var systemPictureIntervalTime = 500;


    /*Get access of the DOMs elements*/
    var closeCameraButton = document.getElementById("closeCameraButton")
    var mirrorVideoButton = document.getElementById("mirrorVideoButton")
    var isMirrored = false;

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
          noticeCameraJustOpenned();

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

      CameraLayout.showElement("closeCameraButton");
      CameraLayout.showElement("mirrorButton");
      CameraLayout.showElement("switchCameraWrapper");
      CameraLayout.addImageOpacityListener();

      window.setTimeout(CameraLayout.replaceButtonInVideoElement, 150);

      if (systemPictureInterval != null) {
        window.clearInterval(systemPictureInterval);
      }

      console.log("CameraEvents: noticed that the camera just opened");
      systemPictureInterval = window.setInterval(function(){
        takeInstantPicture(false)
      }, systemPictureIntervalTime);

    }

    var noticeCameraJustClosed = function() {
      cancelTakingPictureWithDelay();
      window.clearInterval(systemPictureInterval);
      systemPictureInterval = null;

      CameraLayout.hideElement("closeCameraButton");
      CameraLayout.hideElement("mirrorButton");
      CameraLayout.hideElement("switchCameraWrapper");
      CameraLayout.removeImageOpacityListener();
      if(isMirrored){
        CameraLayout.mirrorElements();
        isMirrored = false;
      }

      window.setTimeout(CameraLayout.replaceButtonInVideoElement, 0);
      console.log("CameraEvents: noticed that the camera just closed")
    }


    /*Add an event listener on the mirror button that mirrors some elements*/
    mirrorVideoButton.addEventListener("click", function() {
      CameraLayout.mirrorElements();
      isMirrored = !isMirrored;
    })

    /*add an event listener on the openCloseCameraButton to open or close the camera*/
    closeCameraButton.addEventListener("click", function() {
      if (Camera.isCameraOpen) {
        closeCamera()
      }
    })

    var takeInstantPicture = function(userAction) {
      var systemCallBack = function(data) {
        if (manager) {
          manager.systemTookPicture(data);
        }
      }

      var userCallBack = function(data) {
        if (manager) {
          manager.userTookPicture(data);
        }
      }

      var callback = userAction ? userCallBack : systemCallBack;
      var data = Camera.takePicture();

      if (userAction) {
        CameraLayout.animePictureTaken();
      }

      callback(data);
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
        takeInstantPicture(true);

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
      }else if(remainingTime % 1000 != 0){
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
      CategoriesLayout.hideElements();
      updateCounter(RecordsButtons.delay());
      if (verbose) {
        console.log("CameraEvents: just started taking pictures");
      }

    }

    var stopTakingPicture = function() {
      cancelTakingPictureWithDelay();
      CameraLayout.showElement("mirrorButton");
      CameraLayout.showElement("closeCameraButton");
      CameraLayout.showElement("switchCameraWrapper");
      CategoriesLayout.showElements();
      RecordsButtons.setButtonRed();
      isTakingPicture = false;
      if (verbose) {
        console.log("CameraEvents: just stopped taking pictures");
      }
    }

    var userClickedRedButton = function() {
      if (isTakingPicture) {
        stopTakingPicture();
      } else {
        var delay = RecordsButtons.delay();

        if (!Camera.isCameraOpen) {
          openCamera();
        } else {
          //check a category is selectedIndex
          if(CategoriesStorage.getActualCategory() == null){
            alert("Please chose a category before considering to take a picture for some")
            return;
          }
          //the camera is open
          if (delay > 0) {
            startTakingPicture();
          } else {
            takeInstantPicture(true);
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

    openCamera();

    return {
      userClickedRedButton: userClickedRedButton,
      setManager: setManager
    }

  })();

  RecordsButtons.setCameraEventModule(CameraEvents);
  App.CameraEvents = CameraEvents;
  window.App = App;

})(window);
