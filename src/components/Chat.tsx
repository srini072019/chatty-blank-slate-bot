
import { useState } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";

interface ChatMessage {
  content: string;
  isUser: boolean;
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { content: "Hello! How can I help you today?", isUser: false },
  ]);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      { content: message, isUser: true },
      { content: "I'm a demo bot. I'll echo your message: " + message, isUser: false },
    ]);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>
      <div className="sticky bottom-0 bg-background pt-2">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;
