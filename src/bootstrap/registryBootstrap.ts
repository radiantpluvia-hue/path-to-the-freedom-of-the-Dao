import { Registry } from '../data/registry';
import daos from '../data/daos.json';
import laws from '../data/laws.json';
import archetypes from '../data/cultivation_archetypes.json';
import pathways from '../data/cultivation_pathways.json';

// register minimal datasets under namespaces so other systems can access them
Registry.register('daos', daos as any);
Registry.register('laws', laws as any);
Registry.register('archetypes', archetypes as any);
Registry.register('pathways', pathways as any);

export default function initializeRegistry() { /* marker - registration already done */ }
