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

    /*
    ============================================================
    ENVIRONMENT VARIABLES
    ============================================================

    HF_TOKEN
      Hugging Face token used for the AI model.

    SERPER_API_KEY
      Used for Internet / Google web search.

    Add both of these in Vercel:
      Settings → Environment Variables
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
    DETECT AXA / INTERNAL QUESTIONS
    ============================================================

    If the user mentions AXA / AXA XL, we treat the question
    as an internal AXA XL Credit Control question.

    This prevents public web information from replacing the
    verified internal knowledge provided for this project.
    */

    const normalizedMessage = userMessage
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    const isAXAQuestion =
      /\baxa\b/i.test(normalizedMessage) ||
      /\baxa xl\b/i.test(normalizedMessage) ||
      normalizedMessage.includes("axa-xl");

    /*
    ============================================================
    VERIFIED GENIUS QUICK ANSWERS
    ============================================================

    These answers are returned directly so the model cannot
    accidentally change verified internal definitions.
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

    const directAnswer = verifiedAnswers[normalizedMessage];

    /*
    ============================================================
    DIRECT VERIFIED CREDIT CONTROL ANSWERS
    ============================================================
    */

    if (
      normalizedMessage === "what is m3" ||
      normalizedMessage === "what does m3 do" ||
      normalizedMessage === "what is m3 command" ||
      normalizedMessage === "what is m3 used for"
    ) {
      return res.status(200).json({
        answer:
          "M3 is used to check detailed information about a policy."
      });
    }

    if (
      normalizedMessage === "what is /i" ||
      normalizedMessage === "what does /i do" ||
      normalizedMessage === "what is /i command" ||
      normalizedMessage.includes("iban")
    ) {
      return res.status(200).json({
        answer:
          "/I is used to check whether an IBAN is registered against a particular payee code."
      });
    }

    if (
      normalizedMessage === "what is t3" ||
      normalizedMessage === "what does t3 do" ||
      normalizedMessage === "what is t3 command" ||
      normalizedMessage === "what is t3 used for"
    ) {
      return res.status(200).json({
        answer:
          "T3 is used to check the due date for a booking."
      });
    }

    if (
      normalizedMessage === "what is b4" ||
      normalizedMessage === "what does b4 do" ||
      normalizedMessage === "what is b4 command" ||
      normalizedMessage === "what is b4 used for"
    ) {
      return res.status(200).json({
        answer:
          "B4 is used to check what bookings are available on a particular account code."
      });
    }

    if (
      normalizedMessage === "what is b4+8" ||
      normalizedMessage === "what does b4+8 do" ||
      normalizedMessage === "what is b4+8 command" ||
      normalizedMessage === "what is b4+8 used for"
    ) {
      return res.status(200).json({
        answer:
          "B4+8 is used to update narratives on a booking."
      });
    }

    if (
      normalizedMessage === "what is b5" ||
      normalizedMessage === "what does b5 do" ||
      normalizedMessage === "what is b5 command" ||
      normalizedMessage === "what is b5 used for"
    ) {
      return res.status(200).json({
        answer:
          "B5 is used to get the breakdown of a booking when commission is involved."
      });
    }

    if (
      normalizedMessage === "what is 5" ||
      normalizedMessage === "what does 5 do" ||
      normalizedMessage === "what is 5 command"
    ) {
      return res.status(200).json({
        answer:
          "5 is used to get the proper breakdown of a booking, including taxes, net premium and commission."
      });
    }

    /*
    ============================================================
    GENERAL INTERNAL CREDIT CONTROL DIRECT ANSWERS
    ============================================================
    */

    if (
      normalizedMessage === "what is credit control" ||
      normalizedMessage === "what is credit control in insurance" ||
      normalizedMessage.includes("define credit control")
    ) {
      return res.status(200).json({
        answer:
          "Credit Control in insurance is the process of monitoring and managing amounts owed to the insurer, particularly premiums and other receivables. The objective is to support timely collection and effective management of outstanding balances."
      });
    }

    if (
      normalizedMessage.includes("what is an overdue receivable") ||
      normalizedMessage.includes("what is overdue receivable") ||
      normalizedMessage.includes("overdue receivable")
    ) {
      return res.status(200).json({
        answer:
          "An overdue receivable is an amount that was due for payment but has not been received by the agreed due date. In Credit Control, it may require follow-up such as reminders, queries or escalation."
      });
    }

    /*
    ============================================================
    WEB SEARCH FUNCTION
    ============================================================

    Non-AXA questions use Internet search.

    We use Serper's Google Search API to retrieve current
    search results and then give those results to the AI.
    */

    async function searchWeb(query) {
      if (!SERPER_API_KEY) {
        console.error("SERPER_API_KEY is missing.");

        return {
          results: [],
          error: "Web search is not configured."
        };
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

        const searchText = await searchResponse.text();

        let searchData;

        try {
          searchData = JSON.parse(searchText);
        } catch (error) {
          console.error(
            "Serper returned invalid JSON:",
            searchText
          );

          return {
            results: [],
            error: "Web search returned an invalid response."
          };
        }

        if (!searchResponse.ok) {
          console.error(
            "Serper API error:",
            searchResponse.status,
            searchData
          );

          return {
            results: [],
            error:
              searchData?.message ||
              "Web search request failed."
          };
        }

        const results = Array.isArray(searchData?.organic)
          ? searchData.organic
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

        return {
          results,
          error: null
        };

      } catch (error) {
        console.error(
          "Web search error:",
          error
        );

        return {
          results: [],
          error: "Unable to perform web search."
        };
      }
    }

    /*
    ============================================================
    INTERNAL KNOWLEDGE
    ============================================================

    This is the verified AXA XL / Credit Control information
    provided for this project.

    It is deliberately kept separate from public web results.
    */

    const internalKnowledge = `
============================================================
CREDIT CONTROL BUDDY - VERIFIED INTERNAL KNOWLEDGE
============================================================

You are Credit Control Buddy, an internal AI assistant designed
to help AXA XL employees understand Credit Control, insurance,
receivables, collections, premiums, Lines of Business (LOBs),
insurance systems, Genius and related processes.

The following information has been verified for this project.

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
say that verified information is not currently available
for that command.

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
SMARTMATCH - CASH MANAGEMENT
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
OUTSTANDING MANAGEMENT PROCESS
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
INTERNAL KNOWLEDGE RULE
============================================================

If the user's question mentions AXA, AXA XL, an AXA XL system,
an AXA XL process, or asks about AXA XL internal Credit Control:

Use the verified internal knowledge above.

Do NOT replace internal knowledge with public web information.

Do NOT invent AXA XL policies, procedures, contacts,
responsibilities, system functionality, insured-specific
information, LOB-specific information or Genius commands.

If the verified internal information does not contain the
answer, clearly say that the information is not currently
verified rather than inventing an answer.
`;

    /*
    ============================================================
    WEB SEARCH FOR ALL NON-AXA QUESTIONS
    ============================================================

    This means:

    - General insurance questions → Internet
    - General Credit Control questions → Internet
    - Current events → Internet
    - General knowledge → Internet
    - Technology → Internet
    - Anything else → Internet
    */

    let webContext = "";
    let sourceLinks = [];

    if (!isAXAQuestion) {
      const searchResult = await searchWeb(userMessage);

      if (searchResult.results.length > 0) {
        webContext = searchResult.results
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

        sourceLinks = searchResult.results
          .map((result) => ({
            title: result.title,
            link: result.link
          }))
          .filter(
            (result) =>
              result.title &&
              result.link
          )
          .slice(0, 5);
      } else if (searchResult.error) {
        console.error(
          "Web search unavailable:",
          searchResult.error
        );
      }
    }

    /*
    ============================================================
    SYSTEM PROMPT
    ============================================================
    */

    const systemPrompt = `
You are Credit Control Buddy.

You are a professional, conversational AI chatbot.

Your job is to answer the employee's question clearly,
naturally and accurately.

============================================================
IMPORTANT ROUTING RULE
============================================================

There are two different knowledge modes.

MODE 1 — AXA XL / INTERNAL
MODE 2 — INTERNET / GENERAL KNOWLEDGE

The backend has already determined the mode.

Current mode:

${
  isAXAQuestion
    ? "AXA XL / INTERNAL KNOWLEDGE"
    : "INTERNET / GENERAL KNOWLEDGE"
}

============================================================
IF MODE = AXA XL / INTERNAL
============================================================

Use the verified internal knowledge provided below.

Do NOT use public web information to contradict or replace
verified internal AXA XL information.

Do NOT invent missing internal information.

If something is not verified internally, say:

"I don't have verified internal information on that."

You may still explain general concepts when helpful, but
clearly distinguish general insurance knowledge from AXA XL
specific information.

============================================================
IF MODE = INTERNET / GENERAL KNOWLEDGE
============================================================

Use the supplied web search results as the primary source.

The search results are current public Internet information.

Do not pretend that you personally browsed websites beyond
the supplied search results.

Do not invent facts or sources.

If the search results are insufficient, say so.

For current events, dates, prices, people, companies,
technology, sports, news or other time-sensitive questions,
prefer the supplied web results.

For general insurance questions, use the web results and
explain the concept clearly.

============================================================
ANSWER STYLE
============================================================

Be:

- Professional
- Clear
- Conversational
- Helpful
- Concise
- Accurate

Answer the question directly first.

Do not unnecessarily use:

"Step 1"
"Step 2"
"Step 3"

unless the user specifically asks for a process or workflow.

Use bullets when they improve readability.

Use tables when comparing multiple items.

Do not sound robotic.

Do not repeatedly say "According to the sources".

Write like a knowledgeable colleague.

============================================================
SOURCE HANDLING
============================================================

For Internet questions, only rely on the supplied web results
for current/public factual claims.

If useful, mention the source naturally.

Do not create fake URLs.

============================================================
VERIFIED INTERNAL KNOWLEDGE
============================================================

${internalKnowledge}

============================================================
WEB SEARCH RESULTS
============================================================

${
  webContext ||
  "No web search results are available. Do not invent web facts."
}

============================================================
FINAL RULE
============================================================

Accuracy is more important than answering every question.

Never fabricate AXA XL internal information.

Never fabricate Genius commands.

Never fabricate web sources.

Give the user the most useful answer supported by the
available information.
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
    HUGGING FACE MESSAGES
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
    HUGGING FACE AI
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
        "Hugging Face returned non-JSON response:",
        responseText
      );

      return res.status(502).json({
        error: "Hugging Face returned an invalid response."
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
        "Hugging Face returned an empty answer:",
        data
      );

      return res.status(502).json({
        error: "The AI returned an empty response."
      });
    }

    /*
    ============================================================
    RETURN ANSWER + SOURCES
    ============================================================
    */

    return res.status(200).json({
      answer,
      sources: isAXAQuestion
        ? []
        : sourceLinks
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
