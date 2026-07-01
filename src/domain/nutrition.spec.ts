import { calcBMR, calcTDEE, calcTargets } from './nutrition';
import type { UserProfile } from './profile';

const male: UserProfile = {
  name: 'Teste',
  sex: 'MALE',
  birthDate: '1996-06-15',
  heightCm: 178,
  weightKg: 82,
  targetWeightKg: 75,
  activityLevel: 'MODERATE',
  goal: 'LOSE_FAT',
  createdAt: '',
};

const female: UserProfile = {
  ...male,
  sex: 'FEMALE',
  birthDate: '1996-06-15',
  heightCm: 165,
  weightKg: 60,
  activityLevel: 'SEDENTARY',
  goal: 'MAINTAIN',
};

describe('nutrition (motor de cálculo do app)', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-01T12:00:00Z')); // idade determinística (30 anos)
  });
  afterAll(() => jest.useRealTimers());

  it('BMR masculino (Mifflin-St Jeor +5)', () => {
    // 10*82 + 6.25*178 - 5*30 + 5 = 1787.5
    expect(calcBMR(male)).toBeCloseTo(1787.5, 1);
  });

  it('BMR feminino (-161)', () => {
    // 10*60 + 6.25*165 - 5*30 - 161 = 1320.25... -> 600+1031.25-150-161 = 1320.25
    expect(calcBMR(female)).toBeCloseTo(1320.25, 1);
  });

  it('TDEE aplica fator de atividade', () => {
    expect(calcTDEE(male)).toBeCloseTo(1787.5 * 1.55, 1);
    expect(calcTDEE(female)).toBeCloseTo(1320.25 * 1.2, 1);
  });

  it('metas: déficit de 20% para perder gordura', () => {
    const t = calcTargets(male);
    expect(t.bmr).toBe(1788);
    expect(t.tdee).toBe(2771);
    expect(t.calories).toBe(2217);
  });

  it('metas: proteína 2.0 g/kg (ativo c/ objetivo) e gordura 0.9 g/kg', () => {
    const t = calcTargets(male);
    expect(t.proteinG).toBe(164);
    expect(t.fatG).toBe(74);
  });

  it('metas: proteína 1.6 g/kg quando sedentário', () => {
    expect(calcTargets(female).proteinG).toBe(96);
  });

  it('metas: MAINTAIN mantém calorias = TDEE', () => {
    const t = calcTargets(female);
    expect(t.calories).toBe(t.tdee);
  });

  it('água arredondada a múltiplos de 50 ml', () => {
    const t = calcTargets(male); // 35*82 = 2870 -> 2850
    expect(t.waterMl % 50).toBe(0);
    expect(t.waterMl).toBe(2850);
  });

  it('nunca retorna carboidrato negativo (peso extremo)', () => {
    expect(calcTargets({ ...male, weightKg: 200 }).carbsG).toBeGreaterThanOrEqual(0);
  });
});
