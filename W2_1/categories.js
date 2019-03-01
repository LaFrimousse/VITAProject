'use strict'

var categories = (function () {
  var allCategories  = [
    {
      "title":"Categorie1",
      "imageURL":"images/cat1.png"
    },
    {
      "title":"Categorie2",
      "imageURL":"images/cat2.png"
    },
    {
      "title":"Categorie3",
      "imageURL":"images/cat3.png"
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

var categorySelector = document.getElementById("categorySelector")
categories.allCategories.forEach(function (cat) {
  categorySelector.insertAdjacentHTML("beforeend", '<option>'+cat.title+'</option>')
})


var categoryChoosenImg = document.getElementById("categoryChoosenImg")
categorySelector.addEventListener("change", function(){
categoryChoosenImg.setAttribute('src', categories.allCategories[categorySelector.selectedIndex-1].imageURL);
  console.log(categorySelector.selectedIndex)
});
