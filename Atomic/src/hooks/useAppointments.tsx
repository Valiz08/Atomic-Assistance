interface AppointmentData {
  userId: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  duration: number;
  notes: string;
  workerId?: string;
  workerName?: string;
}

export const useAppointments = () => {
  const getAppointments = async (userId: string, start: string, end: string): Promise<any[]> => {
    try {
      const res = await fetch(`/api/appointments/${userId}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  };

  const createAppointment = async (data: AppointmentData): Promise<any> => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  };

  const updateAppointment = async (id: string, data: Record<string, any>): Promise<any> => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  };

  return { getAppointments, createAppointment, updateAppointment, deleteAppointment };
};
