import express from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Content Production Endpoint
app.post('/api/content', async (req, res) => {
  const { text, type } = req.body;

  if (!text || !type) {
    return res.status(400).json({ error: 'Missing text or type' });
  }

  const systemInstruction = `You are an expert Digital Content Producer, Copywriter, and Media Architect.
Your goal is to take raw drafts and translate them into ready-to-publish digital products.

CORE TASKS:
1. E-Book Packaging: Compelling titles, chapter breakdowns, sales pitch summaries.
2. Storefront Copy: High-converting landing page text, bullet points.
3. Media Scripts: Structured audio/video voiceover scripts with visual/audio cues.
4. Social Snippets: Teaser posts, captions.

Style: Authoritative yet accessible, innovative, grounded.
Production Directives: Include [Audio Cue: ...] and [Visual Cue: ...] in scripts.

Output MUST be a JSON object with sections matching the requested type.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate ${type} based on this input: \n\n${text}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Content Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Localization Endpoint
app.post('/api/localize', async (req, res) => {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Missing text or targetLanguage' });
  }

  const systemInstruction = `You are the automated stand-up comedy localization engine for the Dragon 9 Synchronized Time AI Studio.
Your objective is to take stand-up comedy scripts and adapt them into specified target languages while strictly preserving comedic timing, rhythm, and punchline impact.

CORE RULES:
1. TIMING & SYLLABLE BUDGET: The translated punchline must match the approximate syllable count of the original (+/- 15%). Embed precise timing tags (e.g., [pause: 0.5s]) to maintain setup-pause-punchline delivery for voice synthesis.
2. CULTURAL ADAPTATION: Replace hyper-local brands, stores, and regional references with functional equivalents in the target culture. Swap idioms for target-language idioms carrying the same absurdity and visual imagery.
3. LAST-WORD PUNCHLINE RULE: Ensure the operative punchline word lands at the absolute end of the sentence in the target language.
4. LANGUAGE SPECIFICITY:
   - DE (German): Use spoken Umgangssprache. Leverage SOV verb-ending structure to delay the punchline.
   - ES (Spanish): Keep pace high. Adapt for target region (Castilian vs. Mexican). Accentuate the final word.
   - FR (French): Use conversational register with verlan/argot. Retain timing fillers (genre, du coup) before punchlines.
   - JA (Japanese): Keep punchlines punchy using natural spoken expressions (e.g., 親の仇 style framing).

Output MUST be a JSON array of segments.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Localize this stand-up comedy script into ${targetLanguage}: \n\n${text}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              segment_id: { type: Type.STRING },
              target_language: { type: Type.STRING },
              source_text: { type: Type.STRING },
              localized_text: { type: Type.STRING },
              timing_markers: { type: Type.STRING, description: "Adapted text with embedded [pause: X.Xs] tags" },
              adaptation_notes: { type: Type.STRING }
            },
            required: ["segment_id", "target_language", "source_text", "localized_text", "timing_markers", "adaptation_notes"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || '[]');
    res.json(result);
  } catch (error: any) {
    console.error('Localization Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Production static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In dev, Vite handles this
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
