// Registry of content packs. To add a chapter: create content/<id>/pack.js and list it here.
import ch8a2 from './ch8a-2/pack.js';

export const PACKS = [ch8a2];
export const getPack = (id) => PACKS.find((p) => p.id === id);
