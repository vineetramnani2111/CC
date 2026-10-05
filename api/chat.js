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
      .replace(/\s+/g, " ")
      .trim();

    /*
    ============================================================
    ENVIRONMENT VARIABLES
    ============================================================
    */

    const HF_TOKEN = process.env.HF_TOKEN;
    const SERPER_API_KEY = process.env.SERPER_API_KEY;

    if (!HF_TOKEN) {
      console.error("HF_TOKEN is missing.");

      return res.status(500).json({
        error: "Hugging Face token is not configured in Vercel."
      });
    }

    /*
    ============================================================
    INTERNAL / AXA ROUTING
    ============================================================

    AXA / AXA XL automatically means internal knowledge.

    Certain internal system/tool names also automatically mean
    internal knowledge even when the user doesn't type AXA.
    */

    const internalKeywords = [
      "axa",
      "axa xl",

      // Genius / internal tools
      "genius",
      "m3",
      "/i",
      "t3",
      "b4",
      "b4+8",
      "b5",

      // Internal systems
      "iqma",
      "smartmatch",
      "wins",
      "ibais",
      "theframe",

      // Internal Credit Control activities
      "cash management",
      "cash identification",
      "cash booking",
      "split cash",
      "cash allocation",
      "payable management",
      "reconcile bookings",
      "settlement pay-out",
      "outstanding management",

      // Internal process terminology
      "soa",
      "statement of accounts",
      "journal allocation",
      "query assignment",
      "query reassignment",
      "query closure"
    ];

    const isInternalQuestion = internalKeywords.some((keyword) => {
      if (keyword === "/i") {
        return normalized.includes("/i");
      }

      return normalized.includes(keyword);
    });

    /*
    ============================================================
    VERIFIED GENIUS ANSWERS
    ============================================================
    */

    const verifiedAnswers = {
      "m3":
        "M3 is used to check detailed information about a policy.",

      "/i":
        "/I is used to check whether an IBAN is registered against a particular payee code.",

      "t3":
        "T3 is used to check the due date for a booking.",

      "b4":
        "B4 is used to check what bookings are available on a particular account code.",

      "b4+8":
        "B4+8 is used to update narratives on a booking.",

      "b5":
        "B5 is used to get the breakdown of a booking when commission is involved.",

      "5":
        "5 is used to get the proper breakdown of a booking, including taxes, net premium and commission."
    };

    /*
    ============================================================
    DIRECT VERIFIED ANSWERS
    ============================================================
    */

    if (verifiedAnswers[normalized]) {
      return res.status(200).json({
        answer: verifiedAnswers[normalized],
        sources: []
      });
    }

    /*
    ============================================================
    INTERNAL KNOWLEDGE
    ============================================================
    */

    const internalKnowledge = `
============================================================
CREDIT CONTROL BUDDY - VERIFIED INTERNAL KNOWLEDGE
============================================================

You are Credit Control Buddy, an internal AI assistant designed
to help AXA XL employees understand Credit Control, insurance,
receivables, collections, premiums, Lines of Business (LOBs),
insurance systems, Genius and related processes.

The following information is verified internal/project
knowledge.

============================================================
GENERAL CREDIT CONTROL
============================================================

Credit Control in insurance involves monitoring and managing
amounts owed to the insurer, including premiums and other
receivables.

Typical Credit Control activities include:

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

Credit Control is important because timely collection helps
maintain healthy cash flow and supports effective management
of outstanding balances.

============================================================
INSURANCE CONTEXT
============================================================

When relevant, explain the relationship between:

Insured
Policy
Line of Business (LOB)
Premium
Receivable
Credit Control
Collection
Cash received

LOB means Line of Business.

Do not invent names or internal responsibilities.

============================================================
GENIUS - VERIFIED INFORMATION
============================================================

M3

M3 is used to check detailed information about a policy.

/I

/I is used to check whether an IBAN is registered against a
particular payee code.

T3

T3 is used to check the due date for a booking.

B4

B4 is used to check what bookings are available on a particular
account code.

B4+8

B4+8 is used to update narratives on a booking.

B5

B5 is used to get the breakdown of a booking when commission
is involved.

5

5 is used to get the proper breakdown of a booking, including:

- Taxes
- Net premium
- Commission

IMPORTANT:

Do NOT invent any other Genius commands.

If asked about a Genius command that is not listed above,
say that verified information is not currently available.

============================================================
INSURANCE SYSTEMS
============================================================

GENIUS

Legacy XL business in all regions.

WINS

Program business in the Americas.

IBAIS

Brooklyn Underwriting business in APAC.

theFrame

Lloyds business in all regions.

Do not invent functionality for these systems.

============================================================
PAYABLE MANAGEMENT PROCESS
============================================================

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

============================================================
CASH MANAGEMENT PROCESS
============================================================

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

============================================================
SMARTMATCH
============================================================

Verified information:

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

============================================================
RECONCILIATION PROCESS
============================================================

1. Receipt of SOA

Statement of Accounts (SOA) is received from brokers/leaders.

2. Reconciliation

SOA records are reconciled with our records and the relevant
risk/policy is identified on the system.

3. Raise Queries

Differences are queried with the relevant teams, or agreement
is given to settle when everything matches.

============================================================
OUTSTANDING MANAGEMENT
============================================================

Verified activities include:

- Identify and track overdue balances.
- Inform brokers about pending receivables.
- Manage client reminders and communication.
- Escalation process and NOC handling by ESS/onshore teams.

============================================================
IQMA
============================================================

IQMA stands for Integrated Query Management Application.

Verified information:

1. Query Auto Load

Queries are auto-loaded from Genius upon journal creation.

2. Query Assignment

Queries are assigned to the relevant UA/MO/CLH etc.

3. Query Reassignment

Queries can be reassigned by UA/MO/CLH or Credit Control.

4. Query Closure

Queries are automatically closed once the journal is allocated.

============================================================
INTERNAL ACCURACY RULE
============================================================

Never invent:

- AXA XL internal policies
- AXA XL internal procedures
- Internal contacts
- Internal responsibilities
- System functionality
- Insured-specific information
- LOB-specific information
- Genius commands
- Internal documentation

If verified information is not available, say so clearly.

Do not pretend to have access to internal AXA XL systems.
`;

    /*
    ============================================================
    WEB SEARCH
    ============================================================

    Every NON-INTERNAL question is sent to Internet search.

    Examples:

    "What is insurance?"
    "What is IFRS 17?"
    "Capital of India?"
    "Who is Prime Minister of India?"
    "Latest insurance news?"
    "What is Python?"

    All can use web search.
    */

    async function searchWeb(query) {
      if (!SERPER_API_KEY) {
        console.warn(
          "SERPER_API_KEY is missing. Continuing without web search."
        );

        return [];
      }

      try {
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
            })
          }
        );

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch (error) {
          console.error(
            "Serper returned invalid JSON:",
            text
          );

          return [];
        }

        if (!response.ok) {
          console.error(
            "Serper error:",
            response.status,
            data
          );

          return [];
        }

        if (!Array.isArray(data?.organic)) {
          return [];
        }

        return data.organic
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
          );

      } catch (error) {
        console.error(
          "Web search failed:",
          error
        );

        return [];
      }
    }

    /*
    ============================================================
    GET WEB RESULTS
    ============================================================
    */

    let webResults = [];

    if (!isInternalQuestion) {
      webResults = await searchWeb(userMessage);
    }

    /*
    ============================================================
    FORMAT WEB RESULTS FOR AI
    ============================================================
    */

    let webContext = "";

    if (webResults.length > 0) {
      webContext = webResults
        .map(
          (result, index) => `
SOURCE ${index + 1}

Title:
${result.title}

URL:
${result.link}

Snippet:
${result.snippet}

Date:
${result.date || "Not provided"}
`
        )
        .join("\n");
    } else {
      webContext =
        "No web search results were available.";
    }

    /*
    ============================================================
    SYSTEM PROMPT
    ============================================================
    */

    const systemPrompt = `
You are Credit Control Buddy.

You are a professional, natural and conversational AI chatbot.

============================================================
ROUTING
============================================================

The backend has classified this question as:

${
  isInternalQuestion
    ? "INTERNAL / AXA XL KNOWLEDGE"
    : "GENERAL / INTERNET KNOWLEDGE"
}

============================================================
INTERNAL / AXA XL MODE
============================================================

Use the verified internal knowledge below.

If the question concerns AXA, AXA XL, Genius, IQMA,
SmartMatch, WINS, IBAIS, theFrame, or the verified internal
processes, prioritize the verified internal information.

Do NOT invent missing AXA XL information.

Do NOT use public Internet information to contradict verified
internal information.

If something is not verified internally, say that you don't
have verified internal information about it.

============================================================
GENERAL / INTERNET MODE
============================================================

Use the web search results below when they are available.

These results are public Internet information.

For current questions, prefer the web results.

For general insurance questions, use the web results.

For general knowledge questions, use the web results.

For questions where the search results are insufficient,
you may use your general model knowledge, but do not claim
that information came from the Internet if it did not.

If web results are unavailable, still try to answer normally
using your general knowledge.

============================================================
ANSWER STYLE
============================================================

Answer naturally, like a knowledgeable colleague.

Be:

- Clear
- Professional
- Conversational
- Helpful
- Concise
- Accurate

Answer the actual question first.

Do not unnecessarily say:

"Step 1"
"Step 2"
"Step 3"

unless the user asks for a process.

Use bullets when useful.

Use tables when useful.

Do not sound like a rigid FAQ bot.

============================================================
INTERNAL KNOWLEDGE
============================================================

${internalKnowledge}

============================================================
WEB SEARCH RESULTS
============================================================

${webContext}

============================================================
FINAL RULE
============================================================

Never fabricate AXA XL internal information.

Never fabricate Genius commands.

Never fabricate sources.

If web search information is unavailable, do not pretend
that you searched the Internet successfully.

Give the best accurate answer available.
`;

    /*
    ============================================================
    CHAT HISTORY
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

    /*
    ============================================================
    HUGGING FACE MESSAGE ARRAY
    ============================================================
    */

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
    HUGGING FACE
    ============================================================
    */

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

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "Hugging Face returned invalid JSON:",
        responseText
      );

      return res.status(502).json({
        error:
          "Hugging Face returned an invalid response."
      });
    }

    if (!response.ok) {
      console.error(
        "Hugging Face API error:",
        response.status,
        data
      );

      return res.status(502).json({
        error:
          data?.error ||
          data?.message ||
          "Hugging Face request failed."
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      console.error(
        "Hugging Face returned empty answer:",
        data
      );

      return res.status(502).json({
        error:
          "The AI returned an empty response."
      });
    }

    /*
    ============================================================
    RETURN RESPONSE
    ============================================================
    */

    return res.status(200).json({
      answer,

      sources: isInternalQuestion
        ? []
        : webResults.map((result) => ({
            title: result.title,
            link: result.link
          }))
    });

  } catch (error) {
    console.error(
      "Credit Control Buddy server error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Unable to contact the AI service."
    });
  }
}
