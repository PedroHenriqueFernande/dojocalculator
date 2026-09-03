import { arredondar } from './custo';
import type {
  Capacidade,
  CustoBase,
  ItemCascata,
  PrecoCanal,
  ResumoUnitario,
} from './tipos';

const HORAS_UTEIS_DIA = 20;
const DIAS_UTEIS_MES = 26;

function porQuantidade(valor: number, quantidade: number): number {
  return arredondar(valor / (quantidade > 0 ? quantidade : 1));
}

export function calcularCapacidade(
  tempoImpressaoMin: number,
  quantidade: number,
  lucroLiquidoDoLote: number,
): Capacidade {
  const tempoHoras = tempoImpressaoMin / 60;
  const lucroPorPeca = quantidade > 0 ? lucroLiquidoDoLote / quantidade : 0;
  const lucroPorHora = tempoHoras > 0 ? lucroPorPeca / tempoHoras : 0;
  const pecasPorDia = tempoHoras > 0 ? Math.floor(HORAS_UTEIS_DIA / tempoHoras) : 0;
  const lucroPorDia = pecasPorDia * lucroPorPeca;

  return {
    lucroPorPeca: arredondar(lucroPorPeca),
    lucroPorHora: arredondar(lucroPorHora),
    pecasPorDia,
    lucroPorDia: arredondar(lucroPorDia),
    potencialMensal: arredondar(lucroPorDia * DIAS_UTEIS_MES),
    horasUteisConsideradas: HORAS_UTEIS_DIA,
    diasUteisConsiderados: DIAS_UTEIS_MES,
  };
}

export function montarResumoUnitario(
  custoBase: CustoBase,
  preco: PrecoCanal,
  quantidade: number,
): ResumoUnitario {
  const falhas = porQuantidade(preco.valorFalha, quantidade);
  const frete = porQuantidade(preco.valorFrete, quantidade);
  const taxasCanal = porQuantidade(preco.totalTaxas, quantidade);
  const custoUnitarioBase = porQuantidade(custoBase.custoTotalBase, quantidade);

  return {
    material: porQuantidade(custoBase.custoMaterial, quantidade),
    energia: porQuantidade(custoBase.custoEnergia, quantidade),
    amortizacao: porQuantidade(custoBase.custoAmortizacao, quantidade),
    manutencao: porQuantidade(custoBase.custoManutencaoRateado, quantidade),
    projeto: porQuantidade(custoBase.custoProjeto, quantidade),
    falhas,
    frete,
    taxasCanal,
    totalCustos: arredondar(custoUnitarioBase + falhas + frete + taxasCanal),
    precoFinal: porQuantidade(preco.precoVenda, quantidade),
    lucroLiquido: porQuantidade(preco.lucroLiquido, quantidade),
  };
}

export function montarCascata(
  custoBase: CustoBase,
  preco: PrecoCanal,
  canalNome: string,
): ItemCascata[] {
  const itens: ItemCascata[] = [
    { label: 'Preço de venda', valor: preco.precoVenda, tipo: 'receita' },
  ];

  const deducao = (label: string, valor: number) => {
    if (valor > 0) itens.push({ label, valor: -valor, tipo: 'deducao' });
  };
  const custo = (label: string, valor: number) => {
    if (valor > 0) itens.push({ label, valor: -valor, tipo: 'custo' });
  };

  deducao(`Reserva para falhas (${preco.percentualFalha}%)`, preco.valorFalha);
  custo('Frete repassado', preco.valorFrete);
  deducao(`Taxa ${canalNome} (${preco.taxaMarket}%)`, preco.valorTaxaMarket);
  deducao(`Taxa fixa ${canalNome}`, preco.taxaFixa);
  deducao(`Imposto (${preco.impostoPercentual}%)`, preco.valorImposto);
  deducao(
    `Taxa de pagamento (${preco.taxaPagamentoPercentual}%)`,
    preco.valorTaxaPagamento,
  );

  custo('Material', custoBase.custoMaterial);
  custo('Energia', custoBase.custoEnergia);
  custo('Amortização da impressora', custoBase.custoAmortizacao);
  custo('Manutenção da impressora', custoBase.custoManutencaoRateado);
  custo('Custos do projeto', custoBase.custoProjeto);

  itens.push({
    label: 'Lucro líquido',
    valor: preco.lucroLiquido,
    tipo: 'resultado',
  });

  return itens;
}
