(function(window) {
  'use strict';

  var App = window.App || {};
  var PointsDrawing = (function() {
    var verbose = true;

    var videoElement = document.getElementById("videoElement")
    //the DOM element in which the video is displayed
    var canvas = document.getElementById("videoPointsCanvas")

    var canvasUsedToAddPointsInPictures = document.getElementById("usedToDrawPointsInPictures")


    var THRESHOLD_TO_DRAW_A_POINT = 0.1
    var POINTS_RADIUS = 10
    var FILL_STYLE = "rgba(255, 255, 255, 0.5)"


    var lastDrawnPointsInVideo = undefined

    var addPointsOverVideo = function(pointsToDraw) {
      lastDrawnPointsInVideo = pointsToDraw

      var height = videoElement.clientHeight
      var width = videoElement.clientWidth
      canvas.width = width
      canvas.height = height
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawPointsInCanvas(pointsToDraw, canvas)
    }


    var drawPointsInCanvas = function(points, canvas, imgWidth, imgHeight) {
      var x_factor = 1;
      var y_factor = 1;
      if (imgWidth) {
        x_factor = imgWidth;
      }
      if (imgHeight) {
        y_factor = imgHeight;
      }
      var context = canvas.getContext('2d');
      context.fillStyle = FILL_STYLE;
      points.forEach(function(point) {

        var certainty = point[2]
        if (certainty >= THRESHOLD_TO_DRAW_A_POINT) {

          var pointX = point[0] * x_factor;
          var pointY = point[1] * y_factor;

          context.beginPath(); // La tête
          context.arc(pointX, pointY, POINTS_RADIUS, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        }
      })

    }


    var removePointsFromVideo = function() {
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height)
      lastDrawnPointsInVideo = undefined
    }

    /*Designed to be called each time the size of the video element change.
     It simply redraw the last drawn points*/
    var refresh = function() {
      if (typeof(lastDrawnPointsInVideo) != "undefined") {
        drawPoints(lastDrawnPointsInVideo)
      }
    }

    var addPointsInImage = function(imageURL, points, callback) {
      var context = canvasUsedToAddPointsInPictures.getContext('2d');
      context.clearRect(0, 0, canvasUsedToAddPointsInPictures.width, canvasUsedToAddPointsInPictures.height)

      var img = new Image();
      img.src = imageURL;
      img.onload = function() {
        var imgWidth = points[0].width_height[0];
        var imgHeight = points[0].width_height[1];
        imgWidth = img.naturalWidth;
        imgHeight = img.naturalHeight;
        canvasUsedToAddPointsInPictures.width = imgWidth;
        canvasUsedToAddPointsInPictures.height = imgHeight;
        context.drawImage(img, 0, 0)
        points.forEach(function(pts){
          drawPointsInCanvas(pts.coordinates, canvasUsedToAddPointsInPictures, imgWidth, imgHeight);
        });

        if (typeof(callback) != "undefined") {
          callback(canvasUsedToAddPointsInPictures.toDataURL('image/jpeg', 1.0))
        }
      }
    }



    return {
      addPointsOverVideo: addPointsOverVideo,
      removePointsFromVideo: removePointsFromVideo,
      addPointsInImage: addPointsInImage,
      refresh: refresh
    }

  })();

  App.PointsDrawing = PointsDrawing;
  window.App = App;

})(window);
