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

    const normalized = userMessage
      .toLowerCase()
      .replace(/[?.,!;:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const HF_TOKEN = process.env.HF_TOKEN;
    const SERPER_API_KEY = process.env.SERPER_API_KEY;

    /*
    ============================================================
    VERIFIED INTERNAL ANSWERS
    ============================================================
    */

    function internalAnswer(text) {
      return res.status(200).json({
        answer: text,
        sources: [],
        mode: "internal"
      });
    }

    /*
    ------------------------------------------------------------
    GENIUS COMMANDS
    ------------------------------------------------------------
    */

    if (
      /\bm3\b/.test(normalized) &&
      (
        normalized.includes("genius") ||
        normalized.includes("used") ||
        normalized.includes("use") ||
        normalized.includes("what") ||
        normalized.includes("meaning")
      )
    ) {
      return internalAnswer(
        "M3 is used to check detailed information about a policy."
      );
    }

    if (
      normalized.includes("/i") ||
      (
        normalized.includes("iban") &&
        (
          normalized.includes("genius") ||
          normalized.includes("payee") ||
          normalized.includes("command")
        )
      )
    ) {
      return internalAnswer(
        "/I is used to check whether an IBAN is registered against a particular payee code."
      );
    }

    if (
      /\bt3\b/.test(normalized) &&
      (
        normalized.includes("genius") ||
        normalized.includes("used") ||
        normalized.includes("use") ||
        normalized.includes("what")
      )
    ) {
      return internalAnswer(
        "T3 is used to check the due date for a booking."
      );
    }

    if (
      /\bb4\+8\b/.test(normalized)
    ) {
      return internalAnswer(
        "B4+8 is used to update narratives on a booking."
      );
    }

    if (
      /\bb4\b/.test(normalized) &&
      !normalized.includes("b4+8")
    ) {
      return internalAnswer(
        "B4 is used to check what bookings are available on a particular account code."
      );
    }

    if (
      /\bb5\b/.test(normalized)
    ) {
      return internalAnswer(
        "B5 is used to get the breakdown of a booking when commission is involved."
      );
    }

    /*
    ------------------------------------------------------------
    GENERAL VERIFIED CREDIT CONTROL ANSWERS
    ------------------------------------------------------------
    */

    if (
      normalized.includes("overdue receivable") ||
      normalized.includes("overdue receivables")
    ) {
      return internalAnswer(
        "An overdue receivable is an amount that was due for payment but has not been received by the agreed due date. In Credit Control, it may require follow-up such as reminders, queries or escalation."
      );
    }

    if (
      normalized.includes("what is credit control") ||
      normalized.includes("define credit control") ||
      normalized.includes("credit control in insurance")
    ) {
      return internalAnswer(
        "Credit Control in insurance is the process of monitoring and managing amounts owed to the insurer, particularly premiums and other receivables. The objective is to support timely collection and effective management of outstanding balances."
      );
    }

    /*
    ============================================================
    INTERNAL KEYWORDS
    ============================================================
    */

    const internalKeywords = [
      "axa",
      "axa xl",
      "genius",
      "iqma",
      "smartmatch",
      "wins",
      "ibais",
      "theframe",
      "cash management",
      "cash identification",
      "cash booking",
      "split cash",
      "cash allocation",
      "payable management",
      "outstanding management",
      "query assignment",
      "query reassignment",
      "query closure",
      "journal allocation",
      "settlement pay",
      "statement of accounts",
      "soa"
    ];

    const isInternalQuestion = internalKeywords.some(
      (keyword) => normalized.includes(keyword)
    );

    /*
    ============================================================
    VERIFIED INTERNAL KNOWLEDGE
    ============================================================
    */

    const internalKnowledge = `
You are Credit Control Buddy, an internal AI assistant for
AXA XL employees.

VERIFIED INTERNAL KNOWLEDGE:

GENERAL CREDIT CONTROL

Credit Control in insurance involves monitoring and managing
amounts owed to the insurer, including premiums and other
receivables.

Typical activities include:

- Monitoring receivables
- Tracking overdue balances
- Following up on outstanding payments
- Reconciliation
- Cash allocation
- Query management
- Working with relevant teams to resolve differences
- Supporting timely collection

An overdue receivable is an amount that was due for payment
but has not been received by the agreed due date.

Premiums are amounts payable for insurance coverage.

A receivable represents an amount owed to the insurer.

INSURANCE CONTEXT

Insured
Policy
Line of Business (LOB)
Premium
Receivable
Credit Control
Collection
Cash received

GENIUS

M3:
Used to check detailed information about a policy.

 /I:
Used to check whether an IBAN is registered against a
particular payee code.

T3:
Used to check the due date for a booking.

B4:
Used to check what bookings are available on a particular
account code.

B4+8:
Used to update narratives on a booking.

B5:
Used to get the breakdown of a booking when commission is
involved.

5:
Used to get the proper breakdown of a booking, including:
- Taxes
- Net premium
- Commission

Do not invent any other Genius commands.

INSURANCE SYSTEMS

GENIUS:
Legacy XL business in all regions.

WINS:
Program business in the Americas.

IBAIS:
Brooklyn Underwriting business in APAC.

theFrame:
Lloyds business in all regions.

PAYABLE MANAGEMENT

1. Request Received
Settlement / pay-out request is received via email.

2. Reconcile Bookings
Check supporting documentation and match bookings in the
system.

3. Initiation & Authorization
Credit Controller initiates the payment and obtains the
required authorization.

4. Payment Processed
Payment is successfully completed.

CASH MANAGEMENT

1. Cash Receipt
Cash is credited to the bank account.

2. Cash Identification
Cash is identified against the relevant account code and
policy by Credit Control.

3. Cash Booking
Cash is booked to the relevant account code.

4. Split Cash
In case of bulk cash, journals are split per insured.

5. Allocation
Matching items are allocated against the relevant booking.

6. Query
Pending items are queried with the relevant booking teams.

SMARTMATCH

- Funds credited in bank accounts reflect in SmartMatch.
- Receipts are received via email from the bank.
- Clients and account codes are identified through payment
  details.
- Cash is booked in SmartMatch against identified account
  codes and policies, where applicable.
- Cash reflects in GENIUS the next day.
- Where full or partial details are available, allocation
  can proceed.
- Pending items are queried with relevant teams.

RECONCILIATION

1. Receipt of SOA
Statement of Accounts is received from brokers/leaders.

2. Reconciliation
SOA records are reconciled with our records and the relevant
risk/policy is identified on the system.

3. Raise Queries
Differences are queried with the relevant teams, or agreement
is given to settle when everything matches.

OUTSTANDING MANAGEMENT

- Identify and track overdue balances.
- Inform brokers about pending receivables.
- Manage client reminders and communication.
- Escalation process and NOC handling by ESS/onshore teams.

IQMA

IQMA stands for Integrated Query Management Application.

1. Query Auto Load
Queries are auto-loaded from Genius upon journal creation.

2. Query Assignment
Queries are assigned to the relevant UA/MO/CLH etc.

3. Query Reassignment
Queries can be reassigned by UA/MO/CLH or Credit Control.

4. Query Closure
Queries are automatically closed once the journal is allocated.

IMPORTANT:

Never invent AXA XL internal policies, procedures, contacts,
responsibilities, system functionality, insured information,
LOB-specific information or Genius commands.
`;

    /*
    ============================================================
    WEB SEARCH
    ============================================================
    */

    async function searchWeb(query) {
      if (!SERPER_API_KEY) {
        console.error(
          "SERPER_API_KEY is missing from Vercel."
        );

        return [];
      }

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
              q: query,
              num: 6
            })
          }
        );

        const responseText = await searchResponse.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error(
            "SERPER INVALID JSON:",
            responseText
          );

          return [];
        }

        if (!searchResponse.ok) {
          console.error(
            "SERPER ERROR:",
            searchResponse.status,
            data
          );

          return [];
        }

        return Array.isArray(data?.organic)
          ? data.organic
              .slice(0, 6)
              .map((item) => ({
                title: item?.title || "",
                link: item?.link || "",
                snippet: item?.snippet || "",
                date: item?.date || ""
              }))
              .filter(
                (item) =>
                  item.title &&
                  item.link &&
                  item.snippet
              )
          : [];

      } catch (error) {
        console.error(
          "WEB SEARCH FAILED:",
          error
        );

        return [];
      }
    }

    /*
    ============================================================
    GET WEB RESULTS FOR NON-INTERNAL QUESTIONS
    ============================================================
    */

    let webResults = [];

    if (!isInternalQuestion) {
      webResults = await searchWeb(userMessage);
    }

    /*
    ============================================================
    WEB CONTEXT
    ============================================================
    */

    const webContext =
      webResults.length > 0
        ? webResults
            .map(
              (result, index) => `
SOURCE ${index + 1}
Title: ${result.title}
URL: ${result.link}
Snippet: ${result.snippet}
Date: ${result.date || "Not available"}
`
            )
            .join("\n")
        : "No web results were retrieved.";

    /*
    ============================================================
    HUGGING FACE
    ============================================================
    */

    if (!HF_TOKEN) {
      console.error("HF_TOKEN is missing.");

      /*
      If this is an Internet question and we have search
      results, return those rather than completely failing.
      */

      if (!isInternalQuestion && webResults.length > 0) {
        return res.status(200).json({
          answer:
            webResults[0].snippet ||
            "I found information on the web, but the AI service is currently unavailable.",
          sources: webResults.map((item) => ({
            title: item.title,
            link: item.link
          })),
          mode: "web-fallback"
        });
      }

      return res.status(500).json({
        error: "Hugging Face token is not configured."
      });
    }

    /*
    ============================================================
    SYSTEM PROMPT
    ============================================================
    */

    const systemPrompt = `
You are Credit Control Buddy.

Be professional, natural, conversational and accurate.

ROUTING:

${
  isInternalQuestion
    ? "INTERNAL AXA XL MODE"
    : "GENERAL INTERNET MODE"
}

INTERNAL AXA XL MODE:

Use the verified internal knowledge below.

AXA XL information has priority over general/public knowledge.

Never invent internal information.

If the requested internal information is not verified,
say that clearly.

GENERAL INTERNET MODE:

Use the supplied Internet search results as the primary
source for current/public information.

You can answer general questions such as:

- General insurance
- IFRS
- Finance
- Technology
- Geography
- Current affairs
- Public figures
- Companies
- General knowledge
- Everyday questions

If search results are available, use them.

If search results are unavailable, answer from your general
knowledge rather than simply refusing to answer.

ANSWER STYLE:

Answer directly.

Do not unnecessarily create Step 1 / Step 2 / Step 3.

Use bullets or tables only when helpful.

Do not sound robotic.

VERIFIED INTERNAL KNOWLEDGE:

${internalKnowledge}

WEB SEARCH RESULTS:

${webContext}

ACCURACY:

Never fabricate AXA XL information.

Never fabricate Genius commands.

Never fabricate sources.
`;

    /*
    ============================================================
    HISTORY
    ============================================================
    */

    const recentHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.content === "string" &&
              item.content.trim()
          )
          .slice(-8)
      : [];

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },

      ...recentHistory.map((item) => ({
        role:
          item.role === "assistant"
            ? "assistant"
            : "user",
        content: item.content.trim()
      })),

      {
        role: "user",
        content: userMessage
      }
    ];

    /*
    ============================================================
    CALL HUGGING FACE
    ============================================================
    */

    let aiResponse;

    try {
      aiResponse = await fetch(
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
    } catch (error) {
      console.error(
        "HUGGING FACE NETWORK ERROR:",
        error
      );

      /*
      WEB FALLBACK
      */

      if (!isInternalQuestion && webResults.length > 0) {
        return res.status(200).json({
          answer: webResults[0].snippet,
          sources: webResults.map((item) => ({
            title: item.title,
            link: item.link
          })),
          mode: "web-fallback"
        });
      }

      return res.status(502).json({
        error:
          "Unable to reach the AI service."
      });
    }

    const responseText = await aiResponse.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "HUGGING FACE INVALID JSON:",
        responseText
      );

      if (!isInternalQuestion && webResults.length > 0) {
        return res.status(200).json({
          answer: webResults[0].snippet,
          sources: webResults.map((item) => ({
            title: item.title,
            link: item.link
          })),
          mode: "web-fallback"
        });
      }

      return res.status(502).json({
        error:
          "The AI service returned an invalid response."
      });
    }

    /*
    ============================================================
    HUGGING FACE ERROR
    ============================================================
    */

    if (!aiResponse.ok) {
      console.error(
        "HUGGING FACE ERROR:",
        aiResponse.status,
        data
      );

      /*
      For a web question, do not completely fail if the
      Internet search already worked.
      */

      if (!isInternalQuestion && webResults.length > 0) {
        return res.status(200).json({
          answer:
            webResults[0].snippet ||
            "I found information from the web, but the AI service is temporarily unavailable.",

          sources: webResults.map((item) => ({
            title: item.title,
            link: item.link
          })),

          mode: "web-fallback"
        });
      }

      return res.status(502).json({
        error:
          data?.error ||
          data?.message ||
          "Hugging Face request failed."
      });
    }

    /*
    ============================================================
    EXTRACT ANSWER
    ============================================================
    */

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      console.error(
        "EMPTY HUGGING FACE ANSWER:",
        data
      );

      if (!isInternalQuestion && webResults.length > 0) {
        return res.status(200).json({
          answer: webResults[0].snippet,

          sources: webResults.map((item) => ({
            title: item.title,
            link: item.link
          })),

          mode: "web-fallback"
        });
      }

      return res.status(502).json({
        error: "The AI returned an empty answer."
      });
    }

    /*
    ============================================================
    FINAL RESPONSE
    ============================================================
    */

    return res.status(200).json({
      answer,

      sources: isInternalQuestion
        ? []
        : webResults.map((item) => ({
            title: item.title,
            link: item.link
          })),

      mode: isInternalQuestion
        ? "internal"
        : "web"
    });

  } catch (error) {
    console.error(
      "CREDIT CONTROL BUDDY ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Unable to process the request."
    });
  }
}
