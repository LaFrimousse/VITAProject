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

    var appendPointsToACat = function(points) {
      categoriesStorage.appendPointsToACat(indexOfCategorySelected, points);
    }


    var hide = function(){
      var elemToHide = document.getElementById("categoriesModule")
      if (!elemToHide.classList.contains("notDisplayed")) {
        elemToHide.classList.add("notDisplayed");
      }
    }
    var show = function(){
      var elemToHide = document.getElementById("categoriesModule")
      if (elemToHide.classList.contains("notDisplayed")) {
        elemToHide.classList.remove("notDisplayed");
      }
      showPicturesTakenForACategory();
    }



    var showPicturesTakenForACategory = function() {

      if (indexOfCategorySelected == -1){
        console.error("CategoriesManager: no picture to show for a category of index -1")
        return ;
      }

      //empty the existing pictures
      while (pictureTakenPerCategoryDiv.firstChild) {
        pictureTakenPerCategoryDiv.removeChild(pictureTakenPerCategoryDiv.firstChild);
      }

      var datas = categoriesStorage.pictureTakenForACat(indexOfCategorySelected)
      //and fill with the new pictures if availables
        datas.forEach(function(data) {
          addAPhotoToPicturesTaken(data)
        })


        if (datas.length > 0){
          pictureTakenPerCategoryDiv.style.display = "flex"
        }else{
          pictureTakenPerCategoryDiv.style.display = "none"
        }


    }

    var addAPhotoToPicturesTaken = function(data) {
      var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
      newImg.src = data
      pictureTakenPerCategoryDiv.appendChild(newImg)
    }


    categorySelector.addEventListener("change", function() {
      /*update the actual selected index*/
      indexOfCategorySelected = categorySelector.selectedIndex - 1
      /*change the image accordingly that show the category actually selected*/
      categorySelectedImg.setAttribute('src', categoriesStorage.categories[indexOfCategorySelected].imageURL);

      /*load the previously taken photos in the div element*/
      showPicturesTakenForACategory()
    });



    return {
      hideElements: hide,
      showElements: show,
      appendPictureToACat: appendPictureToACat,
      appendPointsToACat: appendPointsToACat
    }
  })();


  App.CategoriesManager = CategoriesManager;
  window.App = App;

})(window);
