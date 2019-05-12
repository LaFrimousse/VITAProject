console.log('Hello TensorFlow');

/**
 * Get the car data reduced to just the variables we are interested
 * and cleaned of missing data.
 */
async function getData() {
  const carsDataReq = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
  const carsData = await carsDataReq.json();
  const cleaned = carsData.map(car => ({
      mpg: car.Miles_per_Gallon,
      horsepower: car.Horsepower,
    }))
    .filter(car => (car.mpg != null && car.horsepower != null));

  return cleaned;
}

async function run() {
  // Load and plot the original input data that we are going to train on.
  const data = await getData();
  const values = data.map(d => ({
    x: d.horsepower,
    y: d.mpg,
  }));

  tfvis.render.scatterplot({
    name: 'Horsepower v MPG'
  }, {
    values
  }, {
    xLabel: 'Horsepower',
    yLabel: 'MPG',
    height: 300
  });

  // Create the model
  const model = createModel();
  tfvis.show.modelSummary({
    name: 'Model Summary'
  }, model);

  // Convert the data to a form we can use for training.
const tensorData = convertToTensor(data);
const {inputs, labels} = tensorData;

// Train the model
await trainModel(model, inputs, labels);
console.log('Done Training');

// Make some predictions using the model and compare them to the
// original data
testModel(model, data, tensorData);
}

function createModel() {
  // Create a sequential model
  /*This instantiates a tf.Model object. This model is sequential because its inputs flow straight down to its output. Other kinds of models can have branches, or even multiple inputs and outputs, but in many cases your models will be sequential. Sequential models also have an easier to use API.*/
  const model = tf.sequential();

  // Add a single hidden layer
  /*This adds a hidden layer to our network. A dense layer is a type of layer that multiplies its inputs by a matrix (called weights) and then adds a number (called the bias) to the result. As this is the first layer of the network, we need to define our inputShape. The inputShape is [1] because we have 1 number as our input (the horsepower of a given car).

units sets how big the weight matrix will be in the layer. By setting it to 1 here we are saying there will be 1 weight for each of the input features of the data.

Note: Dense layers come with a bias term by default, so we do not need to set useBias to true, we will omit from further calls to tf.layers.dense*/
  model.add(tf.layers.dense({
    inputShape: [1],
    units: 50,
    useBias: true
  }));



  /*adding an extra layer as proposed at the end of the tutorial to kill the linearity*/
  model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
  model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
  model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));


  // Add an output layer
  /*The code above creates our output layer. We set units to 1 because we want to output 1 number. Dense layers also come with a bias by

Note: In this example, because the hidden layer has 1 unit, we don't actually need to add the final output layer above (i.e. we could use hidden layer as the output layer). However, defining a separate output layer allows us to modify the number of units in the hidden layer while keeping the one-to-one mapping of input and output.*/
  model.add(tf.layers.dense({
    units: 1,
    useBias: true
  }));

  return model;
}

/**
 * Convert the input data to a tensors that we can use for machine
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.

  return tf.tidy(() => {
    // Step 1. Shuffle the data
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.horsepower)
    const labels = data.map(d => d.mpg);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    }
  });
}

async function trainModel(model, inputs, labels) {
  // Prepare the model for training.
  model.compile({
    /*optimizer: This is the algorithm that is going to govern the updates to the model as it sees examples. There are many optimizers available in TensorFlow.js. Here we have picked the adam optimizer as it is quite effective in practice and requires no configuration.*/
    optimizer: tf.train.adam(),
    /*loss: this is a function that will tell the model how well it is doing on learning each of the batches (data subsets) that it is shown. Here we use meanSquaredError to compare the predictions made by the model with the true values.*/
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });

  /*batchSize refers to the size of the data subsets that the model will see on each iteration of training. Common batch sizes tend to be in the range 32-512. There isn't really an ideal batch size for all problems and it is beyond the scope of this tutorial to describe the mathematical motivations for various batch sizes.*/
  const batchSize = 28;
  /*epochs refers to the number of times the model is going to look at the entire dataset that you provide it. Here we will take 50 iterations through the dataset.*/
  const epochs = 50;

/*model.fit is the function we call to start the training loop. It is an asynchronous function so we return the promise it gives us so that the caller can determine when training is complete.*/
  return await model.fit(inputs, labels, {
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
  });
}


function testModel(model, inputData, normalizationData) {
  const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

  // Generate predictions for a uniform range of numbers between 0 and 1;
  // We un-normalize the data by doing the inverse of the min-max scaling
  // that we did earlier.
  const [xs, preds] = tf.tidy(() => {

    const xs = tf.linspace(0, 1, 100);
    const preds = model.predict(xs.reshape([100, 1]));

// Un-normalize the data
    const unNormXs = xs
      .mul(inputMax.sub(inputMin))
      .add(inputMin);

    const unNormPreds = preds
      .mul(labelMax.sub(labelMin))
      .add(labelMin);


    /*.dataSync() is a method we can use to get a typedarray of the values stored in a tensor. This allows us to process those values in regular JavaScript. This is a synchronous version of the .data() method which is generally preferred.*/
    return [unNormXs.dataSync(), unNormPreds.dataSync()];
  });


  const predictedPoints = Array.from(xs).map((val, i) => {
    return {x: val, y: preds[i]}
  });

  const originalPoints = inputData.map(d => ({
    x: d.horsepower, y: d.mpg,
  }));


  tfvis.render.scatterplot(
    {name: 'Model Predictions vs Original Data'},
    {values: [originalPoints, predictedPoints], series: ['original', 'predicted']},
    {
      xLabel: 'Horsepower',
      yLabel: 'MPG',
      height: 300
    }
  );
}


document.addEventListener('DOMContentLoaded', run);
