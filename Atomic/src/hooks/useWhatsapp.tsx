export const useWhatsapp = () => {
  const getConfig = async (userId: string) => {
    try {
      const res = await fetch(`/api/whatsapp-config/${userId}`);
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch {
      return { phoneNumberId: '', hasToken: false, verifyToken: '' };
    }
  };

  const saveConfig = async (userId: string, phoneNumberId: string, token: string, verifyToken: string) => {
    try {
      const res = await fetch(`/api/whatsapp-config/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId, token, verifyToken }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  return { getConfig, saveConfig };
};
