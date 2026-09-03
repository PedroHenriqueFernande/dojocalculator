export type PerfilEscassez = 'DEMANDA_PADRAO' | 'PROJETO_EXCLUSIVO' | 'SAZONAL';
export type TipoCanal = 'DIRETA' | 'SHOPEE' | 'MERCADOLIVRE';

export interface ItemProjeto {
  nome: string;
  valorUnitario: number;
  quantidade: number;
}

export interface Filamento {
  precoKg: number;
  pesoGramas: number;
}

export interface FaixaTaxaFixa {
  precoMinimo: number;
  precoMaximo: number;
  taxaFixa: number;
  ehPercentual: boolean;
  valorPercentual: number | null;
}

export interface Canal {
  id: TipoCanal;
  nome: string;
  taxaMarket: number;
  taxaFixa: number;
  taxaFixaTipo: 'VALOR' | 'PERCENTUAL';
  faixasTaxaFixa?: FaixaTaxaFixa[];
  freteGratisShopee?: boolean;
}

export interface EntradaCalculo {
  filamentos: Filamento[];
  quantidade: number;
  tempoImpressaoMin: number;
  precoCompraImpressora: number;
  vidaUtilHorasImpressora: number;
  custoManutencaoMes: number;
  consumoKwh: number;
  custoKwh: number;
  itensProjeto: ItemProjeto[];
  percentualFalha: number;
  valorFrete: number;
  perfilEscassez: PerfilEscassez;
  ajusteMarkup: number;
  impostoPercentual: number;
  taxaPagamentoPercentual: number;
  canais: Canal[];
}

export interface CustoBase {
  custoMaterial: number;
  custoEnergia: number;
  custoAmortizacao: number;
  amortizacaoHora: number;
  custoManutencaoPorHora: number;
  custoManutencaoRateado: number;
  custoProjeto: number;
  custoTotalBase: number;
  tempoTotalHoras: number;
}

export interface PrecoCanal {
  taxaMarket: number;
  valorTaxaMarket: number;
  taxaFixa: number;
  impostoPercentual: number;
  valorImposto: number;
  taxaPagamentoPercentual: number;
  valorTaxaPagamento: number;
  totalTaxas: number;
  percentualTaxas: number;
  markup: number;
  percentualFalha: number;
  valorFalha: number;
  valorFrete: number;
  precoVendaSemFalha: number;
  precoVendaSemFrete: number;
  precoVenda: number;
  lucroLiquido: number;
}

export type ResultadoCanal =
  | { ok: true; preco: PrecoCanal }
  | { ok: false; motivo: string };

export interface ResumoUnitario {
  material: number;
  energia: number;
  amortizacao: number;
  manutencao: number;
  projeto: number;
  falhas: number;
  frete: number;
  taxasCanal: number;
  totalCustos: number;
  precoFinal: number;
  lucroLiquido: number;
}

export interface ItemCascata {
  label: string;
  valor: number;
  tipo: 'receita' | 'deducao' | 'custo' | 'resultado';
}

export interface Capacidade {
  lucroPorPeca: number;
  lucroPorHora: number;
  pecasPorDia: number;
  lucroPorDia: number;
  potencialMensal: number;
  horasUteisConsideradas: number;
  diasUteisConsiderados: number;
}

export interface ResultadoDoCanal {
  canalId: TipoCanal;
  canalNome: string;
  consumidor: ResultadoCanal;
  lojista: ResultadoCanal;
  resumoConsumidor: ResumoUnitario | null;
  resumoLojista: ResumoUnitario | null;
  cascata: ItemCascata[];
  capacidade: Capacidade | null;
}

export interface Resultado {
  custoBase: CustoBase;
  markupConsumidor: number;
  markupLojista: number;
  canais: ResultadoDoCanal[];
}
