(function(window) {
  'use strict'

  var Server = (function() {
    var verbose = true
    var URL = "blablabla"

    /*The callback contains the points calculated by the server*/
    var getPointsForImage = function(image, callback){
      if(verbose){
        console.log("Server: will ask the server for the point in an image but now faking an answer")
        callback([])
      }
    }

    return {
      getPointsForImage: getPointsForImage
    }
  })();


  App.Server = Server;
  window.App = App;
})(window);
