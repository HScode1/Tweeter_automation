import OpenAI from 'openai';

// Initialisation de l'API OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
