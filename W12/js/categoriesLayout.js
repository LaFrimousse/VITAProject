(function(window) {
  'use strict';

  var App = window.App;
  var PointsDrawing = App.PointsDrawing;
  var CategoriesStorage = App.CategoriesStorage;

  var CategoriesLayout = (function() {
    var verbose = false;
      var actualCategoryIndex = -1;
    var actualCategoryDisplayed = null;
    var nbOfPictureSelected = 0;
    var urlToClean = [];

    var globalWrapper = document.getElementsByClassName("categoryDisplayWrapper")[0];
    var imageForCat = document.getElementById("postureToAdoptImg");
    var title = document.getElementById("postureToAdaptTitle");
    var pictureDisplayWrapper = document.getElementsByClassName("pictureDisplayWrapper")[0];
    var picturesWrapper = document.getElementById("pictures");
    var deleteButton = document.getElementById("deletePicture");

    //theses 3 next line of code were originally in categoriesStorage.js
    var selector = document.getElementById("categorySelector");
    var checkbox = document.getElementById("proposalModeCheckBox");
    checkbox.checked = true;


        CategoriesStorage.categories.forEach(function(cat) {
          selector.insertAdjacentHTML("beforeend", '<option>' + cat.title + '</option>')
        })

        selector.addEventListener("change", function() {
          checkbox.checked = false
          CategoriesStorage.proposeNextCategory(selector.selectedIndex);
          displayCategory(getActualCategory());
          showPicturesForACat(picturesTakenForACat());
        })

        checkbox.addEventListener("change", function() {
          selector.selectedIndex = 0
          CategoriesStorage.proposeNextCategory(selector.selectedIndex);
          displayCategory(getActualCategory());
          hidePicturesTaken();
        })

        CategoriesStorage.proposeNextCategory(0);
        displayCategory(getActualCategory());



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
        if(verbose){
          console.log("CategoriesLayout: hidding the delete button");
        }
        hide(deleteButton)
      } else {
        if(verbose){
          console.log("CategoriesLayout: showing the delete button");
        }
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

    var showPicturesForACat = function(pictsWraps, displayPoints) {
      if (verbose) {
        console.log("CategoriesLayout: showing " + pictsWraps.length + " pictures to the user for a category");
      }
      displayPoints = true;

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
      pictsWraps.forEach(function(wrapper) {
        addAPhotoToPicturesTaken(wrapper, displayPoints);
      })
      if (pictsWraps.length > 0) {
        show(picturesWrapper);
      } else {
        hide(picturesWrapper);
      }
    }

    var showNewPicture = function(points, picture, displayPoints){
      var wrapper = {}
      wrapper.picture = picture;
      wrapper.points = points;
      addAPhotoToPicturesTaken(wrapper, displayPoints);
        show(picturesWrapper);
    }

    var addAPhotoToPicturesTaken = function(wrapper, displayPoints) {
      var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
      var url = URL.createObjectURL(wrapper.picture);

      if(!displayPoints || wrapper.points == null){
        newImg.src = url
      }else{
        var callback = function(url2){
          newImg.src = url2;
        }
        PointsDrawing.addPointsInImage(url, wrapper.points, callback);
      }
      urlToClean.push(url);

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

        CategoriesStorage.deleteAPictureWrapperFromACat(null, indexes.reverse());

      // UI reloaded from categriesStorage
    }





    return {
      displayCategory: displayCategory,
      showElements: showElements,
      hideElements: hideElements,
      showPicturesForACat: showPicturesForACat,
      showNewPicture:showNewPicture,
      hidePicturesTaken: hidePicturesTaken,
    }
  })();
  App.CategoriesLayout = CategoriesLayout;
  window.App = App;
})(window);
