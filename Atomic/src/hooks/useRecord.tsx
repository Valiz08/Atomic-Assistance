import { useState } from 'react';

export const useRecord = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getRecords = async (userId: string) => {
    setLoading(true);
    try {
      console.log('[useRecord] fetching records for userId:', userId);
      const response = await fetch(`http://localhost:3088/api/records/${userId}`);
      console.log('[useRecord] response status:', response.status);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log('[useRecord] records received:', data);
      setRecords(data);
      return data;
    } catch (error) {
      console.error("Error fetching records:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecord = async (userId: string, clientId: string) => {
    try {
      const response = await fetch(`http://localhost:3088/api/record/${userId}/${clientId}`);
      if (!response.ok) throw new Error("Failed to fetch record");
      return await response.json();
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  };

  const sendUserResponse = async (userId: string, clientId: string, message: string) => {
    try {
      const response = await fetch("http://localhost:3088/api/send-user-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, clientId, message }),
      });
      if (!response.ok) throw new Error("Failed to send response");
      return await response.json();
    } catch (error) {
      console.error("Error sending user response:", error);
    }
  };

  const addMessage = async (userId: string, clientId: string, message: string) => {
    try {
      const response = await fetch('http://localhost:3088/api/record/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, clientId, message }),
      });
      if (!response.ok) throw new Error('Failed to add message');
      return await response.json();
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  return {
    records,
    setRecords,
    loading,
    getRecords,
    getRecord,
    sendUserResponse,
    addMessage,
  };
};
