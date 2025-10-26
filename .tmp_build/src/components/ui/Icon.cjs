"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMPLEMENTED_ICON_IDS = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const IconNoble_1 = __importDefault(require("./icons/IconNoble"));
const IconScholar_1 = __importDefault(require("./icons/IconScholar"));
const IconCommoner_1 = __importDefault(require("./icons/IconCommoner"));
const IconSect_1 = __importDefault(require("./icons/IconSect"));
const IconInfernal_1 = __importDefault(require("./icons/IconInfernal"));
const IconOutcast_1 = __importDefault(require("./icons/IconOutcast"));
const IconWoodland_1 = __importDefault(require("./icons/IconWoodland"));
const IconWandering_1 = __importDefault(require("./icons/IconWandering"));
const IconDragonBlood_1 = __importDefault(require("./icons/IconDragonBlood"));
const IconDragonScholar_1 = __importDefault(require("./icons/IconDragonScholar"));
const IconPhoenixReborn_1 = __importDefault(require("./icons/IconPhoenixReborn"));
const IconPhoenixFlame_1 = __importDefault(require("./icons/IconPhoenixFlame"));
const IconCelestialBureau_1 = __importDefault(require("./icons/IconCelestialBureau"));
const IconCelestialFallen_1 = __importDefault(require("./icons/IconCelestialFallen"));
const IconAsuraWarborn_1 = __importDefault(require("./icons/IconAsuraWarborn"));
const IconAsuraRage_1 = __importDefault(require("./icons/IconAsuraRage"));
const IconAsuraTactician_1 = __importDefault(require("./icons/IconAsuraTactician"));
const IconMonkeyKing_1 = __importDefault(require("./icons/IconMonkeyKing"));
const IconMonkeyMountain_1 = __importDefault(require("./icons/IconMonkeyMountain"));
const IconMonkeyTrickster_1 = __importDefault(require("./icons/IconMonkeyTrickster"));
const IconMonkeyMystic_1 = __importDefault(require("./icons/IconMonkeyMystic"));
const IconMonkeyArtisan_1 = __importDefault(require("./icons/IconMonkeyArtisan"));
const IconFoxNine_1 = __importDefault(require("./icons/IconFoxNine"));
const IconFoxCity_1 = __importDefault(require("./icons/IconFoxCity"));
const IconQilinAuspice_1 = __importDefault(require("./icons/IconQilinAuspice"));
const IconQilinGuardian_1 = __importDefault(require("./icons/IconQilinGuardian"));
const IconQilinBlessed_1 = __importDefault(require("./icons/IconQilinBlessed"));
exports.IMPLEMENTED_ICON_IDS = [
    'icon-noble', 'icon-scholar', 'icon-commoner', 'icon-sect', 'icon-infernal', 'icon-outcast', 'icon-woodland', 'icon-wandering', 'icon-dragonblood', 'icon-dragon-scholar', 'icon-phoenix-reborn', 'icon-phoenix-flame', 'icon-celestial-bureau', 'icon-celestial-fallen', 'icon-asura-warborn', 'icon-asura-rage', 'icon-asura-tactician', 'icon-monkey-king', 'icon-monkey-mountain', 'icon-monkey-trickster', 'icon-monkey-mystic', 'icon-monkey-artisan', 'icon-fox-nine', 'icon-fox-city', 'icon-qilin-auspice', 'icon-qilin-guardian', 'icon-qilin-blessed'
];
const Svg = {
    'icon-noble': IconNoble_1.default,
    'icon-scholar': IconScholar_1.default,
    'icon-commoner': IconCommoner_1.default,
    'icon-sect': IconSect_1.default,
    'icon-infernal': IconInfernal_1.default,
    'icon-outcast': IconOutcast_1.default,
    'icon-woodland': IconWoodland_1.default,
    'icon-wandering': IconWandering_1.default,
    'icon-dragonblood': IconDragonBlood_1.default,
    'icon-dragon-scholar': IconDragonScholar_1.default,
    'icon-phoenix-reborn': IconPhoenixReborn_1.default,
    'icon-phoenix-flame': IconPhoenixFlame_1.default,
    'icon-celestial-bureau': IconCelestialBureau_1.default,
    'icon-celestial-fallen': IconCelestialFallen_1.default,
    'icon-asura-warborn': IconAsuraWarborn_1.default,
    'icon-asura-rage': IconAsuraRage_1.default,
    'icon-asura-tactician': IconAsuraTactician_1.default,
    'icon-monkey-king': IconMonkeyKing_1.default,
    'icon-monkey-mountain': IconMonkeyMountain_1.default,
    'icon-monkey-trickster': IconMonkeyTrickster_1.default,
    'icon-monkey-mystic': IconMonkeyMystic_1.default,
    'icon-monkey-artisan': IconMonkeyArtisan_1.default,
    'icon-fox-nine': IconFoxNine_1.default,
    'icon-fox-city': IconFoxCity_1.default,
    'icon-qilin-auspice': IconQilinAuspice_1.default,
    'icon-qilin-guardian': IconQilinGuardian_1.default,
    'icon-qilin-blessed': IconQilinBlessed_1.default,
};
const Icon = ({ id, size = 40, className, alt }) => {
    const SvgComp = Svg[id];
    const ariaHidden = !alt;
    const wrapperStyle = { width: size, height: size, display: 'inline-block' };
    const srOnlyStyle = {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0
    };
    if (SvgComp) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: className, "aria-hidden": ariaHidden, "aria-label": alt, style: wrapperStyle, children: [(0, jsx_runtime_1.jsx)(SvgComp, { width: size, height: size }), alt && (0, jsx_runtime_1.jsx)("span", { style: srOnlyStyle, children: alt })] }));
    }
    // generic placeholder SVG
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, "aria-hidden": ariaHidden, "aria-label": alt, style: wrapperStyle, children: [(0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0, jsx_runtime_1.jsx)("rect", { x: "3", y: "3", width: "18", height: "18", rx: "3", fill: "#E5E7EB" }), (0, jsx_runtime_1.jsx)("text", { x: "12", y: "16", fontSize: "10", textAnchor: "middle", fill: "#374151", children: "?" })] }), alt && (0, jsx_runtime_1.jsx)("span", { style: srOnlyStyle, children: alt })] }));
};
exports.default = Icon;
