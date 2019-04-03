//tuto : https://www.html5rocks.com/en/tutorials/getusermedia/intro/
/*This module provides 4 usefull functions:
-open (to open the camera)
-close (to close the camera)
-takePicture (to call only when the camera is open)
-isCameraOpen (return a boolean)
To do this it just retains 2 DOM elements:
the videoElement in the one to send the stream captured by the camera
a hidden canvas (never displayed to the user) used to render the videoElement into a image when the takepicure function is called
This module is never responsible for any Layout*/
(function(window) {
  'use strict';

  var App = window.App || {};

  var Camera = (function() {
    var verbose = true
    var actuallyOpeningOrClosing = false;

    //the DOM element in which the video is displayed
    var videoElement = document.getElementById("videoElement")
    var canvas = document.getElementById("videoBackedUpCanvas")
    //a helper variable that keeps track of the camera state
    var isCameraOpen = false
    var isBackCamera = true
    //will be a boolean
    var hasMultipleCamera = null

    /*some constraints about the video format that can still evolve, we can pick
    the one we want */
    const backConstraint = {
      video: {
        facingMode: "environment"
      }
    };
    const frontConstraint = {
      video: {
        facingMode: "user"
      }
    };
    var actualContraint = backConstraint;


    const vgaConstraints = {
      video: {
        width: {
          exact: 640
        },
        height: {
          exact: 480
        }
      }
    };

    const hdconstraints = {
      video: {
        width: {
          min: 1280
        },
        height: {
          min: 720
        },
        facingMode: "environment"
      }
    };

    var hasUserMedia = function() {
      var hasMedia = !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia)

      if (hasMedia) {
        return true
      } else {
        alert("getUserMedia() is not supported by your browser, you won't be able to use this web application!");
        return false
      }
    }

    /* the callback is called with a true value iff the camera was closed before the call of this function
    and will be open after the call of this function*/
    var openCamera = function(callback) {

      if (this.isCameraOpen || !hasUserMedia()) {
        console.error("Camera: Cannot open the camera if it is already open or not available")
        if (typeof(callback) != "undefined") {
          callback(false)
        }
        return
      }

      if (actuallyOpeningOrClosing) {
        console.error("The user should not click so quickly on the buttons")
        return;
      }
      actuallyOpeningOrClosing = true;

      navigator.mediaDevices.getUserMedia(actualContraint).then((stream) => {
        videoElement.srcObject = stream
        this.isCameraOpen = true

        if (verbose) {
          console.log("Camera: Just opened the camera")
        }

        actuallyOpeningOrClosing = false;

        if (typeof(callback) != "undefined") {
          callback(true)
        }

      }).catch(function(error) {
        console.error("Camera: Error: Promise Rejected", error)
        if (typeof(callback) != "undefined") {
          callback(false)
        }
        console.error("Camera: Failed to open the camera");
        actuallyOpeningOrClosing = false;
      });
    }

    /* the callback is called with a true value iff the camera was open before the call of this function and will be closed after the call of this function*/
    var closeCamera = function(callback) {

      if (!this.isCameraOpen) {
        if (typeof(callback) != "undefined") {
          callback(false)
        }
        console.error("Camera: Cannot close the camera that is already closed")

        return
      }

      if (actuallyOpeningOrClosing) {
        console.error("The user should not click so quickly on the buttons")
        return;
      }
      actuallyOpeningOrClosing = true;

      let stream = videoElement.srcObject;
      let tracks = stream.getTracks();

      tracks.forEach(function(track) {
        track.stop();
      });

      videoElement.srcObject = null;
      this.isCameraOpen = false

      if (verbose) {
        console.log("Camera: Just closed the camera")
      }

      actuallyOpeningOrClosing = false;

      if (typeof(callback) != "undefined") {
        callback(true)
      }

    }

    var takePicture = function() {
      //cannot take picture if camera is closed
      if (!this.isCameraOpen) {
        console.error("Camera: Cannot take a picture if the camera is closed")

        return null
      }

      var height = videoElement.clientHeight
      var width = videoElement.clientWidth

      var context = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      context.drawImage(videoElement, 0, 0, width, height)

      //full quality
      var data = canvas.toDataURL('image/jpeg', 1.0)

      if (verbose) {
        console.log("Camera: Took a picture, rendered it in a canvas of size" + width +
          " (width) X " + height + " (height)")
      }

      return data
    }

    var switchCamera = function() {
      isBackCamera = !isBackCamera
      if (verbose) {
        var camString = isBackCamera ? "back camera" : "front camera"
        console.log("Camera: Switching the camera to the " + camString);
      }

      actualContraint = isBackCamera ? backConstraint : frontConstraint;
    }

    var hasMultipleCameraAvailable = function(callback) {

      if (typeof this.hasMultipleCamera === "boolean"){
        if(verbose){
          console.log("Camera: answering the question of multiple camera using a previous stored value. The answer is " + this.hasMultipleCamera);
        }
        if(callback){
          callback(this.hasMultipleCamera);
        }
        return this.hasMultipleCamera;
      }

      var cb = function(response){
        this.hasMultipleCamera = response
        if(callback){
          callback(response);
        }
      }.bind(this)

      askSystemIfMultipleCameraAvailable(cb);
    }

    var askSystemIfMultipleCameraAvailable = function(callback) {
      var videoDevices = []
      navigator.mediaDevices.enumerateDevices().then(function(devices) {
        /*const hasVideo = devices.some(device => device.kind === "videoinput");
        console.log("has video", hasVideo);*/
        devices.forEach(function(dev) {
          if (dev.kind === "videoinput") {
            videoDevices.push(dev);
          }
        })
        var multipleAvailable = videoDevices.length > 1;
        if (verbose) {
          var negation = multipleAvailable ? "" : " not";
          console.log("Camera: We noticed that this device has" + negation + " multiple input video devices");
        }
        if (callback) {
          callback(multipleAvailable);
        }
      });
    }

    var isUsingBackCamera = function() {
      return isBackCamera;
    }

    /*Explicitly reveal public pointers to the private functions
    that we want to reveal publicly*/
    return {
      open: openCamera,
      close: closeCamera,
      isCameraOpen: isCameraOpen,
      hasMultipleCamera:hasMultipleCamera,
      takePicture: takePicture,
      switchCamera: switchCamera,
      hasMultipleCameraAvailable: hasMultipleCameraAvailable,
      isUsingBackCamera: isUsingBackCamera
    }
  })();

  App.Camera = Camera;
  window.App = App;

})(window);
