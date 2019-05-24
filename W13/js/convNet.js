(function(window) {
  'use strict';
  var App = window.App || {};
  var Firebase = App.Firebase;
  var Device = App.Device;
  var CategoriesStorage = App.CategoriesStorage;
  var ConvNet = (function() {
    var verbose = true;
    /*batchSize refers to the size of the data subsets that the model will see on each iteration of training. Common batch sizes tend to be in the range 32-512. There isn't really an ideal batch size for all problems and it is beyond the scope of this tutorial to describe the mathematical motivations for various batch sizes.*/
    /*Total number of training examples present in a single batch.
    As I said, you can’t pass the entire dataset into the neural net at once. So, you divide dataset into Number of Batches or sets or parts.*/
    const BATCH_SIZE = 32;
    /*epochs refers to the number of times the model is going to look at the entire dataset that you provide it. Here we will take 50 iterations through the dataset.*/
    /*One Epoch is when an ENTIRE dataset is passed forward and backward through the neural network only ONCE.*/
    const EPOCHS = 2;

    const classNames = CategoriesStorage.getCatLabels()
    const NB_CATEGORIES = classNames.length;

    var globalModel = null;
    var userModel = null;
    var usedModel = null;
    var userModelStillNotTrained = true;


    async function run(forUserModel) {
      var data = await getData(forUserModel);
      // TODO: VERIFY SIZE OF INPUT
      /*if(forUserModel){
        console.log(data)
        alert("verify size of data")
      }*/

      var model = createModel();
      if (forUserModel) {
        tfvis.show.modelSummary({
          name: 'Model Summary',
          tab: "Model Summary"
        }, model);
      }

      var tensors = null;
      if (forUserModel) {
        tensors = convertToTensors(data);
      } else {
        tensors = convertToTensorsForGlobalModel(data);
      }

      var {
        training_inputs,
        training_labels,
        validation_inputs,
        validation_labels,
        test_inputs,
        test_labels
      } = tensors;

      if (verbose) {
        console.log("ConvNet: just converted the downloaded inputs to tensors. (Only for this user", forUserModel, ")", test_inputs);
      }

      await trainModel(model, training_inputs, training_labels, validation_inputs, validation_labels, forUserModel);


      if (verbose) {
        console.log("ConvNet: Done training the model. (Only for this user", forUserModel, ")");
      }

      if (forUserModel) {
        await showAccuracy(model, test_inputs, test_labels);
        await showConfusion(model, test_inputs, test_labels);
      }

      if (forUserModel) {
        userModel = model;
        usedModel = userModel;
        App.ConvNetLayout.notifyUserModelIsReady()
      } else {
        globalModel = model;
        usedModel = globalModel;
        App.ConvNetLayout.notifyGlobalModelIsReady()
      }
    }


    //TODO: Flatten when we have more thant one array of points per image
    async function getData(forUserModel) {

      var listMetaData = null;
      if (forUserModel) {
        listMetaData = await Firebase.getAllImagesMetaDataForAUser(Device.clientId);
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
          coordinates: (function() {
            if (data.points == null || data.points == undefined || data.points.length == 0) {
              return null;
            }
            return data.points[0].coordinates
          })(),
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

      model.add(tf.layers.dense({
        /*Integer or Long, dimensionality of the output space.*/
        units: NB_CATEGORIES,
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


    function convertToTensorsForGlobalModel(data) {
      var TRAINING_DATASET_RATIO = 0.7;
      //no test set here.

      if (verbose) {
        console.log("ConvNet: will convert to tensor a data of size", data.length)
      }

      var dataPerCat = {}

      //split the original data into a dictionary: each entry is a category
      classNames.forEach(function(cat, index) {
        dataPerCat[cat] = data.filter(dt => dt.label[index] == 1)
      })


      //find the category for the one we have the less data
      var minNumberOfData = dataPerCat[classNames[0]].length;
      classNames.forEach(function(cat) {
        if (dataPerCat[cat].length < minNumberOfData) {
          minNumberOfData = dataPerCat[cat].length
        }
        //and suffle each entry of the dictionary
        tf.util.shuffle(dataPerCat[cat]);
      })

      if (verbose) {
        console.log("ConvNet: all the available metadata was separtated into", dataPerCat, " the min size is ", minNumberOfData)
      }

      //discard some data points for the categories that have more data than the minimum one
      var discarded = dataPerCat;
      classNames.forEach(function(cat) {
        discarded[cat] = discarded[cat].slice(0, minNumberOfData)
      })

      if (verbose) {
        console.log("ConvNet: reduced the size of the input data to have a balanced set between classes ", discarded)
      }

      /*compute the effective number of training sample and validation sample based on the ratio declared at the begining of this function*/
      var NUM_TRAIN_ELEMENTS = minNumberOfData * TRAINING_DATASET_RATIO;
      var NUM_VALIDATION_ELEMENTS = minNumberOfData - NUM_TRAIN_ELEMENTS;

      //preparte 2 arrays in the one the dictionary will be distributed
      var trainingDatas = [];
      var validationDatas = [];

      classNames.forEach(function(cat) {
        //for each category, split the entries of the dico in the 2 above arrays
        var inputPart = discarded[cat].slice(0, NUM_TRAIN_ELEMENTS)
        var validPart = discarded[cat].slice(NUM_TRAIN_ELEMENTS, minNumberOfData)
        trainingDatas.push(inputPart);
        validationDatas.push(validPart);
      });

      trainingDatas = trainingDatas.flat();
      validationDatas = validationDatas.flat();

      tf.util.shuffle(trainingDatas);
      tf.util.shuffle(validationDatas);

      return tf.tidy(() => {

        var testData = trainingDatas.map(d => d.coordinates.flat());
        var testLabel = trainingDatas.map(d => d.label);
        var validData = validationDatas.map(d => d.coordinates.flat());
        var validLabel = validationDatas.map(d => d.label);

        var trainingInputs = tf.tensor2d(testData, [testData.length, 3 * 17]);
        var trainingLabels = tf.tensor2d(testLabel, [testLabel.length, NB_CATEGORIES]);
        var validationInputs = tf.tensor2d(validData, [validData.length, 3 * 17]);
        var validationLabels = tf.tensor2d(validLabel, [validLabel.length, NB_CATEGORIES]);
        //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
        //const inputMax = inputTensor.max();
        //const inputMin = inputTensor.min();

        /*const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));

        const [trainingInputs, validationInputs, testInputs] = tf.split(normalizedInputs, [NUM_TRAIN_ELEMENTS, NUM_VALIDATION_ELEMENTS, NUM_TEST_ELEMENTS], 0);
        const [trainingLabels, validationLabels, testLabels] = tf.split(normalizedLabels, [NUM_TRAIN_ELEMENTS, NUM_VALIDATION_ELEMENTS, NUM_TEST_ELEMENTS], 0);*/

        return {
          training_inputs: trainingInputs,
          training_labels: trainingLabels,
          validation_inputs: validationInputs,
          validation_labels: validationLabels,
        }
      });
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
        //const labelMax = labelTensor.max();
        //const labelMin = labelTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        //const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        const [trainingInputs, validationInputs, testInputs] = tf.split(normalizedInputs, [NUM_TRAIN_ELEMENTS, NUM_VALIDATION_ELEMENTS, NUM_TEST_ELEMENTS], 0);
        const [trainingLabels, validationLabels, testLabels] = tf.split(labelTensor, [NUM_TRAIN_ELEMENTS, NUM_VALIDATION_ELEMENTS, NUM_TEST_ELEMENTS], 0);




        return {
          training_inputs: trainingInputs,
          training_labels: trainingLabels,
          validation_inputs: validationInputs,
          validation_labels: validationLabels,
          test_inputs: testInputs,
          test_labels: testLabels,
          // Return the min/max bounds so we can use them later.
          /*inputMax,
          inputMin,
          labelMax,
          labelMin,*/
        }
      });
    }


    var getTensorForRecoMode = function(points) {
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

    async function trainModel(model, trainingInputs, trainingLabels, validationInputs, validationLabels, isUserDataOnly) {

      /*Here we decide which metrics we are going to monitor. We will monitor loss and accuracy on the training set as well as loss and accuracy on the validation set */
      const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
      const container = {
        name: 'Model Training',
        tab: "Training",
        styles: {
          height: '1000px'
        }
      };
      const fitCallbacks = isUserDataOnly ? tfvis.show.fitCallbacks(container, metrics) : null;



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

    var testAPicForRecognition = function(points) {
      if (verbose) {
        console.log("ConvNet: was asked to perform a position recognition for the points ", points)
      }

      var tensor = getTensorForRecoMode(points);
      const preds = usedModel.predict(tensor.inputs) //.argMax([-1]);
      return preds;
    }

    var trainUserModel = function() {
      if (!userModelStillNotTrained) {
        console.error("ConvNet: cannot train a user model twice in a single session")
        return;
      }
      userModelStillNotTrained = false;
      run(true);
    }


    var aModelIsReady = function() {
      return usedModel != null;
    }

    var isUserModelAlreadyTrained = function() {
      return !userModelStillNotTrained;
    }

    window.setTimeout(function() {
      run(false)
    }, 500)



    return {
      isUserModelAlreadyTrained: isUserModelAlreadyTrained,
      trainUserModel: trainUserModel,
      aModelIsReady: aModelIsReady,
      testAPicForRecognition: testAPicForRecognition,
    }
  })();
  App.ConvNet = ConvNet;
  window.App = App;
})(window);
