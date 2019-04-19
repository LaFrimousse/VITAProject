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
      if(previousClientId == null){
        if(verbose){
          console.log("Main: no previous cookie found for this user identifier");
        }
        previousClientId = Helper.UUID();
      }else{
        if(verbose){
          console.log("Main: a previous cookie has been found for this user : "+previousClientId);
        }
      }
      clientId = previousClientId;
      Helper.setCookie(clientIdCookieName, clientId, 100);
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

      Firebase.saveImage(clientId, imageId, data, catName, new Date(), "browserString");
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
