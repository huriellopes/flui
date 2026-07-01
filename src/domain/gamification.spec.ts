import {
  addXp,
  INITIAL_GAMIFICATION,
  levelFromXp,
  levelProgress,
  touchStreak,
  xpIntoLevel,
  XP_REWARDS,
} from './gamification';

describe('gamification (app)', () => {
  it('nível sobe a cada 100 XP', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(350)).toBe(4);
  });

  it('progresso e XP dentro do nível', () => {
    expect(xpIntoLevel(150)).toBe(50);
    expect(levelProgress(150)).toBeCloseTo(0.5, 5);
    expect(levelProgress(0)).toBe(0);
  });

  it('addXp acumula', () => {
    const s = addXp(INITIAL_GAMIFICATION, XP_REWARDS.WORKOUT);
    expect(s.xp).toBe(25);
    expect(INITIAL_GAMIFICATION.xp).toBe(0); // imutável
  });

  describe('touchStreak', () => {
    it('primeiro dia → 1', () => {
      const s = touchStreak(INITIAL_GAMIFICATION, '2026-07-01');
      expect(s.currentStreak).toBe(1);
      expect(s.longestStreak).toBe(1);
      expect(s.lastActiveDay).toBe('2026-07-01');
    });

    it('dias consecutivos incrementam', () => {
      const s = touchStreak(
        { ...INITIAL_GAMIFICATION, currentStreak: 3, longestStreak: 3, lastActiveDay: '2026-06-30' },
        '2026-07-01',
      );
      expect(s.currentStreak).toBe(4);
      expect(s.longestStreak).toBe(4);
    });

    it('pular um dia reinicia em 1 mas preserva recorde', () => {
      const s = touchStreak(
        { ...INITIAL_GAMIFICATION, currentStreak: 5, longestStreak: 5, lastActiveDay: '2026-06-28' },
        '2026-07-01',
      );
      expect(s.currentStreak).toBe(1);
      expect(s.longestStreak).toBe(5);
    });

    it('mesmo dia é idempotente', () => {
      const base = { ...INITIAL_GAMIFICATION, currentStreak: 2, lastActiveDay: '2026-07-01' };
      expect(touchStreak(base, '2026-07-01')).toBe(base);
    });
  });
});
