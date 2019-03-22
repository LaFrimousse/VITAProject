(function(window) {
  'use strict';

  var App = window.App || {};

  var verbose = true

  /*return an empty 2d array of same lenght than allcategories, in order to add pictures and point later at the same indexes than the categories allows to*/
  function empty2DArray(categories) {
    var emptyArray = []
    categories.forEach(function(element) {
      emptyArray.push([])
    })
    return emptyArray
  }


  function CategoriesStorage() {
    this.categories = [{
        "title": "Strech out your arms",
        "label": "arms_outstreched",
        "imageURL": "images/arms_outstreched.png"
      },
      {
        "title": "Put one arm up, the other down",
        "label": "arm_up_arm_down",
        "imageURL": "images/arm_up_arm_down.png"
      },
      {
        "title": "Put your arms down",
        "label": "arms_down",
        "imageURL": "images/arms_down.png"
      },
      {
        "title": "Make a roof",
        "label": "arms_roof",
        "imageURL": "images/arms_roof.png"
      },
      {
        "title": "Put your hands up (in the air)",
        "label": "arms_up",
        "imageURL": "images/arms_up.png"
      }
    ]

    /*empty initialized*/
    this.picturesTakenPerCategory = empty2DArray(this.categories);
    /*empty initialized*/
    this.pointsTakenPerCategory = empty2DArray(this.categories);

    if(verbose){
      console.log("Categories: just initialized a new categoriesStorage instance");
    }
  }

  /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
  CategoriesStorage.prototype.appendPictureToACat = function(atIndex, picture) {
    this.picturesTakenPerCategory[atIndex].push(picture)
    if(verbose){
      console.log("Categories: just appened a picture at index" + atIndex);
    }
  }

  /* When the server parsed some points for an image, we can decide to save them in this class under a particular category*/
  CategoriesStorage.prototype.appendPointsToACat = function(atIndex, points) {
    this.pointsTakenPerCategory[atIndex].push(points)
    if(verbose){
      console.log("Categories: just appened some points at index" + atIndex);
    }
  }

  CategoriesStorage.prototype.deleteAPictureFromACat = function(categoryIndex, elementIndex) {
    this.picturesTakenPerCategory[categoryIndex].splice(elementIndex,1);
    if(verbose){
      console.log("Categories: just deleted a picture for category " + categoryIndex + " at index" + elementIndex);
    }
  }

  CategoriesStorage.prototype.deleteAPointFromACat = function(categoryIndex, elementIndex) {
    this.pointsTakenPerCategory[categoryIndex].splice(elementIndex,1);
    if(verbose){
      console.log("Categories: just deleted the points for category " + categoryIndex + " at index" + elementIndex);
    }
  }

  /*Return all the pictures that were previously stored for a particula category*/
  CategoriesStorage.prototype.pictureTakenForACat = function(catIndex) {
    if(verbose){
      console.log("Categories: returning the pictures taken for category of index " + catIndex);
    }
    return this.picturesTakenPerCategory[catIndex]
  }

  /*Return all the pictures that were previously stored for a particula category*/
  CategoriesStorage.prototype.pointsTakenForACat = function(catIndex) {
    if(verbose){
      console.log("Categories: returning the points taken for category of index " + catIndex);
    }
    return this.pointsTakenPerCategory[catIndex]
  }

  App.CategoriesStorage = CategoriesStorage;
  window.App = App;

})(window);
