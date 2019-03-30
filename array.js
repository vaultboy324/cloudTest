var array_counter = function (array) {
  return "В массиве находится " + array.length + " элементов!";
};

var multiply = function (x, y) {
    return `${x} умножить на ${y} равно ${x * y}`
};

var some_value = 323;

/*module.exports.counter = array_counter;
module.exports.multiply = multiply;
module.exports.value  = some_value;*/

module.exports = {
    counter : array_counter,
    multiply : multiply,
    value : some_value
};

