'use strict'

/*The html objects that the user can interact with*/
var openCloseCameraButton = document.getElementById("openCloseCameraButton")
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
categoriesStorage.allCategories.forEach(function (cat) {
  categorySelector.insertAdjacentHTML("beforeend", '<option>'+cat.title+'</option>')
})

/*add an onchange event listener on the available categories selector*/
categorySelector.addEventListener("change", function(){
  /*update the actual selected index*/
  indexOfCategorySelected = categorySelector.selectedIndex-1
  /*change the image accordingly that show the category actually selected*/
  categorySelectedImg.setAttribute('src', categoriesStorage.allCategories[indexOfCategorySelected].imageURL);
  /*set the startStopTakingPicturesButton visible if it was not before*/
  startStopTakingPicturesButton.style.visibility = "visible";
  /*stop to take pictures if the user was trying it...*/
  stopTakingPictures()
  /*load the previously taken photos*/

  var datas = categoriesStorage.pictureTakenForACat(indexOfCategorySelected)
  loadPhotosToPictureTaken(datas)
});

/*open the camera and change the text of the openCloseCameraButton accordingly*/
var openCamera  = function(callback) {
  if(cameraModule.isCameraOpen){
    return
  }

  var cb = function(success){
    if(success){
      openCloseCameraButton.src = "images/closeCameraButton.png"
      if(!openCloseCameraButton.classList.contains("alpha08")){
        openCloseCameraButton.classList.add("alpha08");
      }

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
      openCloseCameraButton.src = "images/openCameraButton.png"
      if(openCloseCameraButton.classList.contains("alpha08")){
        openCloseCameraButton.classList.remove("alpha08");
      }
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


/*add an event listener on the openCloseCameraButton to open or close the camera*/
openCloseCameraButton.addEventListener("click",  function(){
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
  if(mirrorVideoButton.classList.contains("mirrored")){
    mirrorVideoButton.classList.remove("mirrored");
  }else{
    mirrorVideoButton.classList.add("mirrored");
  }
})

var proceedPhotoTakenForCreatingTrainingSet = function(data){
  var actualCategory = categoriesStorage.allCategories[indexOfCategorySelected].title
  console.log("Should send a picture to the server now for the category " +actualCategory)
  categoriesStorage.appendPictureToACat(indexOfCategorySelected, data)
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

  for (var i = 0; i<100;i++){
    addAPhotoToPicturesTaken("images/cat0.png")
  }
