(function(window) {
  'use strict';

  var App = window.App;

  var CameraEvents = App.CameraEvents;
  var CategoriesStorage = App.CategoriesStorage;

  /*var CategoriesManager = App.CategoriesManager;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;*/

  var Manager = function(){
    var verbose = true;


    var userTookPicture = function(data){
      if(verbose){
        console.log("Manager: The user took a picture for the category \"" + CategoriesStorage.getActualCategory().label+"\"");
      }

      CategoriesStorage.proposeNextCategory();
      CategoriesStorage.displayCategory();
    }

    var systemTookPicture = function(data){
      if(verbose){
        console.log("Manager: The system took a picture");
      }
    }

    return {
      userTookPicture: userTookPicture,
      systemTookPicture:systemTookPicture
    }

  }();

  CameraEvents.setManager(Manager);

})(window);
