# SOLA VOICE AGENT KIT

A simple framework to build voice agents powered by SOLA.

Follow the steps below to get started.

## Installation

1. Clone the repository

    ```sh
    git clone https://github.com/sola-ai/sola-voice-agent-kit.git
    ```

2. Install the dependencies

    ```sh
    npm install
    ```

3. Create a agent

    ```tsx
    const agent = new SolaAgent(
        "private-key",
        "rpc-url",
        "open-ai-key"
      );
    ```

4. Follow ```examples/basic.tsx``` for a ui demo.

5. Add the component to your main file , ie, ```main.tsx```

    ```tsx
    import React from "react";
    import ReactDOM from "react-dom/client";
    import App from ".path/to/your/agent/component";

    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    ```
