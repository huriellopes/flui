import { ageFromBirthDate, shortName } from './profile';

describe('profile utils', () => {
  describe('shortName', () => {
    it('retorna primeiro + último nome', () => {
      expect(shortName('Huriel Lopes da Silva')).toBe('Huriel Silva');
      expect(shortName('Maria Aparecida Souza')).toBe('Maria Souza');
    });
    it('mantém nome único', () => {
      expect(shortName('Huriel')).toBe('Huriel');
    });
    it('lida com espaços extras', () => {
      expect(shortName('  Ana   Beatriz  ')).toBe('Ana Beatriz');
    });
    it('string vazia', () => {
      expect(shortName('')).toBe('');
    });
  });

  describe('ageFromBirthDate', () => {
    it('calcula idade em relação a uma data fixa', () => {
      expect(ageFromBirthDate('1996-06-15', new Date('2026-07-01'))).toBe(30);
      expect(ageFromBirthDate('1996-08-15', new Date('2026-07-01'))).toBe(29); // ainda não fez aniversário
    });
  });
});
