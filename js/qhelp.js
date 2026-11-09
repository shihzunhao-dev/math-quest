// Helpers templates use to build options.
import { texSurd } from './mathfmt.js';

// tex: markup shown; key: value used to detect duplicate options; mis: misconception code or null for the answer
export const O = (tex, key, mis = null, extra = {}) => ({ tex, key, mis, ...extra });
export const OS = (s, mis = null, extra = {}) => O(texSurd(s), s.value, mis, extra);
export const OT = (text, mis = null) => O(text, text, mis);
