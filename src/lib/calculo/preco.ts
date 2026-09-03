import { arredondar } from './custo';
import type { Canal, PerfilEscassez, ResultadoCanal } from './tipos';

const LIMITE_PRECO_BAIXO_ML = 12.5;
const COMISSAO_EXTRA_FRETE_GRATIS_SHOPEE = 6;
const DIVISOR_EXTRA_ML_PRECO_BAIXO = 0.5;

export const MARKUPS_ESCASSEZ: Record<
  PerfilEscassez,
  { consumidor: number; lojista: number }
> = {
  DEMANDA_PADRAO: { consumidor: 1.6, lojista: 1.4 },
  PROJETO_EXCLUSIVO: { consumidor: 2.4, lojista: 2 },
  SAZONAL: { consumidor: 2, lojista: 1.6 },
};

export function calcularMarkup(perfil: PerfilEscassez, ajuste: number) {
  const base = MARKUPS_ESCASSEZ[perfil];

  return {
    consumidor: arredondar(base.consumidor * ajuste),
    lojista: arredondar(base.lojista * ajuste),
  };
}

interface EntradaPreco {
  custoTotalBase: number;
  custoMaterial: number;
  canal: Canal;
  markup: number;
  impostoPercentual: number;
  taxaPagamentoPercentual: number;
  percentualFalha: number;
  valorFrete: number;
}

/**
 * A origem tem três classes (genérico, Shopee, Mercado Livre) com o corpo do
 * cálculo duplicado, separadas só pela injeção de dependência do NestJS. Aqui
 * são uma função com as duas diferenças reais aplicadas no ponto onde ocorrem.
 *
 * O preço é calculado três vezes porque a UI mostra quanto a reserva de falha
 * e o frete custam em preço final — é assim que a origem faz.
 */
export function calcularPrecoCanal(entrada: EntradaPreco): ResultadoCanal {
  const percentualFalha = arredondar(
    Math.min(Math.max(entrada.percentualFalha || 0, 0), 100),
  );
  const valorFalha = arredondar(
    Math.max(entrada.custoMaterial, 0) * (percentualFalha / 100),
  );
  const valorFrete = arredondar(Math.max(entrada.valorFrete || 0, 0));

  const semFalha = precificar(entrada, 0);
  if (!semFalha.ok) return semFalha;

  const semFrete = precificar(entrada, valorFalha);
  if (!semFrete.ok) return semFrete;

  const final = precificar(entrada, arredondar(valorFalha + valorFrete));
  if (!final.ok) return final;

  const lucroLiquido = arredondar(
    final.preco.precoVenda -
      final.preco.totalTaxas -
      entrada.custoTotalBase -
      valorFalha -
      valorFrete,
  );

  return {
    ok: true,
    preco: {
      ...final.preco,
      lucroLiquido,
      percentualFalha,
      valorFalha,
      valorFrete,
      precoVendaSemFalha: semFalha.preco.precoVenda,
      precoVendaSemFrete: semFrete.preco.precoVenda,
    },
  };
}

function precificar(entrada: EntradaPreco, custoRepasse: number): ResultadoCanal {
  const { canal } = entrada;

  const comissao =
    canal.id === 'SHOPEE' && canal.freteGratisShopee
      ? canal.taxaMarket + COMISSAO_EXTRA_FRETE_GRATIS_SHOPEE
      : canal.taxaMarket;

  const percentualTotal =
    comissao + entrada.impostoPercentual + entrada.taxaPagamentoPercentual;

  const subtotalMarkup =
    entrada.custoTotalBase * entrada.markup + Math.max(custoRepasse, 0);

  const taxaFixa = resolverTaxaFixa(subtotalMarkup, canal);
  const divisor = 1 - (percentualTotal + taxaFixa.percentual) / 100;

  if (divisor <= 0) {
    return {
      ok: false,
      motivo: `${canal.nome}: as taxas somam 100% ou mais do preço. Não existe preço de venda possível com essa configuração.`,
    };
  }

  let precoVenda = (subtotalMarkup + taxaFixa.valor) / divisor;

  if (canal.id === 'MERCADOLIVRE' && precoVenda < LIMITE_PRECO_BAIXO_ML) {
    const divisorBaixo = divisor - DIVISOR_EXTRA_ML_PRECO_BAIXO;

    if (divisorBaixo <= 0) {
      return {
        ok: false,
        motivo: `${canal.nome}: com a taxa extra de produto abaixo de R$ 12,50, as taxas ultrapassam 100% do preço.`,
      };
    }

    precoVenda = (subtotalMarkup + taxaFixa.valor) / divisorBaixo;
  }

  const valorTaxaMarket = precoVenda * (comissao / 100);
  const valorTaxaFixa =
    taxaFixa.percentual > 0 ? precoVenda * (taxaFixa.percentual / 100) : taxaFixa.valor;
  const valorImposto = precoVenda * (entrada.impostoPercentual / 100);
  const valorTaxaPagamento = precoVenda * (entrada.taxaPagamentoPercentual / 100);

  const totalTaxas =
    valorTaxaMarket + valorTaxaFixa + valorImposto + valorTaxaPagamento;

  return {
    ok: true,
    preco: {
      taxaMarket: arredondar(comissao),
      valorTaxaMarket: arredondar(valorTaxaMarket),
      taxaFixa: arredondar(valorTaxaFixa),
      impostoPercentual: arredondar(entrada.impostoPercentual),
      valorImposto: arredondar(valorImposto),
      taxaPagamentoPercentual: arredondar(entrada.taxaPagamentoPercentual),
      valorTaxaPagamento: arredondar(valorTaxaPagamento),
      totalTaxas: arredondar(totalTaxas),
      percentualTaxas: precoVenda > 0 ? arredondar((totalTaxas / precoVenda) * 100) : 0,
      markup: arredondar(entrada.markup),
      percentualFalha: 0,
      valorFalha: 0,
      valorFrete: 0,
      precoVendaSemFalha: arredondar(precoVenda),
      precoVendaSemFrete: arredondar(precoVenda),
      precoVenda: arredondar(precoVenda),
      lucroLiquido: arredondar(
        precoVenda - entrada.custoTotalBase - Math.max(custoRepasse, 0) - totalTaxas,
      ),
    },
  };
}

function resolverTaxaFixa(
  precoEstimado: number,
  canal: Canal,
): { valor: number; percentual: number } {
  if (canal.taxaFixaTipo === 'PERCENTUAL') {
    return { valor: 0, percentual: canal.taxaFixa || 0 };
  }

  const faixa = canal.faixasTaxaFixa?.find(
    (f) => precoEstimado >= f.precoMinimo && precoEstimado <= f.precoMaximo,
  );

  if (!faixa) return { valor: canal.taxaFixa || 0, percentual: 0 };

  return faixa.ehPercentual && faixa.valorPercentual !== null
    ? { valor: 0, percentual: faixa.valorPercentual }
    : { valor: faixa.taxaFixa, percentual: 0 };
}
