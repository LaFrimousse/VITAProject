/*The class that gets pictures taken from the CameraEvents module, and pass them to the pifpaf buffer, firebase , CategoriesStorage or ConvNetLayout...*/
(function(window) {
  'use strict';

  var App = window.App;

  var Device = App.Device;
  var CameraEvents = App.CameraEvents;
  var CategoriesStorage = App.CategoriesStorage;
  var CategoriesLayout = App.CategoriesLayout;
  var Firebase = App.Firebase;
  var Helper = App.Helper;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;
  var PifPafBuffer = App.PifPafBuffer;


  var Manager = (function() {
    var verbose = false;
    var drawLivePoints = false;

    (function() {
      //load from firebase the picture the user took in previous session
      Firebase.getAllImagesMetaDataForAUser(Device.clientId).then(function(allMetaDatas) {
        allMetaDatas.forEach(function(metaData) {
          var newWrapper = {
            catIndex: CategoriesStorage.indexForLabel(metaData.catLabel),
            imageId: metaData.pictId,
            points: metaData.points,
            date: metaData.date,
            browserDescription: metaData.browserDescription,
            isSavedOnFirebase: metaData.isSavedOnFirebase,
            picture: null,
          }

          if (!newWrapper.isSavedOnFirebase) {
            CategoriesStorage.appendPictureWrapperToACat(newWrapper);
          } else {

            Firebase.downloadImageAsBlob(metaData.catLabel, newWrapper.imageId).then(function(result) {
              newWrapper.picture = result.blob;
              CategoriesStorage.appendPictureWrapperToACat(newWrapper);
            })
          }

        })

      })
      return;

    })();


    var userTookPicture = function(picture) {
      /*Triggered when a user took actively a picture*/

      var catLabel = CategoriesStorage.getActualCategory().label

      var newWrapper = {
        catIndex: CategoriesStorage.indexForLabel(catLabel),
        imageId: Helper.UUID(),
        points: null,
        picture: picture,
        date: new Date(),
        browserDescription: navigator.userAgent,
      }

      if (verbose) {
        console.log("Manager: The user took a picture for the category ", catLabel);
      }

      CategoriesStorage.proposeNextCategory();
      CategoriesLayout.displayCategoryTitleAndPicture(CategoriesStorage.getActualCategory());

      getPointsFromPifPaf(picture).then(function(points) {
        if (verbose) {
          console.log("Main: received some points from the pif paf server for a new picture, time to save a wrapper in memory and send them to firebase")
        }

        newWrapper.points = points;
        CategoriesStorage.appendPictureWrapperToACat(newWrapper);
        Firebase.saveImage(Device.clientId, newWrapper);

      }).catch(function(error) {
        console.error("Didn't receive points from the pif paf algo, but still save the picture in firebase and into memory " + error);
        CategoriesStorage.appendPictureWrapperToACat(newWrapper);
        Firebase.saveImage(Device.clientId, newWrapper);
      })

    }


    var getPointsFromPifPaf = function(image) {
      var promise = new Promise(function(resolve, reject) {


        var reader = new FileReader();
        reader.onload = function() {
          var json = {};
          json.image = reader.result;

          Server.requestPifPafForPoints(json).then(function(pointsText) {
            var points = JSON.parse(pointsText.pointsText);
            resolve(points);
          }).catch(function(error) {
            reject(error);
          })

        }
        reader.readAsDataURL(image);
      });

      return promise;
    }

    var systemTookPicture = function(url, shouldDrawLivePoints) {
      /*Triggered automatically*/
      if (verbose) {
        console.log("Manager: The system took a picture");
      }

      var shouldShowAReco = App.ConvNetLayout.isInRecoMode() && App.ConvNet.aModelIsReady();

      if (shouldShowAReco || shouldDrawLivePoints) {
        //then in any case we need to compute the points

        var callback = function(points, forImgUrl) {
          if (shouldDrawLivePoints) {
            PointsDrawing.addPointsOverVideo(points);
          }

          if (forImgUrl) {
            url = forImgUrl.image
          }


          if (shouldShowAReco) {
            var convNetResult = null;
            if (points.length > 0) {
              convNetResult = App.ConvNet.testAPicForRecognition(points);
            }

            PointsDrawing.addPointsInImage(url, points, true).then(function(url1) {
              PointsDrawing.addPointsInImage(url, points, false).then(function(url2) {
                App.ConvNetLayout.displayRecoResult(convNetResult, url1, url2);
              })
            })
          }
        }

        var json = {
          image: url
        }
        PifPafBuffer.sendPictureToPifPaf(json, callback);

      }
    }

    return {
      userTookPicture: userTookPicture,
      systemTookPicture: systemTookPicture,
    }

  })();

  CameraEvents.setManager(Manager);
  App.Manager = Manager;
  window.App = App;

})(window);
