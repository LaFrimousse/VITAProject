(function(window) {
  'use strict';

  var App = window.App;
  var CategoriesManager = App.CategoriesManager;
  var CameraManager = App.CameraManager;
  var Server = App.Server;
  var PointsDrawing = App.PointsDrawing;

  var StateEnum = Object.freeze({
    INITIAL: 0,//when the user open the app
    CATEGORY_CHOOSEN: 1,//when the user has choosen a category
    TAKING_PICTURE: 2,//when the user is taking picture for a category he choodes
    TRAINING_SET_FOR_SERVER:3/*when the server coninuously ask the user to take new pictures for any posture in order to increase his training set*/
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
              var callback = function(pointsFromServer){
                if(pointsFromServer == 'undefined' || pointsFromServer == null){
                  log.console.error("Main: the server was not able to proceed an image and turning back an array of points as expected");
                }else{
                  PointsDrawing.addPointsInImage(data,points, function(data){
                    CategoriesManager.appendPictureToACat(data);
                    CategoriesManager.appendPointsToACat(pointsFromServer);
                  })

                }
              }
              Server.getPointsForImage(data,callback)
            })
            CategoriesManager.hideElements()
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
            CategoriesManager.showElements()
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



  var points = [
    [50, 150, 3],
    [150, 50, 3],
    [25, 45, 3],
    [2, 0, 3]
  ]

  App.PointsDrawing.addPointsOverVideo(points)







})(window);
