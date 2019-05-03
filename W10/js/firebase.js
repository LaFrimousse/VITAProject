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

    var saveImage = function(userId, imageId, imageFile, categoryName, date, browserId, points) {

      putImgFileInFirebase(categoryName, imageId, imageFile).then(function(snapshot) {
        if (verbose) {
          console.log("Just put the image ", imageId, "on firebase for the category ", categoryName);
        }
        addImgIdToTheListForThisUser(userId, imageId, categoryName).then(function() {
          if (verbose) {
            console.log("Just put the imageId ", imageId, " in the list of the pictures taken for the cat ", categoryName, " for this user with id ", userId);
          }
          storeImgMetaData(imageId, date, browserId, categoryName, points).then(function() {
            if (verbose) {
              console.log("Just stored the image MetaData for the image ", imageId, " in firebase");
            }
          }).catch(function(error) {
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
          if (verbose) {
            console.log("Firebase : just saved the image " + imageId + " online");
          }
          resolve(snapshot);
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    var deleteImgFromStorage = function(categoryName, imageId) {
      var promise = new Promise(function(resolve, reject) {
        var imgRef = storageRef.child("images").child(categoryName).child(imageId);
        imgRef.delete().then(function() {
          if (verbose) {
            console.log("Firebase : just deleted the image " + imageId + " of firebase");
          }
          resolve();
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    var downloadImageAsBlob = function(categoryName, imageId, justURLWanted) {
      var promise = new Promise(function(resolve, reject) {
        var imgRef = storageRef.child("images").child(categoryName).child(imageId);
        imgRef.getDownloadURL().then(function(url) {
          if (justURLWanted) {
            if (verbose) {
              console.log("Firebase : just downloaded the url of an image : " + url);
            }
            resolve({
              categoryName: categoryName,
              imageId: imageId,
              url: url
            });
          } else {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function(event) {
              var blob = xhr.response;
              if (verbose) {
                console.log("Firebase : just downloaded the blob of the image at url : " + url);
              }
              resolve({
                categoryName: categoryName,
                imageId: imageId,
                blob: blob
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
            if (verbose) {
              console.log("Firebase : just downloaded list images Id for the cat : " + categoryName + " " + oldList);
            }
            resolve(oldList);
          } else {
            if (verbose) {
              console.log("No old list found for category", categoryName)
            }
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
          if (verbose) {
            console.log("Firebase : just stored the image list for category " + categoryName + "on firebase : " + imageList);
          }
          resolve();
        }).catch(function(error) {
          reject(error);
        })
      });
      return promise;
    }

    var storeImgMetaData = function(imageId, date, browserDescription, catLabel, points) {
      var promise = new Promise(function(resolve, reject) {
        var imgRef = imgsCollection.doc(imageId);
        imgRef.set({
          categoryLabel: catLabel,
          date: date,
          browserDescription: browserDescription,
          points: JSON.stringify(points)
        }).then(function() {
          if (verbose) {
            console.log("Firebase : just stored the metadata of image " + imageId + "on firebase");
          }
          resolve();
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }



    var deleteImageMetaData = function(imageId) {
      var promise = new Promise(function(resolve, reject) {
        var refDoc = imgsCollection.doc(imageId);
        refDoc.delete().then(function() {
          if (verbose) {
            console.log("Firebase : just deleted the image metadata of " + imageId);
          }
          resolve();
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    var deleteImgListForThisUser = function(userId, catName, imageList) {
      var promise = new Promise(function(resolve, reject) {
        getImgListForUser(userId, catName).then(function(list) {

          var imageSet = new Set(list);
          imageList.forEach(function(el){
            imageSet.delete(el);
          })

          /*for (var i = 0; i < list.length; i++) {
            if (list[i] === imageIdToDel) {
              if (verbose) {
                console.log("Firebase : removing an id of the image list before storing it again. categoryName :  " + categoryName + " idToDelete : " + imageIdToDel + "actualList: " + list);
              }
              list.splice(i, 1);
              i--;
            }
          }*/

          storeImgListForUser(userId, catName, Array.from(imageSet)).then(function() {
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

    var deleteImages = function(imageArray) {

      var imgIdsToDelForTheUser = [];
      var catName = null;
      var userId = null;

      imageArray.forEach(function(img){
        catName = img.catLabel;
        userId = img.userId;
        var imageId = img.imageId;
        imgIdsToDelForTheUser.push(imageId);

        deleteImgFromStorage(catName, imageId).then(function() {
          deleteImageMetaData(imageId).catch(function(error){
            console.error(error);
          });
        }).catch(function(error){
          console.error(error);
        });

      });

      deleteImgListForThisUser(userId, catName, imgIdsToDelForTheUser);



      /*deleteImgFromStorage(catName, imageId).then(function() {
        deleteImgIdToTheListForThisUser(userId, imageId, catName).then(function() {
          deleteImageMetaData(imageId).catch(function(error) {
            console.error(error);
          }).catch(function(error) {
            console.error(error);
          });
        }).catch(function(error) {
          console.error(error);
        });
      })*/


    };

    var getAllImagesMetaData = function() {
      var promise = new Promise(function(resolve, reject) {
        var back = [];
        imgsCollection.get().then(function(snapshot) {

          snapshot.forEach(function(sn) {
            back.push({
              catLabel: sn.data().categoryLabel,
              pictId: sn.id,
              points: JSON.parse(sn.data().points)
            });
          });
          resolve(back);
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    var getPointsForAPicture = function(pictId) {
      var promise = new Promise(function(resolve, reject) {
        imgsCollection.doc(pictId).get().then(function(snapshot) {
          resolve(JSON.parse(snapshot.data().points));
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    return {
      verbose: verbose,
      saveImage: saveImage,
      deleteImages: deleteImages,
      getImgListForUser: getImgListForUser,
      downloadImageAsBlob: downloadImageAsBlob,
      getPointsForAPicture: getPointsForAPicture,
      getAllImagesMetaData: getAllImagesMetaData
    }
  })();

  App.Firebase = Firebase;
  window.App = App;

})(window);
