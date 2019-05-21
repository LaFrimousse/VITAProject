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

    var displayRecoResult = function(result, forPicture){
      console.log(forPicture)
      result.data().then(function(arr){
        if(isInRecoMode){
          if(verbose){
            console.log("ConvNetLayout: will display a recognition result ", arr);
          }
          //suite ici
        }
      });
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

    var fakeResult = [0.12454298138618469, 0.2329123467206955, 0.14344632625579834, 0.12855647504329681, 0.37054187059402466];


    return {
      isInRecoMode:getRecoMode,
      notifyGlobalModelIsReady: notifyGlobalModelIsReady,
      notifyUserModelIsReady: notifyUserModelIsReady,
      displayRecoResult: displayRecoResult,
    }
  })();
  App.ConvNetLayout = ConvNetLayout;
  window.App = App;
})(window);
