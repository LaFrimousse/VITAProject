(function(window) {
  'use strict'
  var App = window.App || {};

  var TensorFlow = (function() {
    console.log("éjéljss");
    const a = tf.tensor([[1, 2], [3, 4], [5, 6]]);
    console.log('shape:', a.shape);

    //const b = tf.tensor([1, 2,3,3]);
    //console.log('shape:', b.shape);

    console.log(tf.getBackend());
    a.dispose();

    const model = tf.sequential();
  model.add(tf.layers.dense({inputShape: [17], units: 32, activation: 'relu'}));
  model.add(tf.layers.dense({units: 10, activation: 'softmax'}));

  /*IMPORTANT: The first layer in the model needs an inputShape. Make sure you exclude the batch size when providing the inputShape. For example, if you plan to feed the model tensors of shape [B, 784], where B can be any batch size, specify inputShape as [784] when creating the model.*/
  model.summary()

    return {
    }

  })();

  App.TensorFlow = TensorFlow;
  window.App = App;

})(window);
