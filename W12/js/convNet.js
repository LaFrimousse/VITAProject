(function(window) {
  'use strict';
  var App = window.App || {};
  var Firebase = App.Firebase;

  var CategoriesStorage = App.CategoriesStorage;
  var ConvNet = (function() {
    /*batchSize refers to the size of the data subsets that the model will see on each iteration of training. Common batch sizes tend to be in the range 32-512. There isn't really an ideal batch size for all problems and it is beyond the scope of this tutorial to describe the mathematical motivations for various batch sizes.*/
    /*Total number of training examples present in a single batch.
    As I said, you can’t pass the entire dataset into the neural net at once. So, you divide dataset into Number of Batches or sets or parts.*/
    const BATCH_SIZE = 32;
    /*epochs refers to the number of times the model is going to look at the entire dataset that you provide it. Here we will take 50 iterations through the dataset.*/
    /*One Epoch is when an ENTIRE dataset is passed forward and backward through the neural network only ONCE.*/
    const EPOCHS = 2;

    const classNames = CategoriesStorage.catLabels()
    const NB_CATEGORIES = classNames.length;
    var trainedOnceAlready = false;
    var isRecognitionModeActivated = false;
    var model = null;


    var createModelButton = document.getElementById("createModel");
    var createModelJustWithUserPicturesButton = document.getElementById("createModelJustForThisUser");
    var showOrHideModelButton = document.getElementById("showOrHideModelButton");
    var goToRecoModeButton = document.getElementById("startRecognition");

    var hideCreateModelButtons = function() {
      createModelButton.classList.add("notDisplayed");
      createModelJustWithUserPicturesButton.classList.add("notDisplayed");
    }

    var showCreateModelButtons = function() {
      createModelButton.classList.remove("notDisplayed");
      createModelJustWithUserPicturesButton.classList.remove("notDisplayed");
    }



    async function run(onlyThisUserData) {
      var data = await getData(onlyThisUserData);
      // TODO: VERIFY SIZE OF INPUT
      /*if(onlyThisUserData){
        console.log(data)
        alert("verify size of data")
      }*/

      // Create the model
       model = createModel();
      tfvis.show.modelSummary({
        name: 'Model Summary',
        tab: "Model Summary"
      }, model);

      var tensors = convertToTensors(data);

      var {
        training_inputs,
        training_labels,
        validation_inputs,
        validation_labels,
        test_inputs,
        test_labels
      } = tensors;
      console.log(test_inputs)
      await trainModel(model, training_inputs, training_labels, validation_inputs, validation_labels);
      console.log('Done Training');
      /*const saveResult = await model.save('localstorage://my-model-1');
      console.log("model saved")
      console.log(saveResult)*/

      await showAccuracy(model, test_inputs, test_labels);
      await showConfusion(model, test_inputs, test_labels);

      trainedOnceAlready = true;
      showCreateModelButtons();
      showOrHideModelButton.classList.remove("notDisplayed");
    }


    //TODO: Flatten when we have more thant one array of points per image
    async function getData(onlyThisUserData) {

      var listMetaData = null;
      if (onlyThisUserData) {
        listMetaData = await Firebase.getAllImagesMetaDataForAUser(App.Manager.clientId);
      } else {
        listMetaData = await Firebase.getAllImagesMetaData();
      }
      const cleaned = listMetaData.map(data => ({
          //lab: parseInt(CategoriesStorage.indexForLabel(data.catLabel)),
          label: (function() {
            //the label number
            var l = parseInt(CategoriesStorage.indexForLabel(data.catLabel));
            //[0,0,0,0,0]
            var arr = new Array(NB_CATEGORIES).fill(0);
            //[0,0,0,1,0]
            arr[l] = 1
            return arr;
          })(),
          coordinates: data.points[0].coordinates,
        }))
        .filter(data => (data.label != null && data.coordinates != null));
      return cleaned;
    }

    function createModel() {
      const model = tf.sequential();
      model.add(tf.layers.dense({
        inputShape: [17 * 3],
        // Integer or Long, dimensionality of the output space.
        units: 500,
        useBias: true
      }));

      model.add(tf.layers.dense({
        units: 500,
        activation: 'sigmoid'
      }));

      //  model.add(tf.layers.flatten());

      const NUM_OUTPUT_CLASSES = 5; //because we have 5 positions
      model.add(tf.layers.dense({
        /*Integer or Long, dimensionality of the output space.*/
        units: NUM_OUTPUT_CLASSES,
        kernelInitializer: 'varianceScaling',
        /*because we want the outputs to sum to one in the last layer, that gives us the detection probabliities*/
        activation: 'softmax'
      }));
      // Choose an optimizer, loss function and accuracy metric,
      // then compile and return the model
      /*Here we use categoricalCrossentropy as our loss function. As the name implies this is used when the output of our model is a probability distribution. categoricalCrossentropy measures the error between the probability distribution generated by the last layer of our model and the probability distribution given by our true label.
      The other metric we will monitor is accuracy which for a classification problem is the percentage of correct predictions out of all predictions.*/
      const optimizer = tf.train.adam();
      model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

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

        const inputTensor = tf.tensor2d(inputs, [inputs.length, 3 * 17]);
        const labelTensor = tf.tensor2d(labels, [labels.length, NB_CATEGORIES]);

        //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelMax = labelTensor.max();
        const labelMin = labelTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        const [trainingInputs, validationInputs, testInputs] = tf.split(normalizedInputs, [NUM_TRAIN_ELEMENTS, NUM_VALIDATION_ELEMENTS, NUM_TEST_ELEMENTS], 0);
        const [trainingLabels, validationLabels, testLabels] = tf.split(normalizedLabels, [NUM_TRAIN_ELEMENTS, NUM_VALIDATION_ELEMENTS, NUM_TEST_ELEMENTS], 0);

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


    var getTensorForRecoMode = function(points){
      return tf.tidy(() => {

        // Step 2. Convert data to Tensor
        const inputs = points.map(d => d.coordinates.flat())

        const inputTensor = tf.tensor2d(inputs, [inputs.length, 3 * 17]);

        //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));

        return {
          inputs: normalizedInputs,
        }
      });

    }

    async function trainModel(model, trainingInputs, trainingLabels, validationInputs, validationLabels) {

      /*Here we decide which metrics we are going to monitor. We will monitor loss and accuracy on the training set as well as loss and accuracy on the validation set */
      const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
      const container = {
        name: 'Model Training',
        tab: "Training",
        styles: {
          height: '1000px'
        }
      };
      const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);



      /*model.fit is the function we call to start the training loop. It is an asynchronous function so we return the promise it gives us so that the caller can determine when training is complete.*/
      /*return await model.fit(inputs, labels, {
        batchSize,
        epochs,
        shuffle: true,
        callbacks: tfvis.show.fitCallbacks({
            name: 'Training Performance'
          },
          ['loss', 'mse'], {
            height: 200,
            callbacks: ['onEpochEnd']
          }
        )
      });*/

      return model.fit(trainingInputs, trainingLabels, {
        batchSize: BATCH_SIZE,
        validationData: [validationInputs, validationLabels],
        epochs: EPOCHS,
        shuffle: true,
        callbacks: fitCallbacks
      });
    }

    async function showAccuracy(model, testInput, testLabels) {
      const [pred, labels] = doPrediction(model, testInput, testLabels);
      const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, pred);
      const container = {
        name: 'Accuracy',
        tab: 'Evaluation'
      };
      tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

      labels.dispose();
    }

    async function showConfusion(model, testInput, testLabels) {


      const [preds, labels] = doPrediction(model, testInput, testLabels);
      const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
      const container = {
        name: 'Confusion Matrix',
        tab: 'Evaluation'
      };
      tfvis.render.confusionMatrix(
        container, {
          values: confusionMatrix,
          tickLabels: classNames
        });



      labels.dispose();
    }

    function doPrediction(model, testInput, testLabels) {

      //const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
      const labels = testLabels.argMax([-1]);
      /*Take the maximum value of the vector output by the model, the class with the highest probability*/
      const preds = model.predict(testInput).argMax([-1]);
      //preds.dispose();
      console.log("Model prediction is ", preds, "and label was ", labels)
      return [preds, labels];
    }

    var testAPicForRecognition = function(points){
      var tensor = getTensorForRecoMode(points);
      const preds = model.predict(tensor.inputs)//.argMax([-1]);
      return preds;
    }

    createModelButton.addEventListener("click", function() {
      hideCreateModelButtons();
      if (trainedOnceAlready) {
        tfvis.visor().setActiveTab("Training")
        if (!tfvis.visor().isOpen()) {
          tfvis.visor().toggle()
        }
      }
      run(false);
    });
    createModelJustWithUserPicturesButton.addEventListener("click", function() {
      hideCreateModelButtons();

      if (trainedOnceAlready) {
        tfvis.visor().setActiveTab("Training")
        if (!tfvis.visor().isOpen()) {
          tfvis.visor().toggle()
        }
      }

      run(true);
    });

    showOrHideModelButton.addEventListener("click", function() {
      tfvis.visor().toggle()
    });

    goToRecoModeButton.addEventListener("click", function() {
      isRecognitionModeActivated = !isRecognitionModeActivated
      var text = !isRecognitionModeActivated ? "Go to recognition mode" : "Leave recognition mode"
      goToRecoModeButton.innerHTML = text;
      if(isRecognitionModeActivated){
        App.CategoriesLayout.hideElements()
        App.RecordsButtons.hideElements()
        App.CameraLayout.hideElement("postureImage")
      }else{
        App.CategoriesLayout.showElements()
        App.RecordsButtons.showElements()
        App.CameraLayout.showElement("postureImage")
      }
    });


    //run();
    return {
      isRecognitionModeActivated:isRecognitionModeActivated,
      testAPicForRecognition: testAPicForRecognition
    }
  })();
  App.ConvNet = ConvNet;
  window.App = App;
})(window);
