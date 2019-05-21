(function(window) {
  'use strict';
  var App = window.App;
  var ConvNet = App.ConvNet;
  var CategoriesStorage = App.CategoriesStorage;
  var CategoriesLayout = App.CategoriesLayout;

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
      createMyModelButton.classList.remove("notDisplayed");
    }

    var notifyUserModelIsReady = function() {
      if (verbose) {
        console.log("ConvNetLayout: get notified that this user model is ready")
      }
    }

    changeModeButton.addEventListener("click", function() {
      isInRecoMode = !isInRecoMode;

      if(isInRecoMode){
        CategoriesLayout.hideGlobalWrapper();
      }else{
        if(!CategoriesStorage.isAutomaticCategoryProposal()){
          CategoriesLayout.showGlobalWrapper();
        }
      }
    });





    notifyGlobalModelIsReady();
    return {
      notifyGlobalModelIsReady: notifyGlobalModelIsReady,
      notifyUserModelIsReady: notifyUserModelIsReady,
    }
  })();
  App.ConvNetLayout = ConvNetLayout;
  window.App = App;
})(window);
