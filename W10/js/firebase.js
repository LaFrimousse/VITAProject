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

    /*docRef.set({
      mytest: "testo",
      testy: ["tastay", "tastaaay"]
    }).then(function() {
      console.log("Document written");
    }).catch(function(error) {
      console.error("Error adding document: ", error);
    })

    docRef.get().then(function(doc) {
      if (doc && doc.exists) {
        const myData = doc.data();
        console.log(myData.testy)
      }
    }).catch(function(error) {
      console.log("Error occurred when fetching", error);
    });
*/

    /*var putFile = function(arrayPath, file) {
      var newRef = storageRef;
      for (var i in arrayPath){
        newRef = newRef.child(arrayPath[i]);
      }
      newRef.put(file).then(function(snapshot) {
        console.log('Firebase: Uploaded a blob or file in Firebase!');
      });
    }*/

    var saveImage = function(userId, imageId, imageFile, categoryName, date, browserId) {
      console.log("userId : ", userId);
      console.log("imageId : ",imageId);
      putImgFileInFirebase(categoryName, imageId, imageFile).then(function(snapshot){
        addImgIdToTheListForThisUser(userId, imageId, categoryName).then(function(){
          console.log("ALL IS OKAY")
        })
      })
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

    var addImgIdToTheListForThisUser = function(userId, imageId, categoryName){
      var promise = new Promise(function(resolve, reject) {
        getImgListForUser(userId, categoryName).then(function(list){
          console.log("The list of image that was on firebase for this cat founded is : ", list);
          list.push(imageId);
          console.log("the future list is : ", list)
          storeImgListForUser(userId, categoryName, list).then(function(){
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
      console.log("userId : ", userId)
      console.log("categoryName : ",categoryName)
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

    var storeImgListForUser = function(userId, categoryName, imageList){
      var promise = new Promise(function(resolve, reject) {
        var listRef = usersCollection.doc(userId).collection("categories").doc(categoryName);
        listRef.set(
          {imageList: imageList}
        ).then(function() {
          resolve();
        }).catch(function(error) {
          reject(error);
        })
      });
      return promise;
    }



    return {
      verbose: verbose,
      saveImage: saveImage,
      getImgListForUser: getImgListForUser
    }
  })();

  App.Firebase = Firebase;
  window.App = App;

})(window);
