import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from 'bs58';
import { MODELS, VOICES } from "../config/config";
import { Tool, ToolParameters, ToolProperties } from '../types/agent';
import 'reflect-metadata';
import { fnArgsTypes, FunctionArgTypes } from '../types/functions';
import { transfer } from "../actions/solana/transfer";

export class SolaAgent {
    public connection: Connection;
    public keypair: Keypair;
    public open_ai_key: String;
    public wallet_address: PublicKey;
    public agent_voice: string;
    public agent_name: string;
    public agent_personality: string;
    public agent_instructions: string;
    public agent_tools: any[]
    public agent_model:string

    constructor(
        private_key: string,
        rpc_url: string,
        open_ai_key: string,
    ) {
        this.connection = new Connection(
            rpc_url || "https://api.mainnet-beta.solana.com",
        );
        this.keypair = Keypair.fromSecretKey(bs58.decode(private_key));
        this.wallet_address = this.keypair.publicKey;
        this.open_ai_key = open_ai_key;
        this.agent_voice = VOICES.Sage
        this.agent_name = "Sola Agent";
        this.agent_personality = "You are a helpful assistant.";
        this.agent_instructions =
            "Listen to the user and process their requests in a way that is helpful and efficient.";
        this.agent_tools = [];
        this.agent_model = MODELS.GPT4Realtime
    }

    set_voice(voice: string) {
        this.agent_voice = voice;
    }
    set_name(name: string) {
        this.agent_name = name;
    }
    set_personality(personality: string) {
        this.agent_personality = personality;
    }
    set_instructions(instructions: string) {
        this.agent_instructions = instructions;
    }
    set_tools(tools: any[]) {
        this.agent_tools = tools;
    }
    
    create_tool(description: string, fn:(...args: any[]) => any) {
        const toolName = fn.name;
        const fnString = fn.toString();
        const paramMatch = fnString.match(/\(([^)]*)\)/);
        const rawParams = paramMatch ? paramMatch[1] : '';
        const paramNames = rawParams
          .split(',')
          .map((param) => param.trim())
          .filter((param) => param.length > 0);
        let properties: ToolProperties = paramNames.reduce((acc, tname) => {
            if (tname in fnArgsTypes) {
                acc[tname] = {
                    type: fnArgsTypes[tname as keyof FunctionArgTypes],
                    description: `The ${tname} that the user specifies`
                };
            }
            return acc;
        }, {} as ToolProperties);

        const parameters: ToolParameters = {
          type: "object",
          strict: true,
          required: paramNames,
          properties:properties,
        };

        const newTool: Tool = {
            type: 'function',
            name: toolName,
            description: description,
            parameters,
        }
        

        this.agent_tools.push(newTool);

    }
    remove_tool(toolName: string) {
        this.agent_tools = this.agent_tools.filter(
        (tool) => tool.name !== toolName
        );
    }
    responseToOpenai = (message: String) => {
        let msg = {
          type: 'response.create',
          response: {
            instructions: message,
          },
        };
        return msg;
    };

    async transfer(agent: SolaAgent, to: string, amount: number, token?: string) { 
        let tx = await transfer(agent, to, amount, token)
        console.log(tx)
        return agent.responseToOpenai(`the transfer has been successful/failure based on ${tx}`);
    }
}
