import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { calcularCapacidade, montarCascata, montarResumoUnitario } from './resultado';
import type { CustoBase, PrecoCanal } from './tipos';

type Cenario = (typeof ouro)[number];

const primeiro = ouro[0];

function custoBaseDe(cenario: Cenario): CustoBase {
  return {
    custoMaterial: cenario.custoBase.custoMaterial,
    custoEnergia: cenario.custoBase.custoEnergia,
    custoAmortizacao: cenario.custoBase.custoAmortizacao,
    amortizacaoHora: cenario.custoBase.amortizacaoHora,
    custoManutencaoPorHora: cenario.custoBase.custoManutencaoPorHora,
    custoManutencaoRateado: cenario.custoBase.custoManutencaoRateado,
    custoProjeto: cenario.custoBase.totalAcessoriosEmbalagens,
    custoTotalBase: cenario.custoBase.custoTotalBase,
    tempoTotalHoras:
      (cenario.entrada.tempoImpressaoMin / 60) * cenario.entrada.quantidade,
  };
}

describe('calcularCapacidade', () => {
  it.each(ouro.map((c) => [c.nome, c] as const))(
    'reproduz a capacidade produtiva do cenário %s',
    (_nome, cenario) => {
      const esperado = cenario.capacidade[0];
      const resultado = calcularCapacidade(
        cenario.entrada.tempoImpressaoMin,
        cenario.entrada.quantidade,
        cenario.consumidor[0].lucroLiquido,
      );

      expect(resultado.lucroPorPeca).toBe(esperado.lucroPorPeca);
      expect(resultado.lucroPorHora).toBe(esperado.lucroPorHora);
      expect(resultado.pecasPorDia).toBe(esperado.pecasPorDia);
      expect(resultado.lucroPorDia).toBe(esperado.lucroPorDia);
      expect(resultado.potencialMensal).toBe(esperado.potencialMensal);
    },
  );

  it('devolve zeros quando o tempo de impressão é zero', () => {
    const resultado = calcularCapacidade(0, 1, 10);

    expect(resultado.lucroPorHora).toBe(0);
    expect(resultado.pecasPorDia).toBe(0);
    expect(resultado.potencialMensal).toBe(0);
  });
});

describe('montarResumoUnitario', () => {
  it('divide cada componente pela quantidade', () => {
    const lote = ouro.find((c) => c.nome === 'lote-com-falha-e-frete')!;
    const resumo = montarResumoUnitario(
      custoBaseDe(lote),
      lote.consumidor[0] as unknown as PrecoCanal,
      lote.entrada.quantidade,
    );

    expect(resumo.material).toBe(
      Math.round((lote.custoBase.custoMaterial / 5) * 100) / 100,
    );
    expect(resumo.precoFinal).toBe(
      Math.round((lote.consumidor[0].precoVenda / 5) * 100) / 100,
    );
    expect(resumo.totalCustos).toBeGreaterThan(0);
  });

  it('não divide por zero quando a quantidade é zero', () => {
    const resumo = montarResumoUnitario(
      custoBaseDe(primeiro),
      primeiro.consumidor[0] as unknown as PrecoCanal,
      0,
    );

    expect(Number.isFinite(resumo.totalCustos)).toBe(true);
    expect(resumo.material).toBe(primeiro.custoBase.custoMaterial);
  });
});

describe('montarCascata', () => {
  it('abre com a receita e fecha com o resultado', () => {
    const cascata = montarCascata(
      custoBaseDe(primeiro),
      primeiro.consumidor[1] as unknown as PrecoCanal,
      'Shopee',
    );

    expect(cascata[0].tipo).toBe('receita');
    expect(cascata[cascata.length - 1].tipo).toBe('resultado');
  });

  it('omite as linhas que valem zero', () => {
    const cascata = montarCascata(
      custoBaseDe(primeiro),
      primeiro.consumidor[0] as unknown as PrecoCanal,
      'Venda direta',
    );

    expect(cascata.some((item) => item.label.includes('Frete'))).toBe(false);
    expect(cascata.some((item) => item.label.includes('Reserva'))).toBe(false);
  });

  it('fecha a conta: receita menos deduções e custos é o lucro', () => {
    const lote = ouro.find((c) => c.nome === 'lote-com-falha-e-frete')!;
    const preco = lote.consumidor[1] as unknown as PrecoCanal;
    const cascata = montarCascata(custoBaseDe(lote), preco, 'Shopee');

    const soma = cascata
      .filter((item) => item.tipo !== 'resultado')
      .reduce((total, item) => total + item.valor, 0);

    expect(Math.abs(soma - preco.lucroLiquido)).toBeLessThan(0.02);
  });
});
