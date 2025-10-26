type ConfirmHandlers = { onConfirm?: () => void; onCancel?: () => void };
const handlers = new Map<string, ConfirmHandlers>();

export function registerConfirmHandler(id: string, onConfirm?: () => void, onCancel?: () => void) {
  handlers.set(id, { onConfirm, onCancel });
}

export function consumeConfirmHandler(id: string): ConfirmHandlers | undefined {
  const cb = handlers.get(id);
  if (cb) handlers.delete(id);
  return cb;
}

export function removeConfirmHandler(id: string) {
  handlers.delete(id);
}

export function clearAllConfirmHandlers() {
  handlers.clear();
}

export default {
  registerConfirmHandler,
  consumeConfirmHandler,
  removeConfirmHandler,
  clearAllConfirmHandlers,
};
