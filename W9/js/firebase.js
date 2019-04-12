(function(window) {
  'use strict';

  var App = window.App || {};

  var Firebase = (function() {
    var verbose = true;

    console.log("Fire loaded");
    var storage = firebase.storage();
    var storageRef = storage.ref();
    var imagesRef = storageRef.child('images');
    var spaceRef = storageRef.child('images/space.jpg');



    var putFile = function(file) {
      spaceRef.put(file).then(function(snapshot) {
        console.log('Uploaded a blob or file!');
        console.log(snapshot);
      });
    }

    var getFile = function(ref) {

    }

    document.addEventListener("keypress", function(e) {
      if (e.charCode == 32) { //SPACE
        var imageForCat = document.getElementById("postureToAdoptImg");
        putFile(imageForCat.src)
      }
    });

    return {
      verbose: verbose,
      putFile:putFile
    }
  })();

  App.Firebase = Firebase;
  window.App = App;

})(window);
