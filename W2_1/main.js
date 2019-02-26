'use strict'

/*The 3 html objects that appear until now*/
let startStopRecordingButton = document.getElementById("startStopRecordingButton")
let mirrorVideoButton = document.getElementById("mirrorVideoButton")




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
