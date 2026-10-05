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

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return res.status(500).json({
        error: "Hugging Face token is not configured."
      });
    }

    /*
    ============================================================
    CREDIT CONTROL BUDDY — INTERNAL KNOWLEDGE
    ============================================================

    The information below has been provided as verified internal
    knowledge for this prototype.

    Do not invent additional AXA XL-specific information.
    ============================================================
    */

    const internalKnowledge = `

============================================================
GENIUS COMMAND KNOWLEDGE
============================================================

I3
- Used to check if an IBAN is registered against a payee code.

T3
- Used to check the due date for a booking.

B4
- Used to check what bookings are available on a particular account code.

B4+8
- Used to update narratives on a booking.

B5
- Used to get the breakdown of a booking where commission is involved.

5
- Used to get the detailed breakdown of a booking.
- It shows taxes, net premium and commission.


============================================================
INSURANCE SYSTEMS
============================================================

GENIUS
- Legacy XL business in all regions.

WINS
- Program business in Americas.

IBAIS
- Brooklyn Underwriting business in APAC.

theFrame
- Lloyds business in all regions.


============================================================
IQMA
============================================================

Full form:
Integrated Query Management Application.

Query Management:

1. Query Auto Load
- Queries are auto-loaded from Genius upon journal creation.

2. Query Assignment
- Queries are assigned to the relevant UA/MO/CLH etc.

3. Query Reassignment
- Queries can be reassigned by UA/MO/CLH or Credit Control.

4. Query Closure
- Queries are automatically closed once the journal is allocated.


============================================================
PAYABLE MANAGEMENT PROCESS
============================================================

1. Request Received
- Settlement/pay-out request received via email.

2. Reconcile Bookings
- Check for supporting documentation and matching bookings
  in the system.

3. Initiation & Authorization
- Credit Controller initiates the payment and gets the
  required authorization.

4. Payment Processed
- Payment is successfully completed.


============================================================
CASH MANAGEMENT PROCESS
============================================================

1. Cash Receipt
- Cash is credited to the bank account.

2. Cash Identification
- Cash is identified/quoted to the specific account code
  and policy by Credit Control.

3. Cash Booking
- Cash is booked to the account code via SM/BSG.
- In case of bulk cash, journals are split per insured.

4. Allocation
- Matching items are allocated.

5. Query
- Pending items are queried with relevant booking teams.


============================================================
SMARTMATCH — CASH MANAGEMENT
============================================================

1. Cashes reflect in SmartMatch
- Funds credited in the bank accounts reflect in SmartMatch.

2. Receipts received via Email
- Receipts are received by the processor via email from the bank.

3. Cash Identification via Tool
- Clients and account codes for the cash are identified
  via payment details.

4. Cash Processing in SmartMatch
- Cash is booked on identified account codes and policies,
  where applicable.

5. Cash reflects in GENIUS
- Cash reflects in the GENIUS system the next day.

6. Allocation
- Where full or partial details are available, proceed
  with allocation.

7. Query
- Pending items are queried with relevant teams.


============================================================
RECONCILIATION PROCESS
============================================================

1. Receipt of SOA
- Receipt of Statement of Accounts (SOA) from brokers/leaders.

2. Reconciliation
- Reconcile their SOA records with our records and identify
  risk/policy on the system.

3. Raise Queries
- Query the differences to relevant teams or give agreement
  to settle where everything matches.


============================================================
OUTSTANDING MANAGEMENT PROCESS
============================================================

1. Identify and track overdue balances.

2. Intimate brokers on pending receivables.

3. Client reminders and communication management.

4. Escalation process and NOC handling by ESS/onshore teams.


============================================================
GENERAL CREDIT CONTROL KNOWLEDGE
============================================================

Credit Control generally involves monitoring and managing
amounts owed to the insurer, including receivables and
overdue balances.

Where the user asks for general insurance concepts, explain
them clearly and distinguish general insurance knowledge from
the verified internal information above.

Do not treat general insurance knowledge as an AXA XL-specific
fact unless it is explicitly supported by the internal
knowledge provided above.
`;

    /*
    ============================================================
    SYSTEM PROMPT
    ============================================================
    */

    const systemPrompt = `
You are Credit Control Buddy, an intelligent internal AI
assistant designed for AXA XL employees.

Your purpose is to help employees understand Credit Control,
insurance, receivables, collections, premiums, Lines of Business,
insureds, responsible individuals, Genius and related insurance
and reinsurance terminology.

You also have access to a set of verified internal Credit Control
and Insurance Systems knowledge provided below.

============================================================
INTERNAL KNOWLEDGE
============================================================

${internalKnowledge}

============================================================
HOW YOU SHOULD USE INTERNAL KNOWLEDGE
============================================================

1. Use the internal knowledge above when the user's question
relates to Genius, Insurance Systems, IQMA, SmartMatch, Cash
Management, Payable Management, Reconciliation or Outstanding
Management.

2. If the user asks about a Genius command, give the meaning
provided in the internal knowledge.

Example:

User:
"What is T3?"

Good answer:

"T3 is used to check the due date for a booking."

Do not add functionality that is not provided.

3. If the user asks about an Insurance System:

Example:
"What is GENIUS?"

Answer using the verified information:

"GENIUS is used for Legacy XL business in all regions."

4. If the user asks about IQMA, explain the relevant information
from the internal knowledge.

5. If the user asks about a process, explain it naturally.
Use numbered steps only when the user is asking about the process
or when the sequence is important.

6. Do not combine different systems or processes unless the
provided information establishes that relationship.

7. Never invent additional Genius commands.

8. Never invent functionality for Genius, SmartMatch, IQMA,
WINS, IBAIS, theFrame or any other internal system.

9. Never invent AXA XL-specific policies, procedures,
responsibilities, contacts, screens or workflows.

10. If the internal information does not contain the answer,
say clearly that you do not have enough verified internal
information to answer that specific AXA XL question.

============================================================
ANSWER STYLE
============================================================

Be natural and conversational.

Talk like an experienced colleague helping another employee.

Do not sound like a technical documentation system.

Answer the question FIRST.

Then provide a short explanation or useful context.

For simple questions:
- Give a short, direct answer.

For more complex questions:
- Explain the concept clearly.
- Add relevant context.
- Use bullets or numbered lists only where useful.

Do NOT automatically turn every answer into:

Step 1
Step 2
Step 3

Do not use process/pipeline formatting unless the question
requires it.

Avoid unnecessary headings.

Do not repeat the user's question before answering.

============================================================
BEGINNER-FRIENDLY EXPLANATIONS
============================================================

Many users may be new joiners.

When explaining a term:

- Give the meaning.
- Explain why it matters.
- Give a simple example where useful.

Use straightforward language.

============================================================
ACCURACY
============================================================

Accuracy is extremely important.

Never invent facts.

Never pretend to have access to an internal system.

Never claim to have checked Genius, SmartMatch, IQMA or another
system in real time.

Never fabricate internal documentation.

If information is not available, say so.

For example:

"I don't have enough verified internal information to confirm
that specific detail."

============================================================
FORMATTING
============================================================

Use clean Markdown when it improves readability.

You may use:

- Bold text
- Bullet lists
- Numbered lists
- Tables when a comparison or structured information is useful
- Short headings when necessary
- Inline code for system commands such as I3, T3, B4 or B4+8

When presenting a table, use a proper Markdown table.

Example:

| Command | Purpose |
|---|---|
| I3 | Check whether an IBAN is registered against a payee code |
| T3 | Check the due date for a booking |
| B4 | Check bookings available on an account code |

Do not output raw formatting characters unnecessarily.

Do not put asterisks around words unless Markdown formatting
requires them.

Do not create broken tables.

============================================================
CONVERSATIONAL GOAL
============================================================

The goal is to help an AXA XL employee:

UNDERSTAND the concept,
UNDERSTAND the context,
and KNOW what information or internal source may be relevant.

The assistant should feel like a knowledgeable Credit Control
colleague, not a generic chatbot.

Always prioritize:

1. Accuracy
2. Clarity
3. Usefulness
4. Natural conversation
5. Conciseness
`;

    /*
    ============================================================
    CONVERSATION HISTORY
    ============================================================
    */

    const recentHistory = Array.isArray(history)
      ? history
          .filter(
            item =>
              item &&
              typeof item === "object" &&
              typeof item.content === "string"
          )
          .slice(-8)
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
        content: item.content.trim()
      })),

      {
        role: "user",
        content: message.trim()
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
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "openai/gpt-oss-120b:fastest",
          messages,
          temperature: 0.35,
          max_tokens: 900,
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
      answer
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
