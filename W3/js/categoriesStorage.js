(function(window) {
  'use strict';

  var App = window.App || {};

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
        "title": "Categorie0",
        "imageURL": "images/cat0.png"
      },
      {
        "title": "Categorie1",
        "imageURL": "images/cat1.png"
      },
      {
        "title": "Categorie2",
        "imageURL": "images/cat2.png"
      }
    ]

    /*empty initialized*/
    this.picturesTakenPerCategory = empty2DArray(this.categories);
    /*empty initialized*/
    this.pointsTakenPerCategory = empty2DArray(this.categories);
  }

  /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
  CategoriesStorage.prototype.appendPictureToACat = function(atIndex, picture) {
    this.picturesTakenPerCategory[atIndex].push(picture)
  }

  /* When the server parsed some points for an image, we can decide to save them in this class under a particular category*/
  CategoriesStorage.prototype.appendPointsToACat = function(atIndex, points) {
    this.pointsTakenPerCategory[atIndex].push(points)
  }

  /*Return all the pictures that were previously stored for a particula category*/
  CategoriesStorage.prototype.pictureTakenForACat = function(catIndex) {
    return this.picturesTakenPerCategory[catIndex]
  }

  /*Return all the pictures that were previously stored for a particula category*/
  CategoriesStorage.prototype.pointsTakenForACat = function(catIndex) {
    return this.pointsTakenPerCategory[catIndex]
  }

  App.CategoriesStorage = CategoriesStorage;
  window.App = App;

})(window);
