// import OpenAI from "openai";

import { GoogleGenAI } from "@google/genai";
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const openai = new OpenAI();

// const thread = await openai.beta.threads.create();

export async function POST(req, res) {
  try {
    const { newMessage } = await req.json();
    const query = newMessage.content;

    // const assistantId = process.env.BETTERBOT_ASST_ID;

    // await openai.beta.threads.messages.create(thread.id, {
    //   role: "user",
    //   content: query,
    // });

    // const run = await openai.beta.threads.runs.create(thread.id, {
    //   assistant_id: assistantId,
    // });

    // await checkRunStatus(thread.id, run.id);

    // const messages = await openai.beta.threads.messages.list(thread.id);
    // const answer = messages?.data[0]?.content[0]?.text?.value;

    if (!query) {
      return new Response(
        JSON.stringify({
          error: { message: "No query provided", code: 400 },
        }),
        { status: 400 },
      );
    }

    console.log("query backend", query);

    const timeout = (ms) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), ms),
      );

    async function generateWithRetry(query) {
      try {
        return await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: query,
        });
      } catch (error) {
        const msg = error?.message || "";

        // Retry ONLY once for 503
        if (msg.includes("503")) {
          await new Promise((res) => setTimeout(res, 10000));

          return await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: query,
          });
        }

        throw error;
      }
    }

    const aiPromise = generateWithRetry(query);

    // ⏱️ HARD LIMIT (VERY IMPORTANT)
    const response = await Promise.race([
      aiPromise,
      timeout(20000), // keep under Vercel limit
    ]);

    // const response = await ai.models.generateContent({
    //   // model: "gemini-3-flash-preview",
    //   model: "gemini-pro",
    //   contents: `${query}`,
    // });

    console.log("response backend", response);

    const answer = response.text;

    console.log("response from assistant backend", response);

    if (!answer) {
      throw new Error("No valid response");
    }

    return new Response(JSON.stringify({ message: answer }), { status: 200 });
  } catch (error) {
    console.error("API ERROR:", error);

    const message =
      error.message === "TIMEOUT"
        ? "⏱️ The request took too long. Please try again."
        : "⚠️ The AI is currently busy. Please try again.";

    return new Response(JSON.stringify({ error: { message } }), {
      status: 500,
    });
  }
}

// async function checkRunStatus(threadId, runId) {
//   let isComplete = false;
//   while (!isComplete) {
//     const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

//     if (runStatus.status === "completed") {
//       isComplete = true;
//     } else {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   }
// }
