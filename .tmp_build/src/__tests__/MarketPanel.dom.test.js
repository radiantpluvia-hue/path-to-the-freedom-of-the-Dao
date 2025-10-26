"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const MarketPanel_1 = __importDefault(require("@/components/game/MarketPanel"));
const useGameStore_1 = require("@/store/useGameStore");
describe('MarketPanel DOM', () => {
    beforeEach(() => {
        // Ensure store provides safe market fallbacks
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({
            listMarkets: () => [],
            listMarketItems: (mid) => [],
            listActiveAuctions: () => [],
            listPlayerMarketInventory: () => ({}),
            purchaseFromMarket: () => false,
        });
    });
    test('shows no items placeholder when market empty', async () => {
        await (0, react_1.act)(async () => {
            (0, react_1.render)((0, jsx_runtime_1.jsx)(MarketPanel_1.default, {}));
        });
        expect(react_1.screen.getByText(/No items available/i)).toBeInTheDocument();
    });
});
