export default async function handler(req, res) {
  // ============================================================
  // METHOD CHECK
  // ============================================================

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ============================================================
    // READ REQUEST
    // ============================================================

    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const q = message.toLowerCase();

    // ============================================================
    // ENVIRONMENT VARIABLES
    // ============================================================

    const HF_TOKEN = process.env.HF_TOKEN;

    // ============================================================
    // VERIFIED AXA XL INTERNAL KNOWLEDGE
    // ============================================================

    const internalKnowledge = `
VERIFIED AXA XL INTERNAL KNOWLEDGE

1. INSURANCE SYSTEMS
GENIUS - Legacy XL business in all regions.
WINS - Program business in Americas.
IBAIS - Brooklyn Underwriting business in APAC.
theFrame - Lloyds Business in all regions.

2. GENIUS COMMANDS
M3 - Check detailed information about a policy.
/I - Check whether an IBAN is registered against a payee code.
T3 - Check due date for the booking.
B4 - Check what bookings are available on a particular account/account code.
B4+8 - Update narratives on booking.
B5 - Get breakdown of booking if commission is involved.
5 - Proper breakdown of booking. Shows taxes, net premium and commission.

3. IQMA
IQMA - Integrated Query Management Application.
Query Auto Load - Queries are auto-loaded from Genius upon journal creation.
Query Assignment - Queries are assigned to relevant UA/MO/CLH etc.
Query Reassignment - Queries can be reassigned by UA/MO/CLH or Credit Control.
Query Closure - Queries automatically close once journal allocated.

4. PAYABLE MANAGEMENT
Request Received - Settlement/pay-out request received via email.
Reconcile Bookings - Check supporting documentation and match bookings in system.
Initiation & Authorization - Credit Controller initiates payment and gets required authorization.
Payment Processed - Payment successfully completed.

5. CASH MANAGEMENT
Cash Receipt - Cash credited to bank account.
Cash Identification - Cash identified/quoted to specific account code and policy by Credit Control.
Cash Booking - Cash booked to account code via SM/BSG.
Split Cash - Bulk cash journals split per insured.
Allocation - Matching items allocated.
Query - Pending items queried with relevant booking teams.

6. SMARTMATCH
- Funds credited in bank accounts reflect in SmartMatch.
- Receipts via email from bank.
- Clients/account codes identified through payment details.
- Cash booked in SmartMatch against identified account codes/policies where applicable.
- Cash reflects in GENIUS next day.
- Full/partial details allow allocation.
- Pending items queried with relevant teams.

7. RECONCILIATION
- Receipt of SOA from brokers/leaders.
- Reconcile SOA with records and identify risk/policy on system.
- Raise queries on differences or agreement to settle if everything matches.

8. OUTSTANDING MANAGEMENT
- Identify/track overdue balances.
- Inform brokers on pending receivables.
- Client reminders/communication.
- Escalation/NOC handling by ESS/onshore teams.
`;

    // ============================================================
    // HELPERS
    // ============================================================

    function cleanText(value) {
      return String(value || "").replace(/\s+/g, " ").trim();
    }

    function getRecentHistory() {
      return history
        .filter(
          (item) =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim()
        )
        .slice(-8)
        .map((item) => ({
          role: item.role,
          content: item.content.trim()
        }));
    }

    // ============================================================
    // INTERNAL ROUTING CHECK
    // ============================================================
    
    // This now strictly routes to internal knowledge ONLY if the user types "axa"
    const isInternal = q.includes("axa");

    // ============================================================
    // HUGGING FACE FUNCTION
    // ============================================================

    async function callHuggingFace(messages) {
      if (!HF_TOKEN) {
        return { ok: false, error: "HF_TOKEN is not configured in Vercel." };
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 45000);

        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b:fastest",
            messages,
            temperature: 0.35,
            max_tokens: 700,
            stream: false
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);
        const rawText = await response.text();
        
        let data;
        try {
          data = JSON.parse(rawText);
        } catch {
          data = { raw: rawText };
        }

        if (!response.ok) {
          console.error("Hugging Face error:", data);
          return {
            ok: false,
            error: data?.error?.message || data?.error || `Hugging Face returned HTTP ${response.status}.`
          };
        }

        const answer = cleanText(data?.choices?.[0]?.message?.content);
        if (!answer) {
          return { ok: false, error: "Hugging Face returned an empty answer." };
        }

        return { ok: true, answer };

      } catch (error) {
        console.error("Hugging Face exception:", error);
        return {
          ok: false,
          error: error?.name === "AbortError" ? "Hugging Face request timed out." : error?.message || "Unable to contact Hugging Face."
        };
      }
    }

    // ============================================================
    // INTERNAL QUESTION FLOW
    // ============================================================

    if (isInternal) {
      const internalMessages = [
        {
          role: "system",
          content: `You are Credit Control Buddy, a professional AI assistant for AXA XL employees. Use ONLY the verified internal knowledge provided below to answer the user's question. Be concise and helpful.

VERIFIED INTERNAL KNOWLEDGE:
${internalKnowledge}`
        },
        ...getRecentHistory(),
        { role: "user", content: message }
      ];

      const result = await callHuggingFace(internalMessages);

      if (result.ok) {
        return res.status(200).json({
          answer: result.answer,
          mode: "internal",
          source: "verified_internal_knowledge",
          sources: []
        });
      } else {
        return res.status(500).json({
          answer: "I experienced an error accessing the internal AXA data. Please try again.",
          mode: "error",
          warning: result.error
        });
      }
    }

    // ============================================================
    // PUBLIC / GENERAL QUESTION FLOW
    // ============================================================

    // If "axa" is not in the prompt, it acts as a general AI
    const publicSystemPrompt = `You are Credit Control Buddy, a professional AI assistant. 
Answer the user's general questions about credit control, insurance, or other topics directly and accurately based on your general knowledge.
Do not mention internal AXA XL procedures unless specifically asked. Be concise but useful.`;

    const publicMessages = [
      { role: "system", content: publicSystemPrompt },
      ...getRecentHistory(),
      { role: "user", content: message }
    ];

    const hfResult = await callHuggingFace(publicMessages);

    if (hfResult.ok) {
      return res.status(200).json({
        answer: hfResult.answer,
        mode: "model",
        source: "model_knowledge",
        sources: []
      });
    }

    // ============================================================
    // AI SERVICE FAILED
    // ============================================================

    return res.status(500).json({
      answer: HF_TOKEN 
        ? "The AI service is currently unavailable. Please try again in a moment." 
        : "The AI service is not configured correctly. Please add HF_TOKEN to your environment variables.",
      mode: "service_fallback",
      warning: hfResult.error
    });

  } catch (error) {
    console.error("COMPLETE API ERROR:", error);
    return res.status(500).json({
      answer: "I ran into a temporary problem while processing that request. Please try the question again.",
      mode: "error_fallback",
      warning: error?.message || "Unknown server error."
    });
  }
}
