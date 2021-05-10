function defaultComparator(source, target) {
    if (target === source) {
        return 0;
    }
    else if (source < target) {
        return -1;
    }
    return 1;
}
// https://github.com/lodash/lodash/issues/4969
export function findSortedIndex(array, value, compare = defaultComparator) {
    return findSortedIndexWithInRange(0, array.length, (mid, low, high) => {
        return compare(array[mid], value, mid, low, high);
    });
}
export function findSortedIndexWithInRange(start, end, compare) {
    let low = start;
    let high = end;
    while (low < high) {
        const mid = low + ((high - low) / 2 | 0);
        const compareResult = compare(mid, low, high);
        if (compareResult === 0) {
            return {
                result: true,
                index: mid,
            };
        }
        else if (compareResult === -1) {
            low = mid + 1;
        }
        else if (compareResult === 1) {
            high = mid;
        }
        else {
            throw new Error(`findSortedIndex: comparator return unexpected value ${compareResult}`);
        }
    }
    return {
        result: false,
        index: high,
    };
}
