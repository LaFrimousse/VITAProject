(function(window) {
  'use strict';

  var App = window.App || {};
  var PointsDrawing = (function() {

    var videoElement = document.getElementById("videoElement")
    //the DOM element in which the video is displayed
    var canvas = document.getElementById("videoPointsCanvas")

    var canvasUsedToAddPointsInPictures = document.getElementById("usedToDrawPointsInPictures")


    var THRESHOLD_TO_DRAW_A_POINT = 0.0
    var POINTS_RADIUS = 20
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


    var drawPointsInCanvas = function(points, canvas) {
      var context = canvas.getContext('2d');
      context.fillStyle = FILL_STYLE;

      points.forEach(function(point) {
        var pointX = point[0]
        var pointY = point[1]
        var certainty = point[2]
        if (certainty >= THRESHOLD_TO_DRAW_A_POINT) {
          context.beginPath(); // La tête
          context.arc(point[0], point[1], POINTS_RADIUS, 0, Math.PI * 2);
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

    var addPointsInImage = function(imageURL, points, callback){

      var context = canvasUsedToAddPointsInPictures.getContext('2d');
        context.clearRect(0, 0, canvasUsedToAddPointsInPictures.width, canvasUsedToAddPointsInPictures.height)

      var img = new Image();
      img.src = imageURL;
      img.onload = function(){
        canvasUsedToAddPointsInPictures.width = img.naturalWidth
        canvasUsedToAddPointsInPictures.height = img.naturalHeight
        context.drawImage(img,0,0)
        drawPointsInCanvas(points,canvasUsedToAddPointsInPictures)
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
