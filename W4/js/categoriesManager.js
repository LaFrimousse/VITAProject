(function(window) {
  'use strict';

  var App = window.App || {};

  var CategoriesManager = (function() {

    /*the DOM elements manipulated by this module*/
    var categorySelector = document.getElementById("categorySelector")
    var categorySelectedImg = document.getElementById("categoryChoosenImg")
    var deletePicturesButton = document.getElementById("deletePicturesFromTrainingSetButton")
    var pictureTakenPerCategoryDiv = document.getElementById("pictureTakenPerCategory")


    /*the index actually selected of the categorySelector*/
    var indexOfCategorySelected = -1

    var nbOfImageSelectedFromTrainingSetToDelete = 0

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

    var deleteAPictureFromACat = function(index) {
      categoriesStorage.deleteAPictureFromACat(indexOfCategorySelected, index);
    }

    var deleteAPointFromACat = function(index) {
      categoriesStorage.deleteAPointFromACat(indexOfCategorySelected, index);
    }


    var hide = function(el) {

      var elemToHide = el
      if (typeof(elemToHide) == "undefined") {
        elemToHide = document.getElementById("categoriesModule")
      }

      if (!elemToHide.classList.contains("notDisplayed")) {
        elemToHide.classList.add("notDisplayed");
      }
    }

    var show = function(el) {
      var elemToShow = el
      var willShow = false
      if (typeof(elemToShow) == "undefined") {
        elemToShow = document.getElementById("categoriesModule")
        willShow = true
      }

      if (elemToShow.classList.contains("notDisplayed")) {
        elemToShow.classList.remove("notDisplayed");
      }
      if (willShow) {
        showPicturesTakenForACategory();
      }
    }


    var showPicturesTakenForACategory = function() {

      if (indexOfCategorySelected == -1) {
        console.error("CategoriesManager: no picture to show for a category of index -1")
        return;
      }

      nbOfImageSelectedFromTrainingSetToDelete = 0;
      hideOrShowDeleteButton();

      //empty the existing pictures
      while (pictureTakenPerCategoryDiv.firstChild) {
        pictureTakenPerCategoryDiv.removeChild(pictureTakenPerCategoryDiv.firstChild);
      }

      var datas = categoriesStorage.pictureTakenForACat(indexOfCategorySelected)
      //and fill with the new pictures if availables
      datas.forEach(function(data, index) {
        addAPhotoToPicturesTaken(data, index)
      })


      if (datas.length > 0) {
        pictureTakenPerCategoryDiv.style.display = "flex"
      } else {
        pictureTakenPerCategoryDiv.style.display = "none"
      }

    }

    var addAPhotoToPicturesTaken = function(data, index) {
      var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
      newImg.src = data
      //newImg.setAttribute("data-picture_nb", index);
      pictureTakenPerCategoryDiv.appendChild(newImg)

      newImg.addEventListener("click", function(el) {
        if (newImg.classList.contains("selected")) {
          newImg.classList.remove("selected");
          nbOfImageSelectedFromTrainingSetToDelete -= 1;
          hideOrShowDeleteButton();
        } else {
          newImg.classList.add("selected");
          nbOfImageSelectedFromTrainingSetToDelete += 1;
          hideOrShowDeleteButton();
        }
      })
    }


    categorySelector.addEventListener("change", function() {
      /*update the actual selected index*/
      indexOfCategorySelected = categorySelector.selectedIndex - 1
      /*change the image accordingly that show the category actually selected*/
      categorySelectedImg.setAttribute('src', categoriesStorage.categories[indexOfCategorySelected].imageURL);


      /*load the previously taken photos in the div element*/
      showPicturesTakenForACategory()
    });

    var hideOrShowDeleteButton = function() {
      if (nbOfImageSelectedFromTrainingSetToDelete == 0) {
        hide(deletePicturesButton)
      } else {
        show(deletePicturesButton)
      }
    }


    deletePicturesButton.addEventListener("click", function() {
      var childrenList = pictureTakenPerCategory.children;
      var indexes = [];
      [].slice.call(childrenList).forEach(function(item,index) {
        if(item.classList.contains("selected")){
          indexes.push(index)
        }
      });
      indexes.reverse().forEach(function(nb){
        deleteAPictureFromACat(nb)
        deleteAPointFromACat(nb)
      })
      //reload the UI
      showPicturesTakenForACategory()
    });



    return {
      hideElements: hide,
      showElements: show,
      appendPictureToACat: appendPictureToACat,
      appendPointsToACat: appendPointsToACat,
    }
  })();


  App.CategoriesManager = CategoriesManager;
  window.App = App;

})(window);
