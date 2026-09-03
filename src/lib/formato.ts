const MOEDA = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const DECIMAL = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatarMoeda(entrada: number, opcoes?: { simbolo?: boolean }): string {
  // O contrato aqui é formatar um valor em dinheiro. NaN e Infinity não são
  // valores em dinheiro, e a saída do Intl para eles é a string "NaN" — que
  // numa calculadora de preço é pior do que qualquer número. Vira zero.
  const valor = Number.isFinite(entrada) ? entrada : 0;

  if (opcoes?.simbolo === false) return DECIMAL.format(valor);

  // Intl separa "R$" do número com espaço inquebrável (U+00A0). Trocamos por
  // espaço comum para o texto poder ser copiado, comparado e relido por lerMoeda.
  return MOEDA.format(valor).replace(/ /g, ' ');
}

/**
 * Aceita o que a pessoa realmente digita ou cola: "1234,5", "R$ 1.234,50",
 * "89.90". Quando existe vírgula, o ponto é separador de milhar; quando não
 * existe, o ponto é o decimal.
 */
export function lerMoeda(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, '').trim();
  if (!limpo) return null;

  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo;

  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

export function formatarTempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = Math.round(minutos % 60);

  if (horas === 0) return `${resto}min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h ${resto}min`;
}

export function formatarPercentual(valor: number): string {
  const texto = Number.isInteger(valor)
    ? String(valor)
    : valor
        .toFixed(2)
        .replace(/0+$/, '')
        .replace(/\.$/, '')
        .replace('.', ',');

  return `${texto}%`;
}
