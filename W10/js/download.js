(function(window) {
  'use strict';

  var App = window.App;
  var Firebase = App.Firebase;

  var Download = (function() {
    var verbose = true;

    (function() {//init stuff?
      Firebase.getAllImagesMetaData().then(function(listMetaData) {
        console.log(listMetaData);
      }).catch(function(error) {
        console.error(error);
      });
    })();



    return {}
  })();

  App.Download = Download;
  window.App = App;

})(window);
