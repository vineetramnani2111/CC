export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // ============================================================
    // 1. READ REQUEST
    // ============================================================

    const { message, history = [] } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const userMessage = message.trim();

    // ============================================================
    // 2. VERIFIED AXA XL INTERNAL KNOWLEDGE
    // ============================================================

    const internalKnowledge = `
You are Credit Control Buddy, an internal AI assistant for AXA XL employees.

Use the following as VERIFIED internal knowledge.

IMPORTANT:
- Never invent AXA XL-specific facts.
- Never invent Genius commands.
- Never invent internal processes.
- Never claim something is an AXA XL internal process unless it is contained
  in this knowledge.
- If the supplied internal knowledge does not answer the question, say that
  you do not have enough verified internal information.

==================================================
GENIUS
==================================================

GENIUS:
- Legacy XL business in all regions.

M3:
- Used to check detailed information about a policy.

/I:
- Used to check whether an IBAN is registered against a particular payee code.

T3:
- Used to check the due date for the booking.

B4:
- Used to check what bookings are available on a particular account/account code.

B4+8:
- Used to update narratives on a booking.

B5:
- Used to get a breakdown of a booking if commission is involved.

5:
- Provides the proper breakdown of a booking.
- Shows taxes, net premium and commission.

Do not invent other Genius commands.

==================================================
INSURANCE SYSTEMS
==================================================

GENIUS:
- Legacy XL business in all regions.

WINS:
- Program business in Americas.

IBAIS:
- Brooklyn Underwriting business in APAC.

theFrame:
- Lloyds Business in all regions.

==================================================
IQMA
==================================================

IQMA = Integrated Query Management Application.

Query Auto Load:
- Queries are auto-loaded from Genius upon journal creation.

Query Assignment:
- Queries are assigned to relevant UA / MO / CLH etc.

Query Reassignment:
- Queries can be reassigned by UA / MO / CLH or Credit Control.

Query Closure:
- Queries automatically close once the journal is allocated.

==================================================
PAYABLE MANAGEMENT
==================================================

Payable Management:

1. Request Received
- Settlement / pay-out request received via email.

2. Reconcile Bookings
- Check supporting documentation.
- Match bookings in the system.

3. Initiation & Authorization
- Credit Controller initiates payment.
- Required authorization is obtained.

4. Payment Processed
- Payment is successfully completed.

==================================================
CASH MANAGEMENT
==================================================

Cash Receipt:
- Cash credited to bank account.

Cash Identification:
- Cash identified / quoted to specific account code and policy by Credit Control.

Cash Booking:
- Cash booked to account code via SM / BSG.

Split Cash:
- Bulk cash journals split per insured.

Allocation:
- Matching items allocated.

Query:
- Pending items queried with relevant booking teams.

==================================================
SMARTMATCH
==================================================

- Funds credited in bank accounts reflect in SmartMatch.
- Receipts via email from bank.
- Clients / account codes identified through payment details.
- Cash booked in SmartMatch against identified account codes / policies where applicable.
- Cash reflects in GENIUS next day.
- Full / partial details allow allocation.
- Pending items queried with relevant teams.

==================================================
RECONCILIATION
==================================================

- Receipt of SOA from brokers / leaders.
- Reconcile SOA with records and identify risk / policy on system.
- Raise queries on differences or agreement to settle if everything matches.

SOA = Statement of Account.

==================================================
OUTSTANDING MANAGEMENT
==================================================

- Identify / track overdue balances.
- Inform brokers on pending receivables.
- Client reminders / communication.
- Escalation / NOC handling by ESS / onshore teams.

==================================================
CREDIT CONTROL
==================================================

The verified internal knowledge covers:

- Credit Control
- Receivables
- Outstanding balances
- Cash management
- Cash identification
- Cash booking
- Cash allocation
- Queries
- Reconciliation
- Payable Management
- Settlement / payment processing
`;

    // ============================================================
    // 3. DIRECT INTERNAL ANSWERS
    // ============================================================
    //
    // These answers DO NOT require:
    // - Internet
    // - Serper
    // - Hugging Face
    //
    // This makes verified internal questions reliable.
    // ============================================================

    const q = userMessage.toLowerCase();

    let directAnswer = null;

    // -------------------------
    // PAYABLE MANAGEMENT
    // -------------------------

    if (
      q.includes("payable management") ||
      q.includes("payables management")
    ) {
      directAnswer = `Payable Management at AXA XL is the process of managing settlement and pay-out requests through to successful payment.

It includes:

• Request Received — settlement / pay-out request is received via email.
• Reconcile Bookings — supporting documentation is checked and bookings are matched in the system.
• Initiation & Authorization — the Credit Controller initiates the payment and obtains the required authorization.
• Payment Processed — the payment is successfully completed.`;
    }

    // -------------------------
    // OVERDUE RECEIVABLE
    // -------------------------

    else if (
      q.includes("overdue receivable") ||
      q.includes("overdue receivables") ||
      q.includes("overdue balance") ||
      q.includes("overdue balances")
    ) {
      directAnswer = `An overdue receivable is an amount that remains outstanding after its expected due date.

In Credit Control, overdue balances are identified and tracked, brokers are informed about pending receivables, and client reminders or further escalation may be handled as appropriate.`;
    }

    // -------------------------
    // M3
    // -------------------------

    else if (
      /\bm3\b/.test(q) &&
      (
        q.includes("genius") ||
        q.includes("used") ||
        q.includes("what") ||
        q.includes("meaning") ||
        q.includes("check")
      )
    ) {
      directAnswer =
        "In GENIUS, M3 is used to check detailed information about a policy.";
    }

    // -------------------------
    // /I
    // -------------------------

    else if (
      q.includes("/i") ||
      (q.includes("iban") && q.includes("payee"))
    ) {
      directAnswer =
        "In GENIUS, /I is used to check whether an IBAN is registered against a particular payee code.";
    }

    // -------------------------
    // T3
    // -------------------------

    else if (
      /\bt3\b/.test(q) &&
      (
        q.includes("genius") ||
        q.includes("used") ||
        q.includes("what") ||
        q.includes("due") ||
        q.includes("booking")
      )
    ) {
      directAnswer =
        "In GENIUS, T3 is used to check the due date for the booking.";
    }

    // -------------------------
    // B4+8
    // -------------------------

    else if (
      q.includes("b4+8") ||
      q.includes("b4 + 8") ||
      q.includes("b4 8")
    ) {
      directAnswer =
        "In GENIUS, B4+8 is used to update narratives on a booking.";
    }

    // -------------------------
    // B4
    // -------------------------

    else if (
      /\bb4\b/.test(q) &&
      !q.includes("b4+8") &&
      !q.includes("b4 + 8") &&
      (
        q.includes("genius") ||
        q.includes("booking") ||
        q.includes("account") ||
        q.includes("used") ||
        q.includes("what")
      )
    ) {
      directAnswer =
        "In GENIUS, B4 is used to check what bookings are available on a particular account or account code.";
    }

    // -------------------------
    // B5
    // -------------------------

    else if (
      /\bb5\b/.test(q) &&
      (
        q.includes("genius") ||
        q.includes("booking") ||
        q.includes("commission") ||
        q.includes("used") ||
        q.includes("what")
      )
    ) {
      directAnswer =
        "In GENIUS, B5 is used to get a breakdown of a booking when commission is involved.";
    }

    // -------------------------
    // GENIUS COMMAND 5
    // -------------------------

    else if (
      q === "5" ||
      q.includes("genius 5") ||
      q.includes("command 5")
    ) {
      directAnswer =
        "In GENIUS, command 5 provides the proper breakdown of a booking, including taxes, net premium and commission.";
    }

    // -------------------------
    // IQMA
    // -------------------------

    else if (
      q.includes("iqma") ||
      q.includes("integrated query management")
    ) {
      directAnswer = `IQMA stands for Integrated Query Management Application.

Its known functions include:

• Query Auto Load — queries are auto-loaded from GENIUS upon journal creation.
• Query Assignment — queries are assigned to the relevant UA / MO / CLH etc.
• Query Reassignment — queries can be reassigned by UA / MO / CLH or Credit Control.
• Query Closure — queries automatically close once the journal is allocated.`;
    }

    // -------------------------
    // SMARTMATCH
    // -------------------------

    else if (q.includes("smartmatch")) {
      directAnswer = `SmartMatch is used to reflect funds credited in bank accounts and support the identification and booking of cash.

The process includes receiving bank receipts by email, identifying clients / account codes from payment details, booking cash against identified account codes / policies where applicable, and supporting allocation.

Cash reflects in GENIUS the next day. Pending items are queried with the relevant teams.`;
    }

    // -------------------------
    // CASH MANAGEMENT
    // -------------------------

    else if (
      q.includes("cash management") ||
      q.includes("cash receipt") ||
      q.includes("cash identification") ||
      q.includes("cash booking") ||
      q.includes("split cash")
    ) {
      directAnswer = `Cash Management covers the handling of cash from receipt through identification, booking, allocation and query resolution.

It includes:

• Cash Receipt — cash is credited to the bank account.
• Cash Identification — cash is identified / quoted to the relevant account code and policy by Credit Control.
• Cash Booking — cash is booked to the account code via SM / BSG.
• Split Cash — bulk cash journals are split per insured.
• Allocation — matching items are allocated.
• Query — pending items are queried with the relevant booking teams.`;
    }

    // -------------------------
    // RECONCILIATION
    // -------------------------

    else if (
      q.includes("reconciliation") ||
      q.includes("reconcile soa") ||
      q.includes("statement of account")
    ) {
      directAnswer = `The reconciliation process includes:

• Receipt of SOA from brokers / leaders.
• Reconciling the SOA with records and identifying the risk / policy on the system.
• Raising queries on differences, or agreement to settle if everything matches.

SOA means Statement of Account.`;
    }

    // -------------------------
    // OUTSTANDING MANAGEMENT
    // -------------------------

    else if (
      q.includes("outstanding management") ||
      q.includes("outstanding balance") ||
      q.includes("pending receivable")
    ) {
      directAnswer = `Outstanding management includes:

• Identifying and tracking overdue balances.
• Informing brokers about pending receivables.
• Client reminders / communication.
• Escalation / NOC handling by ESS / onshore teams.`;
    }

    // ============================================================
    // 4. RETURN DIRECT INTERNAL ANSWER
    // ============================================================

    if (directAnswer) {
      console.log("ROUTE: DIRECT_INTERNAL");
      console.log("QUESTION:", userMessage);

      return res.status(200).json({
        answer: directAnswer,
        mode: "internal",
        source: "verified_internal_knowledge",
        sources: []
      });
    }

    // ============================================================
    // 5. DETECT INTERNAL QUESTION
    // ============================================================

    const internalKeywords = [
      "axa",
      "axa xl",
      "genius",
      "iqma",
      "smartmatch",
      "wins",
      "ibais",
      "theframe",
      "payable management",
      "payables management",
      "cash management",
      "cash receipt",
      "cash identification",
      "cash booking",
      "split cash",
      "cash allocation",
      "outstanding management",
      "outstanding balance",
      "query assignment",
      "query reassignment",
      "query closure",
      "journal allocation",
      "settlement",
      "pay-out",
      "payout",
      "reconciliation",
      "statement of account",
      "soa",
      "credit control",
      "credit controller",
      "account code",
      "m3",
      "b4",
      "b4+8",
      "b5",
      "t3"
    ];

    const isInternal = internalKeywords.some((keyword) =>
      q.includes(keyword)
    );

    // ============================================================
    // 6. INTERNAL AI ROUTE
    // ============================================================

    if (isInternal) {
      console.log("ROUTE: INTERNAL_AI");
      console.log("QUESTION:", userMessage);

      const HF_TOKEN = process.env.HF_TOKEN;

      if (!HF_TOKEN) {
        return res.status(200).json({
          answer:
            "This is an AXA XL internal topic, but I don't currently have enough verified internal information to answer it safely.",
          mode: "internal",
          source: "verified_internal_knowledge",
          sources: []
        });
      }

      const recentHistory = Array.isArray(history)
        ? history
            .filter(
              (item) =>
                item &&
                typeof item === "object" &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string"
            )
            .slice(-8)
        : [];

      const messages = [
        {
          role: "system",
          content: `
You are Credit Control Buddy, an internal AI assistant for AXA XL employees.

Answer using ONLY the verified AXA XL internal knowledge below.

Rules:

- Never invent AXA XL-specific facts.
- Never invent Genius commands.
- Never invent internal processes.
- Never assume a public process is an AXA XL process.
- If the information is not available, say you do not have enough verified
  internal information.
- Answer naturally.
- Answer the question directly.
- Keep the answer concise but useful.
- Use bullets only when helpful.
- Do not unnecessarily format everything as steps.

VERIFIED INTERNAL KNOWLEDGE:

${internalKnowledge}
`
        },
        ...recentHistory.map((item) => ({
          role: item.role,
          content: item.content.trim()
        })),
        {
          role: "user",
          content: userMessage
        }
      ];

      try {
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
              temperature: 0.25,
              max_tokens: 700,
              stream: false
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "HF INTERNAL ERROR:",
            response.status,
            data
          );

          return res.status(200).json({
            answer:
              "I found this to be an AXA XL internal topic, but I don't have enough verified internal information to answer it safely.",
            mode: "internal",
            source: "verified_internal_knowledge",
            sources: []
          });
        }

        const answer =
          data?.choices?.[0]?.message?.content?.trim();

        if (!answer) {
          return res.status(200).json({
            answer:
              "I don't have enough verified internal information to answer that safely.",
            mode: "internal",
            source: "verified_internal_knowledge",
            sources: []
          });
        }

        return res.status(200).json({
          answer,
          mode: "internal",
          source: "verified_internal_knowledge",
          sources: []
        });

      } catch (error) {
        console.error("INTERNAL AI ERROR:", error);

        return res.status(200).json({
          answer:
            "I found this to be an AXA XL internal topic, but I don't have enough verified internal information to answer it safely.",
          mode: "internal",
          source: "verified_internal_knowledge",
          sources: []
        });
      }
    }

    // ============================================================
    // 7. GENERAL / INTERNET ROUTE
    // ============================================================

    console.log("ROUTE: WEB_AI");
    console.log("QUESTION:", userMessage);

    const SERPER_API_KEY = process.env.SERPER_API_KEY;

    let searchResults = [];

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

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          searchResults = Array.isArray(searchData?.organic)
            ? searchData.organic.slice(0, 6)
            : [];
        } else {
          console.error(
            "SERPER ERROR:",
            searchResponse.status
          );
        }
      } catch (error) {
        console.error("SERPER REQUEST ERROR:", error);
      }
    } else {
      console.warn("SERPER_API_KEY is not configured.");
    }

    // ============================================================
    // 8. PREPARE WEB CONTEXT
    // ============================================================

    const webContext = searchResults.length
      ? searchResults
          .map(
            (item, index) => `
SOURCE ${index + 1}
Title: ${item.title || ""}
Snippet: ${item.snippet || ""}
URL: ${item.link || ""}
`
          )
          .join("\n")
      : "No web search results were available.";

    // ============================================================
    // 9. HUGGING FACE FOR GENERAL QUESTIONS
    // ============================================================

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      if (searchResults.length > 0) {
        const fallback = searchResults
          .slice(0, 3)
          .map(
            (item) =>
              `${item.title}\n${item.snippet}`
          )
          .join("\n\n");

        return res.status(200).json({
          answer: fallback,
          mode: "web_fallback",
          source: "web_search",
          sources: searchResults.map((item) => ({
            title: item.title,
            link: item.link
          }))
        });
      }

      return res.status(503).json({
        error: "Hugging Face token is not configured."
      });
    }

    const recentHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-8)
      : [];

    const messages = [
      {
        role: "system",
        content: `
You are Credit Control Buddy.

You are a professional, concise and conversational AI assistant.

The user is asking a general/public question.

Use the web search results supplied below when relevant.

Rules:

- Answer the user's actual question directly.
- Use current web information when the question is time-sensitive.
- Do not invent facts.
- Do not blindly copy search snippets.
- Synthesize the information naturally.
- Do not unnecessarily use step-by-step formatting.
- Use bullets when they improve clarity.
- Keep the response concise but useful.
- Do not invent AXA XL internal information.

WEB SEARCH RESULTS:

${webContext}
`
      },
      ...recentHistory.map((item) => ({
        role: item.role,
        content: item.content.trim()
      })),
      {
        role: "user",
        content: userMessage
      }
    ];

    // ============================================================
    // 10. CALL HUGGING FACE
    // ============================================================

    try {
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
            max_tokens: 800,
            stream: false
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "HF GENERAL ERROR:",
          response.status,
          data
        );

        throw new Error("Hugging Face request failed.");
      }

      const answer =
        data?.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        throw new Error("Empty AI response.");
      }

      return res.status(200).json({
        answer,
        mode: "web",
        source: "web_search_and_ai",
        sources: searchResults.map((item) => ({
          title: item.title,
          link: item.link
        }))
      });

    } catch (error) {
      console.error("GENERAL AI ERROR:", error);

      // ==========================================================
      // 11. WEB FALLBACK
      // ==========================================================

      if (searchResults.length > 0) {
        const fallback = searchResults
          .slice(0, 3)
          .map(
            (item) =>
              `${item.title}\n${item.snippet}`
          )
          .join("\n\n");

        return res.status(200).json({
          answer: fallback,
          mode: "web_fallback",
          source: "web_search",
          sources: searchResults.map((item) => ({
            title: item.title,
            link: item.link
          }))
        });
      }

      return res.status(503).json({
        error:
          "I couldn't retrieve current information right now. Please try again."
      });
    }

  } catch (error) {
    console.error("UNHANDLED SERVER ERROR:", error);

    return res.status(500).json({
      error: "Unable to process the request."
    });
  }
}
