(function(window) {
  'use strict';

  var App = window.App || {};

  var Firebase = (function() {
    var verbose = false;
    var WILL_SAVE_PICTURE_IN_FIREBASE = false;

    /*Reference to the database*/
    var firestore = firebase.firestore();
    //var userCollection = firestore.collection("myUsers").doc("mouh2");
    var usersCollection = firestore.collection("users");
    var imgsCollection = firestore.collection("images");
    /*Reference to the storage*/
    var storage = firebase.storage();
    var storageRef = storage.ref();

    var saveImage = function(userId, wrapper) {
      var imageId = wrapper.imageId;
      var imageFile = wrapper.picture;
      var categoryName = App.CategoriesStorage.labelForIndex(wrapper.catIndex);
      var date = wrapper.date;
      var browserId = wrapper.browserDescription;
      var points = wrapper.points;
      var isSavedOnFirebase = WILL_SAVE_PICTURE_IN_FIREBASE;

      if(!points && !WILL_SAVE_PICTURE_IN_FIREBASE){
        if(verbose){
          console.log("Firebase: nothing to store because we have neither the points nor the image")
        }
        return;
      }

      putImgFileInFirebase(categoryName, imageId, imageFile,isSavedOnFirebase).then(function(snapshot) {
        if (verbose) {
          if(snapshot == null){
            console.log("Didn't stored on purpose the image file of img ", imageId, "on firebase for the category ", categoryName);
          }else{
            console.log("Just put the image ", imageId, "on firebase for the category ", categoryName);
          }
        }
        addImgIdToTheListForThisUser(userId, imageId, categoryName).then(function() {
          if (verbose) {
            console.log("Just put the imageId ", imageId, " in the list of the pictures taken for the cat ", categoryName, " for this user with id ", userId);
          }
          storeImgMetaData(imageId, date, browserId, categoryName, points,isSavedOnFirebase).then(function() {
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


    var putImgFileInFirebase = function(categoryName, imageId, imageFile, isSavedOnFirebase) {
      if(!isSavedOnFirebase){
        var promise = new Promise(function(resolve, reject) {
          resolve(null);
        });
        return promise;
      }

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

    var deleteImgFromStorage = function(categoryName, imageId, imgIsStored) {

      if(!imgIsStored){
        var promise = new Promise(function(resolve, reject) {
          resolve();
        });
        return promise;
      }

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

    var storeImgMetaData = function(imageId, date, browserDescription, catLabel, points, isSavedOnFirebase) {
      var promise = new Promise(function(resolve, reject) {
        var imgRef = imgsCollection.doc(imageId);
        imgRef.set({
          categoryLabel: catLabel,
          date: Date.parse(date),
          browserDescription: browserDescription,
          points: JSON.stringify(points),
          imageSavedOnFirebase:isSavedOnFirebase
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
        var imgIsStored = img.isSavedOnFirebase;

        deleteImgFromStorage(catName, imageId, imgIsStored).then(function() {
          deleteImageMetaData(imageId).catch(function(error){
            console.error(error);
          });
        }).catch(function(error){
          console.error(error);
        });

      });

      deleteImgListForThisUser(userId, catName, imgIdsToDelForTheUser);
    };

    var getAllImagesMetaData = function() {
      var promise = new Promise(function(resolve, reject) {
        var back = [];
        imgsCollection.get().then(function(snapshot) {

          snapshot.forEach(function(sn) {
            back.push({
              catLabel: sn.data().categoryLabel,
              pictId: sn.id,
              date: sn.data().date,
              browserDescription: sn.data().browserDescription,
              points: JSON.parse(sn.data().points),
              isSavedOnFirebase: sn.data().imageSavedOnFirebase,
            });
          });
          resolve(back);
        }).catch(function(error) {
          reject(error);
        });
      });
      return promise;
    }

    async function getAllImagesMetaDataForAUser(userId) {
      var allCatNames = App.CategoriesStorage.getCatLabels()
      var allImagesIdsForUser = []
      var i;
      for (i = 0; i < allCatNames.length; i++) {
        var toAdd = await getImgListForUser(userId, allCatNames[i]);
        allImagesIdsForUser.push(toAdd)
      }
      allImagesIdsForUser = allImagesIdsForUser.flat()
      var setId = new Set(allImagesIdsForUser);
      var allMetaData = await getAllImagesMetaData();
      return allMetaData.filter(md => setId.has(md.pictId));
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

    var willSavePicture = function(){
      return WILL_SAVE_PICTURE_IN_FIREBASE;
    }

    return {
      verbose: verbose,
      willSavePicture:willSavePicture,
      saveImage: saveImage,
      deleteImages: deleteImages,
      getImgListForUser: getImgListForUser,
      downloadImageAsBlob: downloadImageAsBlob,
      getPointsForAPicture: getPointsForAPicture,
      getAllImagesMetaData: getAllImagesMetaData,
      getAllImagesMetaDataForAUser:getAllImagesMetaDataForAUser,
      storeImgMetaData:storeImgMetaData,/*public because needed from download.js*/
    }
  })();

  App.Firebase = Firebase;
  window.App = App;

})(window);
