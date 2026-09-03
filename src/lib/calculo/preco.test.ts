import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { calcularMarkup, calcularPrecoCanal, MARKUPS_ESCASSEZ } from './preco';
import type { Canal, PerfilEscassez } from './tipos';

function canaisDoCenario(freteGratisShopee: boolean): Canal[] {
  return [
    { id: 'DIRETA', nome: 'Venda direta', taxaMarket: 0, taxaFixa: 0, taxaFixaTipo: 'VALOR' },
    { id: 'SHOPEE', nome: 'Shopee', taxaMarket: 14, taxaFixa: 4, taxaFixaTipo: 'VALOR', freteGratisShopee },
    { id: 'MERCADOLIVRE', nome: 'Mercado Livre', taxaMarket: 16, taxaFixa: 6.5, taxaFixaTipo: 'VALOR' },
  ];
}

describe('calcularMarkup', () => {
  it('multiplica o perfil pelo ajuste manual e arredonda', () => {
    expect(calcularMarkup('DEMANDA_PADRAO', 1)).toEqual({ consumidor: 1.6, lojista: 1.4 });
    expect(calcularMarkup('PROJETO_EXCLUSIVO', 1.2)).toEqual({ consumidor: 2.88, lojista: 2.4 });
  });

  it('expõe os três perfis da origem', () => {
    expect(MARKUPS_ESCASSEZ.SAZONAL).toEqual({ consumidor: 2, lojista: 1.6 });
  });
});

describe('calcularPrecoCanal', () => {
  const casos = ouro.flatMap((cenario) =>
    (['consumidor', 'lojista'] as const).flatMap((publico) =>
      cenario[publico].map((esperado, indice) => ({
        rotulo: `${cenario.nome}/${publico}/${esperado.canalLabel}`,
        cenario,
        publico,
        indice,
        esperado,
      })),
    ),
  );

  it.each(casos.map((c) => [c.rotulo, c] as const))(
    'reproduz o preço de %s',
    (_rotulo, { cenario, publico, indice, esperado }) => {
      const markup = calcularMarkup(
        cenario.entrada.perfil as PerfilEscassez,
        cenario.entrada.ajusteMarkup,
      )[publico];

      const resultado = calcularPrecoCanal({
        custoTotalBase: cenario.custoBase.custoTotalBase,
        custoMaterial: cenario.custoBase.custoMaterial,
        canal: canaisDoCenario(cenario.entrada.freteGratisShopee)[indice],
        markup,
        impostoPercentual: cenario.entrada.impostoPercentual,
        taxaPagamentoPercentual: cenario.entrada.taxaPagamentoPercentual,
        percentualFalha: cenario.entrada.percentualFalha,
        valorFrete: cenario.entrada.valorFrete,
      });

      expect(resultado.ok).toBe(true);
      if (!resultado.ok) return;

      expect(resultado.preco.precoVenda).toBe(esperado.precoVenda);
      expect(resultado.preco.lucroLiquido).toBe(esperado.lucroLiquido);
      expect(resultado.preco.totalTaxas).toBe(esperado.totalTaxas);
      expect(resultado.preco.valorFalha).toBe(esperado.valorFalha);
      expect(resultado.preco.precoVendaSemFalha).toBe(esperado.precoVendaSemFalha);
      expect(resultado.preco.precoVendaSemFrete).toBe(esperado.precoVendaSemFrete);
      expect(resultado.preco.taxaMarket).toBe(esperado.taxaMarket);
      expect(resultado.preco.valorTaxaMarket).toBe(esperado.valorTaxaMarket);
      expect(resultado.preco.taxaFixa).toBe(esperado.taxaFixa);
      expect(resultado.preco.valorImposto).toBe(esperado.valorImposto);
      expect(resultado.preco.valorTaxaPagamento).toBe(esperado.valorTaxaPagamento);
      expect(resultado.preco.percentualTaxas).toBe(esperado.percentualTaxas);
    },
  );

  it('recusa o cálculo quando as taxas somam 100% ou mais', () => {
    const resultado = calcularPrecoCanal({
      custoTotalBase: 10,
      custoMaterial: 5,
      canal: { id: 'DIRETA', nome: 'Venda direta', taxaMarket: 60, taxaFixa: 0, taxaFixaTipo: 'VALOR' },
      markup: 1.6,
      impostoPercentual: 30,
      taxaPagamentoPercentual: 10,
      percentualFalha: 0,
      valorFrete: 0,
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.motivo).toContain('100%');
  });

  it('soma 6 pontos de comissão na Shopee com frete grátis', () => {
    const comum = {
      custoTotalBase: 20,
      custoMaterial: 10,
      markup: 1.6,
      impostoPercentual: 0,
      taxaPagamentoPercentual: 0,
      percentualFalha: 0,
      valorFrete: 0,
    };
    const semFrete = calcularPrecoCanal({ ...comum, canal: canaisDoCenario(false)[1] });
    const comFrete = calcularPrecoCanal({ ...comum, canal: canaisDoCenario(true)[1] });

    expect(semFrete.ok && semFrete.preco.taxaMarket).toBe(14);
    expect(comFrete.ok && comFrete.preco.taxaMarket).toBe(20);
    expect(comFrete.ok && semFrete.ok && comFrete.preco.precoVenda).toBeGreaterThan(
      semFrete.ok ? semFrete.preco.precoVenda : 0,
    );
  });

  it('aplica o divisor reduzido do Mercado Livre abaixo de R$ 12,50', () => {
    const abaixo = calcularPrecoCanal({
      custoTotalBase: 1,
      custoMaterial: 0.5,
      canal: canaisDoCenario(false)[2],
      markup: 1.6,
      impostoPercentual: 0,
      taxaPagamentoPercentual: 0,
      percentualFalha: 0,
      valorFrete: 0,
    });

    expect(abaixo.ok).toBe(true);
    if (!abaixo.ok) return;
    // (1 × 1,6 + 6,50) ÷ (1 − 0,16 − 0,5) = 8,10 ÷ 0,34
    expect(abaixo.preco.precoVenda).toBe(23.82);
  });

  it('não aplica o divisor reduzido quando o preço já passa de R$ 12,50', () => {
    const acima = calcularPrecoCanal({
      custoTotalBase: 30,
      custoMaterial: 15,
      canal: canaisDoCenario(false)[2],
      markup: 1.6,
      impostoPercentual: 0,
      taxaPagamentoPercentual: 0,
      percentualFalha: 0,
      valorFrete: 0,
    });

    expect(acima.ok).toBe(true);
    if (!acima.ok) return;
    // (30 × 1,6 + 6,50) ÷ (1 − 0,16) = 54,50 ÷ 0,84
    expect(acima.preco.precoVenda).toBe(64.88);
  });
});
