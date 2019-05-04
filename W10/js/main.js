(function(window) {
  'use strict';

  var App = window.App;

  var CameraEvents = App.CameraEvents;
  var CategoriesStorage = App.CategoriesStorage;
  var CategoriesLayout = App.CategoriesLayout;
  var Firebase = App.Firebase;
  var Helper = App.Helper;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;

  /*var CategoriesManager = App.CategoriesManager;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;*/

  var Manager = function() {
    var verbose = false;
    var drawLivePoints = false;

    var clientIdCookieName = "clientIdCookieName";
    var clientId = null;

    (function() { // init code that fetch the client id cookie
      var previousClientId = Helper.getCookie(clientIdCookieName);
      if (previousClientId == null) {
        if (verbose) {
          console.log("Main: no previous cookie found for this user identifier");
        }
        previousClientId = Helper.UUID();
      } else {
        if (verbose) {
          console.log("Main: a previous cookie has been found for this user : " + previousClientId);
        }
      }
      clientId = previousClientId;
      CategoriesStorage.setUserId(clientId);
      Helper.setCookie(clientIdCookieName, clientId, 100);

      //load from firebase the picture the user took in previous session
      var allCat = CategoriesStorage.categories
      allCat.forEach(function(cat) {
        var catName = cat.label;
        Firebase.getImgListForUser(clientId, catName).then(function(listIds) {
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

      //turn the blob to a base64 string to send it to the pif_paf server
      var reader = new FileReader();
      reader.onload = function() {
        var json = {};
        json.image = reader.result;

        Server.requestPifPafForPoints(json).then(function(pointsText) {
          if (verbose) {
            console.log("Main: received some points from the pif paf server, time to save them in memory and send them to firebase")
          }
          var points = JSON.parse(pointsText);
          CategoriesStorage.appendPictureWrapperToACat(catName, imageId, points, data);
          Firebase.saveImage(clientId, imageId, data, catName, new Date(), navigator.userAgent, points);

        }).catch(function(error) {
          console.error("Didn't receive points from the pif paf algo, but still save the picture in firebase and into memory " + error);
          CategoriesStorage.appendPictureWrapperToACat(catName, imageId, null, data);
          Firebase.saveImage(clientId, imageId, data, catName, new Date(), navigator.userAgent, null);
        })

      }
      reader.readAsDataURL(data);
    }


    var systemTookPicture = function(data) {
      if (verbose) {
        console.log("Manager: The system took a picture");
      }

      if (drawLivePoints) {
        var reader = new FileReader();
        reader.onload = function() {
          var json = {};
          json.image = reader.result;
          console.log(json);
          Server.requestPifPafForPoints(json).then(function(pointsText) {
            var points = JSON.parse(pointsText);
            PointsDrawing.addPointsOverVideo(points);
          })/*.catch(function(error) {
            console.error("Didn't receive points from the pif paf algo, so no live points to draw " + error);
          })*/
        }
        reader.readAsDataURL(data);
      }
    }


    return {
      userTookPicture: userTookPicture,
      systemTookPicture: systemTookPicture
    }

  }();

  CameraEvents.setManager(Manager);

})(window);
