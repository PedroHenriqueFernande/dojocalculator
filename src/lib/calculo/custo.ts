import type { CustoBase, EntradaCalculo, ItemProjeto } from './tipos';

const HORAS_UTEIS_DIA = 20;
const DIAS_UTEIS_MES = 26;

export const HORAS_FIXAS_MES = HORAS_UTEIS_DIA * DIAS_UTEIS_MES;

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

type EntradaCusto = Pick<
  EntradaCalculo,
  | 'precoKg'
  | 'pesoGramas'
  | 'quantidade'
  | 'tempoImpressaoMin'
  | 'precoCompraImpressora'
  | 'vidaUtilHorasImpressora'
  | 'custoManutencaoMes'
  | 'consumoKwh'
  | 'custoKwh'
  | 'itensProjeto'
>;

export function totalDoItem(item: ItemProjeto): number {
  return arredondar(arredondar(item.valorUnitario) * item.quantidade);
}

export function calcularCustoBase(entrada: EntradaCusto): CustoBase {
  const custoMaterial = arredondar(
    (entrada.precoKg / 1000) * entrada.pesoGramas * entrada.quantidade,
  );

  const tempoTotalHoras = (entrada.tempoImpressaoMin / 60) * entrada.quantidade;

  const custoEnergia =
    (entrada.tempoImpressaoMin / 60) *
    entrada.consumoKwh *
    entrada.custoKwh *
    entrada.quantidade;

  const amortizacaoHora =
    entrada.vidaUtilHorasImpressora > 0
      ? entrada.precoCompraImpressora / entrada.vidaUtilHorasImpressora
      : 0;
  const custoAmortizacao = amortizacaoHora * tempoTotalHoras;

  const custoManutencaoPorHora = entrada.custoManutencaoMes / HORAS_FIXAS_MES;
  const custoManutencaoRateado = custoManutencaoPorHora * tempoTotalHoras;

  const custoProjeto = entrada.itensProjeto.reduce(
    (total, item) => total + totalDoItem(item),
    0,
  );

  // Soma os valores ainda não arredondados (só o material entra arredondado,
  // como na origem) e arredonda no fim. Somar os campos já arredondados daria
  // diferença de centavos em alguns cenários.
  const custoTotalBase =
    custoMaterial +
    custoEnergia +
    custoAmortizacao +
    custoManutencaoRateado +
    custoProjeto;

  return {
    custoMaterial,
    custoEnergia: arredondar(custoEnergia),
    custoAmortizacao: arredondar(custoAmortizacao),
    amortizacaoHora: arredondar(amortizacaoHora),
    custoManutencaoPorHora: arredondar(custoManutencaoPorHora),
    custoManutencaoRateado: arredondar(custoManutencaoRateado),
    custoProjeto: arredondar(custoProjeto),
    custoTotalBase: arredondar(custoTotalBase),
    tempoTotalHoras,
  };
}
