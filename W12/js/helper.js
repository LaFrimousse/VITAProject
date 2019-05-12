(function(window) {
  'use strict';

  var App = window.App || {};

  var Helper = (function() {
    var verbose = false;

    var setCookie = function(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      if(verbose){
        console.log("Helper: just setted a cookie");
      }
    }

    var getCookie = function(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie); //to handle cookies with special characters, e.g. '$'
      var ca = decodedCookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return null;
    }

    var UUID = function() {
      //https://codepen.io/Jvsierra/pen/BNbEjW
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }


    return {
      setCookie: setCookie,
      getCookie: getCookie,
      UUID: UUID
    }
  })();
  App.Helper = Helper;
  window.App = App;
})(window);
