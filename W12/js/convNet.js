(function(window) {
  'use strict';
  var App = window.App || {};
  var Firebase = App.Firebase;
  var CategoriesStorage = App.CategoriesStorage;
  var ConvNet = (function() {

    (function() { // init code that fetch the client id cookie
      getData();




    })();

    async function getData() {
      const listMetaData = await Firebase.getAllImagesMetaData();
      const cleaned = listMetaData.map(data => ({
          mpg: car.Miles_per_Gallon,
          horsepower: car.Horsepower,
        }))
        .filter(car => (car.mpg != null && car.horsepower != null));

      //return cleaned;
      return listMetaData;
    }





    return {

    }
  })();
  App.ConvNet = ConvNet;
  window.App = App;
})(window);
