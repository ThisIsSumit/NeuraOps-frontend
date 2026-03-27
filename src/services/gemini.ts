import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { useAppStore } from "../store";
import { Message, ToolCall } from "../types";

const MODEL_NAME = "gemini-3.1-pro-preview";

// Define tool declarations
const getServicesTool: FunctionDeclaration = {
  name: "get_services",
  description: "Get a list of all services in the infrastructure, including their status, CPU, memory, and replicas.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getServiceMetricsTool: FunctionDeclaration = {
  name: "get_service_metrics",
  description: "Get detailed CPU, memory, and network metrics for a specific service.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceId: { type: Type.STRING, description: "The ID of the service to get metrics for." },
      range: { type: Type.STRING, description: "The time range for metrics (e.g., '1h', '6h', '24h')." },
    },
    required: ["serviceId"],
  },
};

const getServiceLogsTool: FunctionDeclaration = {
  name: "get_service_logs",
  description: "Get recent logs for a specific service.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceId: { type: Type.STRING, description: "The ID of the service to get logs for." },
      level: { type: Type.STRING, description: "The log level to filter by (e.g., 'INFO', 'WARN', 'ERROR')." },
      limit: { type: Type.NUMBER, description: "The maximum number of logs to return." },
    },
    required: ["serviceId"],
  },
};

const getDnsRecordsTool: FunctionDeclaration = {
  name: "get_dns_records",
  description: "Get a list of all DNS records managed by the system.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const restartServiceTool: FunctionDeclaration = {
  name: "restart_service",
  description: "Restart a specific service.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceId: { type: Type.STRING, description: "The ID of the service to restart." },
    },
    required: ["serviceId"],
  },
};

const scaleServiceTool: FunctionDeclaration = {
  name: "scale_service",
  description: "Scale a specific service to a desired number of replicas.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceId: { type: Type.STRING, description: "The ID of the service to scale." },
      replicas: { type: Type.NUMBER, description: "The desired number of replicas." },
    },
    required: ["serviceId", "replicas"],
  },
};

const tools = [
  {
    functionDeclarations: [
      getServicesTool,
      getServiceMetricsTool,
      getServiceLogsTool,
      getDnsRecordsTool,
      restartServiceTool,
      scaleServiceTool,
    ],
  },
];

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI Agent features will be limited.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'missing-key' });
  }

  async chat(conversationId: string, userMessage: string) {
    if (!process.env.GEMINI_API_KEY) {
      return { content: "The Gemini API key is missing. Please configure it in the AI Studio secrets to use the AI Agent." };
    }
    const store = useAppStore.getState();
    const conversation = store.conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    // Prepare history for Gemini
    const contents: any[] = conversation.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: `You are NeuraOps AI SRE Agent, a world-class site reliability engineer. 
          You help users manage their infrastructure, troubleshoot issues, and automate tasks.
          You have access to tools to query the infrastructure state, logs, and metrics.
          Always use tools when you need real data.
          Be concise, technical, and helpful.
          When you detect an issue, suggest a fix and offer to execute it.`,
          tools,
        },
      });
      
      const candidate = response.candidates?.[0];
      if (!candidate) return { content: "I'm sorry, I couldn't generate a response." };

      // Handle function calls
      if (candidate.content.parts.some(p => p.functionCall)) {
        const toolCalls: ToolCall[] = [];
        const functionResponses = [];

        // Add the model's turn with function calls to history
        contents.push(candidate.content);

        for (const part of candidate.content.parts) {
          if (part.functionCall) {
            const call = part.functionCall;
            const startTime = Date.now();
            let output;

            // Execute tool logic
            switch (call.name) {
              case "get_services":
                output = store.services;
                break;
              case "get_service_metrics":
                output = {
                  cpu: Math.floor(Math.random() * 100),
                  memory: Math.floor(Math.random() * 1024),
                  network: { in: Math.floor(Math.random() * 1000), out: Math.floor(Math.random() * 1000) }
                };
                break;
              case "get_service_logs":
                output = [
                  { timestamp: new Date().toISOString(), level: "INFO", message: "Service started" },
                  { timestamp: new Date().toISOString(), level: "INFO", message: "Listening on port 80" }
                ];
                break;
              case "get_dns_records":
                output = store.dnsRecords;
                break;
              case "restart_service":
                store.addEvent({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'ai',
                  description: `AI Agent restarted service ${call.args.serviceId}`,
                  timestamp: new Date().toISOString()
                });
                output = { status: "success", message: "Service restart initiated" };
                break;
              case "scale_service":
                store.updateService(call.args.serviceId as string, { replicas: call.args.replicas as number });
                store.addEvent({
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'ai',
                  description: `AI Agent scaled service ${call.args.serviceId} to ${call.args.replicas}`,
                  timestamp: new Date().toISOString()
                });
                output = { status: "success", message: `Service scaled to ${call.args.replicas}` };
                break;
              default:
                output = { error: "Unknown tool" };
            }

            toolCalls.push({
              id: Math.random().toString(36).substr(2, 9),
              name: call.name,
              input: call.args,
              output,
              duration: Date.now() - startTime,
            });

            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { content: output },
              }
            });
          }
        }

        // Add the function responses to history
        contents.push({
          role: 'user',
          parts: functionResponses,
        });

        // Send function responses back to Gemini
        const finalResponse = await this.ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction: `You are NeuraOps AI SRE Agent, a world-class site reliability engineer.`,
            tools,
          },
        });

        return {
          content: finalResponse.text,
          toolCalls,
        };
      }

      return {
        content: response.text,
      };

    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return {
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
      };
    }
  }
}

export const gemini = new GeminiService();
