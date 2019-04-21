(function(window) {
  'use strict'

  var App = window.App || {};
  
  var Server = (function() {
    var verbose = true
    var URL = "http://localhost:8080/TestGetRessources/myText.txt"


    function ajaxGet(url, callback) {
      var req = new XMLHttpRequest();
      req.open("GET", url);
      req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
          // Appelle la fonction callback en lui passant la réponse de la requête
          callback(req.responseText);
        } else {
          console.error(req.status + " " + req.statusText + " " + url);
        }
      });
      req.addEventListener("error", function() {
        console.error("Erreur réseau avec l'URL " + url);
      });
      req.send(null);
    }



    var post = function(url, data, callback, isJson) {
      var req = new XMLHttpRequest();
      req.open("GET", url);
      req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
          //all is okay
          callback(req.responseText);
        } else {
          console.error("Server: an ajax request failed " + req.status + " " + req.statusText + " " + url);
        }
      });

      req.addEventListener("error", function() {
        console.error("Server: Network failure with url " + url);
      });
      if (isJson) {
        // Définit le contenu de la requête comme étant du JSON
        req.setRequestHeader("Content-Type", "application/json")
        // Transforme la donnée du format JSON vers le format texte avant l'envoi
        data = JSON.stringify(data);
      }
      req.send(data);
    }




    /*console.log("here we go")
        ajaxGet(URL, function(data){
          console.log(data)
        })*/




    /*The callback contains the points calculated by the server*/
    var getPointsForImage = function(image, callback) {
      if (verbose) {
        console.log("Server: will ask the server for the point in an image but now faking an answer")
        callback([])
      }
    }

    return {
      getPointsForImage: getPointsForImage,
      post: post
    }
  })();


  App.Server = Server;
  window.App = App;
})(window);
