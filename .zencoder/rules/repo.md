---
description: Repository Information Overview
alwaysApply: true
---

# Xianxia Game Information

## Summary
A browser-based Xianxia cultivation game called "Xianxia: Toward the Dao". The game is implemented as a single HTML file with embedded JavaScript and CSS. It features a cultivation system, character creation, events, quests, and a progression system based on Xianxia/cultivation novel tropes.

## Structure
The entire game is contained in a single HTML file (`gameact1.html`) with embedded JavaScript for game logic and CSS for styling. The game uses Font Awesome and Google Fonts for icons and typography.

## Language & Runtime
**Language**: HTML, CSS, JavaScript
**Runtime**: Web browser
**Framework**: Vanilla JavaScript (no external frameworks)

## Dependencies
**External Resources**:
- Font Awesome 6.4.0 (CDN: cdnjs.cloudflare.com)
- Google Fonts: 'Ma Shan Zheng' and 'ZCOOL XiaoWei' (fonts.googleapis.com)

## Game Features
**Character Creation**:
- Race selection (Human, Divine, Heavenly, Demon, Devil, Ghost, Spirit, Monster)
- Background selection
- Skill allocation system

**Gameplay Systems**:
- Cultivation system with realms and breakthroughs
- Event system with context-based triggers
- Quest system
- Inventory and items
- Currency system (Yuan and Spirit Stones)
- Reputation system
- Combat mechanics

**Game Progression**:
- Act-based storyline (currently Act 1 implemented)
- Realm advancement through cultivation
- Character development through skills and abilities

## Game Structure
**Main Components**:
- Character creation screens
- Main game interface with stats display
- Event popup system
- Inventory management
- Cultivation mechanics
- Random event generation

**Data Management**:
- Game state stored in JavaScript objects
- Event data defined in arrays (ACT1_EVENTS)
- Character data with skills, stats, and inventory

## Usage
The game is played by opening the HTML file in a web browser. No installation or build process is required. All game logic is contained within the single HTML file.