import { useGameStore } from './useGameStore';
import confirmRegistry from './confirmRegistry';
import { getRng } from '../utils/rng';

export function showConfirm(payload: { title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; }) : Promise<boolean> {
  const id = `confirm_${Date.now()}_${Math.floor(getRng()()*10000)}`;
  return new Promise<boolean>((resolve) => {
    confirmRegistry.registerConfirmHandler(id, () => resolve(true), () => resolve(false));
    useGameStore.getState().setUIProperty('activeConfirm', {
      id,
      title: payload.title,
      message: payload.message,
      confirmLabel: payload.confirmLabel,
      cancelLabel: payload.cancelLabel,
    });
  });
}

export default showConfirm;
