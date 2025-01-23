import { SolaAgent } from "../agent";

export const createSession = async (agent:SolaAgent)=>{ 
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${agent.open_ai_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: agent.agent_model,
        }),
      });
    const data = await r.json();
    return data
}