/*Provides the ajax post methods as well as a constant to change the URL of the pif paf algo to use*/
(function(window) {
  'use strict'

  var App = window.App || {};

  var Server = (function() {
    var verbose = true

    var URL_PIF_PAF = "http://localhost:5000/process";

    var post = function(url, data, callback, isJson) {
      var req = new XMLHttpRequest();
      req.open("POST", url);
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
      if (isJson) {
        // Définit le contenu de la requête comme étant du JSON
        req.setRequestHeader("Content-Type", "application/json")
        // Transforme la donnée du format JSON vers le format texte avant l'envoi
        data = JSON.stringify(data);
      }
      req.send(data);
    }

    var postPromise = function(url, data, isJson) {

      var promise = new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("POST", url);
        req.addEventListener("load", function() {

          if (req.status >= 200 && req.status < 400) {
            // Appelle la fonction callback en lui passant la réponse de la requête

            var answer = {
              pointsText : req.responseText,
              forImg: data,
            }
            resolve(answer);
          } else {
            reject(req.status + " " + req.statusText + " " + url);
          }
        });
        req.addEventListener("error", function(e) {
          reject(e);
        });
        if (isJson) {
          // Définit le contenu de la requête comme étant du JSON
          req.setRequestHeader("Content-Type", "application/json")
          // Transforme la donnée du format JSON vers le format texte avant l'envoi
          data = JSON.stringify(data);
        }
        req.send(data);

      });
      return promise;
    }


    /*The callback contains the points calculated by the server*/

    var requestPifPafForPoints = function(image) {
      return postPromise(URL_PIF_PAF, image, true);
    }

    return {
      requestPifPafForPoints: requestPifPafForPoints,
      post: post
    }
  })();


  App.Server = Server;
  window.App = App;
})(window);
