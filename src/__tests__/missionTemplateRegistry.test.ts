import { registerMissionTemplate, getRegisteredMissionTemplate, clearMissionRegistry, listRegisteredTemplates } from '@/systems/missionTemplateRegistry';

describe('missionTemplateRegistry', () => {
  beforeEach(() => { clearMissionRegistry(); });

  test('registers and retrieves templates', () => {
    const tpl = { id: 't1', title: 'T1', description: 'Desc' };
    expect(registerMissionTemplate(tpl as any)).toBe(true);
    const got = getRegisteredMissionTemplate('t1');
    expect(got).not.toBeNull();
    expect(got!.title).toBe('T1');
    expect(listRegisteredTemplates().length).toBe(1);
  });

  test('clear removes templates', () => {
    registerMissionTemplate({ id: 't2', title: 'T2' } as any);
    expect(listRegisteredTemplates().length).toBe(1);
    clearMissionRegistry();
    expect(listRegisteredTemplates().length).toBe(0);
    expect(getRegisteredMissionTemplate('t2')).toBeNull();
  });
});
