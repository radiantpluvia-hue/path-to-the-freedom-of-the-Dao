"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftingScreen = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
const craftingStations_1 = require("@/data/craftingStations");
const Button = ({ children, onClick, disabled = false, variant = 'primary', style = {} }) => {
    const baseStyle = {
        padding: '10px 15px',
        border: '1px solid var(--primary)',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontWeight: 'bold',
    };
    const variantStyle = {
        primary: { background: 'var(--primary)', color: 'var(--dark)' },
        secondary: { background: 'transparent', color: 'var(--primary)' },
    };
    return ((0, jsx_runtime_1.jsx)("button", { onClick: onClick, disabled: disabled, style: { ...baseStyle, ...variantStyle[variant], ...style }, children: children }));
};
const CraftingScreen = () => {
    const { player, craftingSystem, getAvailableCraftingRecipes, craftItem, experimentWithIngredients, setUIProperty } = (0, useGameStore_1.useGameStore)();
    const [selectedRecipe, setSelectedRecipe] = (0, react_1.useState)(null);
    const [activeTab, setActiveTab] = (0, react_1.useState)('alchemy');
    const [experimentSlots, setExperimentSlots] = (0, react_1.useState)([]);
    const availableRecipes = (0, react_1.useMemo)(() => getAvailableCraftingRecipes(), [getAvailableCraftingRecipes]);
    const station = player.currentLocationId ? craftingStations_1.stationsById.get(player.currentLocationId) : null;
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
    const addToExperimentSlot = (item) => {
        if (experimentSlots.length < 5) { // Limit to 5 ingredients for simplicity
            setExperimentSlots([...experimentSlots, item]);
        }
    };
    const removeFromExperimentSlot = (index) => {
        setExperimentSlots(experimentSlots.filter((_, i) => i !== index));
    };
    const inventoryMaterials = (0, react_1.useMemo)(() => {
        const counts = player.inventory.reduce((acc, item) => {
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
    const getIngredientCount = (itemId) => {
        return player.inventory.filter(i => i.itemId === itemId).length;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { color: 'var(--primary)', fontFamily: 'var(--font-decorative)' }, children: "Crafting Pavilion" }), (0, jsx_runtime_1.jsx)(Button, { onClick: () => setUIProperty('currentScreen', 'game'), variant: "secondary", children: "Back to Game" })] }), station && ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '10px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }, children: ["\u2728 Active Station: ", (0, jsx_runtime_1.jsx)("strong", { children: station.name }), " (+", station.bonuses.successChance ? (station.bonuses.successChance * 100) : 0, "% success, +", station.bonuses.qualityChance ? (station.bonuses.qualityChance * 100) : 0, "% quality)"] })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTab('alchemy'), style: { padding: '10px', border: 'none', background: activeTab === 'alchemy' ? 'var(--primary)' : 'transparent', color: activeTab === 'alchemy' ? 'var(--dark)' : 'var(--primary)', cursor: 'pointer' }, children: "Alchemy" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTab('forging'), style: { padding: '10px', border: 'none', background: activeTab === 'forging' ? 'var(--primary)' : 'transparent', color: activeTab === 'forging' ? 'var(--dark)' : 'var(--primary)', cursor: 'pointer' }, children: "Forging" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTab('experiment'), style: { padding: '10px', border: 'none', background: activeTab === 'experiment' ? 'var(--primary)' : 'transparent', color: activeTab === 'experiment' ? 'var(--dark)' : 'var(--primary)', cursor: 'pointer' }, children: "Experiment" })] }), activeTab !== 'experiment' ? ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }, children: filteredRecipes.map(recipe => ((0, jsx_runtime_1.jsxs)("div", { onClick: () => setSelectedRecipe(recipe), style: { padding: '10px', border: `1px solid ${selectedRecipe?.id === recipe.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', background: 'rgba(0,0,0,0.2)' }, children: [(0, jsx_runtime_1.jsxs)("strong", { children: [recipe.name, recipe.isSecret && (0, jsx_runtime_1.jsx)("span", { title: "Secret Recipe", children: " \uD83D\uDCDC" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: 'var(--muted)' }, children: ["Lvl ", recipe.requiredLevel, " ", recipe.skill] })] }, recipe.id))) }), (0, jsx_runtime_1.jsx)("div", { children: selectedRecipe ? ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: selectedRecipe.name }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)' }, children: selectedRecipe.description }), (0, jsx_runtime_1.jsx)("h4", { children: "Ingredients:" }), (0, jsx_runtime_1.jsx)("ul", { style: { listStyle: 'none', padding: 0 }, children: selectedRecipe.ingredients.map(ing => {
                                        const have = getIngredientCount(ing.itemId);
                                        const need = ing.quantity;
                                        return ((0, jsx_runtime_1.jsxs)("li", { style: { color: have >= need ? 'var(--success)' : 'var(--danger)', marginBottom: '5px' }, children: [ing.itemId.replace(/_/g, ' '), ": ", have, " / ", need] }, ing.itemId));
                                    }) }), (0, jsx_runtime_1.jsx)("h4", { children: "Output:" }), (0, jsx_runtime_1.jsxs)("p", { children: [selectedRecipe.output.name, " x", selectedRecipe.output.quantity] }), selectedRecipe.output.uniqueProperties && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '15px', padding: '10px', background: 'rgba(212, 175, 55, 0.1)', borderLeft: '3px solid var(--primary)' }, children: [(0, jsx_runtime_1.jsx)("h5", { style: { margin: '0 0 5px 0', color: 'var(--primary)' }, children: "Unique Effect" }), (0, jsx_runtime_1.jsx)("p", { style: { margin: 0, color: 'var(--text-secondary)' }, children: selectedRecipe.output.uniqueProperties.description })] })), (0, jsx_runtime_1.jsx)(Button, { onClick: handleCraft, disabled: !canCraft.can, children: canCraft.can ? 'Craft' : canCraft.reason })] })) : (0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', padding: '50px', color: 'var(--muted)' }, children: "Select a recipe to view details." }) })] })) : (
            // Experimentation UI
            (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: { marginTop: 0 }, children: "Your Materials" }), (0, jsx_runtime_1.jsx)("div", { style: { maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }, children: inventoryMaterials.map(item => ((0, jsx_runtime_1.jsxs)("div", { onClick: () => addToExperimentSlot(item), style: { padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: item.name }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--muted)' }, children: ["x", item.count] })] }, item.itemId))) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Experimentation Slots (Max 5)" }), (0, jsx_runtime_1.jsxs)("div", { style: { minHeight: '150px', border: '2px dashed var(--border)', borderRadius: '4px', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }, children: [experimentSlots.map((item, index) => ((0, jsx_runtime_1.jsxs)("div", { onClick: () => removeFromExperimentSlot(index), style: { padding: '8px 12px', background: 'var(--primary)', color: 'var(--dark)', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold' }, children: [item.name, " \u00D7"] }, index))), experimentSlots.length === 0 && (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', alignSelf: 'center', width: '100%', textAlign: 'center' }, children: "Click materials from your inventory to add them here." })] }), (0, jsx_runtime_1.jsx)(Button, { onClick: handleExperiment, disabled: experimentSlots.length === 0, children: "Begin Experiment" })] })] }))] }));
};
exports.CraftingScreen = CraftingScreen;
