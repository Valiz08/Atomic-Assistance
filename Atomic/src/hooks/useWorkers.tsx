export interface Worker {
  id: string;
  name: string;
}

export const useWorkers = () => {
  const getWorkers = async (userId: string): Promise<Worker[]> => {
    try {
      const res = await fetch(`/api/workers/${userId}`);
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  };

  const addWorker = async (userId: string, name: string): Promise<Worker | null> => {
    try {
      const res = await fetch(`/api/workers/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  };

  const removeWorker = async (userId: string, workerId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/workers/${userId}/${workerId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  };

  return { getWorkers, addWorker, removeWorker };
};
