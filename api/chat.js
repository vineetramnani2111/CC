export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      message,
      history = []
    } = req.body || {};


    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {

      return res.status(400).json({
        error: "Message is required"
      });

    }


    /*
      Token comes from Vercel Environment Variables.

      NEVER put the actual Hugging Face token
      inside this file.
    */

    const HF_TOKEN =
      process.env.HF_TOKEN;


    if (!HF_TOKEN) {

      console.error(
        "HF_TOKEN is missing"
      );

      return res.status(500).json({
        error:
          "Hugging Face token is not configured."
      });

    }


    /*
      System instructions
    */

    const systemPrompt = `
You are Credit Control Buddy, an AI assistant
for AXA XL employees.

Help users understand:

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

IMPORTANT RULES:

1. Never invent facts.

2. Never invent AXA XL policies, procedures,
systems, numbers or internal information.

3. Clearly distinguish general insurance knowledge
from AXA XL-specific internal information.

4. If you do not know something, say so.

5. If the question requires an AXA XL internal document
that you cannot access, tell the user to check the
relevant internal documentation.

6. Do not fabricate sources.

7. Do not claim to have access to internal AXA XL
systems or documents unless they are actually provided
in the conversation.

8. Give practical explanations when possible.

9. Keep answers reasonably concise unless the user
asks for a detailed explanation.
`;


    /*
      Keep only recent conversation history.

      This prevents the request from becoming
      unnecessarily large.
    */

    const recentHistory =
      Array.isArray(history)
        ? history
            .filter(item =>
              item &&
              (
                item.role === "user" ||
                item.role === "assistant"
              )
            )
            .slice(-8)
        : [];


    /*
      Build messages for Hugging Face.
    */

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

        content:
          String(item.content || "").slice(
            0,
            6000
          )

      })),

      {
        role: "user",
        content: message.trim().slice(
          0,
          6000
        )
      }

    ];


    /*
      Call Hugging Face Router
    */

    const response =
      await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {

          method: "POST",

          headers: {

            "Authorization":
              `Bearer ${HF_TOKEN}`,

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            model:
              "openai/gpt-oss-120b:fastest",

            messages,

            temperature: 0.2,

            max_tokens: 700,

            stream: false

          })

        }
      );


    const data =
      await response.json();


    /*
      Hugging Face returned an error
    */

    if (!response.ok) {

      console.error(
        "Hugging Face error:",
        data
      );

      return res.status(500).json({

        error:
          data?.error ||
          "Hugging Face request failed."

      });

    }


    /*
      Extract AI answer
    */

    const answer =
      data
        ?.choices?.[0]
        ?.message
        ?.content
        ?.trim();


    if (!answer) {

      console.error(
        "Unexpected Hugging Face response:",
        data
      );

      return res.status(500).json({
        error:
          "The AI returned an empty response."
      });

    }


    /*
      Send answer back to frontend
    */

    return res.status(200).json({
      answer
    });


  }

  catch (error) {

    console.error(
      "Server error:",
      error
    );


    return res.status(500).json({

      error:
        "Unable to contact the AI service."

    });

  }

}
