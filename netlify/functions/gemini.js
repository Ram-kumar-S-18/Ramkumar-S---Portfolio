export default async (event) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GEMINI_API_KEY not found" }),
      };
    }

    const { type, data } = JSON.parse(event.body);

    const prompt = `
You are Ram Kumar S, speaking to a recruiter.
First person only.
Concise.
Question: ${type}
Portfolio data: ${data}
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: json.candidates[0].content.parts[0].text,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
