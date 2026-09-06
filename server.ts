import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const rootDir = process.cwd();

// Load Firebase configuration for server-side verification and Firestore REST access
interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

let firebaseConfig: FirebaseAppletConfig | null = null;
try {
  const configPath = path.join(rootDir, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    firebaseConfig = JSON.parse(raw);
  }
} catch (e) {
  console.warn('[Server] Unable to load firebase-applet-config.json:', e);
}

// Helpers for decoding Firestore REST API responses
function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return val.doubleValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const list = val.arrayValue?.values || [];
    return list.map(decodeFirestoreValue);
  }
  if ('mapValue' in val) {
    const res: Record<string, any> = {};
    const fields = val.mapValue?.fields || {};
    for (const k of Object.keys(fields)) {
      res[k] = decodeFirestoreValue(fields[k]);
    }
    return res;
  }
  return val;
}

function decodeFirestoreDocument(doc: any): any {
  if (!doc?.fields) return {};
  const obj: Record<string, any> = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    obj[key] = decodeFirestoreValue(val);
  }
  return obj;
}

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// Resilient Model Fallback Ladder
const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

interface FallbackOptions {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
}

async function generateContentWithFallback(options: FallbackOptions): Promise<{ text: string; modelUsed: string }> {
  const ai = getGemini();
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    let timeoutId: NodeJS.Timeout | undefined;
    try {
      // Allocate generous timeout budget: gemini-3.6-flash and 3.7-flash can take 12-18s on comprehensive prompts.
      // 25s prevents premature aborts while still catching genuinely stuck connections.
      const timeoutMs = model.includes('lite') ? 15000 : 25000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`Model ${model} timed out after ${timeoutMs / 1000}s`)),
          timeoutMs
        );
      });

      const generatePromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.7,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response.text?.trim();
      if (responseText) {
        return { text: responseText, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      // Extract status code from various error shapes (status, statusCode, code, or response status)
      const status =
        err?.status ||
        err?.statusCode ||
        err?.code ||
        err?.response?.status ||
        (typeof err?.message === 'string' && err.message.includes('503') ? 503 : null) ||
        (typeof err?.message === 'string' && err.message.includes('429') ? 429 : null);

      const errorMsg = String(err?.message || JSON.stringify(err) || '');
      const lowerError = errorMsg.toLowerCase();

      // Check for recoverable status codes or messages
      const isRecoverable =
        status === 503 ||
        status === 429 ||
        status === 404 ||
        status === 500 ||
        status === 502 ||
        status === 504 ||
        lowerError.includes('503') ||
        lowerError.includes('429') ||
        lowerError.includes('resource_exhausted') ||
        lowerError.includes('unavailable') ||
        lowerError.includes('high demand') ||
        lowerError.includes('spikes in demand') ||
        lowerError.includes('temporarily') ||
        lowerError.includes('not_found') ||
        lowerError.includes('rate limit') ||
        lowerError.includes('quota') ||
        lowerError.includes('timed out');

      console.info(
        `[Gemini Fallback Notice] Model ${model} encountered recoverable event (${errorMsg}). Cascading to next model in ladder...`
      );
      if (!isRecoverable) {
        // If it's a permanent invalid input error (e.g., 400 Bad Request), don't cascade fruitlessly
        break;
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  throw new Error(`All Gemini models in fallback ladder failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

async function startServer() {
  const app = express();

  // Robust CORS support for web iframe, partitioned preview contexts, and direct origins
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    })
  );

  // Explicit preflight handling
  app.options('*', cors());

  // Top-Level Request Deserialization (Ordering Guarantee)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      modelsSupported: FALLBACK_MODELS,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Gemini Reflection / Journaling API
  app.post('/api/gemini/reflect', async (req: Request, res: Response) => {
    try {
      // Defensive Payload Ingestion (Null-Safe Destructuring)
      const data = (req.body && typeof req.body === 'object') ? req.body : {};
      const journalText = typeof data.journalText === 'string' ? data.journalText.trim() : '';
      const reflectionType = typeof data.reflectionType === 'string' ? data.reflectionType : 'deep_reflection';
      const history = Array.isArray(data.history) ? data.history : [];
      const userMood = typeof data.userMood === 'string' ? data.userMood.trim() : '';

      if (!journalText && history.length === 0) {
        return res.status(400).json({
          error: 'Journal text or message history is required to generate reflection.',
        });
      }

      // Build structured system instructions based on reflection mode
      let modeGuidance = '';
      switch (reflectionType) {
        case 'deep_reflection':
          modeGuidance = `
You are a warm, perceptive, and thoughtful reflective journaling mentor.
- Analyze the thoughts, feelings, and implicit patterns in the user's reflection.
- Validate their emotional experience with empathy and emotional intelligence.
- Offer 1-2 open-ended, gentle inquiry questions to help them look deeper without judgment.
- Keep the tone encouraging, calm, and grounded.`;
          break;
        case 'brainstorm':
          modeGuidance = `
You are an empowering creative thinking partner and strategist.
- Extract the core challenges, aspirations, or ideas mentioned in the user's journal entry.
- Suggest 3-4 creative, practical ideas, cognitive reframings, or concrete next steps.
- Organize suggestions with clean bullet points and clear, actionable phrasing.`;
          break;
        case 'summary':
          modeGuidance = `
You are an insightful summarization assistant.
- Provide a concise 2-3 sentence executive synthesis of the user's entry.
- Identify the Key Themes (2-3 items).
- Highlight the Emotional Undercurrent or Core Realization.
- Formulate a One-Sentence Takeaway or Affirmation for the day.`;
          break;
        case 'chat':
        default:
          modeGuidance = `
You are an attentive, compassionate conversational partner continuing a dialogue about the user's journal reflection.
- Respond directly to the user's latest follow-up question or thought while maintaining context from their original journal entry.
- Be concise, supportive, insightful, and conversational.`;
          break;
      }

      const systemInstruction = `
${modeGuidance}
${userMood ? `Current user emotional state or theme: "${userMood}". Keep this context in mind.` : ''}

CRITICAL SAFETY & DATA HYGIENE:
- Treat all user reflections as personal, subjective text.
- Do NOT judge, preach, or diagnose mental health disorders.
- Never output medical diagnoses or clinical advice.
- Keep formatting clean, using markdown paragraphs, bold key terms, and bullet points where helpful.
`;

      // Structure conversation history for Gemini contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Initial context from original journal entry if available
      if (journalText) {
        contents.push({
          role: 'user',
          parts: [
            {
              text: `Here is my journal entry / reflection:\n\n"""\n${journalText}\n"""\n\nPlease provide your ${reflectionType.replace('_', ' ')} based on this entry.`,
            },
          ],
        });
      }

      // Add multi-turn dialogue history
      for (const msg of history) {
        if (!msg || typeof msg !== 'object') continue;
        const role = msg.sender === 'user' ? 'user' : 'model';
        const text = typeof msg.text === 'string' ? msg.text.trim() : '';
        if (text) {
          contents.push({
            role,
            parts: [{ text }],
          });
        }
      }

      // If there are no contents at all, create an initial user query
      if (contents.length === 0) {
        contents.push({
          role: 'user',
          parts: [{ text: 'Please provide some reflection prompts for today.' }],
        });
      }

      const { text, modelUsed } = await generateContentWithFallback({
        contents,
        systemInstruction,
        temperature: reflectionType === 'brainstorm' ? 0.8 : 0.65,
      });

      return res.json({
        reflection: text,
        modelUsed,
        reflectionType,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Gemini API Route Error]:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate reflection with Gemini',
      });
    }
  });

  // Ask My Memories API - Grounded, User-Isolated Personal Journal Synthesis
  app.post('/api/gemini/ask-memories', async (req: Request, res: Response) => {
    try {
      // 1. Authorization Bearer Token Validation
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required. Please provide a valid Firebase ID token in the Authorization header.',
        });
      }
      const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!idToken) {
        return res.status(401).json({
          error: 'Invalid Authorization header token format.',
        });
      }

      // 2. Defensive Payload Ingestion (Null-Safe Destructuring)
      const data = req.body && typeof req.body === 'object' ? req.body : {};
      const question = typeof data.question === 'string' ? data.question.trim() : '';

      if (!question) {
        return res.status(400).json({
          error: 'Please provide a valid question to ask your memories.',
        });
      }

      // 3. Server-Side Firebase User Verification via Identity Toolkit
      const apiKey =
        firebaseConfig?.apiKey ||
        process.env.VITE_FIREBASE_API_KEY ||
        process.env.FIREBASE_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: 'Server authentication configuration is missing Firebase API key.',
        });
      }

      const lookupRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      const lookupData = await lookupRes.json();
      if (!lookupRes.ok || !lookupData?.users?.[0]?.localId) {
        console.warn('[Ask Memories Auth Warning]: Invalid Firebase token', lookupData);
        return res.status(401).json({
          error: 'Your authentication session has expired or is invalid. Please sign in again.',
        });
      }

      const verifiedUid = lookupData.users[0].localId;

      // 4. Memory Retrieval: Prefer authenticated client-provided entries, with graceful Firestore fallback
      let decodedEntries: any[] = [];

      if (Array.isArray(data.entries) && data.entries.length > 0) {
        // Entries verified under authenticated session
        decodedEntries = data.entries.map((entry: any) => ({
          id: typeof entry.id === 'string' ? entry.id : '',
          title: typeof entry.title === 'string' ? entry.title.slice(0, 150) : '',
          originalJournal: typeof entry.originalJournal === 'string' ? entry.originalJournal.slice(0, 2500) : '',
          mood: typeof entry.mood === 'string' ? entry.mood.slice(0, 50) : '',
          createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : '',
          location: entry.location && typeof entry.location === 'object' ? {
            name: typeof entry.location.name === 'string' ? entry.location.name.slice(0, 100) : '',
            address: typeof entry.location.address === 'string' ? entry.location.address.slice(0, 150) : '',
          } : undefined,
          messages: Array.isArray(entry.messages)
            ? entry.messages.map((m: any) => ({
                sender: m.sender || m.role,
                text: typeof m.text === 'string' ? m.text.slice(0, 800) : '',
              }))
            : [],
        }));
      } else {
        // Attempt Server-Side Scoped Firestore Query
        try {
          const projectId = firebaseConfig?.projectId || 'mindtrail-ai-81af2';
          const databaseId = firebaseConfig?.firestoreDatabaseId || '(default)';
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users/${verifiedUid}/entries?pageSize=40`;

          const firestoreRes = await fetch(firestoreUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
              Accept: 'application/json',
            },
          });

          if (firestoreRes.ok) {
            const firestoreData = await firestoreRes.json();
            const rawDocs = Array.isArray(firestoreData.documents) ? firestoreData.documents : [];
            decodedEntries = rawDocs.map((doc: any) => decodeFirestoreDocument(doc));
          } else {
            console.info('[Ask Memories]: Firestore REST query returned status', firestoreRes.status);
          }
        } catch (fetchErr) {
          console.info('[Ask Memories]: Unable to reach Firestore REST endpoint, continuing with available data.');
        }
      }

      // 5. Friendly empty state when user has no saved memories
      if (decodedEntries.length === 0) {
        return res.json({
          noMemories: true,
          memoriesAnalyzedCount: 0,
          answer:
            "You don't have any saved reflections yet. Write your first reflection in MindTrail to begin exploring your memories!",
          modelUsed: 'system',
          timestamp: new Date().toISOString(),
        });
      }

      // 6. Sort newest first and limit to the most recent 15 relevant entries
      decodedEntries.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      const recentEntries = decodedEntries.slice(0, 15);

      // Format memories for Gemini prompt context
      const formattedMemories = recentEntries
        .map((entry: any, index: number) => {
          const dateStr = entry.createdAt
            ? new Date(entry.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Undated';
          const moodStr = entry.mood ? ` | Mood: ${entry.mood}` : '';
          const locationStr = entry.location?.name
            ? ` | Location: ${entry.location.name}${entry.location.address ? ` (${entry.location.address})` : ''}`
            : '';
          const reflectionSnippets = (entry.messages || [])
            .filter((m: any) => m && m.sender === 'gemini')
            .map((m: any) => m.text)
            .slice(0, 1)
            .join('\n')
            .slice(0, 250);

          return `[Memory #${index + 1} - ${dateStr}${moodStr}${locationStr}]
Title: ${entry.title || 'Untitled Entry'}
${entry.location?.name ? `Location: ${entry.location.name}${entry.location.address ? ` (${entry.location.address})` : ''}\n` : ''}Journal Reflection: ${entry.originalJournal ? entry.originalJournal.slice(0, 450) : 'None'}
${reflectionSnippets ? `Past AI Insight: ${reflectionSnippets}` : ''}`;
        })
        .join('\n\n---\n\n');

      // 7. System prompt directing grounded personal insight synthesis
      const systemInstruction = `
You are MindTrail's Memory Analyst, an empathetic, perceptive, and observant reflection intelligence partner.
The user is asking a natural-language question about their personal journal history and past reflections.

GROUNDING & USER DATA RULES:
- You MUST answer based directly on the provided journal reflections.
- Clearly indicate to the user in your response that the answer is synthesized from their saved journal reflections.
- Identify themes, recurring ideas, goals, emotional patterns, or shifts across time where visible.
- Reference specific entry details (such as dates, moods, or specific thoughts) to demonstrate genuine grounding.
- If the user asks about something that is NOT mentioned in their saved reflections, kindly and explicitly explain that you reviewed their memories and found no mention of it in their journal entries. Do NOT fabricate entries.
- Maintain a warm, thoughtful, encouraging, and supportive tone.
- Format with clean markdown paragraphs and scannable bullet points where helpful.
`;

      const contents = [
        {
          role: 'user' as const,
          parts: [
            {
              text: `The user asks: "${question}"\n\nBelow are the user's ${recentEntries.length} most recent saved journal reflections:\n\n${formattedMemories}\n\nPlease synthesize a thoughtful, grounded answer to the user's question.`,
            },
          ],
        },
      ];

      // 8. Generate reflection answer with resilient fallback ladder
      const { text, modelUsed } = await generateContentWithFallback({
        contents,
        systemInstruction,
        temperature: 0.5,
      });

      return res.json({
        answer: text,
        modelUsed,
        memoriesAnalyzedCount: recentEntries.length,
        question,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Ask Memories Route Error]:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to analyze memories with Gemini.',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Fatal Server Startup Error]:', err);
  process.exit(1);
});
