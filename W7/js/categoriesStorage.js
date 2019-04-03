(function(window) {
  'use strict';

  var App = window.App || {};

  var CategoriesStorage = (function() {
    var verbose = true
    var actualCategoryIndex = -1;

    function UUID() {
      //https://codepen.io/Jvsierra/pen/BNbEjW
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    /*return an empty 2d array of same lenght than categories, in order to add pictures and point later at the same indexes than the categories allows to*/
    function empty2DArray(categories) {
      var emptyArray = []
      categories.forEach(function(element) {
        emptyArray.push([])
      })
      return emptyArray
    }

    var categories = [{
        "title": "Strech out your arms",
        "label": "arms_outstreched",
        "imageURL": "images/arms_outstreched.png"
      },
      {
        "title": "Put one arm up, the other down",
        "label": "arm_up_arm_down",
        "imageURL": "images/arm_up_arm_down.png"
      },
      {
        "title": "Put your arms down",
        "label": "arms_down",
        "imageURL": "images/arms_down.png"
      },
      {
        "title": "Make a roof",
        "label": "arms_roof",
        "imageURL": "images/arms_roof.png"
      },
      {
        "title": "Put your hands up (in the air)",
        "label": "arms_up",
        "imageURL": "images/arms_up.png"
      }
    ]

    /*empty initialized*/
    var picturesWrappers = empty2DArray(categories);


    /*Given a label name, outputs the integer in which to store these picturesWrappers*/
    var indexForLabel = function(label) {
      for (var i in this.categories) {
        if (this.categories[i].label == label) {
          return i;
        }
      }
      return -1;
    }

    var labelForIndex = function(index) {
      return this.categories[index].label
    }

    function PictureWrapper(uuid, points, picture) {
      this.uuid = uuid;
      this.points = points;
      this.picture = picture;
    }

    var getRealIndexFromNbOrString = function(obj) {
      if (Number.isInteger(obj)) {
        return obj;
      } else {
        return this.indexForLabel(obj);
      }
    }

    /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
    var appendPictureWrapperToACat = function(catIndexOrLabelName, uuid, points, picture) {
      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);

      var wrapper = new PictureWrapper(uuid, points, picture);
      this.picturesWrappers[catIndex].push(wrapper);

      if (verbose) {
        console.log("Categories: just appened a picture wrapper for the category \"" +
          this.labelForIndex(catIndex) + "\"");
      }
    }

    var deleteAPictureWrapperFromACat = function(catIndexOrLabelName, elementIndex) {

      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);

      this.picturesWrappers[catIndex].splice(elementIndex, 1);
      if (verbose) {
        console.log("Categories: just deleted a picture wrapper for the category \"" +
          this.labelForIndex(catIndex) + "\"");
      }
    }

    /*Return all the pictures that were previously stored for a particula category*/
    var pictureTakenForACat = function(catIndexOrLabelName) {

      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);

      var picturesTaken = []
      this.picturesWrappers[catIndex].forEach(function(pw) {
        if (pw.picture) {
          picturesTaken.push(pw.picture)
        }
      })
      if (verbose) {
        console.log("Categories: returning the pictures taken for category of index " + catIndex + "(" +
          picturesTaken.lenght + " pictures)");
      }
      return picturesTaken;
    }

    /*Return all the pictures that were previously stored for a particula category*/
    var pointsTakenForACat = function(catIndexOrLabelName) {

      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);

      var pointsTaken = []
      this.picturesWrappers[catIndex].forEach(function(pw) {
        if (pw.points) {
          pointsTaken.push(pw.points)
        }
      })
      if (verbose) {
        console.log("Categories: returning the points taken for category of index " + catIndex + "(" +
          pointsTaken.lenght + " points)");
      }
      return pointsTaken;
    }

    var getActualCategory = function(){
      return actualCategoryIndex < 0 ? null : categories[actualCategoryIndex];
    }

    var randomCategory = function(){
      var randomIndex = Math.floor(Math.random() * categories.length);
      return randomIndex;
    }

    var getCategorySuggestionFromServer = function(){
      return null;
    }

    var proposeNextCategory = function(){
      if(selector.selectedIndex != 0){
        //manual propostion
        actualCategoryIndex = selector.selectedIndex - 1;
      }else if (checkbox.checked){
        //propostion from the server
        var fromServer = getCategorySuggestionFromServer();
        if (Number.isInteger(fromServer)) {
          actualCategoryIndex = fromServer;
        }else{
          actualCategoryIndex = randomCategory();
        }
      }else{
        //no category
        actualCategoryIndex = -1;
      }
    }

    //-------------FROM HERE EVERYTHING ABOUT THE LAYOUT----------
    var wrapper = document.getElementsByClassName("categoryDisplayWrapper")[0];
    var selector = document.getElementById("categorySelector");
    var checkbox = document.getElementById("proposalModeCheckBox");
    checkbox.checked = true;
    var imageForCat = document.getElementById("postureToAdoptImg");
    var title = document.getElementById("postureToAdaptTitle");

    categories.forEach(function(cat) {
      selector.insertAdjacentHTML("beforeend", '<option>' + cat.title + '</option>')
    })

    selector.addEventListener("change", function() {
      checkbox.checked = false
      actualCategoryIndex =   selector.selectedIndex;
      proposeNextCategory();
      displayCategory();
    })

    checkbox.addEventListener("change", function() {
      selector.selectedIndex = 0
      proposeNextCategory();
      displayCategory();
    })

    var displayCategory = function(){
      var initialTitle = "No category actually proposed"
      var initialImgSrc = "images/questionMark.jpg"
      if(actualCategoryIndex >=0){
        initialTitle = categories[actualCategoryIndex].title
        initialImgSrc = categories[actualCategoryIndex].imageURL
      }
      title.innerHTML = initialTitle;
      imageForCat.src = initialImgSrc;
    }

    proposeNextCategory();
    displayCategory();

    var hideElements = function(){
      if (!wrapper.classList.contains("notDisplayed")) {
        wrapper.classList.add("notDisplayed");
      }
    }

    var showElements = function(){
      if (wrapper.classList.contains("notDisplayed")) {
        wrapper.classList.remove("notDisplayed");
      }
    }

    return {
      categories: categories,
      appendPictureWrapperToACat: appendPictureWrapperToACat,
      deleteAPictureWrapperFromACat: deleteAPictureWrapperFromACat,
      pictureTakenForACat: pictureTakenForACat,
      pointsTakenForACat: pointsTakenForACat,
      getActualCategory:getActualCategory,
      proposeNextCategory:proposeNextCategory,
      displayCategory:displayCategory,
      showElements:showElements,
      hideElements:hideElements
    }

  })();

  App.CategoriesStorage = CategoriesStorage;
  window.App = App;

})(window);
