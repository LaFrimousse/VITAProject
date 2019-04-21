(function(window) {
  'use strict';

  var App = window.App;
  var Firebase = App.Firebase;
  var Server = App.Server;

  var Download = (function() {
    var verbose = true;

    (function() {//init stuff?
      Firebase.getAllImagesMetaData().then(function(listMetaData) {
        //listMetaData.forEach(function(metaData){
        //  console.log(metaData);
        //});
        var metaData = listMetaData[0];
        Firebase.downloadImageAsBlob(metaData.catLabel, metaData.pictId, true).then(function(imageBlob){
          console.log(imageBlob);
        }).catch(function(error) {
          console.error(error);
        });


      }).catch(function(error) {
        console.error(error);
      });
    })();


    /*navigator.webkitPersistentStorage.requestQuota(1024 * 1024 * 1024, function() {
      window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024, SaveDatFileBro);
    })*/







  /*  var callback = function(response){
      console.log(response);
    }
    var myurl = "http://localhost:5000/process";
    Server.post(myurl, image, callback, true);*/



    return {}
  })();

  App.Download = Download;
  window.App = App;

})(window);
