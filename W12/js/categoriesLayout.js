(function(window) {
  'use strict';

  var App = window.App;
  var PointsDrawing = App.PointsDrawing;
  var CategoriesStorage = App.CategoriesStorage;

  var CategoriesLayout = (function() {
    var verbose = true;

    var nbOfPictureSelected = 0;
    var allPicturesToDisplay = [];
    var urlToClean = [];

    var userWantsToSeeThePoints = true;
    var userWantsToSeeTheImages = true;

    //DOM ELEMENTS
    var title = document.getElementById("postureToAdaptTitle");
    var imageForCat = document.getElementById("postureToAdoptImg");

    var globalWrapper = document.getElementsByClassName("pictureAndButtonsWrapper")[0];
    var picturesWrapper = document.getElementById("picturesWrapper");
    var deleteButton = document.getElementById("deletePicture");

    var displayCategoryTitleAndPicture = function(cat) {
      if (verbose) {
        console.log("CategoriesLayout: displaying the category ", cat, "  to the user");
      }
      var initialTitle = ""
      var initialImgSrc = "images/questionMark.jpg"

      if (cat != null) {
        initialTitle = cat.title
        initialImgSrc = cat.imageURL
      }
      title.innerHTML = initialTitle;
      imageForCat.src = initialImgSrc;
    }

    var hideGlobalWrapper = function() {
      if (verbose) {
        console.log("CategoriesLayout: hidding the globalWrapper to the user");
      }
      removeSelection();
      hide(globalWrapper);
    }

    var showGlobalWrapper = function() {
      if (verbose) {
        console.log("CategoriesLayout: hidding the globalWrapper to the user");
      }
      removeSelection();
      show(globalWrapper);
    }


    var hideOrShowDeleteButton = function() {
      if (nbOfPictureSelected == 0) {
        if (verbose) {
          console.log("CategoriesLayout: hidding the delete button");
        }
        hide(deleteButton)
      } else {
        if (verbose) {
          console.log("CategoriesLayout: showing the delete button");
        }
        show(deleteButton)
      }
    }

    var hide = function(element) {
      element.classList.add("notDisplayed");
    }

    var show = function(element) {
      element.classList.remove("notDisplayed");
    }

    var notifyNewPictureAvailable = function(pictWrapper) {
      if (verbose) {
        console.log("CategoriesLayout: notified we have a new  picture wrapper available ", pictWrapper);
      }

      var actualCat = CategoriesStorage.getActualCategory();
      var actualCatIndex = CategoriesStorage.indexForLabel(actualCat.label)
      if(actualCatIndex == pictWrapper.catIndex){
        addAPhotoToPicturesTaken(pictWrapper);
      }
    }

    var displayAllPictures = function() {

      var actualCat = CategoriesStorage.getActualCategory();
      var actualCatIndex = CategoriesStorage.indexForLabel(actualCat.label);
      allPicturesToDisplay = CategoriesStorage.wrappersTakenForACat(actualCatIndex);

      if (verbose) {
        console.log("CategoriesLayout: will show all picture for the category ", actualCat.label, "(", allPicturesToDisplay.length, " pictures)")
      }

      nbOfPictureSelected = 0;
      hideOrShowDeleteButton();

      //empty the existing pictures
      while (picturesWrapper.firstChild) {
        picturesWrapper.removeChild(picturesWrapper.firstChild);
      }

      //TODO: be sure to clean the url when you manually delete some pictures
      urlToClean.forEach(function(el) {
        window.URL.revokeObjectURL(el);
      })
      urlToClean = []

      //and fill with the new pictures if availables
      allPicturesToDisplay.forEach(function(wrapper) {
        addAPhotoToPicturesTaken(wrapper);
      })

      if (allPicturesToDisplay.length > 0) {
        showGlobalWrapper();
      } else {
        hideGlobalWrapper();
      }
    }

    var addAPhotoToPicturesTaken = function(wrapper) {
      var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
      newImg.setAttribute("data-image_id", wrapper.imageId);
      var url = URL.createObjectURL(wrapper.picture);
      urlToClean.push(url);

      if (!userWantsToSeeThePoints || wrapper.points == null) {
        newImg.src = url
      } else {
        var callback = function(url2) {
         newImg.src = url2;
         urlToClean.push(url2);
        }
        PointsDrawing.addPointsInImage(url, wrapper.points, callback, userWantsToSeeTheImages);
      }

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
      if (verbose) {
        console.log("CategoriesLayout: deleting the selected images");
      }
      var childrenList = picturesWrapper.children;
      var indexes = [];
      [].slice.call(childrenList).forEach(function(item, index) {
        if (item.classList.contains("selected")) {
          indexes.push(index)
        }
      });

      categoryStorage.deleteAPictureWrapperFromACat(null, indexes.reverse());

      // UI reloaded from categriesStorage
    }






    displayCategoryTitleAndPicture(CategoriesStorage.getActualCategory());

    deleteButton.addEventListener("click", function() {
      deleteImages();
    });

    document.addEventListener("keydown", function(e) {
      if (e.keyCode == 8) {
        deleteImages();
      }
    });

    return {
      displayCategoryTitleAndPicture: displayCategoryTitleAndPicture,
      hideGlobalWrapper: hideGlobalWrapper,
      showGlobalWrapper: showGlobalWrapper,
      displayAllPictures: displayAllPictures,
      notifyNewPictureAvailable: notifyNewPictureAvailable

      /*
      displayCategory: displayCategory,
      showElements: showElements,
      hideElements: hideElements,
      showPicturesForACat: showPicturesForACat,
      showNewPicture:showNewPicture,
      hidePicturesTaken: hidePicturesTaken,*/
    }
  })();
  App.CategoriesLayout = CategoriesLayout;
  window.App = App;
})(window);
