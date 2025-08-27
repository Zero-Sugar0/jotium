import { AIAgent } from "@/ai/jotium";
import { getUserLanguage } from "@/db/queries";
import { saveChat } from "@/lib/redis-queries";
import { getUserAIModel } from "@/lib/user-model";
import { generateUUID } from "@/lib/utils";

/**
 * Executes a single user-defined task.
 * Returns the synthetic chat ID where the result was stored.
 */
export async function executeTask(task: {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: string;
  time: string;
  day?: string | null;
  date?: string | Date | null;
}) {
  const { id: taskId, userId } = task;

  // Build the prompt for the AI agent
  const prompt = `
Execute the following user-defined task:
Name: ${task.name}
Description: ${task.description}
Frequency: ${task.frequency}
Time: ${task.time}
${task.day ? `Day: ${task.day}` : ""}
${task.date ? `Date: ${task.date}` : ""}
`;

  // Initialise the AI agent
  const geminiApiKey = process.env.GOOGLE_API_KEY || "";
  const model = await getUserAIModel(userId);
  const language = await getUserLanguage(userId);
  const agent = new AIAgent(geminiApiKey, userId, undefined, model, language || "en");
  await agent.initializeTools(userId);

  // 1. Load conversation history (empty for a single task run)
  const conversationHistory = [{ role: "user", parts: [{ text: prompt }] }];

  // 2. Generate the assistant response (may include tool calls)
  const responseStream = await agent.generateContentStream(conversationHistory);
  let fullResponse = "";
  let toolCalls: any[] = [];
  let hasToolCalls = false;

  for await (const chunk of responseStream) {
    if (chunk.candidates?.[0]?.content?.parts) {
      for (const part of chunk.candidates[0].content.parts) {
        if (part.text) {
          fullResponse += part.text;
        }
      }
    }
    if (chunk.functionCalls?.length) {
      hasToolCalls = true;
      toolCalls.push(...chunk.functionCalls);
    }
  }

  // 3. If there are tool calls, execute them sequentially and feed results back
  if (hasToolCalls) {
    const toolResults = [];
    const toolCallsWithIds = toolCalls.map((tc) => ({
      ...tc,
      id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));

    for (const toolCall of toolCallsWithIds) {
      const result = await agent.executeToolCall(toolCall);
      toolResults.push(result);
    }

    // Append tool results to the conversation and get a final response
    const modelParts: any[] = [{ text: fullResponse }];
    toolCallsWithIds.forEach((tc) => modelParts.push({ functionCall: tc } as any));

    conversationHistory.push({ role: "model", parts: modelParts });

    conversationHistory.push({
      role: "user",
      parts: toolResults.map((tr) => ({
        functionResponse: {
          name: toolCallsWithIds.find((tc) => tc.id === tr.toolCallId)?.name,
          response: tr.result,
        },
      })) as any,
    });

    const finalStream = await agent.generateContentStream(conversationHistory);
    fullResponse = "";
    for await (const chunk of finalStream) {
      if (chunk.candidates?.[0]?.content?.parts) {
        for (const part of chunk.candidates[0].content.parts) {
          if (part.text) {
            fullResponse += part.text;
          }
        }
      }
    }
  }

  // 4. Persist the result as a synthetic chat so it appears in the user's chat history
  const syntheticChatId = `task-${taskId}-${Date.now()}`;
  
  // Generate a meaningful title for the task execution
  const title = `Task: ${task.name}`;
  
  const chatPayload = {
    id: syntheticChatId,
    createdAt: new Date().toISOString(),
    userId,
    title, // Add title here
    messages: [
      {
        id: generateUUID(),
        role: "assistant",
        content: fullResponse,
        timestamp: Date.now(),
      },
    ],
  };

  await saveChat(chatPayload);

  return syntheticChatId;
}
