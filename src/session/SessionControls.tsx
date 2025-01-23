import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Mic, Send, MicOff, XCircle } from 'react-feather';
import useChatState from '../zustand/ChatState';
import { Button } from '@headlessui/react';

interface SessionStoppedProps {
  startSession: () => void;
}

const SessionStopped: React.FC<SessionStoppedProps> = ({ startSession }) => {
  const [isActivating, setIsActivating] = useState(false);

  const handleStartSession = () => {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  };

  return (
    <div>
      <Button
        onClick={handleStartSession}
        className=""
      >
        <Mic height={16} />{' '}
        {isActivating ? 'Connecting...' : 'Start Conversation'}
      </Button>
    </div>
  );
};

interface SessionActiveProps {
  stopSession: () => void;
  sendTextMessage: (message: string) => void;
}

const SessionActive: React.FC<SessionActiveProps> = ({
  stopSession,
  sendTextMessage,
}) => {
  const [message, setMessage] = useState('');
  const { isMuted, toggleMute } = useChatState();

  const handleSendClientEvent = () => {
    if (message.trim()) {
      sendTextMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendClientEvent();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Send a text message..."
 
        value={message}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      <Button
        onClick={handleSendClientEvent}

      >
        <Send height={16} />
      </Button>
      <Button
        onClick={toggleMute}

      >
        {isMuted ? <MicOff height={16} /> : <Mic height={16} />}
      </Button>

      <Button
        onClick={stopSession}

      >
        <XCircle height={16} />
      </Button>
    </div>
  );
};

interface SessionControlsProps {
  startSession: () => void;
  stopSession: () => void;
  sendTextMessage: (message: string) => void;
  isSessionActive: boolean;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  startSession,
  stopSession,
  sendTextMessage,
  isSessionActive,
}) => (
  <div className="flex gap-4 h-full rounded-md">
    {isSessionActive ? (
      <SessionActive
        stopSession={stopSession}
        sendTextMessage={sendTextMessage}
      />
    ) : (
      <SessionStopped startSession={startSession} />
    )}
  </div>
);

export default SessionControls;
