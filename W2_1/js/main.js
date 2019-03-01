'use strict'

/*The html objects that the user can interact with*/
var openCloseCameraButton = document.getElementById("startStopRecordingButton")
var mirrorVideoButton = document.getElementById("mirrorVideoButton")
var startStopTakingPicturesButton = document.getElementById("startStopTakingPictures")
var categorySelector = document.getElementById("categorySelector")

/*Other DOM elements*/
var categorySelectedImg = document.getElementById("categoryChoosenImg")

/*Some helpers variables*/
var timeIntervalBetweenPictures = 1000/*1 sec*/
var isActuallyTakingPicture = false
var pictureAutomaticInterval = null
var indexOfCategorySelected = -1


/*load the available categories in the selectcategories DOM element*/
categories.allCategories.forEach(function (cat) {
  categorySelector.insertAdjacentHTML("beforeend", '<option>'+cat.title+'</option>')
})

/*add an onchange event listener on the available categories selector*/
categorySelector.addEventListener("change", function(){
  /*update the actual selected index*/
  indexOfCategorySelected = categorySelector.selectedIndex-1
  /*change the image accordingly that show the category actually selected*/
  categorySelectedImg.setAttribute('src', categories.allCategories[indexOfCategorySelected].imageURL);
  /*set the startStopTakingPicturesButton visible if it was not before*/
  startStopTakingPicturesButton.style.visibility = "visible";
  /*stop to take pictures if the user was trying it...*/
  stopTakingPictures()
  /*load the previously taken photos*/

  var datas = categories.pictureTakenForACat(indexOfCategorySelected)
  loadPhotosToPictureTaken(datas)
});

/*open the camera and change the text of the openCloseCameraButton accordingly*/
var openCamera  = function(callback) {
  if(cameraModule.isCameraOpen){
    return
  }

  var cb = function(success){
    if(success){
      startStopRecordingButton.innerHTML = "close camera"
      if (typeof(callback) != "undefined"){
        callback(true)
      }
    }else{
      if (typeof(callback) != "undefined"){
        callback(false)
      }
    }
  }
  cameraModule.openCamera(cb)
}

/*close the camera and change the text of the openCloseCameraButton accordingly*/
var closeCamera  = function(callback) {
  if(!cameraModule.isCameraOpen){
    return
  }

  stopTakingPictures()

  var cb = function(success){
    if(success){
      startStopRecordingButton.innerHTML = "open camera"
      if (typeof(callback) != "undefined"){
        callback(true)
      }
    }else{
      if (typeof(callback) != "undefined"){
        callback(false)
      }
    }
  }
  cameraModule.closeCamera(cb)
}


/*add an event listener on the startStopRecordingButton to open or close the camera*/
startStopRecordingButton.addEventListener("click",  function(){
  if(!cameraModule.isCameraOpen){
    openCamera()
  }else{
    closeCamera()
  }
})

startStopTakingPicturesButton.addEventListener("click", function(){
  if(isActuallyTakingPicture){
    stopTakingPictures()
  }else{
    if(cameraModule.isCameraOpen){
      startTakingPictures()
    }else{
      var callback = function(success){
        if(success){
          startTakingPictures()
        }
      }
      openCamera(callback)
    }
  }
})

var startTakingPictures = function(){
  if(isActuallyTakingPicture){
    return
  }

isActuallyTakingPicture  = true
startStopTakingPicturesButton.innerHTML = "stop taking pictures"
console.log("starting to take pictures")
pictureAutomaticInterval = window.setInterval(function(){
  var data = cameraModule.takePicture()
  if(data != null){
    proceedPhotoTakenForCreatingTrainingSet(data)
  }
}, timeIntervalBetweenPictures);
}
var stopTakingPictures = function(){
  if(!isActuallyTakingPicture){
    return
  }
  isActuallyTakingPicture = false
  startStopTakingPicturesButton.innerHTML = "start taking pictures"
  console.log("stop taking pictures")
  window.clearInterval(pictureAutomaticInterval)
}


mirrorVideoButton.addEventListener("click", function(){
  if(videoElement.classList.contains("mirrored")){
    videoElement.classList.remove("mirrored");
  }else{
    videoElement.classList.add("mirrored");
  }
})

var proceedPhotoTakenForCreatingTrainingSet = function(data){
  var actualCategory = categories.allCategories[indexOfCategorySelected].title
  console.log("Should send a picture to the server now for the category " +actualCategory)
  categories.appendPictureToACat(indexOfCategorySelected, data)
  /*save the points from the server here also once you get the server answer*/
  addAPhotoToPicturesTaken(data)
}




var pictureTakenPerCategoryDiv = document.getElementById("pictureTakenPerCategory")

var addAPhotoToPicturesTaken = function(data){
  var newImg = document.createElement("img"); //Création d'un nouvel élément de type .ELEMENT_NODE
  newImg.src = data
  pictureTakenPerCategoryDiv.appendChild(newImg)
}

var loadPhotosToPictureTaken = function(datas){
  //empty the existing pictures
  while (pictureTakenPerCategoryDiv.firstChild) {
    pictureTakenPerCategoryDiv.removeChild(pictureTakenPerCategoryDiv.firstChild);
}
  if(Array.isArray(datas)){
    datas.forEach(function(data){
      addAPhotoToPicturesTaken(data)})

    }
  }
