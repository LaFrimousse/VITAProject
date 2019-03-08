'use strict'

var categoriesStorage = (function () {
  var allCategories  = [
    {
      "title":"Categorie0",
      "imageURL":"images/cat0.png"
    },
    {
      "title":"Categorie1",
      "imageURL":"images/cat1.png"
    },
    {
      "title":"Categorie2",
      "imageURL":"images/cat2.png"
    }
  ]

/*return an empty 2d array of same lenght than allcategories, in order to add pictures and point later at the same indexes than the categories allows to*/
  var empty2DArray = function(){
    var emptyArray = []
    allCategories.forEach(function(element) {
      emptyArray.push([])
    })
    return emptyArray
  }

  /*empty initialized*/
  var picturesTakenPerCategory = empty2DArray()
  var pointsTakenPerCategory = empty2DArray()

  /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
  var appendPictureToACat = function(atIndex, picture){
    picturesTakenPerCategory[atIndex].push(picture)
  }

  /* When the server parsed some points for an image, we can decide to save them in this class under a particular category*/
  var appendPointsToACat = function(atIndex, points){
    pointsTakenPerCategory[atIndex].push(points)
  }

  /*Return all the pictures that were previously stored for a particula category*/
  var pictureTakenForACat = function(catIndex){
    return picturesTakenPerCategory[catIndex]
  }

  /*Return all the pictures that were previously stored for a particula category*/
  var pointsTakenForACat = function(catIndex){
    return pointsTakenPerCategory[catIndex]
  }

  return {
    allCategories: allCategories,
    appendPictureToACat: appendPictureToACat,
    appendPointsToACat: appendPointsToACat,
    pictureTakenForACat: pictureTakenForACat,
    pointsTakenForACat: pointsTakenForACat
  }

})();
