"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterCreation = CharacterCreation;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const raceBackgrounds_1 = require("@/data/raceBackgrounds");
const useGameStore_1 = require("@/store/useGameStore");
const Button_1 = require("@/components/core/Button");
const seededRng_1 = require("@/utils/seededRng");
function CharacterCreation() {
    const { startGame } = (0, useGameStore_1.useGameStore)();
    const [name, setName] = (0, react_1.useState)('');
    const [gender, setGender] = (0, react_1.useState)('Male');
    const [race, setRace] = (0, react_1.useState)('Human');
    const [background, setBackground] = (0, react_1.useState)(null);
    const races = Object.keys(raceBackgrounds_1.RACE_BACKGROUNDS);
    const backgrounds = raceBackgrounds_1.RACE_BACKGROUNDS[race] || [];
    const randomizeRace = () => {
        const randomRace = races[Math.floor((0, seededRng_1.runtimeRng)() * races.length)];
        setRace(randomRace);
        // When race changes, reset background
        setBackground(null);
    };
    const randomizeBackground = () => {
        if (backgrounds.length > 0) {
            const randomBackground = backgrounds[Math.floor((0, seededRng_1.runtimeRng)() * backgrounds.length)];
            setBackground(randomBackground);
        }
    };
    const handleRaceChange = (selectedRace) => {
        setRace(selectedRace);
        setBackground(null); // Reset background when race changes
    };
    const handleBackgroundChange = (backgroundId) => {
        const selectedBackground = backgrounds.find(bg => bg.id === backgroundId);
        setBackground(selectedBackground || null);
    };
    const handleCreateCharacter = () => {
        startGame({ name, gender: gender, race, background });
    };
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'legendary': return '#ffd700'; // gold
            case 'epic': return '#9b59b6'; // purple
            case 'rare': return '#007bff'; // blue
            case 'uncommon': return '#28a745'; // green
            case 'common': return '#6c757d'; // gray
            default: return '#ffffff'; // white
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--dark), var(--darker))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            color: 'var(--text-primary)'
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                background: 'var(--gradient-card)',
                border: '2px solid var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                boxShadow: 'var(--shadow-glow)',
                backdropFilter: 'blur(10px)',
                maxWidth: '800px',
                width: '100%'
            }, children: [(0, jsx_runtime_1.jsx)("h2", { style: {
                        textAlign: 'center',
                        color: 'var(--primary)',
                        marginBottom: '30px',
                        fontSize: '2.5rem',
                        fontFamily: 'var(--font-decorative)'
                    }, children: "Create Your Character" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '20px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold' }, children: "Name:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), style: {
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem'
                                    }, placeholder: "Enter your name" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold' }, children: "Gender:" }), (0, jsx_runtime_1.jsxs)("select", { value: gender, onChange: (e) => setGender(e.target.value), style: {
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem'
                                    }, children: [(0, jsx_runtime_1.jsx)("option", { value: "Male", children: "Male" }), (0, jsx_runtime_1.jsx)("option", { value: "Female", children: "Female" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold' }, children: "Race:" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("select", { value: race, onChange: (e) => handleRaceChange(e.target.value), style: {
                                                flex: 1,
                                                padding: '12px',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'var(--dark)',
                                                color: 'var(--text-primary)',
                                                fontSize: '1rem'
                                            }, children: races.map(raceOption => ((0, jsx_runtime_1.jsx)("option", { value: raceOption, children: raceOption }, raceOption))) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: randomizeRace, variant: "secondary", children: "Randomize" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold' }, children: "Background:" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [(0, jsx_runtime_1.jsxs)("select", { value: background?.id || '', onChange: (e) => handleBackgroundChange(e.target.value), style: {
                                                flex: 1,
                                                padding: '12px',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'var(--dark)',
                                                color: 'var(--text-primary)',
                                                fontSize: '1rem'
                                            }, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select a background..." }), backgrounds.map(bg => ((0, jsx_runtime_1.jsxs)("option", { value: bg.id, children: [bg.name, " (", bg.rarity, ")"] }, bg.id)))] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: randomizeBackground, variant: "secondary", children: "Randomize" })] })] }), background && ((0, jsx_runtime_1.jsxs)("div", { style: {
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid var(--primary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '16px',
                                marginTop: '10px'
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }, children: (0, jsx_runtime_1.jsxs)("h3", { style: {
                                            color: 'var(--primary)',
                                            margin: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }, children: [background.name, (0, jsx_runtime_1.jsx)("span", { style: {
                                                    fontSize: '0.8rem',
                                                    color: getRarityColor(background.rarity),
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase'
                                                }, children: background.rarity })] }) }), (0, jsx_runtime_1.jsx)("p", { style: {
                                        color: 'var(--text-secondary)',
                                        marginBottom: '12px',
                                        lineHeight: '1.4'
                                    }, children: background.description }), background.effects && Object.keys(background.effects).length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: {
                                                color: 'var(--accent)',
                                                margin: '0 0 8px 0',
                                                fontSize: '0.9rem'
                                            }, children: "Starting Bonuses:" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                display: 'grid',
                                                gap: '4px',
                                                fontSize: '0.85rem'
                                            }, children: Object.entries(background.effects).map(([key, value]) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--muted)' }, children: [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), ":"] }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--success)', fontWeight: 'bold' }, children: typeof value === 'object' ? JSON.stringify(value) : value })] }, key))) })] })), background.weaponMastery && Object.keys(background.weaponMastery).length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '12px' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: {
                                                color: 'var(--accent)',
                                                margin: '0 0 8px 0',
                                                fontSize: '0.9rem'
                                            }, children: "Weapon Mastery:" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                                display: 'grid',
                                                gap: '3px',
                                                fontSize: '0.85rem'
                                            }, children: Object.entries(background.weaponMastery).map(([weapon, mastery]) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--muted)' }, children: [weapon.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), ":"] }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--success)', fontWeight: 'bold' }, children: mastery.tier })] }, weapon))) })] }))] })), (0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', marginTop: '30px' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: handleCreateCharacter, disabled: !name || !background, style: {
                                    background: !name || !background
                                        ? 'var(--muted)'
                                        : 'linear-gradient(135deg, var(--primary), var(--accent))',
                                    color: 'var(--dark)',
                                    border: '2px solid var(--primary)',
                                    borderRadius: '8px',
                                    padding: '16px 32px',
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    cursor: !name || !background ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit',
                                    opacity: !name || !background ? 0.6 : 1
                                }, children: "Begin Your Journey" }) })] })] }) }));
}
