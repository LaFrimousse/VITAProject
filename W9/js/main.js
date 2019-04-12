(function(window) {
  'use strict';

  var App = window.App;

  var CameraEvents = App.CameraEvents;
  var CategoriesStorage = App.CategoriesStorage;
  var CategoriesLayout = App.CategoriesLayout;
  var Firebase = App.Firebase;

  /*var CategoriesManager = App.CategoriesManager;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;*/

  var Manager = function(){
    var verbose = false;


    var userTookPicture = function(data){
      if(verbose){
        console.log("Manager: The user took a picture for the category \"" + CategoriesStorage.getActualCategory().label+"\"");
      }

      CategoriesStorage.appendPictureWrapperToACat(null, null, null, data);
      CategoriesStorage.proposeNextCategory();
      CategoriesLayout.displayCategory(CategoriesStorage.getActualCategory());

      //fetch(data).then(res => res.blob())
      fetch(data).then(res =>   Firebase.putFile(res.blob()));



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
