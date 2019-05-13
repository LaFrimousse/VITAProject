(function(window) {
  'use strict'
  var App = window.App || {};

  var TensorFlow = (function() {
    const x = tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8,9, 10, 11, 12, 13, 14, 15, 16], [4, 4]);
    x.print();
const [a, b,c] = tf.split(x, [1,2,1], 0);
a.print();
b.print();
c.print();
    return {
    }

  })();

  App.TensorFlow = TensorFlow;
  window.App = App;

})(window);
