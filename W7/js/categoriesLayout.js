(function(window) {
  'use strict';

  var App = window.App || {};

  var CategoriesLayout = (function() {

    var wrapper = document.getElementsByClassName("categoryDisplayWrapper")[0];
    var imageForCat = document.getElementById("postureToAdoptImg");
    var title = document.getElementById("postureToAdaptTitle");


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

    var displayCategory = function(cat){
      var initialTitle = "No category actually proposed"
      var initialImgSrc = "images/questionMark.jpg"
      if(cat != null){
        initialTitle = cat.title
        initialImgSrc = cat.imageURL
      }
      title.innerHTML = initialTitle;
      imageForCat.src = initialImgSrc;
    }

    var showPicturesForACat = function(){

    }

    var hidePicturesForACat = function(){

    }

    var appendAPictureToTheOneDisplayed = function(img){

    }









    return {
      displayCategory:displayCategory,
      showElements:showElements,
      hideElements:hideElements
    }
  })();
  App.CategoriesLayout = CategoriesLayout;
  window.App = App;
})(window);
