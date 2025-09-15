import CURATED, { FORM_TECHNIQUES } from '../../components/minigames/sutras';

// Expose curated sutras/mantras and form techniques into the data layer so
// runtime data consumers (and tests) that import from `src/data/skills` can
// see the canonical curated techniques by id.
export const CURATED_SUTRAS = [...CURATED, ...FORM_TECHNIQUES];

export default CURATED_SUTRAS;
