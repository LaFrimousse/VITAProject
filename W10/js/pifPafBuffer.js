/*The purpose of this class is to optimize the interaction with the pif paf server in order to have the more fluid behaviour possible*/
(function(window) {
  'use strict';

  var App = window.App || {};
  var PifPafBuffer = (function() {
    var MAX_NB_OF_PENDING_REQUEST = 5;

    var nbOfPendingRequest = 0;
    var nextPictureToSend = null;

    var sendPictureToPifPaf = function(picture){
      nextPictureToSend = picture;
      if(nbOfPendingRequest < MAX_NB_OF_PENDING_REQUEST){

      }
      console.log("öjéj")
    }



      /*Server.requestPifPafForPoints(json).then(function(pointsText) {
        console.log("pifpaf answer")
        readyForNextPoints = true;
        var points = JSON.parse(pointsText);
        PointsDrawing.addPointsOverVideo(points);
      }).catch(function(error) {
        console.error("Didn't receive points from the pif paf algo, so no live points to draw " + error);
      })*/






    return {
      sendPictureToPifPaf: sendPictureToPifPaf,

    }

  })();

  App.PifPafBuffer = PifPafBuffer;
  window.App = App;
})(window);
