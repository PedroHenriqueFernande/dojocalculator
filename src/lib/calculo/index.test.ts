import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { calcular } from './index';
import type { Canal, EntradaCalculo, PerfilEscassez } from './tipos';

function entradaDoCenario(cenario: (typeof ouro)[number]): EntradaCalculo {
  const canais: Canal[] = [
    { id: 'DIRETA', nome: 'Venda direta', taxaMarket: 0, taxaFixa: 0, taxaFixaTipo: 'VALOR' },
    {
      id: 'SHOPEE',
      nome: 'Shopee',
      taxaMarket: 14,
      taxaFixa: 4,
      taxaFixaTipo: 'VALOR',
      freteGratisShopee: cenario.entrada.freteGratisShopee,
    },
    { id: 'MERCADOLIVRE', nome: 'Mercado Livre', taxaMarket: 16, taxaFixa: 6.5, taxaFixaTipo: 'VALOR' },
  ];

  return {
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
    percentualFalha: cenario.entrada.percentualFalha,
    valorFrete: cenario.entrada.valorFrete,
    perfilEscassez: cenario.entrada.perfil as PerfilEscassez,
    ajusteMarkup: cenario.entrada.ajusteMarkup,
    impostoPercentual: cenario.entrada.impostoPercentual,
    taxaPagamentoPercentual: cenario.entrada.taxaPagamentoPercentual,
    canais,
  };
}

describe('calcular', () => {
  it.each(ouro.map((c) => [c.nome, c] as const))(
    'reproduz ponta a ponta o cenário %s',
    (_nome, cenario) => {
      const resultado = calcular(entradaDoCenario(cenario));

      expect(resultado.custoBase.custoTotalBase).toBe(cenario.custoBase.custoTotalBase);
      expect(resultado.canais).toHaveLength(3);

      resultado.canais.forEach((canal, indice) => {
        expect(canal.consumidor.ok).toBe(true);
        expect(canal.lojista.ok).toBe(true);
        if (!canal.consumidor.ok || !canal.lojista.ok) return;

        expect(canal.consumidor.preco.precoVenda).toBe(
          cenario.consumidor[indice].precoVenda,
        );
        expect(canal.lojista.preco.precoVenda).toBe(cenario.lojista[indice].precoVenda);
        expect(canal.capacidade?.potencialMensal).toBe(
          cenario.capacidade[indice].potencialMensal,
        );
      });
    },
  );

  it('devolve o motivo do erro por canal em vez de lançar exceção', () => {
    const entrada = entradaDoCenario(ouro[0]);
    const resultado = calcular({
      ...entrada,
      impostoPercentual: 95,
      taxaPagamentoPercentual: 10,
    });

    const direta = resultado.canais[0];
    expect(direta.consumidor.ok).toBe(false);
    expect(direta.resumoConsumidor).toBeNull();
    expect(direta.capacidade).toBeNull();
    expect(direta.cascata).toEqual([]);
  });

  it('expõe os dois markups efetivos', () => {
    const entrada = entradaDoCenario(ouro[0]);
    const resultado = calcular({
      ...entrada,
      perfilEscassez: 'PROJETO_EXCLUSIVO',
      ajusteMarkup: 1.2,
    });

    expect(resultado.markupConsumidor).toBe(2.88);
    expect(resultado.markupLojista).toBe(2.4);
  });
});
