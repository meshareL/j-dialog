'use strict';

/** @type {{open: Callback[], opened: Callback[], closed: Callback[]}} */
const hooks = {
    open: [],
    opened: [],
    closed: []
};

export default hooks;

/**
 * @callback Callback
 * @param {Vue} dialogRef
 */