'use strict'

var pointsOverVideo = (function () {
  var verbose = true

  var videoElement = document.getElementById("videoElement")
  //the DOM element in which the video is displayed
  var canvas = document.getElementById("videoPointsCanvas")
  var context = canvas.getContext('2d');
  var thresholdToDrawAPoint = 0.0
  var pointsRadius = 20

  var points = [[50,150,3],[150,50,3],[25,45,3],[2,0,3]]

  var lastDrawnPoints = undefined


  var drawPoints = function(pointsToDraw){
    lastDrawnPoints = pointsToDraw

    var height = videoElement.clientHeight
    var width = videoElement.clientWidth
    canvas.width = width
    canvas.height = height

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0.5)";

    points.forEach(function(point){
      var pointX = point[0]
      var pointY = point[1]
      var certainty = point[2]
      if(certainty >= thresholdToDrawAPoint){
        context.beginPath(); // La tête
        context.arc(point[0] , point[1], pointsRadius, 0, Math.PI * 2);
        context.fill();
        context.stroke();

      }
    })
  }
  drawPoints(points)

  var removePoints = function(points){
    if(verboxe){
      console.log("Cleaning all the points")
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    lastDrawnPoints = undefined
  }

  /*Designed to be called each time the size of the video element change.
   It simply redraw the last drawn points*/
  var refresh = function(){
    if(verboxe){
      console.log("Wants to refresh some points")
    }
    if (typeof(lastDrawnPoints) != "undefined"){
      if(verboxe){
        console.log("... so we are refeshing")
      }
      drawPoints(lastDrawnPoints)
    }
  }

  /*Explicitly reveal public pointers to the private functions
  that we want to reveal publicly*/
  return {
    drawPoints: drawPoints,
    removePoints: removePoints,
    refresh: refresh
  }
})();
