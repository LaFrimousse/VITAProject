(function(window) {
  'use strict';

  var App = window.App;
  var CategoriesManager = App.CategoriesManager;
  var CameraManager = App.CameraManager;

  var StateEnum = Object.freeze({
    INITIAL: 0,
    CATEGORY_CHOOSEN: 1,
    TAKING_PICTURE: 2
  });

  var actualState = StateEnum.INITIAL;

  /*The kind of interaction that can make a change in this state machine*/
  var UserInteraction = Object.freeze({
    OPEN_OR_CLOSE_CAMERA: 0,
    START_STOP_TAKING_PICTURE: 1,
    CATEGORY_SELECTOR: 2
  });

  var verbose = true

  /*The html objects that the user can interact with and can potentially change the state of this big state machine*/
  var openCloseCameraButton = document.getElementById("openCloseCameraButton")
  var startStopTakingPicturesButton = document.getElementById("startStopTakingPictures")
  var categorySelector = document.getElementById("categorySelector")

  function userInteractionCaptured(interaction) {
    if (verbose) {
      console.log("Interaction " + Object.keys(UserInteraction)[interaction] + " captured in " + Object.keys(StateEnum)[actualState] + " state")
    }

    switch (actualState) {


      case StateEnum.INITIAL:
        switch (interaction) {

          case UserInteraction.CATEGORY_SELECTOR:
            CameraManager.showReadyToRecordButton();
            actualState = StateEnum.CATEGORY_CHOOSEN;
            break;

          default:
            break;
        }
        break;


      case StateEnum.CATEGORY_CHOOSEN:
        switch (interaction) {

          case UserInteraction.START_STOP_TAKING_PICTURE:
            CameraManager.startTakingPictures(1000, function(data) {
              if(verbose){
                console.log("a data has been received in main.js")
              }
            })
            actualState = StateEnum.TAKING_PICTURE;
            break;
          default:

        }
        break;


      case StateEnum.TAKING_PICTURE:
        switch (interaction) {

          case UserInteraction.OPEN_OR_CLOSE_CAMERA:
          case UserInteraction.START_STOP_TAKING_PICTURE:
            CameraManager.stopTakingPictures()
            actualState = StateEnum.CATEGORY_CHOOSEN;
            break;
          default:

        }

        break;
      default:

    }

    if (verbose) {
      console.log("You are now in the state " + Object.keys(StateEnum)[actualState])
    }
  }

  /*add an onchange event listener on the available categories selector*/
  categorySelector.addEventListener("change", function() {
    userInteractionCaptured(UserInteraction.CATEGORY_SELECTOR);
  });

  /*add an event listener on the openCloseCameraButton to open or close the camera*/
  openCloseCameraButton.addEventListener("click", function() {
    userInteractionCaptured(UserInteraction.OPEN_OR_CLOSE_CAMERA);
  })

  /*add an event listener on the startStopTakingPicturesButton to open or close the camera*/
  startStopTakingPicturesButton.addEventListener("click", function() {
    userInteractionCaptured(UserInteraction.START_STOP_TAKING_PICTURE);
  })


  //------------the rest has nothing to do here !!!






  var proceedPhotoTakenForCreatingTrainingSet = function(data) {
    var actualCategory = categoriesStorage.allCategories[indexOfCategorySelected].title
    console.log("Should send a picture to the server now for the category " + actualCategory)
    categoriesStorage.appendPictureToACat(indexOfCategorySelected, data)
    /*save the points from the server here also once you get the server answer*/
    addAPhotoToPicturesTaken(data)
  }

  var addAPhotoToPicturesTaken = function(data) {
    var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
    newImg.src = data
    //pictureTakenPerCategoryDiv.appendChild(newImg)
  }


})(window);
