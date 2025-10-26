import { useMemo, useState } from 'react';
import SmallChip from '@/components/ui/SmallChip';
import { useRelationshipsStore, type RelationshipCategory, type Relationship } from '@/store/relationships';
import { useGameStore } from '../store/useGameStore';
import { Card } from './core/Card';

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: 12 }}>
      <div style={{ marginBottom: 8, color: 'var(--primary)', fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

function RelationshipCard({
  id, name, category, affinity, notes,
  onRemove, onUpdate
}: {
  id: string; name: string; category: RelationshipCategory; affinity: number; notes?: string;
  onRemove: (id: string) => void; onUpdate: (id: string, updates: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ name, category, affinity, notes: notes || '' });

  const save = () => {
    onUpdate(id, local);
    setEditing(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, padding: 8, borderBottom: '1px dashed rgba(212,175,55,0.1)' }}>
      <div>
        {!editing ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ color: 'var(--primary)' }}>{name}</strong>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>({category})</span>
              <span style={{ marginLeft: 'auto', color: affinity >= 0 ? 'var(--success)' : 'var(--danger)' }}>{affinity}</span>
            </div>
            {notes && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{notes}</div>}
          </>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            <input
              style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
              value={local.name}
              onChange={e => setLocal(v => ({ ...v, name: e.target.value }))}
              placeholder="Name"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={local.category}
                onChange={e => setLocal(v => ({ ...v, category: e.target.value as RelationshipCategory }))}
                style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
              >
                {(['Friend','Lover','Mentor','Rival'] as RelationshipCategory[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                value={local.affinity}
                onChange={e => setLocal(v => ({ ...v, affinity: Number(e.target.value) }))}
                min={-100}
                max={100}
                style={{ width: 100, padding: 6, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
              />
            </div>
            <textarea
              rows={2}
              value={local.notes}
              onChange={e => setLocal(v => ({ ...v, notes: e.target.value }))}
              style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
              placeholder="Notes"
            />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'start' }}>
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)} style={{ padding: 0 }}><SmallChip>Edit</SmallChip></button>
            <button onClick={() => onRemove(id)} style={{ padding: 0 }}><SmallChip style={{ color: 'var(--danger)' }}>Remove</SmallChip></button>
          </>
        ) : (
          <>
            <button onClick={save} style={{ padding: 0 }}><SmallChip style={{ color: 'var(--success)' }}>Save</SmallChip></button>
            <button onClick={() => setEditing(false)} style={{ padding: 0 }}><SmallChip>Cancel</SmallChip></button>
          </>
        )}
      </div>
    </div>
  );
}

export function InterpersonalTab() {
  const {
    relationships,
    addRelationship: add,
    removeRelationship: remove,
    updateRelationship: update,
    searchRelationships: search,
    getRelationshipsByCategory: getByCategory,
    includeRival, setIncludeRival
  } = useRelationshipsStore();

  const { player } = useGameStore();

  const [filterQuery, setFilter] = useState('');
  const [selectedCategory, setCategory] = useState<RelationshipCategory | 'All'>('All');

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<RelationshipCategory>('Friend');
  const [newNotes, setNewNotes] = useState('');
  const [newAffinity, setNewAffinity] = useState(0);

  const filtered = useMemo(() => {
    const list = filterQuery ? search(filterQuery) : (selectedCategory === 'All' ? relationships : getByCategory(selectedCategory as RelationshipCategory));
    // group by category for display
    const groups: Record<string, Relationship[]> = { Friend: [], Lover: [], Mentor: [], Rival: [] };
    list.forEach(e => { (groups[e.category] ||= []).push(e); });
    return groups;
  }, [filterQuery, search, getByCategory, selectedCategory, relationships]);

  const submitNew = () => {
    if (!newName.trim()) return;
    add({ name: newName.trim(), category: newCategory, description: '', notes: newNotes.trim(), affinity: newAffinity });
    setNewName(''); setNewNotes(''); setNewAffinity(0); setNewCategory('Friend');
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Section title="Add Relationship">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 1fr auto', gap: 8 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Name"
            style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
          />
          <select value={newCategory} onChange={e => setNewCategory(e.target.value as RelationshipCategory)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
          >
            {(['Friend','Lover','Mentor','Rival'] as RelationshipCategory[]).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input type="number" min={-100} max={100} value={newAffinity}
            onChange={e => setNewAffinity(Number(e.target.value))}
            style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
          />
          <input
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            placeholder="Notes (optional)"
            style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
          />
          <button onClick={submitNew} style={{ padding: 0 }}><SmallChip>Add</SmallChip></button>
        </div>
      </Section>

      <Section title="Filter & Settings">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={filterQuery}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search by name or notes"
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
          />
          <select value={selectedCategory} onChange={e => setCategory(e.target.value as any)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}
          >
            {(['All','Friend','Lover','Mentor','Rival'] as Array<RelationshipCategory | 'All'>).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
            <input type="checkbox" checked={includeRival} onChange={e => setIncludeRival(e.target.checked)} />
            Include rival in list
          </label>
        </div>
      </Section>

      {(['Friend','Lover','Mentor','Rival'] as RelationshipCategory[]).map(cat => (
        <Section key={cat} title={`${cat}s`}>
          {filtered[cat].length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No entries</div>
          ) : (
            filtered[cat].map(e => (
              <RelationshipCard key={e.id}
                id={e.id}
                name={e.name}
                category={e.category}
                affinity={e.affinity}
                notes={e.notes}
                onRemove={remove}
                onUpdate={update}
              />
            ))
          )}
        </Section>
      ))}

      <Card title="Inventory">
        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {player.inventory.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>Empty</p>
          ) : (
            player.inventory.map((item, index) => (
              <div key={index} style={{ padding: '8px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--primary)' }}>{item.name}</strong>
                  {item.quantity && item.quantity > 1 && <span style={{ color: 'var(--accent)'}}>x{item.quantity}</span>}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>{item.description}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
