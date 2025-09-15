import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { type Recipe } from '@/systems';
import { stationsById } from '@/data/craftingStations';

// Mock Button component for styling consistency
type ButtonProps = { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'secondary'; style?: React.CSSProperties };
const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false, variant = 'primary', style = {} }) => {
  const baseStyle = {
    padding: '10px 15px',
    border: '1px solid var(--primary)',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    fontWeight: 'bold',
  };
  const variantStyle: Record<'primary' | 'secondary', React.CSSProperties> = {
    primary: { background: 'var(--primary)', color: 'var(--dark)' },
    secondary: { background: 'transparent', color: 'var(--primary)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...baseStyle, ...variantStyle[variant], ...style }}>
      {children}
    </button>
  );
};

export const CraftingScreen = () => {
  const { player, craftingSystem, getAvailableCraftingRecipes, craftItem, experimentWithIngredients, setUIProperty } = useGameStore();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'alchemy' | 'forging' | 'experiment'>('alchemy');
  const [experimentSlots, setExperimentSlots] = useState<any[]>([]);

  const availableRecipes = useMemo(() => getAvailableCraftingRecipes(), [getAvailableCraftingRecipes]);
  const station = player.currentLocationId ? stationsById.get(player.currentLocationId) : null;

  const handleCraft = () => {
    if (selectedRecipe) {
      // The store will automatically use player.currentLocationId
      craftItem(selectedRecipe.id);
      const updatedRecipe = craftingSystem.getRecipe(selectedRecipe.id);
      if (updatedRecipe) {
        setSelectedRecipe(updatedRecipe);
      }
    }
  };

  const handleExperiment = () => {
    const ingredientIds = experimentSlots.map(item => item.itemId);
    experimentWithIngredients(ingredientIds);
    setExperimentSlots([]); // Clear slots after experimenting
  };

  const addToExperimentSlot = (item: any) => {
    if (experimentSlots.length < 5) { // Limit to 5 ingredients for simplicity
      setExperimentSlots([...experimentSlots, item]);
    }
  };

  const removeFromExperimentSlot = (index: number) => {
    setExperimentSlots(experimentSlots.filter((_, i) => i !== index));
  };

  const inventoryMaterials = useMemo(() => {
    const counts = player.inventory.reduce((acc: Record<string, any>, item: any) => {
      if (item.type !== 'pill' && item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'elixir') { // Filter for materials
        const id = item.itemId || item.id || 'unknown';
        acc[id] = (acc[id] || { ...item, count: 0 });
        acc[id].count++;
      }
      return acc;
    }, {});
    return Object.values(counts);
  }, [player.inventory]);

  const canCraft = selectedRecipe ? craftingSystem.canCraft(selectedRecipe.id, player) : { can: false, reason: 'No recipe selected.' };
  const filteredRecipes = activeTab !== 'experiment' ? availableRecipes.filter(r => r.skill === activeTab) : [];

  const getIngredientCount = (itemId: string) => {
    return player.inventory.filter(i => i.itemId === itemId).length;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--primary)', fontFamily: 'var(--font-decorative)' }}>Crafting Pavilion</h2>
        <Button onClick={() => setUIProperty('currentScreen', 'game')} variant="secondary">Back to Game</Button>
      </div>

      {station && (
        <div style={{ padding: '10px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
          ✨ Active Station: <strong>{station.name}</strong> (+{station.bonuses.successChance ? (station.bonuses.successChance * 100) : 0}% success, +{station.bonuses.qualityChance ? (station.bonuses.qualityChance * 100) : 0}% quality)
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setActiveTab('alchemy')} style={{ padding: '10px', border: 'none', background: activeTab === 'alchemy' ? 'var(--primary)' : 'transparent', color: activeTab === 'alchemy' ? 'var(--dark)' : 'var(--primary)', cursor: 'pointer' }}>Alchemy</button>
        <button onClick={() => setActiveTab('forging')} style={{ padding: '10px', border: 'none', background: activeTab === 'forging' ? 'var(--primary)' : 'transparent', color: activeTab === 'forging' ? 'var(--dark)' : 'var(--primary)', cursor: 'pointer' }}>Forging</button>
        <button onClick={() => setActiveTab('experiment')} style={{ padding: '10px', border: 'none', background: activeTab === 'experiment' ? 'var(--primary)' : 'transparent', color: activeTab === 'experiment' ? 'var(--dark)' : 'var(--primary)', cursor: 'pointer' }}>Experiment</button>
      </div>

      {activeTab !== 'experiment' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Recipe List */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} style={{ padding: '10px', border: `1px solid ${selectedRecipe?.id === recipe.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', background: 'rgba(0,0,0,0.2)' }}>
              <strong>
                {recipe.name}
                {recipe.isSecret && <span title="Secret Recipe"> 📜</span>}
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Lvl {recipe.requiredLevel} {recipe.skill}</div>
            </div>
          ))}
        </div>

        {/* Selected Recipe Details */}
        <div>
          {selectedRecipe ? (
            <div style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
              <h3>{selectedRecipe.name}</h3>
              <p style={{ color: 'var(--muted)' }}>{selectedRecipe.description}</p>
              
              <h4>Ingredients:</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {selectedRecipe.ingredients.map(ing => {
                  const have = getIngredientCount(ing.itemId);
                  const need = ing.quantity;
                  return (
                    <li key={ing.itemId} style={{ color: have >= need ? 'var(--success)' : 'var(--danger)', marginBottom: '5px' }}>
                      {ing.itemId.replace(/_/g, ' ')}: {have} / {need}
                    </li>
                  );
                })}
              </ul>

              <h4>Output:</h4>
              <p>{selectedRecipe.output.name} x{selectedRecipe.output.quantity}</p>

              {selectedRecipe.output.uniqueProperties && (
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(212, 175, 55, 0.1)', borderLeft: '3px solid var(--primary)' }}>
                  <h5 style={{ margin: '0 0 5px 0', color: 'var(--primary)' }}>Unique Effect</h5>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selectedRecipe.output.uniqueProperties.description}</p>
                </div>
              )}

              <Button onClick={handleCraft} disabled={!canCraft.can}>{canCraft.can ? 'Craft' : canCraft.reason}</Button>
            </div>
          ) : <div style={{ textAlign: 'center', padding: '50px', color: 'var(--muted)' }}>Select a recipe to view details.</div>}
        </div>
      </div>
      ) : (
        // Experimentation UI
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div>
            <h4 style={{ marginTop: 0 }}>Your Materials</h4>
            <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }}>
              {inventoryMaterials.map(item => (
                <div key={item.itemId} onClick={() => addToExperimentSlot(item)} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name}</span>
                  <span style={{ color: 'var(--muted)' }}>x{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <h4>Experimentation Slots (Max 5)</h4>
            <div style={{ minHeight: '150px', border: '2px dashed var(--border)', borderRadius: '4px', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {experimentSlots.map((item, index) => (
                <div key={index} onClick={() => removeFromExperimentSlot(index)} style={{ padding: '8px 12px', background: 'var(--primary)', color: 'var(--dark)', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {item.name} &times;
                </div>
              ))}
              {experimentSlots.length === 0 && <p style={{ color: 'var(--muted)', alignSelf: 'center', width: '100%', textAlign: 'center' }}>Click materials from your inventory to add them here.</p>}
            </div>
            <Button onClick={handleExperiment} disabled={experimentSlots.length === 0}>
              Begin Experiment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};