import { DEFAULT_TIME_ZONE, dayKeyInTZ, resolveTimeZone } from './datetime';

describe('datetime (fuso do usuário)', () => {
  it('resolve para um fuso IANA não vazio', () => {
    expect(resolveTimeZone().length).toBeGreaterThan(0);
  });

  it('dayKeyInTZ em America/Sao_Paulo respeita a virada às 21h (UTC-3)', () => {
    // 02:00Z = 23h do dia anterior em São Paulo.
    expect(dayKeyInTZ(new Date('2026-07-02T02:00:00Z'), 'America/Sao_Paulo')).toBe('2026-07-01');
    // 12:30Z = 09:30 em São Paulo, mesmo dia.
    expect(dayKeyInTZ(new Date('2026-07-01T12:30:00Z'), 'America/Sao_Paulo')).toBe('2026-07-01');
  });

  it('o mesmo instante pode cair em dias diferentes conforme o fuso', () => {
    const instant = new Date('2026-07-02T02:00:00Z');
    expect(dayKeyInTZ(instant, 'America/Sao_Paulo')).toBe('2026-07-01');
    expect(dayKeyInTZ(instant, 'UTC')).toBe('2026-07-02');
  });

  it('expõe America/Sao_Paulo como padrão do produto', () => {
    expect(DEFAULT_TIME_ZONE).toBe('America/Sao_Paulo');
  });
});
