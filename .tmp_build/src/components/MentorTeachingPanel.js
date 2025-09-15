"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../store/useGameStore");
const MinigameManager_1 = require("./minigames/MinigameManager");
const mentors_runtime_1 = __importDefault(require("../data/mentors_runtime"));
const playtestScaling_1 = require("../utils/playtestScaling");
const mentorColors = {
    mentor_mo_wuji: '#8B0000', // Fang Yuan -> Mo Wuji
    mentor_lu_chen: '#2F4F4F', // Han Jue -> Lu Chen
    mentor_lie_tian: '#DC143C', // Xiao Yan -> Lie Tian
    mentor_xue_ji: '#8B4513', // Su Ming -> Xue Ji
    mentor_ling_ni: '#4169E1', // Fu Yao -> Ling Ni
    mentor_yuan_shan: '#4682B4', // Han Li -> Yuan Shan
    mentor_qing_xuan: '#ADD8E6', // Lan Wangji -> Qing Xuan
    mentor_li_jian: '#D3D3D3' // Ji Ning -> Li Jian
};
const MentorTeachingPanel = () => {
    const { player, world, story, ui, updatePlayerState, isMentorOnCooldown, getMentorCooldownRemaining, getAvailableTeachingsForMentor, mentorTeachingSystem } = (0, useGameStore_1.useGameStore)((state) => ({
        player: state.player,
        world: state.world,
        story: state.story,
        ui: state.ui,
        updatePlayerState: state.updatePlayerState,
        isMentorOnCooldown: state.isMentorOnCooldown,
        getMentorCooldownRemaining: state.getMentorCooldownRemaining,
        getAvailableTeachingsForMentor: state.getAvailableTeachingsForMentor,
        attemptMentorTeaching: state.attemptMentorTeaching,
        mentorTeachingSystem: state.mentorTeachingSystem
    }));
    const [selectedMentor, setSelectedMentor] = (0, react_1.useState)('mentor_mo_wuji');
    const [availableTeachings, setAvailableTeachings] = (0, react_1.useState)([]);
    const [notification, setNotification] = (0, react_1.useState)('');
    const [isLoading] = (0, react_1.useState)(false);
    const [currentChallenge, setCurrentChallenge] = (0, react_1.useState)(null);
    const mentors = mentors_runtime_1.default.map(m => ({
        id: m.id,
        name: m.displayName,
        title: m.dao,
        color: mentorColors[m.id] || '#6c757d'
    }));
    (0, react_1.useEffect)(() => {
        if (player && getAvailableTeachingsForMentor) {
            try {
                const teachings = getAvailableTeachingsForMentor(selectedMentor);
                setAvailableTeachings(teachings || []);
            }
            catch (error) {
                console.error('Error loading teachings:', error);
                setAvailableTeachings([]);
            }
        }
        // Refresh periodically to update cooldown remaining
        const t = setInterval(() => {
            // trigger re-render by setting state from store (no-op read)
            setAvailableTeachings(prev => prev);
        }, 1000);
        return () => clearInterval(t);
    }, [selectedMentor, player, world, story, ui, getAvailableTeachingsForMentor]);
    const attemptTeaching = async (teachingId) => {
        if (!mentorTeachingSystem || !player)
            return;
        const teaching = availableTeachings.find(t => t.id === teachingId);
        if (!teaching)
            return;
        // Start the minigame challenge
        setCurrentChallenge({
            teachingId,
            challengeType: teaching.challenge.type,
            difficulty: teaching.challenge.difficulty,
            timeLimit: teaching.challenge.timeLimit,
            successThreshold: teaching.challenge.successThreshold || 70
        });
    };
    const handleChallengeComplete = (result) => {
        if (!currentChallenge || !player)
            return;
        const { teachingId } = currentChallenge;
        const teaching = availableTeachings.find(t => t.id === teachingId);
        if (!teaching)
            return;
        // Update teaching progress with the result from the minigame.
        // The previous implementation incorrectly called `attemptTeaching`, which would re-run a simulation.
        const gameState = { player, world, story, ui, systems: useGameStore_1.useGameStore.getState().systems };
        const challengeResult = {
            success: result.success,
            score: result.score || 0,
            timeTaken: result.timeTaken || 0,
        };
        mentorTeachingSystem.recordChallengeResult(teachingId, challengeResult, gameState);
        if (result.success) {
            // Apply rewards
            const rewards = {};
            // Base rewards
            if (teaching?.reward) {
                Object.entries(teaching.reward).forEach(([key, value]) => {
                    rewards[key] = (rewards[key] || 0) + value;
                });
            }
            // Bonus rewards
            if (result.bonusRewards) {
                Object.entries(result.bonusRewards).forEach(([key, value]) => {
                    rewards[key] = (rewards[key] || 0) + value;
                });
            }
            if (Object.keys(rewards).length > 0) {
                // Apply minimal playtest scaling to minigame rewards before updating player
                const scaled = playtestScaling_1.PlaytestScaling.applyScaledEffects(rewards, { source: 'minigame' });
                updatePlayerState(scaled);
            }
            setNotification(`✅ Teaching completed successfully! Score: ${result.score}%`);
        }
        else {
            // Apply failure consequences
            if (result.penaltyConsequences) {
                updatePlayerState(result.penaltyConsequences);
            }
            setNotification(`❌ Teaching failed. Score: ${result.score}%`);
        }
        // Update available teachings
        const teachings = getAvailableTeachingsForMentor(selectedMentor);
        setAvailableTeachings(teachings || []);
        // Clear challenge
        setCurrentChallenge(null);
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(''), 5000);
    };
    const handleChallengeCancel = () => {
        setCurrentChallenge(null);
    };
    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: '#28a745',
            medium: '#ffc107',
            hard: '#fd7e14',
            extreme: '#FF6B35',
            legendary: '#F7931E',
            mythical: '#9B59B6',
            transcendent: '#3498DB',
            impossible: '#E74C3C'
        };
        return colors[difficulty?.toLowerCase()] || '#95A5A6';
    };
    const checkPrerequisites = (teaching) => {
        if (!mentorTeachingSystem || !player)
            return false;
        try {
            const gameState = { player, world, story, ui, systems: useGameStore_1.useGameStore.getState().systems };
            return mentorTeachingSystem.checkPrerequisites(teaching, gameState);
        }
        catch (error) {
            console.error('Error checking prerequisites:', error);
            return false;
        }
    };
    if (!player) {
        return ((0, jsx_runtime_1.jsx)("div", { style: { padding: '20px', textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)("p", { children: "Loading player data..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { textAlign: 'center', marginBottom: '20px', color: '#333' }, children: "Mentor Teachings" }), currentChallenge && ((0, jsx_runtime_1.jsx)(MinigameManager_1.MinigameManager, { challengeType: currentChallenge.challengeType, difficulty: currentChallenge.difficulty, timeLimit: currentChallenge.timeLimit, successThreshold: currentChallenge.successThreshold, onComplete: handleChallengeComplete, onCancel: handleChallengeCancel })), notification && ((0, jsx_runtime_1.jsx)("div", { style: {
                    padding: '10px',
                    marginBottom: '20px',
                    backgroundColor: notification.includes('✅') ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${notification.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '5px',
                    textAlign: 'center',
                    color: notification.includes('✅') ? '#155724' : '#721c24'
                }, children: notification })), (0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    marginBottom: '30px'
                }, children: mentors.map(mentor => {
                    const isSelected = selectedMentor === mentor.id;
                    const affinity = player.mentorAffinity?.[mentor.id] || 0;
                    const onCooldown = isMentorOnCooldown?.(mentor.id) || false;
                    const remaining = onCooldown ? getMentorCooldownRemaining?.(mentor.id) || 0 : 0;
                    return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setSelectedMentor(mentor.id), disabled: isLoading, style: {
                            padding: '15px',
                            border: isSelected ? `3px solid ${mentor.color}` : '1px solid #ccc',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? `${mentor.color}20` : 'white',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            textAlign: 'center',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }, children: mentor.name }), (0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '12px',
                                    color: mentor.color,
                                    marginBottom: '5px',
                                    fontStyle: 'italic'
                                }, children: mentor.title }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '10px', color: '#666' }, children: ["Affinity: ", affinity] }), onCooldown && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '8px', fontSize: '12px', color: '#dc3545', fontWeight: 600 }, children: ["Mentor is resting... ", remaining, " ticks left"] }))] }, mentor.id));
                }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { style: { marginBottom: '15px', color: '#333' }, children: ["Available Teachings for ", mentors.find(m => m.id === selectedMentor)?.name || 'Unknown Mentor'] }), isMentorOnCooldown?.(selectedMentor) && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            textAlign: 'center',
                            padding: '12px 16px',
                            color: '#663c00',
                            backgroundColor: '#fff3cd',
                            borderRadius: '8px',
                            border: '1px solid #ffeeba',
                            marginBottom: '12px',
                            fontWeight: 600
                        }, children: ["Mentor is on cooldown. Remaining: ", getMentorCooldownRemaining?.(selectedMentor), " ticks"] })), availableTeachings.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: {
                            textAlign: 'center',
                            padding: '40px',
                            color: '#666',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                        }, children: "No teachings available. Increase your affinity with this mentor or meet other prerequisites." })) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '20px' }, children: availableTeachings.map(teaching => {
                            const canAttempt = checkPrerequisites(teaching);
                            const mentorCooldown = isMentorOnCooldown?.(selectedMentor) || false;
                            const cooldownRemaining = mentorCooldown ? getMentorCooldownRemaining?.(selectedMentor) || 0 : 0;
                            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    backgroundColor: '#f9f9f9',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '10px'
                                        }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: 0, color: '#333' }, children: teaching.title }), (0, jsx_runtime_1.jsx)("span", { style: {
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    backgroundColor: getDifficultyColor(teaching.challenge?.difficulty || 'unknown')
                                                }, children: (teaching.challenge?.difficulty || 'UNKNOWN').toUpperCase() })] }), (0, jsx_runtime_1.jsx)("p", { style: {
                                            margin: '10px 0',
                                            fontStyle: 'italic',
                                            color: '#555',
                                            lineHeight: '1.4'
                                        }, children: teaching.description }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '15px', fontSize: '14px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Challenge:" }), " ", teaching.challenge?.requirements || 'Unknown'] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Restriction:" }), " ", teaching.challenge?.restriction || 'None'] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '15px',
                                            marginBottom: '15px'
                                        }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Rewards:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '5px 0', paddingLeft: '20px' }, children: Object.entries(teaching.reward || {}).map(([key, value]) => ((0, jsx_runtime_1.jsxs)("li", { style: { color: '#28a745', fontSize: '14px' }, children: [key, ": ", typeof value === 'boolean' ? (value ? 'Gained' : 'Lost') : `+${value}`] }, key))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Failure Consequences:" }), (0, jsx_runtime_1.jsx)("ul", { style: { margin: '5px 0', paddingLeft: '20px' }, children: Object.entries(teaching.failureConsequence || {}).map(([key, value]) => ((0, jsx_runtime_1.jsxs)("li", { style: { color: '#dc3545', fontSize: '14px' }, children: [key, ": ", typeof value === 'boolean' ? (value ? 'Gained' : 'Lost') : `${value}`] }, key))) })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => attemptTeaching(teaching.id), disabled: !canAttempt || isLoading || mentorCooldown, style: {
                                            padding: '10px 20px',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: (!canAttempt || isLoading || mentorCooldown) ? 'not-allowed' : 'pointer',
                                            width: '100%',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            backgroundColor: (!canAttempt || isLoading || mentorCooldown) ? '#6c757d' : '#007bff',
                                            opacity: isLoading ? 0.7 : 1,
                                            transition: 'all 0.2s ease'
                                        }, children: mentorCooldown
                                            ? `On cooldown (${cooldownRemaining} ticks)`
                                            : isLoading
                                                ? 'Processing...'
                                                : canAttempt
                                                    ? 'Attempt Teaching'
                                                    : 'Prerequisites Not Met' })] }, teaching.id));
                        }) }))] })] }));
};
exports.default = MentorTeachingPanel;
