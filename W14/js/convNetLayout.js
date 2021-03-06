/*Deals with the event that are triggered when the user press a button in the top bar. that's when he wants to enter or leave the "recognition mode", change the model used, and so on.*/
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
    var verbose = false;
    var isInRecoMode = false;

    /*in "recognition mode", if the neural nework didn't find a category with equal or higher proba, then the question mark is displayed as category. */
    var LIMIT_TO_SHOW_RECO_IMG = 0.3;

    var changeModeButton = document.getElementById("changeModeButton");
    var createMyModelButton = document.getElementById("createMyModel");
    var probabilitiesDisplayer = document.getElementById("probabilitiesDisplayer");
    var leftPict = document.getElementById("firstPictureReco");
    var rightPict = document.getElementById("secondPictureReco");
    var modelInfoP = document.getElementById("infoAboutModelP");
    var changeModelButton = document.getElementById("changeModelButton");

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
      changeModelButton.classList.remove("notDisplayed");
      getTextForInfoP();
    }

    var getTextForInfoP = function(){
      var text = "You're using your model"
      if(!ConvNet.isUserModelUsed()){
        text = "You're using the global model"
      }
      modelInfoP.innerHTML = text
    }

    var getRecoMode = function() {
      return isInRecoMode;
    }

    var willDisplayRecoResult = function(result, url1, url2) {
      if (result) {
        result.data().then(function(arr) {
          if (isInRecoMode) {
            displayRecoResult(arr, url1, url2);
          }
        });
      } else {
        var len = App.CategoriesStorage.categories.length;
        displayRecoResult(null, url1, url2);
      }

    }

    var displayRecoResult = function(result, url1, url2) {
      if (verbose) {
        console.log("ConvNetLayout: will display a recognition result ", result);
      }
      probabilitiesDisplayer.innerHTML = "";
      if (result) {
        var resultWithLabel = App.CategoriesStorage.getCatLabels().map(function(label, index) {
          return {
            label: label,
            proba: result[index]
          }
        });
        resultWithLabel.sort(function(a, b) {
          return b.proba - a.proba
        });
        var catFound = resultWithLabel[0].label;
        var catProb = resultWithLabel[0].proba;



        resultWithLabel.forEach(function(el, i) {
          probabilitiesDisplayer.innerHTML += "<p> <strong>" + (i + 1) + ") " + el.label + ":</strong>  " +
            Number.parseFloat(el.proba).toFixed(3) +
            "</p>"
        })

      }

      var img = "images/questionMark.jpg";
      if (catProb >= LIMIT_TO_SHOW_RECO_IMG) {
        var index = App.CategoriesStorage.indexForLabel(catFound)
        img = App.CategoriesStorage.categories[index].imageURL;
      }
      document.getElementById("postureToAdoptImg").src = img;
      if (url1) {
        leftPict.src = url1
        leftPict.classList.remove("notDisplayed");
      }
      if (url2) {
        rightPict.src = url2
        rightPict.classList.remove("notDisplayed");
      }


      CameraLayout.replaceButtonInVideoElement()

    }


    changeModeButton.addEventListener("click", function() {
      //deal with the UI
      isInRecoMode = !isInRecoMode;


      if (isInRecoMode) {
        if(!App.Camera.isCameraOpen()){
          App.CameraEvents.userClickedRedButton(false)
        }
        createMyModelButton.classList.remove("notDisplayed");
        modelInfoP.classList.remove("notDisplayed");
        getTextForInfoP();
        if(ConvNet.userModelWasAlreadyTrained()){
          changeModelButton.classList.remove("notDisplayed");
        }
        changeModeButton.innerHTML = "Training Mode"
        CategoriesLayout.hideGlobalWrapper();
        document.getElementById("saveFBWrapper").classList.add("notDisplayed");
        RecordsButtons.hideElements();
        App.CameraEvents.stopTakingPicture();
        CameraLayout.hideElement("closeCameraButton");
        CategoriesLayout.displayCategoryTitleAndPicture()
        document.getElementById("categorySelector").classList.add("notDisplayed");
        document.getElementById("probabilitiesDisplayer").classList.remove("notDisplayed");
        document.getElementById("probaTitle").classList.remove("notDisplayed");
      } else {
        probabilitiesDisplayer.innerHTML = "";
        changeModeButton.innerHTML = "Recognition Mode"
        if (!CategoriesStorage.isAutomaticCategoryProposal()) {
          CategoriesLayout.showGlobalWrapper();
        }
        document.getElementById("saveFBWrapper").classList.remove("notDisplayed");
        createMyModelButton.classList.add("notDisplayed");
        modelInfoP.classList.add("notDisplayed");
        changeModelButton.classList.add("notDisplayed");
        RecordsButtons.showElements();
        CameraLayout.showElement("closeCameraButton");
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
      if(ConvNet.userModelWasAlreadyTrained()){
        if(!tfvis.visor().isOpen()){
          tfvis.visor().open();
        }
      }

    });

    changeModelButton.addEventListener("click", function() {
      ConvNet.changeUsedModel();
      getTextForInfoP();
    })


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
