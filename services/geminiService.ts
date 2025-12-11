import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION, COORDINATOR_TOOLS } from "../constants";
import { Message, Sender, AgentType, GroundingChunk } from "../types";

// Using gemini-2.5-flash for efficiency as a router/coordinator
const MODEL_NAME = "gemini-2.5-flash";

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: any;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is not set correctly.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey });
  }

  public async startChat() {
    try {
      this.chatSession = this.ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: COORDINATOR_TOOLS,
          temperature: 0.2, // Low temperature for precise routing
        },
      });
    } catch (error) {
      console.error("Failed to start chat session", error);
    }
  }

  public async sendMessage(userMessage: string): Promise<Message> {
    if (!this.chatSession) {
      await this.startChat();
    }

    try {
      const result: GenerateContentResponse = await this.chatSession.sendMessage({
        message: userMessage,
      });

      // 1. Check for Function Calls (Routing)
      const functionCalls = result.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
      
      if (functionCalls && functionCalls.length > 0) {
        const fc = functionCalls[0].functionCall;
        
        // In a real system, we would execute the function here. 
        // For this Coordinator demo, we stop here and return the routing decision to the UI.
        
        // We must provide a mock response back to the model to keep the chat history valid
        // if we were to continue the session, but here we just want to show the user the routing.
        
        return {
          id: crypto.randomUUID(),
          text: `Mengarahkan tugas ke agen: ${fc?.name}...`,
          sender: Sender.COORDINATOR,
          timestamp: new Date(),
          isRouting: true,
          routedTo: fc?.name as AgentType,
          functionArgs: fc?.args
        };
      }

      // 2. Check for Text Response (Could be clarification or grounding result)
      const textPart = result.candidates?.[0]?.content?.parts?.find(p => p.text);
      let responseText = textPart ? textPart.text : "Tidak ada respon teks.";

      // 3. Check for Grounding (Google Search)
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const webSources: GroundingChunk[] = [];
      
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
           if (chunk.web) {
             webSources.push({
               web: {
                 uri: chunk.web.uri,
                 title: chunk.web.title
               }
             });
           }
        });
      }

      return {
        id: crypto.randomUUID(),
        text: responseText || "Memproses...",
        sender: Sender.COORDINATOR,
        timestamp: new Date(),
        groundingChunks: webSources
      };

    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        id: crypto.randomUUID(),
        text: "Maaf, terjadi kesalahan saat menghubungi Koordinator Sistem.",
        sender: Sender.SYSTEM,
        timestamp: new Date()
      };
    }
  }
}

export const geminiService = new GeminiService();
