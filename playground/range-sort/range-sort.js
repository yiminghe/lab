/**
 * quick sort array to get first k elements
 * @author yiminghe@gmail.com
 */

function swap(arr, i, j) {
  var tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function partition(arr, comparator, left, right, pivotIndex) {
  var pivot = arr[pivotIndex];
  var cursor = left;
  swap(arr, pivotIndex, right);
  for (var i = left; i <= right; i++) {
    var value = arr[i];
    if (comparator(value, pivot) < 0) {
      swap(arr, i, cursor);
      cursor++;
    }
  }
  swap(arr, cursor, right);
  return cursor;
}

function quickSortFirstK(arr, comparator, left, right, k) {
  if (right <= left) {
    return;
  }
  var pivotIndex = left + Math.floor(Math.random() * (right - left + 1));
  var pivotNewIndex = partition(arr, comparator, left, right, pivotIndex);
  quickSortFirstK(arr, comparator, left, pivotNewIndex - 1, k - 1);
  var extraK = k - 1 + left - pivotNewIndex;
  if (extraK > 0) {
    quickSortFirstK(arr, comparator, pivotNewIndex + 1, right, extraK);
  }
}

function rangeSort(arr, comparator, left, right, k) {
  if (k === undefined || right - left + 1 <= k) {
    arr.sort(comparator);
  } else {
    quickSortFirstK(arr, comparator, left, right, k);
  }
}

module.exports = rangeSort;

if (require.main === module) {
  function randInt() {
    return Math.floor(Math.random() * 100);
  }

  var tests = [];
  for (var i = 0; i < 10; i++) {
    tests.push(randInt());
  }

  rangeSort(
    tests,
    function (a, b) {
      return a - b;
    },
    0,
    tests.length - 1,
    4,
  );

  // [7, 30, 38, 43, 42, 48, 62, 75, 99, 74]
  console.log(tests);
}
