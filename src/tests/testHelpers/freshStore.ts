export default function freshStore() {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const storeMod = require('../../store/useGameStore');
  return storeMod.useGameStore;
}
