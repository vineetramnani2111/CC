export default async function handler(req, res) {
  // ============================================================
  // METHOD CHECK
  // ============================================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // ============================================================
    // READ REQUEST
    // ============================================================

    const body = req.body || {};
    const message = typeof body.message === "string"
      ? body.message.trim()
      : "";

    const history = Array.isArray(body.history)
      ? body.history
      : [];

    if (!message) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const q = message.toLowerCase();

    // ============================================================
    // ENVIRONMENT VARIABLES
    // ============================================================

    const HF_TOKEN = process.env.HF_TOKEN;
    const SERPER_API_KEY = process.env.SERPER_API_KEY;

    // ============================================================
    // VERIFIED AXA XL INTERNAL KNOWLEDGE
    // ============================================================
    //
    // IMPORTANT:
    // Only information supplied/verified for this project belongs here.
    // Do NOT invent additional AXA XL internal information.
    //

    const internalKnowledge = `
VERIFIED AXA XL INTERNAL KNOWLEDGE

============================================================
1. INSURANCE SYSTEMS
============================================================

GENIUS
- Legacy XL business in all regions.

WINS
- Program business in Americas.

IBAIS
- Brooklyn Underwriting business in APAC.

theFrame
- Lloyds Business in all regions.


============================================================
2. GENIUS COMMANDS
============================================================

M3
- Check detailed information about a policy.

/I
- Check whether an IBAN is registered against a payee code.

T3
- Check due date for the booking.

B4
- Check what bookings are available on a particular account/account code.

B4+8
- Update narratives on booking.

B5
- Get breakdown of booking if commission is involved.

5
- Proper breakdown of booking.
- Shows taxes, net premium and commission.


============================================================
3. IQMA
============================================================

IQMA
- Integrated Query Management Application.

Query Auto Load
- Queries are auto-loaded from Genius upon journal creation.

Query Assignment
- Queries are assigned to relevant UA/MO/CLH etc.

Query Reassignment
- Queries can be reassigned by UA/MO/CLH or Credit Control.

Query Closure
- Queries automatically close once journal allocated.


============================================================
4. PAYABLE MANAGEMENT
============================================================

Request Received
- Settlement/pay-out request received via email.

Reconcile Bookings
- Check supporting documentation and match bookings in system.

Initiation & Authorization
- Credit Controller initiates payment and gets required authorization.

Payment Processed
- Payment successfully completed.


============================================================
5. CASH MANAGEMENT
============================================================

Cash Receipt
- Cash credited to bank account.

Cash Identification
- Cash identified/quoted to specific account code and policy by Credit Control.

Cash Booking
- Cash booked to account code via SM/BSG.

Split Cash
- Bulk cash journals split per insured.

Allocation
- Matching items allocated.

Query
- Pending items queried with relevant booking teams.


============================================================
6. SMARTMATCH
============================================================

- Funds credited in bank accounts reflect in SmartMatch.
- Receipts via email from bank.
- Clients/account codes identified through payment details.
- Cash booked in SmartMatch against identified account codes/policies where applicable.
- Cash reflects in GENIUS next day.
- Full/partial details allow allocation.
- Pending items queried with relevant teams.


============================================================
7. RECONCILIATION
============================================================

- Receipt of SOA from brokers/leaders.
- Reconcile SOA with records and identify risk/policy on system.
- Raise queries on differences or agreement to settle if everything matches.


============================================================
8. OUTSTANDING MANAGEMENT
============================================================

- Identify/track overdue balances.
- Inform brokers on pending receivables.
- Client reminders/communication.
- Escalation/NOC handling by ESS/onshore teams.
`;

    // ============================================================
    // HELPER: NORMALISE TEXT
    // ============================================================

    function cleanText(value) {
      return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // ============================================================
    // HELPER: RECENT CHAT HISTORY
    // ============================================================

    function getRecentHistory() {
      return history
        .filter((item) => {
          return (
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim()
          );
        })
        .slice(-8)
        .map((item) => ({
          role: item.role,
          content: item.content.trim()
        }));
    }

    // ============================================================
    // DIRECT VERIFIED INTERNAL ANSWERS
    // ============================================================
    //
    // These do NOT call Hugging Face.
    //
    // This is deliberate.
    //
    // If we already know the verified answer, we return it directly.
    // That means a temporary AI/API problem cannot break known
    // internal answers.
    // ============================================================

    // ------------------------------------------------------------
    // PAYABLE MANAGEMENT
    // ------------------------------------------------------------

    if (
      q === "payable management" ||
      q === "payables management" ||
      q.includes("what is payable management") ||
      q.includes("what is payables management")
    ) {
      return res.status(200).json({
        answer:
          "At AXA XL, Payable Management covers the process from receiving a settlement or pay-out request through reconciliation, authorization and payment. The main stages are Request Received, Reconcile Bookings, Initiation & Authorization, and Payment Processed.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // OUTSTANDING / OVERDUE
    // ------------------------------------------------------------

    if (
      q.includes("overdue receivable") ||
      q.includes("overdue balance") ||
      q.includes("overdue balances") ||
      q.includes("outstanding management")
    ) {
      return res.status(200).json({
        answer:
          "Outstanding Management focuses on identifying and tracking overdue balances, informing brokers about pending receivables, sending client reminders or communications, and handling escalation/NOC activity through ESS/onshore teams.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // M3
    // ------------------------------------------------------------

    if (
      q === "m3" ||
      q.includes("m3 in genius") ||
      q.includes("what is m3") ||
      q.includes("what does m3 do")
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, M3 is used to check detailed information about a policy.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // /I
    // ------------------------------------------------------------

    if (
      q === "/i" ||
      q.includes("/i in genius") ||
      q.includes("what is /i") ||
      q.includes("what does /i do")
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, /I is used to check whether an IBAN is registered against a payee code.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // T3
    // ------------------------------------------------------------

    if (
      q === "t3" ||
      q.includes("t3 in genius") ||
      q.includes("what is t3") ||
      q.includes("what does t3 do")
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, T3 is used to check the due date for the booking.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // B4+8
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // B4
    // ------------------------------------------------------------

    if (
      q === "b4" ||
      q.includes("b4 in genius") ||
      q.includes("what is b4") ||
      q.includes("what does b4 do")
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, B4 is used to check what bookings are available on a particular account or account code.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // B5
    // ------------------------------------------------------------

    if (
      q === "b5" ||
      q.includes("b5 in genius") ||
      q.includes("what is b5") ||
      q.includes("what does b5 do")
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, B5 is used to get a breakdown of a booking when commission is involved.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // COMMAND 5
    // ------------------------------------------------------------

    if (
      q === "5 in genius" ||
      q.includes("command 5 in genius") ||
      q.includes("genius command 5") ||
      q.includes("what is command 5")
    ) {
      return res.status(200).json({
        answer:
          "In GENIUS, command 5 provides a proper breakdown of a booking, including taxes, net premium and commission.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // IQMA
    // ------------------------------------------------------------

    if (
      q === "iqma" ||
      q === "what is iqma" ||
      q.includes("what does iqma stand for")
    ) {
      return res.status(200).json({
        answer:
          "IQMA stands for Integrated Query Management Application. In the verified AXA XL process, queries are auto-loaded from GENIUS when a journal is created, assigned to relevant UA/MO/CLH teams, reassigned when required, and automatically closed once the journal is allocated.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // SMARTMATCH
    // ------------------------------------------------------------

    if (
      q === "smartmatch" ||
      q === "what is smartmatch" ||
      q.includes("what is smartmatch")
    ) {
      return res.status(200).json({
        answer:
          "SmartMatch is part of the cash-management process. Funds credited to bank accounts reflect in SmartMatch, where payment details help identify clients or account codes. Cash can then be booked against identified account codes or policies where applicable. Cash reflects in GENIUS the next day, and pending items can be queried with the relevant teams.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // CASH MANAGEMENT
    // ------------------------------------------------------------

    if (
      q === "cash management" ||
      q === "what is cash management" ||
      q.includes("cash management process")
    ) {
      return res.status(200).json({
        answer:
          "The verified Cash Management process covers Cash Receipt, Cash Identification, Cash Booking, Split Cash, Allocation and Query. In simple terms, cash is received into the bank, identified against the relevant account code and policy, booked, split where required, allocated against matching items, and queried when information is still pending.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ------------------------------------------------------------
    // RECONCILIATION
    // ------------------------------------------------------------

    if (
      q === "reconciliation" ||
      q === "what is reconciliation" ||
      q.includes("reconciliation process") ||
      q.includes("reconcile soa")
    ) {
      return res.status(200).json({
        answer:
          "The verified reconciliation process involves receiving the SOA from brokers or leaders, reconciling it with system records and identifying the relevant risk or policy on the system, then raising queries on differences or proceeding with an agreement to settle when everything matches.",
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ============================================================
    // INTERNAL ROUTING
    // ============================================================
    //
    // IMPORTANT:
    //
    // DO NOT use generic:
    // "axa"
    // "axa xl"
    // "credit control"
    // "credit controller"
    // "policy"
    // "booking"
    // "settlement"
    //
    // Those can be normal public questions.
    // ============================================================

    const internalKeywords = [
      // Internal systems
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

      // Reconciliation-specific wording
      "reconcile soa",

      // Genius commands
      "m3",
      "b4+8",
      "b4 + 8",
      "b5",
      "t3",

      // Explicit internal wording
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

    // ============================================================
    // FUNCTION: HUGGING FACE
    // ============================================================

    async function callHuggingFace(messages) {
      if (!HF_TOKEN) {
        return {
          ok: false,
          error: "HF_TOKEN is not configured in Vercel."
        };
      }

      try {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, 45000);

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
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        const rawText = await response.text();

        let data;

        try {
          data = JSON.parse(rawText);
        } catch {
          data = {
            raw: rawText
          };
        }

        if (!response.ok) {
          console.error("Hugging Face error:", data);

          return {
            ok: false,
            error:
              data?.error?.message ||
              data?.error ||
              `Hugging Face returned HTTP ${response.status}.`
          };
        }

        const answer = cleanText(
          data?.choices?.[0]?.message?.content
        );

        if (!answer) {
          return {
            ok: false,
            error: "Hugging Face returned an empty answer."
          };
        }

        return {
          ok: true,
          answer
        };
      } catch (error) {
        console.error("Hugging Face exception:", error);

        return {
          ok: false,
          error:
            error?.name === "AbortError"
              ? "Hugging Face request timed out."
              : error?.message || "Unable to contact Hugging Face."
        };
      }
    }

    // ============================================================
    // INTERNAL QUESTION NOT DIRECTLY ANSWERED ABOVE
    // ============================================================

    if (isInternal) {
      const internalMessages = [
        {
          role: "system",
          content: `
You are Credit Control Buddy, a professional AI assistant for AXA XL employees.

The user is asking about a verified AXA XL internal system, process,
workflow, or terminology.

Use ONLY the verified internal knowledge provided below for AXA XL-specific
facts.

Never invent:
- internal procedures
- system functionality
- responsibilities
- contacts
- approval requirements
- policies
- process steps
- commands
- business rules

If the verified knowledge does not contain the answer, say that the available
verified internal knowledge does not contain enough information.

Do not replace verified internal information with general public information.

Answer naturally.
Answer first.
Be concise but useful.
Do not unnecessarily use Step 1 / Step 2 / Step 3 formatting.
Use bullets only when useful.

VERIFIED INTERNAL KNOWLEDGE:

${internalKnowledge}
`
        },
        ...getRecentHistory(),
        {
          role: "user",
          content: message
        }
      ];

      const result = await callHuggingFace(internalMessages);

      if (result.ok) {
        return res.status(200).json({
          answer: result.answer,
          mode: "internal",
          source: "verified_internal_knowledge",
          sources: []
        });
      }

      // IMPORTANT:
      // Do not send a 500 here.
      // Give the frontend a useful answer instead of the generic
      // "couldn't connect" message.

      return res.status(200).json({
        answer:
          "I can identify this as an AXA XL internal topic, but the available verified internal information does not contain enough detail to answer it safely. I don't want to invent an internal process or system detail.",
        mode: "internal_fallback",
        source: "verified_internal_knowledge",
        sources: [],
        warning: result.error
      });
    }

    // ============================================================
    // PUBLIC / INTERNET QUESTION
    // ============================================================
    //
    // Examples:
    //
    // What is credit control in insurance?
    // Where is AXA XL headquartered?
    // Who is the Prime Minister of India?
    // What are the main lines of business in insurance?
    //
    // These DO NOT automatically become internal questions.
    // ============================================================

    async function searchInternet(query) {
      if (!SERPER_API_KEY) {
        return {
          ok: false,
          error: "SERPER_API_KEY is not configured in Vercel.",
          results: []
        };
      }

      try {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, 15000);

        const response = await fetch(
          "https://google.serper.dev/search",
          {
            method: "POST",
            headers: {
              "X-API-KEY": SERPER_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              q: query,
              num: 6
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        const rawText = await response.text();

        let data;

        try {
          data = JSON.parse(rawText);
        } catch {
          data = {};
        }

        if (!response.ok) {
          console.error("Serper error:", data);

          return {
            ok: false,
            error:
              data?.message ||
              `Internet search returned HTTP ${response.status}.`,
            results: []
          };
        }

        const results = Array.isArray(data?.organic)
          ? data.organic.slice(0, 6)
          : [];

        return {
          ok: true,
          results
        };
      } catch (error) {
        console.error("Serper exception:", error);

        return {
          ok: false,
          error:
            error?.name === "AbortError"
              ? "Internet search timed out."
              : error?.message || "Unable to perform Internet search.",
          results: []
        };
      }
    }

    // ============================================================
    // PERFORM WEB SEARCH
    // ============================================================

    const search = await searchInternet(message);

    const webResults = search.results || [];

    // ============================================================
    // PREPARE WEB SOURCES FOR HUGGING FACE
    // ============================================================

    const webContext = webResults
      .map((item, index) => {
        return `
SOURCE ${index + 1}
Title: ${cleanText(item.title)}
Snippet: ${cleanText(item.snippet)}
URL: ${cleanText(item.link)}
`;
      })
      .join("\n");

    // ============================================================
    // PUBLIC QUESTION SYSTEM PROMPT
    // ============================================================

    const publicSystemPrompt = `
You are Credit Control Buddy, a professional AI assistant for AXA XL employees.

The user's question is being treated as a public/general question rather than
a verified AXA XL internal-process question.

Use the Internet search results below when they are relevant.

IMPORTANT RULES:

- Answer the user's actual question directly.
- Use public web information for public/current questions.
- Do not assume that every question mentioning AXA XL is an internal question.
- Generic questions about insurance or credit control should be answered as
  general/public questions.
- Do not invent AXA XL internal procedures.
- Do not pretend that public information is internal AXA XL knowledge.
- Do not blindly copy search snippets.
- Summarise the information naturally.
- If sources disagree, acknowledge the uncertainty.
- Answer first.
- Be concise but useful.
- Avoid unnecessary Step 1 / Step 2 / Step 3 formatting.
- Use bullets when they improve readability.
- For current facts, rely primarily on the supplied web results.

Examples of PUBLIC questions:

"Where is AXA XL headquartered?"
"What is credit control in insurance?"
"What are the main lines of business in insurance?"
"Who is the Prime Minister of India?"

These should NOT automatically be classified as internal questions.

VERIFIED INTERNAL KNOWLEDGE
===========================

${internalKnowledge}

Use this internal knowledge only when it is directly relevant.
Never expand it with invented AXA XL-specific information.

INTERNET SEARCH RESULTS
=======================

${webContext || "No Internet search results were available."}
`;

    const publicMessages = [
      {
        role: "system",
        content: publicSystemPrompt
      },
      ...getRecentHistory(),
      {
        role: "user",
        content: message
      }
    ];

    // ============================================================
    // CALL HUGGING FACE FOR PUBLIC ANSWER
    // ============================================================

    const hfResult = await callHuggingFace(publicMessages);

    // ============================================================
    // NORMAL SUCCESS
    // ============================================================

    if (hfResult.ok) {
      return res.status(200).json({
        answer: hfResult.answer,
        mode: webResults.length > 0 ? "web" : "model",
        source: webResults.length > 0
          ? "web_search"
          : "model_knowledge",
        sources: webResults.map((item) => ({
          title: cleanText(item.title),
          url: cleanText(item.link),
          snippet: cleanText(item.snippet)
        }))
      });
    }

    // ============================================================
    // WEB SEARCH WORKED BUT HUGGING FACE FAILED
    // ============================================================
    //
    // Instead of returning HTTP 500 and causing your frontend to show:
    //
    // "Sorry, I couldn't connect to the AI service..."
    //
    // return the actual web information.
    // ============================================================

    if (webResults.length > 0) {
      const fallbackLines = webResults
        .slice(0, 4)
        .map((item) => {
          const title = cleanText(item.title);
          const snippet = cleanText(item.snippet);

          return `${title}\n${snippet}`;
        })
        .filter(Boolean);

      const fallbackAnswer =
        "I found relevant public information, but the AI answer service is temporarily unavailable.\n\n" +
        fallbackLines.join("\n\n");

      return res.status(200).json({
        answer: fallbackAnswer,
        mode: "web_fallback",
        source: "web_search",
        sources: webResults.map((item) => ({
          title: cleanText(item.title),
          url: cleanText(item.link),
          snippet: cleanText(item.snippet)
        })),
        warning: hfResult.error
      });
    }

    // ============================================================
    // BOTH WEB SEARCH AND HUGGING FACE FAILED
    // ============================================================
    //
    // Still return HTTP 200 so your frontend does NOT display the
    // generic "couldn't connect" error.
    //
    // The answer tells you exactly what configuration is missing.
    // ============================================================

    let configurationMessage =
      "I couldn't retrieve an answer right now.";

    if (!SERPER_API_KEY && !HF_TOKEN) {
      configurationMessage =
        "The AI service is not configured correctly in Vercel. Both HF_TOKEN and SERPER_API_KEY are missing.";
    } else if (!SERPER_API_KEY) {
      configurationMessage =
        "Internet search is not configured yet. Please add SERPER_API_KEY to the Vercel project.";
    } else if (!HF_TOKEN) {
      configurationMessage =
        "The AI service is not configured yet. Please add HF_TOKEN to the Vercel project.";
    } else {
      configurationMessage =
        "The Internet search and AI services are currently unavailable. Please try again in a moment.";
    }

    return res.status(200).json({
      answer: configurationMessage,
      mode: "service_fallback",
      source: "configuration_or_service",
      sources: [],
      warning: hfResult.error || search.error || null
    });

  } catch (error) {
    // ============================================================
    // FINAL SAFETY NET
    // ============================================================

    console.error("COMPLETE API ERROR:", error);

    // Return 200 so the frontend receives a real answer instead
    // of triggering its generic error screen/message.

    return res.status(200).json({
      answer:
        "I ran into a temporary problem while processing that request. Please try the question again.",
      mode: "error_fallback",
      source: "server",
      sources: [],
      warning: error?.message || "Unknown server error."
    });
  }
}
