const assert = require('assert');

function makePromiseHandler(handler) {
    assert(typeof handler === 'function', 'Handler given to promise handler is not a function');

    return (req, res, next) => {
        const maybePromise = handler(req, res, next);
        if (maybePromise && 'then' in maybePromise) {
            maybePromise.then(() => {
                // the sucess path doesn't interess us
            }, err => {
                res.status(500).json({errors: [{message: err.message}]});
            });
        }
    };
}

module.exports = makePromiseHandler;
