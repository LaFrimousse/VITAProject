(function(window) {
  'use strict';
  var App = window.App;
  var ConvNet = App.ConvNet;
  var CategoriesStorage = App.CategoriesStorage;
  var CategoriesLayout = App.CategoriesLayout;
  var CameraLayout = App.CameraLayout;
  var RecordsButtons = App.RecordsButtons;
  var Helper = App.Helper;

  var ConvNetLayout = (function() {
    var verbose = true;
    var isInRecoMode = false;

    var LIMIT_TO_SHOW_RECO_IMG = 0.3;

    var changeModeButton = document.getElementById("changeModeButton");
    var createMyModelButton = document.getElementById("createMyModel");
    var probabilitiesDisplayer = document.getElementById("probabilitiesDisplayer");
    var leftPict = document.getElementById("firstPictureReco");
    var rightPict = document.getElementById("secondPictureReco");

    var notifyGlobalModelIsReady = function() {
      if (verbose) {
        console.log("ConvNetLayout: get notified that the global model is ready")
      }
      changeModeButton.classList.remove("notDisplayed");
    }

    var notifyUserModelIsReady = function() {
      if (verbose) {
        console.log("ConvNetLayout: get notified that this user model is ready")
      }
    }

    var getRecoMode = function() {
      return isInRecoMode;
    }

    var willDisplayRecoResult = function(result, url1, url2) {
      result.data().then(function(arr) {
        if (isInRecoMode) {
          displayRecoResult(arr, url1, url2);
        }
      });
    }

    var displayRecoResult = function(result, url1, url2) {
      if (verbose) {
        console.log("ConvNetLayout: will display a recognition result ", result);
      }
      var resultWithLabel = App.CategoriesStorage.getCatLabels().map(function(label, index) {
        return {
          label: label,
          proba: result[index]
          }
      });
      resultWithLabel.sort(function(a, b){
        return b.proba - a.proba
      });
      var catFound = resultWithLabel[0].label;
      var catProb = resultWithLabel[0].proba;

      probabilitiesDisplayer.innerHTML = "";
      resultWithLabel.forEach(function(el,i){
        probabilitiesDisplayer.innerHTML +="<p> <strong>"+(i+1)+") " + el.label + ":</strong>  " +
          Number.parseFloat(el.proba).toFixed(3)
         + "</p>"
      })

      var img = "images/questionMark.jpg";
      if(catProb>=LIMIT_TO_SHOW_RECO_IMG){
        var index = App.CategoriesStorage.indexForLabel(catFound)
        img = App.CategoriesStorage.categories[index].imageURL;
      }
      document.getElementById("postureToAdoptImg").src = img;
      if(url1){
        leftPict.src = url1
      }
      if(url2){
        rightPict.src = url2
      }

    }


    changeModeButton.addEventListener("click", function() {
      isInRecoMode = !isInRecoMode;

      if (isInRecoMode) {
        createMyModelButton.classList.remove("notDisplayed");
        changeModeButton.innerHTML = "Training Mode"
        CategoriesLayout.hideGlobalWrapper();
        RecordsButtons.hideElements();
        App.CameraEvents.stopTakingPicture();
        CameraLayout.hideElement("closeCameraButton");
        CategoriesLayout.displayCategoryTitleAndPicture()
        document.getElementById("categorySelector").classList.add("notDisplayed");
        document.getElementById("probabilitiesDisplayer").classList.remove("notDisplayed");
        document.getElementById("probaTitle").classList.remove("notDisplayed");
        document.getElementById("firstPictureReco").classList.remove("notDisplayed");
        document.getElementById("secondPictureReco").classList.remove("notDisplayed");
      } else {
        changeModeButton.innerHTML = "Recognition Mode"
        if (!CategoriesStorage.isAutomaticCategoryProposal()) {
          CategoriesLayout.showGlobalWrapper();
        }
        createMyModelButton.classList.add("notDisplayed");
        RecordsButtons.showElements();
        CategoriesLayout.displayCategoryTitleAndPicture(CategoriesStorage.getActualCategory());
        document.getElementById("categorySelector").classList.remove("notDisplayed");
        document.getElementById("probabilitiesDisplayer").classList.add("notDisplayed");
        document.getElementById("probaTitle").classList.add("notDisplayed");
        document.getElementById("firstPictureReco").classList.add("notDisplayed");
        document.getElementById("secondPictureReco").classList.add("notDisplayed");


      }
      CameraLayout.replaceButtonInVideoElement();
    });



    createMyModelButton.addEventListener("click", function() {
      ConvNet.trainUserModel();
    });

    var fakeResult = [0.12454298138618469, 0.2329123467206955, 0.14344632625579834, 0.12855647504329681, 0.37054187059402466];

    displayRecoResult(fakeResult, null);
    notifyGlobalModelIsReady();
    window.setTimeout(function(){
      //changeModeButton.click();
    }, 500)


    return {
      isInRecoMode: getRecoMode,
      notifyGlobalModelIsReady: notifyGlobalModelIsReady,
      notifyUserModelIsReady: notifyUserModelIsReady,
      displayRecoResult: willDisplayRecoResult,
    }
  })();
  App.ConvNetLayout = ConvNetLayout;
  window.App = App;
})(window);
