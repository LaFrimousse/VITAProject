'use strict'

var categories = (function () {
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

  /*empty initialized*/
  var picturesTakenPerCategory = [[]]

  /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
  var appendPictureToACat = function(atIndex, picture){
      picturesTakenPerCategory[atIndex].push(picture)
  }

 /*Return all the pictures that were previously stored for a particula category*/
  var pictureTakenForACat = function(catIndex){
    return picturesTakenPerCategory[catIndex]
  }

  return {
    allCategories: allCategories,
    appendPictureToACat: appendPictureToACat,
    pictureTakenForACat: pictureTakenForACat
  }

})();
