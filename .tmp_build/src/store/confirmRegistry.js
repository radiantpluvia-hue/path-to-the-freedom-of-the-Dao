"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConfirmHandler = registerConfirmHandler;
exports.consumeConfirmHandler = consumeConfirmHandler;
exports.removeConfirmHandler = removeConfirmHandler;
exports.clearAllConfirmHandlers = clearAllConfirmHandlers;
const handlers = new Map();
function registerConfirmHandler(id, onConfirm, onCancel) {
    handlers.set(id, { onConfirm, onCancel });
}
function consumeConfirmHandler(id) {
    const cb = handlers.get(id);
    if (cb)
        handlers.delete(id);
    return cb;
}
function removeConfirmHandler(id) {
    handlers.delete(id);
}
function clearAllConfirmHandlers() {
    handlers.clear();
}
exports.default = {
    registerConfirmHandler,
    consumeConfirmHandler,
    removeConfirmHandler,
    clearAllConfirmHandlers,
};
