(function(window) {
  'use strict';

  var App = window.App;

  var CategoriesStorage = (function() {
    var verbose = true;

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
    var picturesWrappers = [];
    var actualCategoryIndex = -1;

    var getCatLabels = function() {
      return categories.map(el => el.label)
    }

    /*Given a label name, outputs the integer in which to store these picturesWrappers*/
    var indexForLabel = function(label) {
      for (var i in categories) {
        if (categories[i].label == label) {
          return Number.parseInt(i);
        }
      }
      return -1;
    }

    var labelForIndex = function(index) {
      return categories[index].label
    }


    /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
    var appendPictureWrapperToACat = function(newWrapper) {

      picturesWrappers.push(newWrapper);

      if (verbose) {
        console.log("CategoriesStorage: just appened a picture wrapper for the category ",
          labelForIndex(newWrapper.catIndex));
      }
      App.CategoriesLayout.notifyNewPictureAvailable(newWrapper);
    }

    var deleteSomePictureFromACat = function(imageIdSet) {
      picturesWrappers = picturesWrappers.filter(wrapper => !imageIdSet.has(wrapper.imageId));
    }

    var wrappersTakenForACat = function(catIndexOrLabelName) {
      var catIndex = Number.isInteger(catIndexOrLabelName) ? catIndexOrLabelName : indexForLabel(catIndexOrLabelName);

      if(verbose){
        console.log("CategoriesStorage: will provide all wrappers for the category with index ", catIndex)
      }

      return picturesWrappers.filter(wrapper => wrapper.catIndex == catIndex);
    }

    var imgForId = function(imageId){
      return  picturesWrappers.filter(wrapper => wrapper.imageId == imageId)[0];
    }

    var getActualCategory = function() {
      return actualCategoryIndex < 0 ? null : categories[actualCategoryIndex];
    }

    var randomCategoryIndex = function() {
      return Math.floor(Math.random() * categories.length);
    }

    var getCategorySuggestionFromServer = function() {
      return null;
    }

    var proposeNextCategory = function() {
      if(categorySelector.selectedIndex == 0){
        //automatic suggestion
        var fromServerIndex = getCategorySuggestionFromServer();
        if (Number.isInteger(fromServerIndex)) {
          actualCategoryIndex = fromServerIndex;
        } else {
          actualCategoryIndex = randomCategoryIndex();
        }

      }else {
        //the user choosed the category to perform
        actualCategoryIndex = categorySelector.selectedIndex - 1;
      }
    }



    //-------------FROM HERE EVERYTHING ABOUT THE LAYOUT----------

    var categorySelector = document.getElementById("categorySelector");

    categories.forEach(function(cat) {
      categorySelector.insertAdjacentHTML("beforeend", '<option>' + cat.title + '</option>')
    })

    categorySelector.addEventListener("change", function() {
      proposeNextCategory();
      //TODO: no listener for the automatic propostion héhé
      App.CategoriesLayout.displayCategoryTitleAndPicture(getActualCategory());
      App.CategoriesLayout.displayAllPictures();
    })

    categorySelector.selectedIndex = 1
    proposeNextCategory();

    return {
      categories: categories,
      getCatLabels:getCatLabels,
      indexForLabel:indexForLabel,
      labelForIndex:labelForIndex,
      appendPictureWrapperToACat: appendPictureWrapperToACat,
      deleteSomePictureFromACat:deleteSomePictureFromACat,
      wrappersTakenForACat:wrappersTakenForACat,
      imgForId:imgForId,
      getActualCategory:getActualCategory,
      proposeNextCategory:proposeNextCategory
    }

  })();

  App.CategoriesStorage = CategoriesStorage;
  window.App = App;

})(window);
