'use strict'

//tuto : https://www.html5rocks.com/en/tutorials/getusermedia/intro/


function hasGetUserMedia() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

if (!hasGetUserMedia()){
  alert('getUserMedia() is not supported by your browser');
  //maybe redirect or something else
}

//---------------------------------------------------------------------------

const constraints = {
  video: true
};
const vgaConstraints = {
  video: {width: {exact: 640}, height: {exact: 480}}
};
const hdConstraints = {
  video: {width: {min: 1280}, height: {min: 720}}
};


/*The 3 html objects that appear until now*/
let videoElement = document.getElementById("videoElement")
let startStopRecordingButton = document.getElementById("startStopRecordingButton")
let mirrorVideoButton = document.getElementById("mirrorVideoButton")

//helper variable
let isFilming = false


startStopRecordingButton.addEventListener("click", function(){
  if(isFilming){
    stopToFilm()
  }else{
    startToFilm()
  }
})

mirrorVideoButton.addEventListener("click", function(){
  if(videoElement.classList.contains("mirrored")){
    videoElement.classList.remove("mirrored");
  }else{
    videoElement.classList.add("mirrored");
  }
})


function startToFilm(){
  /*With the following three lines of code we can already film ourself */



  navigator.mediaDevices.getUserMedia(constraints).//or vgaConstraints or hd Constraints
    then((stream) => {
      videoElement.srcObject = stream
      startStopRecordingButton.innerHTML = "Close camera";
      isFilming = true
    }).catch(function (error) {
       console.log("Promise Rejected", error);
  });
}

function stopToFilm(){
  let stream = videoElement.srcObject;
  let tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  });

  videoElement.srcObject = null;
  isFilming = false
  startStopRecordingButton.innerHTML = "Open camera";
}





  /* const videoElement = document.querySelector('video');
const audioSelect = document.querySelector('select#audioSource');
const videoSelect = document.querySelector('select#videoSource');

navigator.mediaDevices.enumerateDevices()
  .then(gotDevices).then(getStream).catch(handleError);

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label ||
        'microphone ' + (audioSelect.length + 1);
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' +
        (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Found another kind of device: ', deviceInfo);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  const constraints = {
    audio: {
      deviceId: {exact: audioSelect.value}
    },
    video: {
      deviceId: {exact: videoSelect.value}
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

function handleError(error) {
  console.error('Error: ', error);
}*/
