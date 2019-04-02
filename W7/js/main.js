(function(window) {
  'use strict';

  var App = window.App;

  var CameraEvents = App.CameraEvents;

  /*var CategoriesManager = App.CategoriesManager;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;*/

  var Manager = function(){
    var verbose = true;


    var userTookPicture = function(data){
      if(verbose){
        console.log("Manager: The user took a picture");
      }
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

  console.log(Manager);
  CameraEvents.setManager(Manager);

})(window);
