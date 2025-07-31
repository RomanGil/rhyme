import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt received" });
  }

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "너는 유쾌한 힙합 작사가야. 사용자가 쓴 한 줄 가사에 라임을 맞추는 한 줄만 추천해줘."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 50
      })
    });

    const json = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI API Error:", json);
      return res.status(500).json({ error: "OpenAI API call failed", details: json });
    }

    const result = json.choices?.[0]?.message?.content?.trim();
    res.status(200).json({ result });
  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).json({ error: "Failed to fetch rhyme" });
  }
}
