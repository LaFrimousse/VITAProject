/*The purpose of this class is to optimize the interaction with the pif paf server in order to have the more fluid behaviour possible*/
(function(window) {
  'use strict';

  var App = window.App;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;

  var PifPafBuffer = (function() {
    var verbose = false;
    var MAX_NB_OF_PENDING_REQUEST = 1;

    var nbOfPendingRequest = 0;
    var nextPictureToSend = null;
    var stop = true;
    var callback = null;

    var sendPictureToPifPaf = function(picture, cb) {

      if (verbose) {
        console.log("PifPafBuffer: noticed we have a new picture to send, with actually ",
          nbOfPendingRequest, " pending request");
      }
      callback = cb;
      stop = false;
      nextPictureToSend = picture;
      if (nbOfPendingRequest < MAX_NB_OF_PENDING_REQUEST) {
        sendRequestToPifPaf();
      }
    }

    var sendRequestToPifPaf = function() {
      nbOfPendingRequest = nbOfPendingRequest + 1;
      var pictWeSend = nextPictureToSend;
      nextPictureToSend = null;

      Server.requestPifPafForPoints(pictWeSend).then(function(answer) {

        var pointsText = answer.pointsText
        var forImg = JSON.parse(answer.forImg);
        if (!stop) {
          dealWithPointsReceived(pointsText, forImg);
          if (nextPictureToSend != null) {
            sendRequestToPifPaf();
          }
        }
        nbOfPendingRequest = nbOfPendingRequest - 1;
      })/*.catch(function(error) {
        nbOfPendingRequest = nbOfPendingRequest - 1;
        console.error("Didn't receive points from the pif paf algo, so no live points to draw " + error);
      });*/

    }

    var dealWithPointsReceived = function(pointsText, forImg) {
      var points = JSON.parse(pointsText);

      if (verbose) {
        console.log("PifPafBuffer: received some points from the pif paf server that will be drawn ", points);
      }
      callback(points, forImg);
    }



    var stopSendingAndShowingPoints = function() {
      if(verbose){
        console.log("PifPafBuffer: noticed we should stop displaying points");
      }
      stop = true;
      PointsDrawing.addPointsOverVideo(null);
    }



    return {
      sendPictureToPifPaf: sendPictureToPifPaf,
      stopSendingAndShowingPoints: stopSendingAndShowingPoints

    }

  })();

  App.PifPafBuffer = PifPafBuffer;
  window.App = App;
})(window);
