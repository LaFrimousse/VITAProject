(function(window) {
  'use strict';

  var App = window.App || {};

  var verbose = true

  function guid() {
    //https://codepen.io/Jvsierra/pen/BNbEjW
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }


  function PictureWrapper(uuid, points, picture) {
    var myUid = null;
    if (uuid) {
      myUid = uuid;
    } else {
      myUid = guid();
    }
    this.uuid = myUid;
    this.points = points;
    this.picture = picture;
  }

  /*return an empty 2d array of same lenght than allcategories, in order to add pictures and point later at the same indexes than the categories allows to*/
  function empty2DArray(categories) {
    var emptyArray = []
    categories.forEach(function(element) {
      emptyArray.push([])
    })
    return emptyArray
  }


  function CategoriesStorage() {
    this.categories = [{
        "title": "Strech out your arms",
        "label": "arms_outstreched",
        "imageURL": "images/arms_outstreched.png"
      },
      {
        "title": "Put one arm up, the other down",
        "label": "arm_up_arm_down",
        "imageURL": "images/arm_up_arm_down.png"
      },
      {
        "title": "Put your arms down",
        "label": "arms_down",
        "imageURL": "images/arms_down.png"
      },
      {
        "title": "Make a roof",
        "label": "arms_roof",
        "imageURL": "images/arms_roof.png"
      },
      {
        "title": "Put your hands up (in the air)",
        "label": "arms_up",
        "imageURL": "images/arms_up.png"
      }
    ]

    /*empty initialized*/
    this.picturesWrappers = empty2DArray(this.categories);

    if (verbose) {
      console.log("Categories: just initialized a new categoriesStorage instance");
    }
  }

  /*Given a label name, outputs the integer in which to store these picturesWrappers*/
  CategoriesStorage.prototype.indexForLabel = function(label) {
    for (var i in this.categories){
      if(this.categories[i].label == label){
        return i;
      }
    }
    return -1;
  }

  CategoriesStorage.prototype.labelForIndex = function(index) {
    return this.categories[index].label
  }

  /* When the camera module took a picture, we can decide to save it in this class under a particular category*/
  CategoriesStorage.prototype.appendPictureWrapperToACat = function(catIndexOrLabelName, uuid, points, picture) {
    var catIndex = -1;
    if (Number.isInteger(catIndexOrLabelName)){
      catIndex = catIndexOrLabelName;
    }else{
      catIndex = this.indexForLabel(catIndexOrLabelName);
    }

    var wrapper = new PictureWrapper(uuid, points, picture);


    this.picturesWrappers[catIndex].push(wrapper)
    if (verbose) {
      console.log("Categories: just appened a picture wrapper for the category \""
      + this.labelForIndex(catIndex)+"\"");
    }
  }


  CategoriesStorage.prototype.deleteAPictureWrapperFromACat = function(catIndexOrLabelName, elementIndex) {
    var catIndex = -1;
    if (Number.isInteger(catIndexOrLabelName)){
      catIndex = catIndexOrLabelName;
    }else{
      catIndex = this.indexForLabel(catIndexOrLabelName);
    }
    this.picturesWrappers[catIndex].splice(elementIndex, 1);
    if (verbose) {
      console.log("Categories: just deleted a picture wrapper for the category \""
      + this.labelForIndex(catIndex)+"\"");
    }
  }


  /*Return all the pictures that were previously stored for a particula category*/
  CategoriesStorage.prototype.pictureTakenForACat = function(catIndex) {

    var picturesTaken = []
    this.picturesWrappers[catIndex].forEach(function(pw){
      if(pw.picture){
        picturesTaken.push(pw.picture)
      }
    })
    if (verbose) {
      console.log("Categories: returning the pictures taken for category of index " + catIndex + "("
    + picturesTaken.lenght+" pictures)");
    }
    return picturesTaken;
  }

  /*Return all the pictures that were previously stored for a particula category*/
  CategoriesStorage.prototype.pointsTakenForACat = function(catIndex) {
    var pointsTaken = []
    this.picturesWrappers[catIndex].forEach(function(pw){
      if(pw.points){
        pointsTaken.push(pw.points)
      }
    })
    if (verbose) {
      console.log("Categories: returning the points taken for category of index " + catIndex + "("
    + pointsTaken.lenght+" points)");
    }
    return pointsTaken;
  }

  App.CategoriesStorage = CategoriesStorage;
  window.App = App;

})(window);
