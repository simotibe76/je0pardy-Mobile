const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash'
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let prompt;
  try {
    const body = JSON.parse(event.body || '{}');
    prompt = body.prompt;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing prompt in request body' }),
    };
  }

  const rawKeys = process.env.GEMINI_KEYS || '';
  const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

  if (apiKeys.length === 0) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No Gemini API keys configured' }),
    };
  }

  let currentKeyIndex = 0;
  let currentModelIndex = 0;

  const callGemini = async () => {
    const model = MODEL_CHAIN[currentModelIndex % MODEL_CHAIN.length];
    const key = apiKeys[currentKeyIndex % apiKeys.length];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: 'Rispondi ESCLUSIVAMENTE con un oggetto JSON valido. Non includere blocchi di codice markdown ```json o testo extra.' }] },
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (response.status === 429 || response.status === 503) {
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      currentModelIndex = (currentModelIndex + 1) % MODEL_CHAIN.length;
      throw new Error(`Retryable status ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini error ${response.status}: ${errorText}`);
    }

    return response.json();
  };

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const geminiResponse = await callGemini();
      return {
        statusCode: 200,
        body: JSON.stringify(geminiResponse),
      };
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(300);
      }
    }
  }

  return {
    statusCode: 502,
    body: JSON.stringify({ error: lastError?.message || 'Unknown Gemini failure' }),
  };
};
