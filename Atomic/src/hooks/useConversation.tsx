import { useState } from 'react';

export const useConversation = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getConversations = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/conversations/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data);
      return data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversation = async (userId: string, clientId: string) => {
    try {
      const response = await fetch(`/api/conversation/${userId}/${clientId}`);
      if (!response.ok) throw new Error("Failed to fetch conversation");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const sendClientMessage = async (userId: string, clientId: string, clientName: string, clientPhone: string, message: string) => {
    try {
      const response = await fetch("/api/send-client-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, clientId, clientName, clientPhone, message }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending client message:", error);
    }
  };

  const sendUserResponse = async (userId: string, clientId: string, message: string) => {
    try {
      const response = await fetch("/api/send-user-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, clientId, message }),
      });
      if (!response.ok) throw new Error("Failed to send response");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending user response:", error);
    }
  };

  return {
    conversations,
    setConversations,
    loading,
    getConversations,
    getConversation,
    sendClientMessage,
    sendUserResponse
  };
};
