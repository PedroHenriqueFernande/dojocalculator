import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { arredondar, calcularCustoBase, HORAS_FIXAS_MES } from './custo';

describe('calcularCustoBase', () => {
  it('mantém 520 horas fixas por mês, como a origem', () => {
    expect(HORAS_FIXAS_MES).toBe(520);
  });

  it('arredonda para duas casas como a origem', () => {
    expect(arredondar(3.784)).toBe(3.78);
    expect(arredondar(3.785)).toBe(3.79);
  });

  it.each(ouro.map((c) => [c.nome, c] as const))(
    'reproduz o custo base do cenário %s',
    (_nome, cenario) => {
      const resultado = calcularCustoBase({
        filamentos: [
          {
            precoKg: cenario.entrada.precoKg,
            pesoGramas: cenario.entrada.pesoGramas,
          },
        ],
        quantidade: cenario.entrada.quantidade,
        tempoImpressaoMin: cenario.entrada.tempoImpressaoMin,
        precoCompraImpressora: cenario.entrada.precoCompraImpressora,
        vidaUtilHorasImpressora: cenario.entrada.vidaUtilHorasImpressora,
        custoManutencaoMes: cenario.entrada.custoManutencaoMes,
        consumoKwh: cenario.entrada.consumoKwh,
        custoKwh: cenario.entrada.custoKwh,
        itensProjeto: cenario.entrada.itensProjeto,
      });

      expect(resultado.custoMaterial).toBe(cenario.custoBase.custoMaterial);
      expect(resultado.custoEnergia).toBe(cenario.custoBase.custoEnergia);
      expect(resultado.custoAmortizacao).toBe(cenario.custoBase.custoAmortizacao);
      expect(resultado.amortizacaoHora).toBe(cenario.custoBase.amortizacaoHora);
      expect(resultado.custoManutencaoRateado).toBe(
        cenario.custoBase.custoManutencaoRateado,
      );
      expect(resultado.custoProjeto).toBe(
        cenario.custoBase.totalAcessoriosEmbalagens,
      );
      expect(resultado.custoTotalBase).toBe(cenario.custoBase.custoTotalBase);
    },
  );

  it('não divide por zero quando a impressora não tem vida útil', () => {
    const resultado = calcularCustoBase({
      filamentos: [{ precoKg: 90, pesoGramas: 10 }],
      quantidade: 1,
      tempoImpressaoMin: 60,
      precoCompraImpressora: 5000,
      vidaUtilHorasImpressora: 0,
      custoManutencaoMes: 0,
      consumoKwh: 0.1,
      custoKwh: 0.85,
      itensProjeto: [],
    });

    expect(resultado.amortizacaoHora).toBe(0);
    expect(resultado.custoAmortizacao).toBe(0);
  });

  it('soma o custo de varios filamentos e aplica a quantidade de pecas', () => {
    const resultado = calcularCustoBase({
      filamentos: [
        { precoKg: 80, pesoGramas: 100 },
        { precoKg: 120, pesoGramas: 50 },
      ],
      quantidade: 3,
      tempoImpressaoMin: 0,
      precoCompraImpressora: 0,
      vidaUtilHorasImpressora: 0,
      custoManutencaoMes: 0,
      consumoKwh: 0,
      custoKwh: 0,
      itensProjeto: [],
    });

    expect(resultado.custoMaterial).toBe(42);
    expect(resultado.custoTotalBase).toBe(42);
  });
});
