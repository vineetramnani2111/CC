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

    const userMessage = message.trim();
    const q = userMessage.toLowerCase();

    // =========================================================
    // ENVIRONMENT VARIABLES
    // =========================================================

    const HF_TOKEN = process.env.HF_TOKEN;
    const SERPER_API_KEY = process.env.SERPER_API_KEY;

    if (!HF_TOKEN) {
      return res.status(500).json({
        error: "Hugging Face token is not configured."
      });
    }

    // =========================================================
    // VERIFIED AXA XL INTERNAL KNOWLEDGE
    // =========================================================
    //
    // IMPORTANT:
    // This is ONLY information supplied/verified for this project.
    // Do not invent additional AXA XL internal procedures.
    //

    const internalKnowledge = `
VERIFIED AXA XL INTERNAL KNOWLEDGE

INSURANCE SYSTEMS
- GENIUS: Legacy XL business in all regions.
- WINS: Program business in Americas.
- IBAIS: Brooklyn Underwriting business in APAC.
- theFrame: Lloyds Business in all regions.

GENIUS COMMANDS
- M3: Check detailed information about a policy.
- /I: Check whether an IBAN is registered against a payee code.
- T3: Check the due date for the booking.
- B4: Check what bookings are available on a particular account/account code.
- B4+8: Update narratives on booking.
- B5: Get breakdown of a booking if commission is involved.
- Command 5: Proper breakdown of booking, including taxes, net premium and commission.

IQMA
- IQMA means Integrated Query Management Application.
- Query Auto Load: Queries are auto-loaded from Genius upon journal creation.
- Query Assignment: Queries are assigned to relevant UA/MO/CLH etc.
- Query Reassignment: Queries can be reassigned by UA/MO/CLH or Credit Control.
- Query Closure: Queries automatically close once the journal is allocated.

PAYABLE MANAGEMENT
- Request Received: Settlement/pay-out request received via email.
- Reconcile Bookings: Check supporting documentation and match bookings in the system.
- Initiation & Authorization: Credit Controller initiates payment and obtains required authorization.
- Payment Processed: Payment is successfully completed.

CASH MANAGEMENT
- Cash Receipt: Cash is credited to the bank account.
- Cash Identification: Cash is identified/quoted to a specific account code and policy by Credit Control.
- Cash Booking: Cash is booked to the account code via SM/BSG.
- Split Cash: Bulk cash journals are split per insured.
- Allocation: Matching items are allocated.
- Query: Pending items are queried with the relevant booking teams.

SMARTMATCH
- Funds credited in bank accounts reflect in SmartMatch.
- Receipts are received via email from the bank.
- Clients/account codes are identified through payment details.
- Cash is booked in SmartMatch against identified account codes/policies where applicable.
- Cash reflects in GENIUS the next day.
- Full or partial details allow allocation.
- Pending items are queried with relevant teams.

RECONCILIATION
- Receipt of SOA from brokers/leaders.
- Reconcile SOA with records and identify risk/policy on the system.
- Raise queries on differences, or agreement to settle if everything matches.

OUTSTANDING MANAGEMENT
- Identify and track overdue balances.
- Inform brokers about pending receivables.
- Client reminders/communication.
- Escalation/NOC handling by ESS/onshore teams.
`;

    // =========================================================
    // DIRECT INTERNAL ANSWERS
    // =========================================================
    //
    // These answers bypass web search and Hugging Face.
    // This prevents verified internal information from being
    // replaced or confused with public Internet information.
    //

    // PAYABLE MANAGEMENT
    if (
      q.includes("what is payable management") ||
      q.includes("what is payables management") ||
      q === "payable management" ||
      q === "payables management"
    ) {
      return res.status(200).json({
        answer:
          "At AXA XL, Payable Management covers the process from receiving a settlement or pay-out request through reconciliation, authorization and payment. The main stages are: Request Received, Reconcile Bookings, Initiation & Authorization, and Payment Processed.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // OUTSTANDING / OVERDUE
    if (
      q.includes("overdue receivable") ||
      q.includes("overdue balance") ||
      q.includes("overdue balances") ||
      q.includes("outstanding management") ||
      q.includes("manage outstanding")
    ) {
      return res.status(200).json({
        answer:
          "Outstanding Management focuses on identifying and tracking overdue balances, informing brokers about pending receivables, sending client reminders or communications, and handling escalation/NOC activity through ESS/onshore teams.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // M3
    if (
      q.includes("m3 in genius") ||
      q.includes("what is m3") ||
      q === "m3"
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, M3 is used to check detailed information about a policy.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // /I
    if (
      q.includes("/i in genius") ||
      q.includes("what is /i") ||
      q.includes("what does /i do") ||
      q === "/i"
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, /I is used to check whether an IBAN is registered against a payee code.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // T3
    if (
      q.includes("t3 in genius") ||
      q.includes("what is t3") ||
      q.includes("what does t3 do") ||
      q === "t3"
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, T3 is used to check the due date for the booking.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // B4+8
    if (
      q.includes("b4+8") ||
      q.includes("b4 + 8") ||
      q.includes("b4 8")
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, B4+8 is used to update narratives on a booking.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // B4
    if (
      q.includes("b4 in genius") ||
      q.includes("what is b4") ||
      q === "b4"
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, B4 is used to check what bookings are available on a particular account or account code.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // B5
    if (
      q.includes("b5 in genius") ||
      q.includes("what is b5") ||
      q === "b5"
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, B5 is used to get a breakdown of a booking when commission is involved.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // COMMAND 5
    if (
      q.includes("command 5 in genius") ||
      q.includes("command 5") ||
      q === "5 in genius"
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, command 5 provides a proper breakdown of a booking, including taxes, net premium and commission.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // IQMA
    if (
      q === "what is iqma" ||
      q === "iqma" ||
      q.includes("what does iqma stand for") ||
      q.includes("what is iqma in")
    ) {
      return res.status(200).json({
        answer:
          "IQMA stands for Integrated Query Management Application. In the verified AXA XL process, queries are auto-loaded from GENIUS when a journal is created, assigned to relevant UA/MO/CLH teams, reassigned when needed, and automatically closed once the journal is allocated.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // SMARTMATCH
    if (
      q === "smartmatch" ||
      q === "what is smartmatch" ||
      q.includes("what is smartmatch in")
    ) {
      return res.status(200).json({
        answer:
          "SmartMatch is used in the cash-management process. Funds credited to bank accounts reflect in SmartMatch, where payment details help identify clients/account codes. Cash can then be booked against the identified account codes or policies where applicable. Cash reflects in GENIUS the next day, and pending items can be queried with the relevant teams.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // CASH MANAGEMENT
    if (
      q === "cash management" ||
      q === "what is cash management" ||
      q.includes("cash management process")
    ) {
      return res.status(200).json({
        answer:
          "The verified Cash Management process covers Cash Receipt, Cash Identification, Cash Booking, Split Cash, Allocation and Query. In simple terms, cash is received into the bank, identified against the relevant account code/policy, booked, split where required, allocated against matching items, and queried when information is still pending.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // RECONCILIATION
    if (
      q === "reconciliation" ||
      q === "what is reconciliation" ||
      q.includes("reconciliation process") ||
      q.includes("reconcile soa")
    ) {
      return res.status(200).json({
        answer:
          "The verified reconciliation process involves receiving the SOA from brokers or leaders, reconciling it with system records and identifying the relevant risk/policy, then raising queries on differences or proceeding with an agreement to settle when everything matches.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // =========================================================
    // INTERNAL ROUTING
    // =========================================================
    //
    // IMPORTANT:
    // Do NOT put generic words such as "AXA", "AXA XL",
    // "credit control", "policy", "booking", "settlement",
    // "account code" or "SOA" here.
    //
    // Those words can appear in normal public questions.
    //

    const internalKeywords = [
      // AXA XL internal systems
      "genius",
      "iqma",
      "smartmatch",
      "wins",
      "ibais",
      "theframe",

      // Specific internal processes
      "payable management",
      "payables management",
      "cash management",
      "cash receipt",
      "cash identification",
      "cash booking",
      "split cash",
      "cash allocation",
      "outstanding management",
      "query assignment",
      "query reassignment",
      "query closure",
      "journal allocation",

      // Specific internal reconciliation terminology
      "reconcile soa",
      "statement of account",

      // Specific Genius commands
      "m3",
      "b4",
      "b4+8",
      "b4 + 8",
      "b5",
      "t3",

      // Explicitly internal wording
      "internal process",
      "internal procedure",
      "internal system",
      "internal workflow",
      "axa xl process",
      "axa xl procedure",
      "axa xl internal",
      "axa xl workflow"
    ];

    const isInternal = internalKeywords.some((keyword) =>
      q.includes(keyword)
    );

    // =========================================================
    // IMPORTANT INTERNAL SAFETY BEHAVIOUR
    // =========================================================
    //
    // If the question contains a clearly internal term but wasn't
    // covered by a direct answer above, we allow the AI to answer
    // using the verified internal knowledge.
    //
    // Otherwise, PUBLIC WEB SEARCH is used.
    //

    if (isInternal) {
      const internalMessages = [
        {
          role: "system",
          content: `
You are Credit Control Buddy, a professional AI assistant for AXA XL employees.

The user is asking about an AXA XL internal system, process, workflow,
or terminology.

Use ONLY the verified internal knowledge below for AXA XL-specific facts.

Do NOT invent:
- internal procedures
- responsibilities
- system functionality
- contacts
- policies
- approval requirements
- process steps
- system commands
- business rules

If the verified information does not answer the question, clearly say that
the available verified internal knowledge does not contain enough information.

Do not replace verified internal information with general Internet knowledge.

Answer naturally and conversationally.
Answer the question directly.
Do not unnecessarily use "Step 1, Step 2, Step 3".
Use bullets only when useful.
Keep the answer concise but helpful.

VERIFIED INTERNAL KNOWLEDGE:

${internalKnowledge}
`
        }
      ];

      const recentHistory = Array.isArray(history)
        ? history
            .filter(
              (item) =>
                item &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string"
            )
            .slice(-8)
        : [];

      for (const item of recentHistory) {
        internalMessages.push({
          role: item.role,
          content: item.content
        });
      }

      internalMessages.push({
        role: "user",
        content: userMessage
      });

      const hfResponse = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b:fastest",
            messages: internalMessages,
            temperature: 0.35,
            max_tokens: 700,
            stream: false
          })
        }
      );

      const hfData = await hfResponse.json();

      if (!hfResponse.ok) {
        console.error("Hugging Face internal request failed:", hfData);

        return res.status(500).json({
          error: "Hugging Face request failed."
        });
      }

      const internalAnswer =
        hfData?.choices?.[0]?.message?.content?.trim();

      if (!internalAnswer) {
        return res.status(500).json({
          error: "The AI returned an empty response."
        });
      }

      return res.status(200).json({
        answer: internalAnswer,
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // =========================================================
    // PUBLIC / CURRENT INFORMATION -> INTERNET SEARCH
    // =========================================================
    //
    // Examples:
    //
    // "Where is AXA XL headquartered?"
    // "Where is AXA XL capital?"
    // "What is credit control in insurance?"
    // "What are the main lines of business in insurance?"
    // "Who is the Prime Minister of India?"
    //
    // These should NOT be treated as internal questions.
    //

    let webResults = [];

    if (SERPER_API_KEY) {
      try {
        const searchResponse = await fetch(
          "https://google.serper.dev/search",
          {
            method: "POST",
            headers: {
              "X-API-KEY": SERPER_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              q: userMessage,
              num: 6
            })
          }
        );

        const searchData = await searchResponse.json();

        if (searchResponse.ok) {
          webResults = Array.isArray(searchData?.organic)
            ? searchData.organic.slice(0, 6)
            : [];
        } else {
          console.error("Serper search failed:", searchData);
        }
      } catch (searchError) {
        console.error("Serper error:", searchError);
      }
    } else {
      console.warn(
        "SERPER_API_KEY is not configured. Public questions will use model knowledge only."
      );
    }

    // =========================================================
    // FORMAT SEARCH RESULTS FOR THE AI
    // =========================================================

    const formattedWebResults = webResults
      .map((result, index) => {
        return `
SOURCE ${index + 1}
Title: ${result.title || ""}
Snippet: ${result.snippet || ""}
URL: ${result.link || ""}
`;
      })
      .join("\n");

    // =========================================================
    // PUBLIC WEB SYSTEM PROMPT
    // =========================================================

    const publicSystemPrompt = `
You are Credit Control Buddy, a professional AI assistant for AXA XL employees.

The user's question was not identified as a specific verified internal-process
question, so determine the answer using public/current information.

WEB SEARCH RESULTS
==================

${formattedWebResults || "No web search results were available."}

RULES
=====

1. Answer the user's actual question directly.

2. Use the web search results as the primary source when they contain relevant
   information, especially for current or public facts.

3. If the question is about AXA XL but is publicly available, use reliable
   public web information.

4. Do NOT assume that every question mentioning AXA XL is an internal question.

5. Generic questions such as:
   - "What is credit control?"
   - "What is credit control in insurance?"
   - "What are the main lines of business in insurance?"
   should be answered as general/public questions.

6. Do NOT invent AXA XL-specific internal procedures.

7. If the question requires AXA XL internal information that is not present in
   the verified internal knowledge, say that the available verified internal
   information does not establish the answer. Do not make it up.

8. Do not blindly copy search snippets. Understand and summarize them.

9. If sources disagree, mention the uncertainty rather than inventing a
   definitive answer.

10. Give a natural, conversational answer similar to a good ChatGPT response.

11. Answer first. Avoid unnecessary "Step 1 -> Step 2 -> Step 3" formatting
    unless the user specifically asks for steps.

12. Keep answers concise but useful.

13. Use bullets when they genuinely improve readability.

14. For current/public factual questions, mention the relevant source context
    naturally when useful.

15. The verified AXA XL internal knowledge below may be used ONLY when it is
    directly relevant and must NEVER be expanded with invented information.

VERIFIED INTERNAL KNOWLEDGE
===========================

${internalKnowledge}
`;

    // =========================================================
    // CONVERSATION HISTORY
    // =========================================================

    const recentHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-8)
      : [];

    const messages = [
      {
        role: "system",
        content: publicSystemPrompt
      },
      ...recentHistory.map((item) => ({
        role: item.role,
        content: item.content
      })),
      {
        role: "user",
        content: userMessage
      }
    ];

    // =========================================================
    // CALL HUGGING FACE
    // =========================================================

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
          max_tokens: 700,
          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Hugging Face request failed:", data);

      // If Internet search succeeded but Hugging Face failed,
      // return the search information instead of a completely
      // useless generic error.
      if (webResults.length > 0) {
        const fallback = webResults
          .slice(0, 3)
          .map(
            (item) =>
              `${item.title || "Source"}: ${
                item.snippet || ""
              }`
          )
          .join("\n\n");

        return res.status(200).json({
          answer:
            "I found the following public information, but the AI response service is temporarily unavailable:\n\n" +
            fallback,
          mode: "web_fallback",
          source: "web_search",
          sources: webResults.slice(0, 6).map((item) => ({
            title: item.title || "",
            url: item.link || "",
            snippet: item.snippet || ""
          }))
        });
      }

      return res.status(500).json({
        error: "Hugging Face request failed."
      });
    }

    // =========================================================
    // EXTRACT AI ANSWER
    // =========================================================

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(500).json({
        error: "The AI returned an empty response."
      });
    }

    // =========================================================
    // RETURN RESPONSE
    // =========================================================

    return res.status(200).json({
      answer,
      mode: webResults.length > 0 ? "web" : "model",
      source: webResults.length > 0 ? "web_search" : "model_knowledge",
      sources: webResults.slice(0, 6).map((item) => ({
        title: item.title || "",
        url: item.link || "",
        snippet: item.snippet || ""
      }))
    });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Unable to contact the AI service."
    });
  }
}
