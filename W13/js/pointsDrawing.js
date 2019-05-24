(function(window) {
  'use strict';

  var App = window.App || {};
  var PointsDrawing = (function() {
    var verbose = true;

    var videoElement = document.getElementById("videoElement")
    //the DOM element in which the video is displayed
    var canvas = document.getElementById("canvasForLivePoints")

    var canvasUsedToAddPointsInPictures = document.getElementById("usedToDrawPointsInPictures")


    var THRESHOLD_TO_DRAW_A_POINT = 0.1
    var POINTS_RADIUS = 10
    var FILL_STYLE = "rgba(255, 255, 255, 0.5)"

    var randomColor = function() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    var arraySkeletonInitializeColor = function() {
      //1-2 eyes
      //3-4 ears
      //5-6 shoulders
      //7-8 elbows
      //9-10 wrists
      //11-12 bassin
      var array = [
        [1, 3],
        [2, 4],
        [5, 6],
        [6, 8],
        [5, 7],
        [8, 10],
        [7, 9],
        [11, 12],
        [5, 11],
        [6, 12],
        [11, 13],
        [12, 14],
        [13, 15],
        [14, 16],
        [0, 1],
        [0, 2]
      ];

      var arrayBack = [];
      array.forEach(function(el) {
        el.push(randomColor())
        arrayBack.push(el)
      })
      return arrayBack;
    }
    var array = arraySkeletonInitializeColor();

    var lastDrawnPointsInVideo = undefined

    var addPointsOverVideo = function(pointsToDraw) {
      lastDrawnPointsInVideo = pointsToDraw
      var height = videoElement.clientHeight
      var width = videoElement.clientWidth
      canvas.width = width
      canvas.height = height
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (pointsToDraw) {
        pointsToDraw.forEach(function(points) {
          drawPointsInCanvas(points.coordinates, canvas, width, height)
        });
      }
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
      });

      drawLines(array, points, x_factor, y_factor, context);
      //draw the neck
      if (points[0][2] >= THRESHOLD_TO_DRAW_A_POINT &&
        points[5][2] >= THRESHOLD_TO_DRAW_A_POINT &&
        points[6][2] >= THRESHOLD_TO_DRAW_A_POINT) {
        var middleX = (points[5][0] + points[6][0]) / 2;
        var middleY = (points[5][1] + points[6][1]) / 2;
        var start = [middleX * x_factor, middleY * y_factor];
        var end = [points[0][0] * x_factor, points[0][1] * y_factor];
        var color = array[2][2];
        drawALine(context, start, end, null, color);
      }

    }

    var drawLines = function(linesWanted, points, x_factor, y_factor, context) {
      linesWanted.forEach(function(line) {
        var startPoint = line[0];
        var endPoint = line[1];
        var color = line[2];
        if (points[startPoint][2] >= THRESHOLD_TO_DRAW_A_POINT && points[endPoint][2] >= THRESHOLD_TO_DRAW_A_POINT) {
          var start = [points[startPoint][0] * x_factor, points[startPoint][1] * y_factor]
          var end = [points[endPoint][0] * x_factor, points[endPoint][1] * y_factor]
          drawALine(context, start, end, null, color)
        }
      })
    }

    var drawALine = function(context, start, end, thickness, color) {
      if (thickness == undefined || thickness == null) {
        thickness = 3;
      }
      var actualThickness = context.lineWidth;
      context.lineWidth = thickness;

      if (color == undefined || color == null) {
        color = randomColor();
      }
      var actualFillStyle = context.strokeStyle;
      context.strokeStyle = color;


      context.beginPath();
      context.moveTo(start[0], start[1]);
      context.lineTo(end[0], end[1]);
      context.stroke();
      context.lineWidth = actualThickness;
      context.strokeStyle = actualFillStyle;
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

    var addPointsInImage = function(imageURL, points, pictureWanted) {
      var promise = new Promise(function(resolve, reject) {

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
          if (pictureWanted) {
            context.drawImage(img, 0, 0)
          }
          points.forEach(function(pts) {
            drawPointsInCanvas(pts.coordinates, canvasUsedToAddPointsInPictures, imgWidth, imgHeight);
          });

          resolve(canvasUsedToAddPointsInPictures.toDataURL('image/jpeg', 1.0));
        }

      });
      return promise;


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
