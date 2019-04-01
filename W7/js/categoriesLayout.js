//the title of the posture to take
var postureToAdaptTitle = document.getElementById("postureToAdaptTitle");
var postureToAdoptImg = document.getElementById("postureToAdoptImg");

var setTitle = function(newTitle) {
  if (newTitle) {
    postureToAdaptTitle.innerHTML = newTitle;
    show(postureToAdaptTitle);
  } else {
    hide(postureToAdaptTitle);
  }
}


var setGestureImg = function(src) {
  postureToAdoptImg.src = src;
}
