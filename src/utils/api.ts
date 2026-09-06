export async function callGeminiReflect(payload: {
  journalText: string;
  reflectionType: string;
  userMood: string;
  history?: any[];
}): Promise<{ reflection: string; modelUsed: string; timestamp: string }> {
  let lastError: Error | null = null;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Gemini server returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        reflection: data.reflection || 'No reflection generated.',
        modelUsed: data.modelUsed || 'gemini-3.6-flash',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxAttempts) {
        // Wait 750ms before retrying in case of brief container/proxy wake-up delay
        await new Promise((r) => setTimeout(r, 750));
      }
    }
  }

  if (lastError && (lastError.message === 'Failed to fetch' || lastError.name === 'TypeError')) {
    throw new Error(
      'Unable to connect to the MindTrail reflection service. Please check your network connection and try again.'
    );
  }

  throw lastError || new Error('Failed to generate reflection.');
}

export async function callAskMemories(
  idToken: string,
  question: string,
  entries?: any[]
): Promise<{
  answer: string;
  modelUsed: string;
  memoriesAnalyzedCount: number;
  noMemories?: boolean;
  timestamp: string;
}> {
  if (!question || !question.trim()) {
    throw new Error('Please enter a question to ask your memories.');
  }

  let lastError: Error | null = null;
  const maxAttempts = 2;

  // Prepare sanitized entries payload if available from authenticated client
  const sanitizedEntries = Array.isArray(entries)
    ? entries.slice(0, 20).map((e) => ({
        id: e.id,
        title: typeof e.title === 'string' ? e.title.slice(0, 150) : '',
        originalJournal: typeof e.originalJournal === 'string' ? e.originalJournal.slice(0, 2000) : '',
        mood: typeof e.mood === 'string' ? e.mood.slice(0, 50) : '',
        createdAt: typeof e.createdAt === 'string' ? e.createdAt : '',
        location: e.location && typeof e.location === 'object' ? {
          name: typeof e.location.name === 'string' ? e.location.name.slice(0, 100) : '',
          address: typeof e.location.address === 'string' ? e.location.address.slice(0, 150) : '',
        } : undefined,
        messages: Array.isArray(e.messages)
          ? e.messages.slice(0, 4).map((m: any) => ({
              role: m.role,
              text: typeof m.text === 'string' ? m.text.slice(0, 800) : '',
            }))
          : [],
      }))
    : undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('/api/gemini/ask-memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          question: question.trim(),
          entries: sanitizedEntries,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Memory analysis failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        answer: data.answer || '',
        modelUsed: data.modelUsed || 'gemini-3.6-flash',
        memoriesAnalyzedCount: Number(data.memoriesAnalyzedCount) || 0,
        noMemories: Boolean(data.noMemories),
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 750));
      }
    }
  }

  if (lastError && (lastError.message === 'Failed to fetch' || lastError.name === 'TypeError')) {
    throw new Error(
      'Unable to connect to the MindTrail memory service. Please check your network connection and try again.'
    );
  }

  throw lastError || new Error('Failed to analyze memories.');
}
