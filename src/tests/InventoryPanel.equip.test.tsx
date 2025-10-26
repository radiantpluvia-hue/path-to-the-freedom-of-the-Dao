import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { InventoryPanel } from '../components/game/InventoryPanel';

function makeMockStore(initialPlayer: any) {
  const fakeStore: any = {
    player: { ...initialPlayer },
    useItem: jest.fn(() => {}),
    removeInventoryAt: jest.fn(() => {}),
    removeFromInventoryById: jest.fn(() => {}),
    equipItem: jest.fn((slot: string, item: any) => {
      const eq: any = { ...(fakeStore.player.equipment || {}) };
      eq[slot] = item;
      fakeStore.player.equipment = eq;
    }),
    unequipItem: jest.fn((slot: string) => {
      const eq: any = { ...(fakeStore.player.equipment || {}) };
      if (eq[slot]) delete eq[slot];
      fakeStore.player.equipment = eq;
    }),
  };

  const hook = ((selector?: any) => (selector ? selector(fakeStore) : fakeStore)) as any;
  hook.getState = () => fakeStore;
  hook.setState = jest.fn((obj: any) => {
    if (obj && obj.player) Object.assign(fakeStore.player, obj.player);
  });
  hook.equipItem = fakeStore.equipItem;
  hook.unequipItem = fakeStore.unequipItem;
  return { hook, fakeStore };
}

describe('InventoryPanel equip flows', () => {
  afterEach(() => {
    jest.resetModules();
    // clean any injected require cache entries
    try { delete (require as any).cache[require.resolve('../systems/relicRegistry')]; } catch (e) {}
    try { delete (require as any).cache[require.resolve('../../systems/relicRegistry')]; } catch (e) {}
  });

  test('calls store.equipItem for regular equipment with stats/slot', () => {
    const initialPlayer = { inventory: [{ id: 'sword_1', name: 'Test Sword', stats: { atk: 5 }, slot: 'mainHand' }], equipment: {} };
    const { hook, fakeStore } = makeMockStore(initialPlayer);

    render(React.createElement(InventoryPanel, { injectedUseGameStore: hook }));

    const sword = screen.getByText(/Test Sword/i);
    expect(sword).toBeInTheDocument();

    const group = sword.closest('.inventory-row') || sword.parentElement?.parentElement;
    expect(group).toBeTruthy();
    const equipBtn = within(group as HTMLElement).getByText(/Equip/i);
    fireEvent.click(equipBtn);

    expect(fakeStore.equipItem).toHaveBeenCalledWith('mainHand', expect.objectContaining({ id: 'sword_1' }));
  });

  test('calls relicRegistry.equipRelicOnPlayer and sets player when equipping a relic', () => {
    const equipRelicOnPlayer = jest.fn((player: any, relicId: string) => {
      const updated = { ...player, equipment: { ...(player.equipment || {}), mainHand: { id: `relic_${relicId}`, name: 'Relic Weapon' } } };
      return updated;
    });
    const findRelic = jest.fn((id: string) => ({ id, slot: 'weapon', rarity: 'Mythic' }));

    const relicRegistryMock = { findRelic, equipRelicOnPlayer };

    const initialPlayer = { inventory: [{ id: 'relic_test', name: 'Relic Test' }], equipment: {} };
    const { hook } = makeMockStore(initialPlayer);

  render(React.createElement(InventoryPanel, { injectedUseGameStore: hook, injectedRelicRegistry: relicRegistryMock }));

    const relicRow = screen.getByText(/Relic Test/i);
    expect(relicRow).toBeInTheDocument();
    const group = relicRow.closest('.inventory-row') || relicRow.parentElement?.parentElement;
    expect(group).toBeTruthy();
    const equipBtn = within(group as HTMLElement).getByText(/Equip/i);
    fireEvent.click(equipBtn);

    expect(findRelic).toHaveBeenCalledWith('test');
    expect(equipRelicOnPlayer).toHaveBeenCalled();

    // verify that the mocked hook.setState was called to persist the change
    expect(hook.setState).toHaveBeenCalledWith(expect.objectContaining({ player: expect.any(Object) }));

    const updatedPlayer = hook.getState().player;
    expect(updatedPlayer.equipment.mainHand).toBeTruthy();
    expect(updatedPlayer.equipment.mainHand.name).toBe('Relic Weapon');
  });
});
