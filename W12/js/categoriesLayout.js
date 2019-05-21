(function(window) {
  'use strict';

  var App = window.App;
  var Device = App.Device;
  var PointsDrawing = App.PointsDrawing;
  var CategoriesStorage = App.CategoriesStorage;
  var Firebase = App.Firebase;

  var CategoriesLayout = (function() {
    var verbose = false;

    var nbOfPictureSelected = 0;
    var allPicturesToDisplay = [];
    var urlToClean = [];


    //DOM ELEMENTS
    var title = document.getElementById("postureToAdaptTitle");
    var imageForCat = document.getElementById("postureToAdoptImg");

    var globalWrapper = document.getElementsByClassName("pictureAndButtonsWrapper")[0];
    var picturesWrapper = document.getElementById("picturesWrapper");
    var deleteButton = document.getElementById("deletePicture");
    var seePointsCheckBox = document.getElementById("seeThePointsCheckBox");
    var seePicturesCheckBox = document.getElementById("seeThePicturesCheckBox");

    var displayCategoryTitleAndPicture = function(cat) {
      if (verbose) {
        console.log("CategoriesLayout: displaying the category ", cat, "  to the user");
      }
      var initialTitle = "Posture Recognized: "
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
        show(picturesWrapper);
      } else {
        hide(picturesWrapper);
      }
    }

    var addAPhotoToPicturesTaken = function(wrapper) {
      var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
      newImg.setAttribute("data-image_id", wrapper.imageId);
      var url = URL.createObjectURL(wrapper.picture);
      urlToClean.push(url);

      if (!seePointsCheckBox.checked || wrapper.points == null || wrapper.points == undefined) {
        newImg.src = url
      } else {
        var callback = function(url2) {
         newImg.src = url2;
         urlToClean.push(url2);
        }
        PointsDrawing.addPointsInImage(url, wrapper.points, callback, seePicturesCheckBox.checked);
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

      var setOfIdToDel = new Set()
      var imagesToDel = [];
      [].slice.call(childrenList).forEach(function(item, index) {
        if (item.classList.contains("selected")) {
          var imgId = item.getAttribute("data-image_id")
          setOfIdToDel.add(imgId);
          item.remove();
          var inMemoryImg = CategoriesStorage.imgForId(imgId);
          var imToDel = {
            catLabel: CategoriesStorage.labelForIndex(inMemoryImg.catIndex),
            userId: Device.clientId,
            imageId:imgId
          }
          imagesToDel.push(imToDel);
        }
      });

      CategoriesStorage.deleteSomePictureFromACat(setOfIdToDel);
      Firebase.deleteImages(imagesToDel);

      nbOfPictureSelected = 0;
      hideOrShowDeleteButton();

    }


    deleteButton.addEventListener("click", function() {
      deleteImages();
    });

    document.addEventListener("keydown", function(e) {
      if (e.keyCode == 8) {
        deleteImages();
      }
    });

    seePointsCheckBox.addEventListener("change", function() {
      displayAllPictures();
    });

    seePicturesCheckBox.addEventListener("change", function() {
      displayAllPictures();
    });

    displayCategoryTitleAndPicture(CategoriesStorage.getActualCategory());

    return {
      displayCategoryTitleAndPicture: displayCategoryTitleAndPicture,
      hideGlobalWrapper: hideGlobalWrapper,
      showGlobalWrapper: showGlobalWrapper,
      displayAllPictures: displayAllPictures,
      notifyNewPictureAvailable: notifyNewPictureAvailable
    }
  })();
  App.CategoriesLayout = CategoriesLayout;
  window.App = App;
})(window);
