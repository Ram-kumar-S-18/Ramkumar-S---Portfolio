export default async (req, context) => {
  // 1. Get the API Key from Netlify Environment Variables
  // Make sure you have set 'GEMINI_API_KEY' in your Netlify Site Settings
  const apiKey = Netlify.env.get("GEMINI_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Server Configuration Error: GEMINI_API_KEY is missing.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Handle CORS (Allow your specific domain)
  // You can replace '*' with 'https://your-domain.netlify.app' for tighter security
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const body = await req.json();
    const { endpointType, requestBody } = body;

    let targetUrl = "";

    // 3. Determine which Google API to call
    if (endpointType === "text") {
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    } else if (endpointType === "speech") {
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    } else {
      throw new Error("Invalid endpoint type provided.");
    }

    // 4. Make the request to Google (Server-to-Server)
    const googleResponse = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await googleResponse.json();

    // 5. Return the result to your frontend
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
};
