'use strict'

/*The 3 html objects that appear until now*/
var startStopRecordingButton = document.getElementById("startStopRecordingButton")
var mirrorVideoButton = document.getElementById("mirrorVideoButton")
var takePictureButton = document.getElementById("takePicture")
var photo = document.getElementById("monImage")




startStopRecordingButton.addEventListener("click", function(){
  var nextText = cameraModule.isCameraOpen ? "open camera" : "close camera"
  var cb =function(success){
    if(success){
      startStopRecordingButton.innerHTML = nextText
    }
  }
  if(cameraModule.isCameraOpen){
    cameraModule.closeCamera(cb)
  }else{
    cameraModule.openCamera(cb)
  }
})


mirrorVideoButton.addEventListener("click", function(){
  if(videoElement.classList.contains("mirrored")){
    videoElement.classList.remove("mirrored");
  }else{
    videoElement.classList.add("mirrored");
  }
})

takePictureButton.addEventListener("click", function(){
  var data = cameraModule.takePicture()
  if(data != null){
    photo.setAttribute('src', data);
  }

})
