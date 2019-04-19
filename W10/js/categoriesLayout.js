(function(window) {
  'use strict';

  var App = window.App || {};

  var CategoriesLayout = (function() {
    var verbose = false;
    var categoryStorage = null;
    var actualCategoryDisplayed = null;
    var nbOfPictureSelected = 0;
    var urlToClean = [];

    var globalWrapper = document.getElementsByClassName("categoryDisplayWrapper")[0];
    var imageForCat = document.getElementById("postureToAdoptImg");
    var title = document.getElementById("postureToAdaptTitle");
    var pictureDisplayWrapper = document.getElementsByClassName("pictureDisplayWrapper")[0];
    var picturesWrapper = document.getElementById("pictures");
    var deleteButton = document.getElementById("deletePicture");

    var hideElements = function() {
      if (verbose) {
        console.log("CategoriesLayout: hidding the elements to the user");
      }
      removeSelection();
      hide(globalWrapper);
    }

    var showElements = function() {
      if (verbose) {
        console.log("CategoriesLayout: showing the elements to the user");
      }
      show(globalWrapper);
    }

    var displayCategory = function(cat) {
      if (verbose) {
        console.log("CategoriesLayout: displaying a category to the user");
      }
      var initialTitle = "No category actually proposed"
      var initialImgSrc = "images/questionMark.jpg"
      actualCategoryDisplayed = cat;
      if (cat != null) {
        initialTitle = cat.title
        initialImgSrc = cat.imageURL
      }
      title.innerHTML = initialTitle;
      imageForCat.src = initialImgSrc;
    }

    var hideOrShowDeleteButton = function() {
      if (nbOfPictureSelected == 0) {
        console.log("CategoriesLayout: hidding the delete button");
        hide(deleteButton)
      } else {
        console.log("CategoriesLayout: showing the delete button");
        show(deleteButton)
      }
    }

    var hide = function(element) {
      if (!element.classList.contains("notDisplayed")) {
        element.classList.add("notDisplayed");
      }
    }

    var show = function(element) {
      if (element.classList.contains("notDisplayed")) {
        element.classList.remove("notDisplayed");
      }
    }

    var showPicturesForACat = function(pictures) {
      if (verbose) {
        console.log("CategoriesLayout: showing " + pictures.length + " pictures to the user for a category");
      }

      nbOfPictureSelected = 0;
      hideOrShowDeleteButton();

      //empty the existing pictures
      while (picturesWrapper.firstChild) {
        picturesWrapper.removeChild(picturesWrapper.firstChild);
      }
      urlToClean.forEach(function(el){
        window.URL.revokeObjectURL(el);
      })
      urlToClean = []


      //and fill with the new pictures if availables
      pictures.forEach(function(data, index) {
        addAPhotoToPicturesTaken(data, index);
      })

      if (pictures.length > 0) {
        show(picturesWrapper);
      } else {
        hide(picturesWrapper);
      }
    }

    var addAPhotoToPicturesTaken = function(data, index) {
      var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
      var url = URL.createObjectURL(data)
      newImg.src = url
      urlToClean.push(url);
      //newImg.setAttribute("data-picture_nb", index);
      picturesWrapper.appendChild(newImg)

      newImg.addEventListener("click", function(el) {
        if (newImg.classList.contains("selected")) {
          newImg.classList.remove("selected");
          nbOfPictureSelected -= 1;
          hideOrShowDeleteButton();
        } else {
          newImg.classList.add("selected");
          nbOfPictureSelected += 1;
          hideOrShowDeleteButton();
        }
      })
    }

    var hidePicturesTaken = function() {
      if (verbose) {
        console.log("CategoriesLayout: hidding the pictures displayed");
      }
      removeSelection();
      hide(picturesWrapper);
      hide(deleteButton);
    }


    deleteButton.addEventListener("click", function() {
      deleteImages();
    });

    document.addEventListener("keydown", function(e) {
      if (e.keyCode == 8) {
        deleteImages();
      }
    });

    var removeSelection = function() {
      nbOfPictureSelected = 0;
      hide(deleteButton);
      var childrenList = picturesWrapper.children;
      var indexes = [];
      [].slice.call(childrenList).forEach(function(item, index) {
        if (item.classList.contains("selected")) {
          item.classList.remove("selected");
        }
      });
    }

    var deleteImages = function() {
      if (nbOfPictureSelected == 0) {
        //to save if the user want's to delete a picture using the keyboard
        return;
      }
      if(verbose){
        console.log("CategoriesLayout: deleting the selected images");
      }
      var childrenList = picturesWrapper.children;
      var indexes = [];
      [].slice.call(childrenList).forEach(function(item, index) {
        if (item.classList.contains("selected")) {
          indexes.push(index)
        }
      });

      indexes.reverse().forEach(function(nb) {
        categoryStorage.deleteAPictureWrapperFromACat(null, nb)
      })
      // UI reloaded from categriesStorage
    }

    var setCategoryStorage = function(storage) {
      if (verbose) {
        console.log("CategoriesLayout: setting his categoryStorage reference")
        categoryStorage = storage;
      }
    }

    return {
      displayCategory: displayCategory,
      showElements: showElements,
      hideElements: hideElements,
      showPicturesForACat: showPicturesForACat,
      hidePicturesTaken: hidePicturesTaken,
      setCategoryStorage: setCategoryStorage
    }
  })();
  App.CategoriesLayout = CategoriesLayout;
  window.App = App;
})(window);
