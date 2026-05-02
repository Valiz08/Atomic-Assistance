export interface DaySchedule {
  day: number;      // 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
  enabled: boolean;
  open: number;     // hora inicio (0-23)
  close: number;    // hora fin (0-23)
}

export const DEFAULT_BUSINESS_HOURS: DaySchedule[] = [
  { day: 1, enabled: true,  open: 8, close: 19 },
  { day: 2, enabled: true,  open: 8, close: 19 },
  { day: 3, enabled: true,  open: 8, close: 19 },
  { day: 4, enabled: true,  open: 8, close: 19 },
  { day: 5, enabled: true,  open: 8, close: 19 },
  { day: 6, enabled: true,  open: 8, close: 14 },
  { day: 0, enabled: false, open: 8, close: 14 },
];

export const useBusinessHours = () => {
  const getHours = async (userId: string): Promise<DaySchedule[]> => {
    try {
      const res = await fetch(`/api/business-hours/${userId}`);
      return res.ok ? res.json() : DEFAULT_BUSINESS_HOURS;
    } catch {
      return DEFAULT_BUSINESS_HOURS;
    }
  };

  const saveHours = async (userId: string, hours: DaySchedule[]): Promise<boolean> => {
    try {
      const res = await fetch(`/api/business-hours/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  return { getHours, saveHours };
};
