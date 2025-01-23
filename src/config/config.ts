import { SolaAgent } from '../agent/index';
export const VOICES = {
    Alloy: 'Alloy',
    Ash: 'Ash',
    Ballad: 'Ballad',
    Coral: 'Coral',
    Echo: 'Echo',
    Sage: 'Sage',
    Shimmer: 'Shimmer',
    Verse: 'Verse',
};

export const MODELS = {
    GPT4Realtime: "gpt-4o-realtime-preview-2024-12-17",
    GPT4RealtimeMini: "gpt-4o-mini-realtime-preview-2024-12-17",
    Ollama:"" //coming soon
}


export const createToolsConfig = (agent: SolaAgent) => {
    const instructions = `
      Your are a AI assistant called ${agent.agent_name}.
      ${agent.agent_instructions}.
      Your personality is ${agent.agent_personality}.
    `;

    return {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions,
        voice: agent.agent_voice.toLowerCase(),
        tools: agent.agent_tools,
        tool_choice: 'auto',
        temperature: 0.6,
      },
    };
};

