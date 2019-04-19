(function(window) {
  'use strict';

  var App = window.App || {};

  var Firebase = (function() {
    var verbose = true;

    /*Reference to the database*/
    var firestore = firebase.firestore();
    //var userCollection = firestore.collection("myUsers").doc("mouh2");
    var usersCollection = firestore.collection("users");
    var imgsCollection = firestore.collection("images");
    /*Reference to the storage*/
    var storage = firebase.storage();
    var storageRef = storage.ref();

    var saveImage = function(userId, imageId, imageFile, categoryName, date, browserId) {

      putImgFileInFirebase(categoryName, imageId, imageFile).then(function(snapshot) {
        addImgIdToTheListForThisUser(userId, imageId, categoryName).then(function() {
          storeImgMetaData(imageId, date, browserId).catch(function(error) {
            console.error(error);
          });
        }).catch(function(error) {
          console.error(error);
        });
      }).catch(function(error) {
        console.error(error);
      });
    }



    var putImgFileInFirebase = function(categoryName, imageId, imageFile) {
      var promise = new Promise(function(resolve, reject) {
        var imgRef = storageRef.child("images").child(categoryName).child(imageId);
        imgRef.put(imageFile).then(function(snapshot) {
          resolve(snapshot);
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    var downloadImageAsBlob = function(categoryName, imageId) {
      var justURLWanted = false;
      var promise = new Promise(function(resolve, reject) {
        var imgRef = storageRef.child("images").child(categoryName).child(imageId);
        imgRef.getDownloadURL().then(function(url) {
          if (justURLWanted) {
            resolve({
              categoryName:categoryName,
              imageId:imageId,
              url:url
            });
          } else {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function(event) {
              var blob = xhr.response;
              resolve({
                categoryName:categoryName,
                imageId:imageId,
                blob:blob
              });
            };
            xhr.onerror = function(error) {
              reject(error);
            };
            xhr.open('GET', url);
            xhr.send();
          }

        }).catch(function(error) {
          resolve(error);
        });
      });
      return promise;
    }

    var addImgIdToTheListForThisUser = function(userId, imageId, categoryName) {
      var promise = new Promise(function(resolve, reject) {
        getImgListForUser(userId, categoryName).then(function(list) {
          list.push(imageId);
          storeImgListForUser(userId, categoryName, list).then(function() {
            resolve();
          }).catch(function(error) {
            reject(error);
          });
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }


    var getImgListForUser = function(userId, categoryName) {

      var promise = new Promise(function(resolve, reject) {
        var listRef = usersCollection.doc(userId).collection("categories").doc(categoryName);
        listRef.get().then(function(doc) {
          if (doc && doc.exists) {
            var data = doc.data()
            var oldList = data.imageList;
            resolve(oldList);
          } else {
            resolve([])
          }
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    var storeImgListForUser = function(userId, categoryName, imageList) {
      var promise = new Promise(function(resolve, reject) {
        var listRef = usersCollection.doc(userId).collection("categories").doc(categoryName);
        listRef.set({
          imageList: imageList
        }).then(function() {
          resolve();
        }).catch(function(error) {
          reject(error);
        })
      });
      return promise;
    }

    var storeImgMetaData = function(imageId, date, browserDescription) {
      var promise = new Promise(function(resolve, reject) {
        var imgRef = imgsCollection.doc(imageId);
        imgRef.set({
          date: date,
          browserDescription: browserDescription
        }).then(function() {
          resolve();
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    var downloadImages = function(listImageId) {
      var promise = new Promise(function(resolve, reject) {
        resolve("öJ");
      });
      return promise;
    }



    /*db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
});*/


    /*getImgListForUser("52629ad2-575a-2566-95f7-9bdaf25452d4", "arms_down").then(function(res) {
      res.forEach(function(imgId) {
        downloadImageAsBlob("arms_down", imgId).then(function(res) {
          console.log(res);
        }).catch(function(error) {
          console.error(error);
        })
      })
    })*/


    return {
      verbose: verbose,
      saveImage: saveImage,
      getImgListForUser: getImgListForUser,
      downloadImageAsBlob:downloadImageAsBlob
    }
  })();

  App.Firebase = Firebase;
  window.App = App;

})(window);
