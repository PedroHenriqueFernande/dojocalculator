'use client';

import { totalDoItem } from '@/lib/calculo';
import type { ItemProjeto } from '@/lib/calculo';
import { formatarMoeda } from '@/lib/formato';
import type { Alterar, EstadoCalculadora } from './calculadora';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';

interface Props {
  estado: EstadoCalculadora;
  alterar: Alterar;
}

export function SecaoProjeto({ estado, alterar }: Props) {
  const alterarItem = (indice: number, mudanca: Partial<ItemProjeto>) =>
    alterar(
      'itensProjeto',
      estado.itensProjeto.map((item, i) => (i === indice ? { ...item, ...mudanca } : item)),
    );

  const total = estado.itensProjeto.reduce((soma, item) => soma + totalDoItem(item), 0);

  return (
    <Painel titulo="Custos do projeto">
      {estado.itensProjeto.length === 0 && (
        <p className="mb-3 text-[11px] leading-snug text-tinta-3">
          Caixa, ímã, parafuso, tinta, etiqueta — o que entra na peça além do filamento.
        </p>
      )}

      {estado.itensProjeto.map((item, indice) => (
        <div
          key={indice}
          className="mb-2 grid grid-cols-[1fr_7rem_4rem_auto] items-end gap-2"
        >
          <Campo
            label="Item"
            ocultarLabel={indice > 0}
            placeholder="Embalagem"
            value={item.nome}
            onChange={(e) => alterarItem(indice, { nome: e.target.value })}
          />
          <CampoMoeda
            label="Valor"
            ocultarLabel={indice > 0}
            valor={item.valorUnitario}
            onChange={(valor) => alterarItem(indice, { valorUnitario: valor })}
          />
          <Campo
            label="Qtd."
            ocultarLabel={indice > 0}
            inputMode="numeric"
            value={item.quantidade}
            onChange={(e) =>
              alterarItem(indice, {
                quantidade: Math.max(Number(e.target.value) || 1, 1),
              })
            }
          />
          <button
            type="button"
            aria-label={`Remover ${item.nome || `item ${indice + 1}`}`}
            onClick={() =>
              alterar(
                'itensProjeto',
                estado.itensProjeto.filter((_, i) => i !== indice),
              )
            }
            className="mb-1.5 px-2 text-tinta-2 hover:text-vermelho focus-visible:outline focus-visible:outline-2 focus-visible:outline-vermelho"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="mt-3 flex items-center justify-between border-t-[1.5px] border-tinta pt-2">
        <button
          type="button"
          onClick={() =>
            alterar('itensProjeto', [
              ...estado.itensProjeto,
              { nome: '', valorUnitario: 0, quantidade: 1 },
            ])
          }
          className="text-[11px] font-semibold uppercase tracking-wider text-vermelho hover:text-vermelho-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vermelho"
        >
          + Adicionar item
        </button>
        <span className="numero font-mono text-sm font-semibold">
          {formatarMoeda(total)}
        </span>
      </div>

      <div className="mt-4 border-t-[1.5px] border-dashed border-tinta-3 pt-3">
        <CampoMoeda
          label="Frete que você repassa ao cliente"
          ajuda="Entra no preço final sem gerar lucro."
          valor={estado.valorFrete}
          onChange={(valor) => alterar('valorFrete', valor)}
        />
      </div>
    </Painel>
  );
}
