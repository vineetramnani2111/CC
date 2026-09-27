export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { message, history = [] } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    // IMPORTANT:
    // The actual Hugging Face token will NOT be written here.
    // Vercel will provide it securely through HF_TOKEN.

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return res.status(500).json({
        error: "Hugging Face token is not configured."
      });
    }

    const systemPrompt = `
You are Credit Control Buddy, an internal AI assistant
intended for AXA XL employees.

Help with:

- Credit control
- Insurance
- Lines of business
- Premiums
- Receivables
- Collections
- Credit management
- Insurance terminology
- Reinsurance terminology
- Insurance operations

Be concise, professional and conversational.

IMPORTANT:

Never invent facts.

Never invent AXA XL policies, procedures,
numbers, systems or internal information.

Do not pretend that general insurance knowledge
is an AXA XL-specific policy.

If you do not know something, say so.

If a question requires an AXA XL internal document
that you do not have access to, tell the employee
to check the relevant internal documentation.

Do not fabricate sources or information.
`;

    const recentHistory = Array.isArray(history)
      ? history.slice(-8)
      : [];

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },

      ...recentHistory.map(item => ({
        role:
          item.role === "assistant"
            ? "assistant"
            : "user",

        content: String(item.content || "")
      })),

      {
        role: "user",
        content: message.trim()
      }
    ];

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          model: "openai/gpt-oss-120b:fastest",

          messages: messages,

          temperature: 0.2,

          max_tokens: 500,

          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(
        "Hugging Face error:",
        data
      );

      return res.status(500).json({
        error: "Hugging Face request failed."
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {

      return res.status(500).json({
        error: "The AI returned an empty response."
      });
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {

    console.error(
      "Server error:",
      error
    );

    return res.status(500).json({
      error: "Unable to contact the AI service."
    });

  }

}
