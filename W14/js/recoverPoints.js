/*The only module that has hopefully not to be used. It recovers the image from firebase that had no points attached to it and pass them to PifPaf and store back the points on firebase.*/
(function(window) {
  'use strict';

  var App = window.App;
  var Firebase = App.Firebase;
  var Server = App.Server;

  var RecoverPoints = (function() {
    var verbose = true;

    var execute = function(){
      Firebase.getAllImagesMetaData().then(function(listMetaData) {
        if(verbose){
          console.log("RecoverPoints: got all metaData from firebase (",listMetaData.length,"metadatas)");
        }
        //listMetaData represent all metadata for all the images
        addPointsToAllMetaDataWithoutPoints(listMetaData);
      }).catch(function(error) {
        console.error(error);
      });
    }



    /*Exectute this function to add points to all metadata that have no points. For example, if some users took picture without a connection to a pif paf algorithm, their pictures are saved online but for sure without the points. After downloading all metadata of all images of firebase, pass them to this function. For each metadata that has no points stores, it goes on firebase, fetch the corresponding image, pass them to pif paf running locally, get the points and save them back on firebase in order to have all image metadata on firebase with corresponding points.*/
    var addPointsToAllMetaDataWithoutPoints = function(listMetaData) {
      listMetaData.forEach(function(metaDataForImg, index) {

        if (metaDataForImg.points == null) {
          if(verbose){
            console.log("RecoverPoints:  image n°", index, " to add points");
          }
          proceedMetaData(metaDataForImg);
        }
      });
    }


    var proceedMetaData = function(metaData) {
      Firebase.downloadImageAsBlob(metaData.catLabel, metaData.pictId, false).then(function(data) {

        var reader = new FileReader();
        reader.onload = function() {
          var json = {};
          json.image = reader.result;

          Server.requestPifPafForPoints(json).then(function(pointsText) {
            if (verbose) {
              console.log("RecoverPoints: received some points from the pif paf server, time send them on the server");
            }
            var points = JSON.parse(pointsText);
            metaData.points = points;
//         TODO
            Firebase.storeImgMetaData(metaData.pictId, metaData.date, metaData.browserDescription, metaData.catLabel, metaData.points).then(function(){
              if(verbose){
                console.log("RecoverPoints: storing some new points in Firbase")
              }
            }).catch(function(error){
              console.error("Cannot save the new metadata on firebase ", error);
            })
            //Firebase.saveImage(clientId, imageId, data, catName, new Date(), navigator.userAgent, points);

          }).catch(function(error) {
            console.error("RecoverPoints: cannot work with the pif paf algo for metadata ", metaData, " ", error);
          });

        }
        reader.readAsDataURL(data.blob);
      }).catch(function(error) {
        console.error(error);
      });
    }


    return {execute:execute}
  })();

  App.RecoverPoints = RecoverPoints;
  window.App = App;

})(window);
