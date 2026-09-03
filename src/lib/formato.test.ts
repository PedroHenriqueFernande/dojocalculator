import { describe, expect, it } from 'vitest';
import { formatarMoeda, formatarPercentual, formatarTempo, lerMoeda } from './formato';

describe('formatarMoeda', () => {
  it('formata no padrão brasileiro', () => {
    expect(formatarMoeda(1234.5)).toBe('R$ 1.234,50');
    expect(formatarMoeda(0)).toBe('R$ 0,00');
  });

  it('usa espaço comum, não o inquebrável do Intl', () => {
    expect(formatarMoeda(10)).not.toContain(' ');
  });

  it('formata negativo', () => {
    expect(formatarMoeda(-12.3)).toContain('12,30');
    expect(formatarMoeda(-12.3).startsWith('-')).toBe(true);
  });

  it('omite o símbolo quando pedido', () => {
    expect(formatarMoeda(1234.5, { simbolo: false })).toBe('1.234,50');
  });
});

describe('lerMoeda', () => {
  it('lê o que a pessoa digita', () => {
    expect(lerMoeda('1234,5')).toBe(1234.5);
    expect(lerMoeda('R$ 1.234,50')).toBe(1234.5);
    expect(lerMoeda('89.90')).toBe(89.9);
    expect(lerMoeda('89,90')).toBe(89.9);
  });

  it('lê o que a pessoa cola, com espaço inquebrável', () => {
    expect(lerMoeda('R$ 1.234,50')).toBe(1234.5);
  });

  it('devolve null para entrada vazia ou inválida', () => {
    expect(lerMoeda('')).toBeNull();
    expect(lerMoeda('   ')).toBeNull();
    expect(lerMoeda('abc')).toBeNull();
    expect(lerMoeda('R$')).toBeNull();
  });

  it('trata ponto como separador de milhar quando há vírgula decimal', () => {
    expect(lerMoeda('1.234.567,89')).toBe(1234567.89);
  });
});

describe('formatarTempo', () => {
  it('mostra horas e minutos', () => {
    expect(formatarTempo(200)).toBe('3h 20min');
    expect(formatarTempo(45)).toBe('45min');
    expect(formatarTempo(120)).toBe('2h');
    expect(formatarTempo(0)).toBe('0min');
  });
});

describe('formatarPercentual', () => {
  it('usa vírgula e corta zeros à direita', () => {
    expect(formatarPercentual(14)).toBe('14%');
    expect(formatarPercentual(3.99)).toBe('3,99%');
    expect(formatarPercentual(3.9)).toBe('3,9%');
  });
});
