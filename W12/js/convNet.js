(function(window) {
  'use strict';
  var App = window.App || {};
  var Firebase = App.Firebase;
  var CategoriesStorage = App.CategoriesStorage;
  var ConvNet = (function() {

    async function run() {
      var data = await getData();
      // Create the model
      var model = createModel();
      tfvis.show.modelSummary({
        name: 'Model Summary'
      }, model);

      var tensors = convertToTensors(data);
      console.log(tensors);

    }
    /*(function() { // init code that fetch the client id cookie
    })();*/

    //TODO: Flatten when we have more thant one array of points per image
    async function getData() {
      const listMetaData = await Firebase.getAllImagesMetaData();
      const cleaned = listMetaData.map(data => ({
          label: parseInt(CategoriesStorage.indexForLabel(data.catLabel)),
          coordinates: data.points[0].coordinates,
        }))
        .filter(data => (data.label != null && data.coordinates != null));
      return cleaned;
    }

    function createModel() {
      const model = tf.sequential();
      model.add(tf.layers.dense({
        inputShape: [1],
        units: 50,
        useBias: true
      }));
      model.add(tf.layers.dense({
        units: 50,
        activation: 'sigmoid'
      }));
      model.add(tf.layers.dense({
        units: 50,
        activation: 'sigmoid'
      }));
      model.add(tf.layers.dense({
        units: 50,
        activation: 'sigmoid'
      }));
      model.add(tf.layers.dense({
        units: 1,
        useBias: true
      }));

      return model;
    }

    function convertToTensors(data) {
      var TRAINING_DATASET_RATIO = 0.7;
      var VALIDATION_DATASET_RATIO = 0.2;
      var TEST_DATASET = 1.0 - TRAINING_DATASET_RATIO - VALIDATION_DATASET_RATIO;

      var NUM_DATASET_ELEMENTS = data.length;
      var NUM_TRAIN_ELEMENTS = Math.floor(TRAINING_DATASET_RATIO * NUM_DATASET_ELEMENTS);
      var NUM_VALIDATION_ELEMENTS = Math.floor(VALIDATION_DATASET_RATIO * NUM_DATASET_ELEMENTS);
      var NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS - NUM_VALIDATION_ELEMENTS;



      // Wrapping these calculations in a tidy will dispose any
      // intermediate tensors.
      return tf.tidy(() => {
        // Step 1. Shuffle the data
        tf.util.shuffle(data);

        // Step 2. Convert data to Tensor
        const inputs = data.map(d => d.coordinates.flat())
        const labels = data.map(d => d.label);

        const inputTensor = tf.tensor2d(inputs, [inputs.length, 3*17]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

        //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelMax = labelTensor.max();
        const labelMin = labelTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        const [trainingInputs, validationInputs,testInputs]
        = tf.split(normalizedInputs, [NUM_TRAIN_ELEMENTS,NUM_VALIDATION_ELEMENTS,NUM_TEST_ELEMENTS], 0);
        const [trainingLabels, validationLabels,testLabels]
        = tf.split(normalizedLabels, [NUM_TRAIN_ELEMENTS,NUM_VALIDATION_ELEMENTS,NUM_TEST_ELEMENTS], 0);

        return {
          training_inputs: trainingInputs,
          training_labels: trainingLabels,
          validation_inputs: validationInputs,
          validation_labels: validationLabels,
          test_inputs: testInputs,
          test_labels: testLabels,
          // Return the min/max bounds so we can use them later.
          inputMax,
          inputMin,
          labelMax,
          labelMin,
        }
      });
    }


    document.addEventListener('DOMContentLoaded', run);


    return {

    }
  })();
  App.ConvNet = ConvNet;
  window.App = App;
})(window);
