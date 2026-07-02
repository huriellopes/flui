// Utilitário de data ciente de fuso horário.
//
// Estratégia (ver avaliação em README/CLAUDE): o "dia" do usuário segue o fuso
// do DISPOSITIVO — que o SO já deriva da localização/configuração, sem exigir
// permissão de GPS. Se o fuso não puder ser resolvido (Intl indisponível),
// caímos no padrão do produto: America/Sao_Paulo.

/** Fuso padrão do produto quando o do dispositivo não pode ser resolvido. */
export const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

/**
 * Fuso IANA efetivo. Usa o fuso do dispositivo (via Intl, sem permissão) e,
 * na falta dele, o padrão America/Sao_Paulo.
 */
export function resolveTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/**
 * Data (yyyy-mm-dd) de um instante em um fuso IANA específico.
 * Se o Intl falhar, aplica o offset fixo de America/Sao_Paulo (UTC-3, estável
 * desde o fim do horário de verão brasileiro em 2019) como último recurso.
 */
export function dayKeyInTZ(date: Date, timeZone: string = resolveTimeZone()): string {
  try {
    // 'en-CA' formata como ISO yyyy-mm-dd.
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    const saoPaulo = new Date(date.getTime() - 3 * 60 * 60 * 1000);
    const y = saoPaulo.getUTCFullYear();
    const m = String(saoPaulo.getUTCMonth() + 1).padStart(2, '0');
    const d = String(saoPaulo.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
