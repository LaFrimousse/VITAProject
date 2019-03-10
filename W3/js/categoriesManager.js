(function(window) {
  'use strict';

  var App = window.App || {};

  var CategoriesManager = (function() {

    /*the DOM elements manipulated by this module*/
    var categorySelector = document.getElementById("categorySelector")
    var categorySelectedImg = document.getElementById("categoryChoosenImg")
    var pictureTakenPerCategoryDiv = document.getElementById("pictureTakenPerCategory")

    /*the index actually selected of the categorySelector*/
    var indexOfCategorySelected = -1

    /*the model: keeps storage of all the categories and pictures taken for these categories in the actual session*/
    var categoriesStorage = new App.CategoriesStorage();

    /*INITIALISATION: load the available categories in the selectcategories DOM element*/
    categoriesStorage.categories.forEach(function(cat) {
      categorySelector.insertAdjacentHTML("beforeend", '<option>' + cat.title + '</option>')
    })


    var appendPictureToACat = function(picture) {
      categoriesStorage.appendPictureToACat(indexOfCategorySelected, picture);
    }


    var hide = 'undefined'
    var show = 'undefined'



    var loadPhotosToPictureTaken = function() {
      //empty the existing pictures
      while (pictureTakenPerCategoryDiv.firstChild) {
        pictureTakenPerCategoryDiv.removeChild(pictureTakenPerCategoryDiv.firstChild);
      }

      var datas = categoriesStorage.pictureTakenForACat(indexOfCategorySelected)
      //and fill with the new pictures if availables
      if (Array.isArray(datas)) {
        datas.forEach(function(data) {
          addAPhotoToPicturesTaken(data)
        })
      }
    }


    categorySelector.addEventListener("change", function() {
      /*update the actual selected index*/
      indexOfCategorySelected = categorySelector.selectedIndex - 1
      /*change the image accordingly that show the category actually selected*/
      categorySelectedImg.setAttribute('src', categoriesStorage.categories[indexOfCategorySelected].imageURL);

      /*load the previously taken photos in the div element*/
      loadPhotosToPictureTaken()
    });



    return {
      hide: hide,
      show: show,
      appendPictureToACat: appendPictureToACat
    }
  })();


  App.CategoriesManager = CategoriesManager;
  window.App = App;

})(window);
