import OpenAI from "openai";

const openai = new OpenAI();

const thread = await openai.beta.threads.create();

export async function POST(req, res) {
  try {
    const { newMessage } = await req.json();
    const query = newMessage.content;

    const assistantId = process.env.BETTERBOT_ASST_ID;

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: query,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    await checkRunStatus(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id);

    const answer = messages?.data[0]?.content[0]?.text?.value;

    if (!answer) {
      throw new Error("No valid response");
    }

    return new Response(JSON.stringify(answer));
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }, { status: 500 })
    );
  }
}

async function checkRunStatus(threadId, runId) {
  let isComplete = false;
  while (!isComplete) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (runStatus.status === "completed") {
      isComplete = true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
