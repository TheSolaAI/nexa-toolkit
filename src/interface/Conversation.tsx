import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader } from 'react-feather';
import useChatState from '../zustand/ChatState';
import { createToolsConfig } from '../config/config';
import { SolaAgent } from '../agent';
import SessionControls from '../session/SessionControls';
import useFunctionState from '../zustand/FunctionState';


interface ConversationProps {
  agent: SolaAgent; 
}

export const Conversation:React.FC<ConversationProps> = ({ agent }) => {
  const {
    isSessionActive,
    setIsSessionActive,
    dataChannel,
    setDataChannel,
    mediaRecorder,
    setMediaRecorder,
    setPeerConnection,
    getPeerConnection,
    resetMute,
  } = useChatState();
  

  const [events, setEvents] = useState<any[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const [localDataChannel, setLocalDataChannel] = useState(dataChannel);
  

useEffect(() => {
    setLocalDataChannel(dataChannel);
  }, [dataChannel]);

  const connection = agent.connection;

const startSession = async () => {
    console.log(agent.agent_tools)
    try {
      const pc = new RTCPeerConnection();
      audioElement.current = document.createElement('audio');
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        const stream = e.streams[0];
        if (audioElement.current) {
          audioElement.current.srcObject = stream;
        }

        if (MediaRecorder.isTypeSupported('audio/webm')) {
          const recorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm',
          });
          setMediaRecorder(recorder);
          recorder.start();
        } else {
          console.error('MediaRecorder does not support audio/webm format.');
        }
      };

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      setDataChannel(dc);

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = agent.agent_model;

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${agent.open_ai_key}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to fetch SDP response');
      }

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };

      await pc.setRemoteDescription(answer);
      setPeerConnection(pc);
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  function stopSession() {
    const pc = getPeerConnection();

    if (dataChannel) {
      dataChannel.close();
    }
    if (pc) {
      pc.close();
      setPeerConnection(null);
    }

    setIsSessionActive(false);
    setDataChannel(null);
    resetMute();
  }

  const sendClientEvent = useCallback(
    (message: any) => {
      if (localDataChannel && localDataChannel.readyState === 'open') {
        message.event_id = message.event_id || crypto.randomUUID();
        localDataChannel.send(JSON.stringify(message));
        setEvents((prev) => [message, ...prev]);
      } else {
        console.error(
          'Failed to send message - no data channel available',
          message,
        );
      }
    },
    [localDataChannel, setEvents], // Only depend on localDataChannel and setEvents
  );

  

  function sendTextMessage(message: any) {
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: 'response.create' });
  }


  useEffect(() => {
    if (audioElement.current) {
      setIsLoaded(true);
    }
  }, [audioElement]);


  useEffect(() => {
    if (dataChannel) {
      const handleMessage = (e: MessageEvent) => {
        setEvents((prev) => [JSON.parse(e.data), ...prev]);
      };
      const handleOpen = () => setIsSessionActive(true);
      const handleClose = () => setIsSessionActive(false);
      const handleError = (error: Event) =>
        console.error('Data channel error:', error);
  
      dataChannel.addEventListener('message', handleMessage);
      dataChannel.addEventListener('open', handleOpen);
      dataChannel.addEventListener('close', handleClose);
      dataChannel.addEventListener('error', handleError);
  
      return () => {
        dataChannel.removeEventListener('message', handleMessage);
        dataChannel.removeEventListener('open', handleOpen);
        dataChannel.removeEventListener('close', handleClose);
        dataChannel.removeEventListener('error', handleError);
      };
    }
  }, [dataChannel, setIsSessionActive]);
  

  useEffect(() => {
    if (!events || events.length === 0) return;
    

    const handleEvents = async () => {
      const firstEvent = events[events.length - 1];
      if (
        firstEvent.type === 'session.created' &&
        !events.some((e) => e.type === 'session.update')
      ) {
        sendClientEvent(createToolsConfig(agent));
      }
      const mostRecentEvent = events[0];
      if (
        mostRecentEvent.type === 'response.done' &&
        mostRecentEvent.response.output
      ) {
        for (const output of mostRecentEvent.response.output) {
          if (output.type === 'function_call') {
            console.log(output.arguments.length)
            let functions = useFunctionState.getState().functions;
            const functionName = output.name;
            const functionToCall = functions[functionName];
            if (functionToCall) {
              if (output.arguments.length == 2) {
                console.log("no args");
                console.log(functionToCall)
                const functionResponse = await functionToCall();
                
                const response = agent.responseToOpenai(functionResponse);
                sendClientEvent(response)
              }
              else { const functionResponse = await functionToCall(output.arguments);
                const response = agent.responseToOpenai(functionResponse);
                sendClientEvent(response)
              }
              
            }
          }
        }
      }
    };

    handleEvents();
}, [events, sendClientEvent]);

  return isLoaded ? (
    <>
      <main className="h-screen flex flex-col relative dark:bg-darkalign">

      </main>
      <section className="relative flex justify-center items-end w-full  bg-black dark:bg-darkalign animate-in fade-in-0 duration-300">
        <div className="absolute  w-full bottom-0 left-1/2 transform -translate-x-1/2 p-4 flex justify-center bg-white dark:bg-darkalign">
          <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            sendTextMessage={sendTextMessage}
            isSessionActive={isSessionActive}
          />
        </div>
      </section>
    </>
  ) : (
    <Loader />
  );
};

export default Conversation;
