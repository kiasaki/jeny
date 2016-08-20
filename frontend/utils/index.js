import {compose, reduce, toPairs} from 'ramda';

// Throws an "assertion error" when `condition` is false
export function assert(condition, message) {
    if (!condition) {
        throw new Error('assertion error: ' + message);
    }
}

// Takes an object of class names as key and boolean as values. A value of true
// indicates the classname should be included in the returned string.
export const classNames = compose(reduce((classes, [className, use]) => (
    classes + (use ? ` ${className}` : '')
), ''), toPairs);
