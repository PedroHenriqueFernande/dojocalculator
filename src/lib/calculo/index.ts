import { calcularCustoBase } from './custo';
import { calcularMarkup, calcularPrecoCanal } from './preco';
import { calcularCapacidade, montarCascata, montarResumoUnitario } from './resultado';
import type { EntradaCalculo, Resultado, ResultadoDoCanal } from './tipos';

export * from './tipos';
export { arredondar, HORAS_FIXAS_MES, totalDoItem } from './custo';
export { MARKUPS_ESCASSEZ } from './preco';

export function calcular(entrada: EntradaCalculo): Resultado {
  const custoBase = calcularCustoBase(entrada);
  const markup = calcularMarkup(entrada.perfilEscassez, entrada.ajusteMarkup);

  const canais: ResultadoDoCanal[] = entrada.canais.map((canal) => {
    const comum = {
      custoTotalBase: custoBase.custoTotalBase,
      custoMaterial: custoBase.custoMaterial,
      canal,
      impostoPercentual: entrada.impostoPercentual,
      taxaPagamentoPercentual: entrada.taxaPagamentoPercentual,
      percentualFalha: entrada.percentualFalha,
      valorFrete: entrada.valorFrete,
    };

    const consumidor = calcularPrecoCanal({ ...comum, markup: markup.consumidor });
    const lojista = calcularPrecoCanal({ ...comum, markup: markup.lojista });

    return {
      canalId: canal.id,
      canalNome: canal.nome,
      consumidor,
      lojista,
      resumoConsumidor: consumidor.ok
        ? montarResumoUnitario(custoBase, consumidor.preco, entrada.quantidade)
        : null,
      resumoLojista: lojista.ok
        ? montarResumoUnitario(custoBase, lojista.preco, entrada.quantidade)
        : null,
      cascata: consumidor.ok
        ? montarCascata(custoBase, consumidor.preco, canal.nome)
        : [],
      capacidade: consumidor.ok
        ? calcularCapacidade(
            entrada.tempoImpressaoMin,
            entrada.quantidade,
            consumidor.preco.lucroLiquido,
          )
        : null,
    };
  });

  return {
    custoBase,
    markupConsumidor: markup.consumidor,
    markupLojista: markup.lojista,
    canais,
  };
}
