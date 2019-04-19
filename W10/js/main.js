(function(window) {
  'use strict';

  var App = window.App;

  var CameraEvents = App.CameraEvents;
  var CategoriesStorage = App.CategoriesStorage;
  var CategoriesLayout = App.CategoriesLayout;
  var Firebase = App.Firebase;
  var Helper = App.Helper;

  /*var CategoriesManager = App.CategoriesManager;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;*/

  var Manager = function() {
    var verbose = false;

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
      console.log("----------set", clientId)
      Helper.setCookie(clientIdCookieName, clientId, 100);

      //load from firebase the picture the user took in previous session
      var allCat = CategoriesStorage.categories
      // allCat = [];
      allCat.forEach(function(cat){
        var catName = cat.label;
        Firebase.getImgListForUser(clientId, catName).then(function(listIds){
            listIds.forEach(function(pictId){
              Firebase.downloadImageAsBlob(catName, pictId).then(function(wrapper){
                CategoriesStorage.appendPictureWrapperToACat(wrapper.categoryName, wrapper.imageId, null, wrapper.blob);
              }).catch(function(error){
                console.error("Cannot download an image for the cat " + catName," ",pictId, " ", error);
              });
            })
        }).catch(function(error){
          console.error("Cannot get a list of image for the cat " + catName," ", error);
        });
      });

    })();


    var userTookPicture = function(data) {
      var catName = CategoriesStorage.getActualCategory().label;
      if (verbose) {
        console.log("Manager: The user took a picture for the category \"" + catName + "\"");
      }

      var imageId = Helper.UUID();


      CategoriesStorage.appendPictureWrapperToACat(catName, imageId, null, data);
      CategoriesStorage.proposeNextCategory();
      CategoriesLayout.displayCategory(CategoriesStorage.getActualCategory());

      Firebase.saveImage(clientId, imageId, data, catName, new Date(), navigator.userAgent);
    }


    var systemTookPicture = function(data) {
      if (verbose) {
        console.log("Manager: The system took a picture");
      }
    }


    return {
      userTookPicture: userTookPicture,
      systemTookPicture: systemTookPicture
    }

  }();

  CameraEvents.setManager(Manager);

})(window);
