// Holds a short description of what the user is currently looking at,
// so the "Ask the Chef" widget can answer in context (e.g. the open recipe).
let context = '';

export const setAiContext = (c) => { context = c; };
export const clearAiContext = () => { context = ''; };
export const getAiContext = () => context;
