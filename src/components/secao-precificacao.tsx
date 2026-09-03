'use client';

import type { PerfilEscassez } from '@/lib/calculo';
import type { Alterar, EstadoCalculadora } from './calculadora';
import { Campo } from './ui/campo';
import { Painel } from './ui/painel';
import { Select } from './ui/select';

const PERFIS: Array<{ valor: PerfilEscassez; rotulo: string; explicacao: string }> = [
  {
    valor: 'DEMANDA_PADRAO',
    rotulo: 'Demanda padrão',
    explicacao: 'Peça de catálogo, que qualquer um consegue imprimir.',
  },
  {
    valor: 'PROJETO_EXCLUSIVO',
    rotulo: 'Projeto exclusivo',
    explicacao: 'Modelagem sua ou sob encomenda. Vale mais porque só você faz.',
  },
  {
    valor: 'SAZONAL',
    rotulo: 'Sazonal',
    explicacao: 'Natal, Dia das Mães, evento com data marcada.',
  },
];

interface Props {
  estado: EstadoCalculadora;
  alterar: Alterar;
  markupConsumidor: number;
  markupLojista: number;
}

export function SecaoPrecificacao({
  estado,
  alterar,
  markupConsumidor,
  markupLojista,
}: Props) {
  const perfil = PERFIS.find((p) => p.valor === estado.perfilEscassez) ?? PERFIS[0];

  return (
    <Painel titulo="Precificação">
      <Select
        label="Tipo de peça"
        value={estado.perfilEscassez}
        onChange={(e) => alterar('perfilEscassez', e.target.value as PerfilEscassez)}
        opcoes={PERFIS.map((p) => ({ valor: p.valor, rotulo: p.rotulo }))}
      />
      <p className="mt-1 text-[10px] leading-snug text-tinta-3">{perfil.explicacao}</p>

      <div className="mt-3">
        <label htmlFor="ajuste-markup" className="rotulo">
          Ajuste de markup
        </label>
        <div className="flex items-center gap-3">
          <input
            id="ajuste-markup"
            type="range"
            min={1}
            max={2}
            step={0.05}
            value={estado.ajusteMarkup}
            onChange={(e) => alterar('ajusteMarkup', Number(e.target.value))}
            className="h-1 flex-1 accent-vermelho"
          />
          <span className="numero w-14 text-right font-mono text-sm">
            {estado.ajusteMarkup.toFixed(2)}×
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-snug text-tinta-3">
          Multiplicador final: {markupConsumidor.toFixed(2)}× no consumidor,{' '}
          {markupLojista.toFixed(2)}× no lojista.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Campo
          label="Imposto"
          sufixo="%"
          inputMode="decimal"
          ajuda="MEI costuma deixar em 0."
          value={estado.impostoPercentual}
          onChange={(e) =>
            alterar(
              'impostoPercentual',
              Math.min(Math.max(Number(e.target.value) || 0, 0), 100),
            )
          }
        />
        <Campo
          label="Taxa de pagamento"
          sufixo="%"
          inputMode="decimal"
          ajuda="Maquininha, Pix com taxa, gateway."
          value={estado.taxaPagamentoPercentual}
          onChange={(e) =>
            alterar(
              'taxaPagamentoPercentual',
              Math.min(Math.max(Number(e.target.value) || 0, 0), 100),
            )
          }
        />
      </div>
    </Painel>
  );
}
