(function(window) {
  'use strict';

  var App = window.App || {};

  var Firebase = (function() {
    var verbose = true;

    var storage = firebase.storage();
    var storageRef = storage.ref();
    var imagesRef = storageRef.child('images');
    var spaceRef = storageRef.child('images/space.jpg');



    var putFile = function(arrayPath, file) {
      var newRef = storageRef;
      for (var i in arrayPath){
        newRef = newRef.child(arrayPath[i]);
      }
      newRef.put(file).then(function(snapshot) {
        console.log('Firebase: Uploaded a blob or file in Firebase!');
      });
    }

    var getFile = function(ref) {

    }


    return {
      verbose: verbose,
      putFile:putFile
    }
  })();

  App.Firebase = Firebase;
  window.App = App;

})(window);
