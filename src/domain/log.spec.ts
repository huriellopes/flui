import {
  emptyLog,
  totalCalories,
  totalCarbs,
  totalFat,
  totalProtein,
  todayKey,
  type DailyLog,
} from './log';

describe('log (agregações do dia)', () => {
  const log: DailyLog = {
    date: '2026-07-01',
    waterMl: 500,
    meals: [
      { id: '1', label: 'A', calories: 300, proteinG: 20, carbsG: 30, fatG: 10, at: '' },
      { id: '2', label: 'B', calories: 650, proteinG: 45, carbsG: 60, fatG: 20, at: '' },
    ],
    workouts: [{ id: 'w1', kind: 'Corrida', durationMin: 30, at: '' }],
  };

  it('emptyLog zera tudo', () => {
    const e = emptyLog('2026-07-01');
    expect(e.waterMl).toBe(0);
    expect(e.meals).toHaveLength(0);
    expect(e.workouts).toHaveLength(0);
  });

  it('soma calorias e macros das refeições', () => {
    expect(totalCalories(log)).toBe(950);
    expect(totalProtein(log)).toBe(65);
    expect(totalCarbs(log)).toBe(90);
    expect(totalFat(log)).toBe(30);
  });

  it('totais de log vazio são 0', () => {
    const e = emptyLog('2026-07-01');
    expect(totalCalories(e)).toBe(0);
    expect(totalProtein(e)).toBe(0);
  });

  it('todayKey retorna yyyy-mm-dd', () => {
    expect(todayKey(new Date('2026-07-01T15:30:00Z'))).toBe('2026-07-01');
  });
});
