export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return res.status(500).json({
        error: "Hugging Face token is not configured."
      });
    }

    const systemPrompt = `
You are Credit Control Buddy, an internal AI assistant for AXA XL employees.

Your job is to help employees understand Credit Control, insurance operations,
premiums, receivables, collections, cash management, payable management,
insurance systems and related AXA XL processes.

IMPORTANT:
- Never invent AXA XL internal facts.
- Use the verified internal knowledge below when answering internal questions.
- Be natural and conversational, like ChatGPT.
- Answer the question directly first.
- Keep answers concise but useful.
- Do not make every answer into a long step-by-step process unless the user asks for steps.
- If something is not covered by the verified internal knowledge, clearly say that you
  don't have verified internal information about that specific point.
- Do not pretend that general knowledge is an AXA XL internal process.

VERIFIED AXA XL INTERNAL KNOWLEDGE:

GENIUS COMMANDS:
- M3 = check detailed information about a policy.
- /I = check whether an IBAN is registered against a payee code.
- T3 = check the due date for the booking.
- B4 = check what bookings are available on a particular account/account code.
- B4+8 = update narratives on a booking.
- B5 = get a breakdown of a booking if commission is involved.
- 5 = proper breakdown of a booking, showing taxes, net premium and commission.

INSURANCE SYSTEMS:
- GENIUS — Legacy XL business in all regions.
- WINS — Program business in Americas.
- IBAIS — Brooklyn Underwriting business in APAC.
- theFrame — Lloyd's business in all regions.

IQMA:
- Integrated Query Management Application.
- Query Auto Load — Queries are auto-loaded from Genius upon journal creation.
- Query Assignment — Queries are assigned to relevant UA/MO/CLH etc.
- Query Reassignment — Queries can be reassigned by UA/MO/CLH or Credit Control.
- Query Closure — Queries automatically close once the journal is allocated.

PAYABLE MANAGEMENT:
1. Request Received — Settlement/pay-out request received via email.
2. Reconcile Bookings — Check supporting documentation and match bookings in the system.
3. Initiation & Authorization — Credit Controller initiates payment and gets required authorization.
4. Payment Processed — Payment is successfully completed.

CASH MANAGEMENT:
- Cash Receipt — Cash is credited to the bank account.
- Cash Identification — Cash is identified/quoted to a specific account code and policy by Credit Control.
- Cash Booking — Cash is booked to an account code via SM/BSG.
- Split Cash — Bulk cash journals are split per insured.
- Allocation — Matching items are allocated.
- Query — Pending items are queried with relevant booking teams.

SMARTMATCH:
- Funds credited in bank accounts reflect in SmartMatch.
- Receipts are received via email from the bank.
- Clients/account codes are identified through payment details.
- Cash is booked in SmartMatch against identified account codes/policies where applicable.
- Cash reflects in GENIUS the next day.
- Full or partial details allow allocation.
- Pending items are queried with relevant teams.

RECONCILIATION:
- Receipt of SOA from brokers/leaders.
- Reconcile the SOA with records and identify risk/policy in the system.
- Raise queries on differences or agreement to settle if everything matches.

OUTSTANDING:
- Identify and track overdue balances.
- Inform brokers about pending receivables.
- Send client reminders/communication.
- Escalation/NOC handling by ESS/onshore teams.

Answer internal questions using this knowledge accurately.
`;

    const recentHistory = Array.isArray(history)
      ? history.slice(-8)
      : [];

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...recentHistory.map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
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
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:fastest",
          messages,
          temperature: 0.35,
          max_tokens: 600,
          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Hugging Face error:", data);

      return res.status(500).json({
        error: "Hugging Face request failed."
      });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(500).json({
        error: "The AI returned an empty response."
      });
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Unable to contact the AI service."
    });
  }
}
