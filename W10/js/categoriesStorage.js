(function(window) {
  'use strict';

  var App = window.App || {};
  var CategoriesLayout = App.CategoriesLayout;
  var Firebase = App.Firebase;

  var CategoriesStorage = (function() {
    var verbose = false;
    var actualCategoryIndex = -1;
    var userId = null;

    var setUserId = function(toSet){
      userId = toSet;
      if(verbose){
        console.log("CategoryStorage: setted his userId ", userId);
      }
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
        "label": "everyone_stop",
        "imageURL": "images/everyone_stop.png"
      },
      {
        "title": "Put your arms at 90 degrees",
        "label": "90_degrees",
        "imageURL": "images/90_degrees.png"
      },
      {
        "title": "Please slow down",
        "label": "slow_down",
        "imageURL": "images/slow_down.png"
      },
      {
        "title": "Please stop and park",
        "label": "stop_and_park",
        "imageURL": "images/stop_and_park.png"
      }
    ]

    /*empty initialized*/
    var picturesWrappers = empty2DArray(categories);


    /*Given a label name, outputs the integer in which to store these picturesWrappers*/
    var indexForLabel = function(label) {
      for (var i in categories) {
        if (categories[i].label == label) {
          return i;
        }
      }
      return -1;
    }

    var labelForIndex = function(index) {
      return categories[index].label
    }

    function PictureWrapper(uuid, points, picture) {
      this.uuid = uuid;
      this.points = points;
      this.picture = picture;
    }

    var getRealIndexFromNbOrString = function(obj) {
      if (obj == null) {
        return actualCategoryIndex;
      }
      if (Number.isInteger(obj)) {
        return obj;
      } else {
        return indexForLabel(obj);
      }
    }

    /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
    var appendPictureWrapperToACat = function(catIndexOrLabelName, uuid, points, picture) {
      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);

      var wrapper = new PictureWrapper(uuid, points, picture);
      picturesWrappers[catIndex].push(wrapper);

      if (verbose) {
        console.log("CategoriesStorage: just appened a picture wrapper for the category \"" +
          labelForIndex(catIndex) + "\"");
      }
      if (!checkbox.checked) {
        CategoriesLayout.showPicturesForACat(picturesTakenForACat());
      }
    }


    var deleteAPictureWrapperFromACat = function(catIndexOrLabelName, listOfIndex) {

      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);
      var catLabel = labelForIndex(catIndex);

      listOfIndex.forEach(function(elementIndex){
        var imgId = picturesWrappers[catIndex][elementIndex].uuid;
        Firebase.deleteImage(imgId,catLabel, userId);
        picturesWrappers[catIndex].splice(elementIndex, 1);
      });

      if (verbose) {
        console.log("CategoriesStorage: just deleted some picture wrapper for the category " +
          catLabel + " : " + listOfIndex);
      }
      CategoriesLayout.showPicturesForACat(picturesTakenForACat());
    }

    /*Return all the pictures that were previously stored for a particula category*/
    var picturesTakenForACat = function(catIndexOrLabelName) {

      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);

      var picturesTaken = []
      picturesWrappers[catIndex].forEach(function(pw) {
        if (pw.picture) {
          picturesTaken.push(pw.picture)
        }
      })
      if (verbose) {
        console.log("CategoriesStorage: returning the pictures taken for category of index " + catIndex + "(" +
          picturesTaken.length + " pictures)");
      }
      return picturesTaken;
    }


    /*Return all the pictures that were previously stored for a particula category*/
    var pointsTakenForACat = function(catIndexOrLabelName) {

      var catIndex = getRealIndexFromNbOrString(catIndexOrLabelName);

      var pointsTaken = []
      picturesWrappers[catIndex].forEach(function(pw) {
        if (pw.points) {
          pointsTaken.push(pw.points)
        }
      })
      if (verbose) {
        console.log("CategoriesStorage: returning the points taken for category of index " + catIndex + "(" +
          pointsTaken.lenght + " points)");
      }
      return pointsTaken;
    }

    var getActualCategory = function() {
      return actualCategoryIndex < 0 ? null : categories[actualCategoryIndex];
    }

    var randomCategory = function() {
      var randomIndex = Math.floor(Math.random() * categories.length);
      return randomIndex;
    }

    var getCategorySuggestionFromServer = function() {
      return null;
    }

    var proposeNextCategory = function() {
      if (selector.selectedIndex != 0) {
        //manual propostion
        actualCategoryIndex = selector.selectedIndex - 1;
      } else if (checkbox.checked) {
        //propostion from the server
        var fromServer = getCategorySuggestionFromServer();
        if (Number.isInteger(fromServer)) {
          actualCategoryIndex = fromServer;
        } else {
          actualCategoryIndex = randomCategory();
        }
      } else {
        //no category
        actualCategoryIndex = -1;
      }
    }

    //-------------FROM HERE EVERYTHING ABOUT THE LAYOUT----------

    var selector = document.getElementById("categorySelector");
    var checkbox = document.getElementById("proposalModeCheckBox");
    checkbox.checked = true;


    categories.forEach(function(cat) {
      selector.insertAdjacentHTML("beforeend", '<option>' + cat.title + '</option>')
    })

    selector.addEventListener("change", function() {
      checkbox.checked = false
      proposeNextCategory();
      CategoriesLayout.displayCategory(getActualCategory());
      CategoriesLayout.showPicturesForACat(picturesTakenForACat());
    })

    checkbox.addEventListener("change", function() {
      selector.selectedIndex = 0
      proposeNextCategory();
      CategoriesLayout.displayCategory(getActualCategory());
      CategoriesLayout.hidePicturesTaken();
    })

    proposeNextCategory();
    CategoriesLayout.displayCategory(getActualCategory());

    


    return {
      categories: categories,
      appendPictureWrapperToACat: appendPictureWrapperToACat,
      deleteAPictureWrapperFromACat: deleteAPictureWrapperFromACat,
      picturesTakenForACat: picturesTakenForACat,
      pointsTakenForACat: pointsTakenForACat,
      getActualCategory: getActualCategory,
      proposeNextCategory: proposeNextCategory,
      setUserId: setUserId
    }

  })();

  CategoriesLayout.setCategoryStorage(CategoriesStorage);
  App.CategoriesStorage = CategoriesStorage;
  window.App = App;

})(window);
