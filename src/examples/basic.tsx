import { SolaAgent } from "../agent";
import { VOICES } from "../config/config";
import Conversation from "../interface/Conversation";
import useFunctionState from "../zustand/FunctionState";
import { useEffect } from "react";

function App(): JSX.Element {

  const agent = new SolaAgent(
    "private-key",
    "rpc-url",
    "open-ai-key"
  );

  agent.set_name("my new agent");
  agent.set_voice(VOICES.Coral)
  agent.set_personality("sweet and kind, soft spoken")


  function swap(tokenA: string, tokenB: string, amount: number) {
    console.log(`Swapping ${amount} of ${tokenA} for ${tokenB}`);
    return "swap successful";
  }

  agent.create_tool("call this tool to swap between two tokens", swap);

  const addFunction = useFunctionState((state) => state.addFunction);

  useEffect(() => {
    addFunction("swap", swap);

  }, [addFunction]);
  

  // call this component into your ui to use the app.
  return (
    <div>
      <h1>Conversation Demo</h1>
      <Conversation agent={agent} />
    </div>
  );

}

export default App;
