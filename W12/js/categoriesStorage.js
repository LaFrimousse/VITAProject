(function(window) {
  'use strict';
  var App = window.App || {};
  var CategoriesStorage = (function() {
    var verbose = false;

    var categories = [{
        "title": "Strech out your arms",
        "label": "arms_outstreched",
        "imageURL": "images/arms_outstreched.png"
      },
      {
        "title": "Put one arm up, the other down",
        "label": "everyone_stop",
        "imageURL": "images/everyone_stop.png"
      },
      {
        "title": "Put your arms at 90 degrees",
        "label": "90_degrees",
        "imageURL": "images/90_degrees.png"
      },
      {
        "title": "Please slow down",
        "label": "slow_down",
        "imageURL": "images/slow_down.png"
      },
      {
        "title": "Please stop and park",
        "label": "stop_and_park",
        "imageURL": "images/stop_and_park.png"
      }
    ]

    /*Given a label name, outputs the integer in which to store these picturesWrappers*/
    var indexForLabel = function(label) {
      for (var i in categories) {
        if (categories[i].label == label) {
          return i;
        }
      }
      return -1;
    }

    var labelForIndex = function(index) {
      return categories[index].label
    }

    return {
      indexForLabel: indexForLabel,
      labelForIndex:labelForIndex,
    }

  })();
  App.CategoriesStorage = CategoriesStorage;
  window.App = App;
})(window);
