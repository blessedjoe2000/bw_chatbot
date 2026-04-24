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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${query}`,
    });

    const answer = response.text;

    if (!answer) {
      throw new Error("No valid response");
    }

    return new Response(JSON.stringify({ message: answer }), { status: 200 });
  } catch (error) {
    console.error("API ERROR:", error);

    return new Response(
      JSON.stringify({
        error: {
          message:
            error?.message ||
            "The AI service is currently unavailable. Please try again.",
          code: 500,
        },
      }),
      { status: 500 },
    );
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
