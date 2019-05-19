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

  /*var CategoriesManager = App.CategoriesManager;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;*/

  var Manager = (function() {
    var verbose = true;
    var drawLivePoints = false;

    (function() {


      //load from firebase the picture the user took in previous session
      var allCat = CategoriesStorage.categories
      allCat.forEach(function(cat) {
        var catName = cat.label;
        Firebase.getImgListForUser(Device.clientId, catName).then(function(listIds) {
          listIds.forEach(function(pictId) {
            Firebase.downloadImageAsBlob(catName, pictId).then(function(wrapper) {
              Firebase.getPointsForAPicture(pictId).then(function(points) {
                CategoriesStorage.appendPictureWrapperToACat(wrapper.categoryName, wrapper.imageId, points, wrapper.blob);
              }).catch(function(error) {
                console.error("Cannot download the points for the image " + catName, " ", pictId, " ", error);
              });
            }).catch(function(error) {
              console.error("Cannot download an image for the cat " + catName, " ", pictId, " ", error);
            });
          })
        }).catch(function(error) {
          console.error("Cannot get a list of image for the cat " + catName, " ", error);
        });
      });

    })();


    var userTookPicture = function(data) {

      /*if (false) {
        getPointsFromPifPaf(data).then(function(points) {

          var prediction = App.ConvNet.testAPicForRecognition(points);
          console.log("The prediction is", prediction)
          console.log("Async gives", prediction.dataSync())
        });
        return;
      }*/

      var catName = CategoriesStorage.getActualCategory().label;
      if (verbose) {
        console.log("Manager: The user took a picture for the category \"" + catName + "\"");
      }
      proceedImage(catName, data);

      CategoriesStorage.proposeNextCategory();
      CategoriesLayout.displayCategory(CategoriesStorage.getActualCategory());
    }

    var proceedImage = function(catName, data) {
      //create a unique identifier for this picture
      var imageId = Helper.UUID();

      getPointsFromPifPaf(data).then(function(points) {
        if (verbose) {
          console.log("Main: received some points from the pif paf server, time to save them in memory and send them to firebase under the category ", catName)
        }

        CategoriesStorage.appendPictureWrapperToACat(catName, imageId, points, data);
        Firebase.saveImage(Device.clientId, imageId, data, catName, new Date(), navigator.userAgent, points);

      }).catch(function(error) {
        console.error("Didn't receive points from the pif paf algo, but still save the picture in firebase and into memory " + error);
        CategoriesStorage.appendPictureWrapperToACat(catName, imageId, null, data);
        Firebase.saveImage(Device.clientId, imageId, data, catName, new Date(), navigator.userAgent, null);
      })
    }

    var getPointsFromPifPaf = function(image) {
      var promise = new Promise(function(resolve, reject) {


        var reader = new FileReader();
        reader.onload = function() {
          var json = {};
          json.image = reader.result;
          Server.requestPifPafForPoints(json).then(function(pointsText) {
            var points = JSON.parse(pointsText);
            resolve(points);
          }).catch(function(error) {
            reject(error);
          })

        }
        reader.readAsDataURL(image);
      });

      return promise;
    }

    var systemTookPicture = function(data, drawLivePoints) {
      if (verbose) {
        console.log("Manager: The system took a picture");
      }

      if (drawLivePoints) {
        var reader = new FileReader();
        reader.onload = function() {
          var json = {};
          json.image = reader.result;
          PifPafBuffer.sendPictureToPifPaf(json);
        }
        reader.readAsDataURL(data);
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
