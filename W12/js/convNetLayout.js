(function(window) {
  'use strict';
  var App = window.App;
  var ConvNet = App.ConvNet;
  var CategoriesStorage = App.CategoriesStorage;
  var CategoriesLayout = App.CategoriesLayout;
  var RecordsButtons = App.RecordsButtons;

  var ConvNetLayout = (function() {
    var verbose = true;
    var isInRecoMode = false;

    var changeModeButton = document.getElementById("changeModeButton");
    var createMyModelButton = document.getElementById("createMyModel");

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

    var getRecoMode = function(){
      return isInRecoMode;
    }

    changeModeButton.addEventListener("click", function() {
      isInRecoMode = !isInRecoMode;

      if(isInRecoMode){
        createMyModelButton.classList.remove("notDisplayed");
        changeModeButton.innerHTML = "Training Mode"
        CategoriesLayout.hideGlobalWrapper();
        RecordsButtons.hideElements();
        App.CameraEvents.stopTakingPicture();
        CategoriesLayout.displayCategoryTitleAndPicture()
        document.getElementById("categorySelector").classList.add("notDisplayed");
      }else{
          changeModeButton.innerHTML = "Recognition Mode"
        if(!CategoriesStorage.isAutomaticCategoryProposal()){
          CategoriesLayout.showGlobalWrapper();
        }
        createMyModelButton.classList.add("notDisplayed");
        RecordsButtons.showElements();
        CategoriesLayout.displayCategoryTitleAndPicture(CategoriesStorage.getActualCategory());
        document.getElementById("categorySelector").classList.remove("notDisplayed");
      }
    });



    createMyModelButton.addEventListener("click", function() {
      ConvNet.trainUserModel();
    });


    return {
      isInRecoMode:getRecoMode,
      notifyGlobalModelIsReady: notifyGlobalModelIsReady,
      notifyUserModelIsReady: notifyUserModelIsReady,
    }
  })();
  App.ConvNetLayout = ConvNetLayout;
  window.App = App;
})(window);
