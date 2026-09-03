'use client';

import type { Alterar, EstadoCalculadora } from './calculadora';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';

interface Props {
  estado: EstadoCalculadora;
  alterar: Alterar;
}

export function SecaoMaterial({ estado, alterar }: Props) {
  const alterarFilamento = (
    id: string,
    mudanca: Partial<EstadoCalculadora['filamentos'][number]>,
  ) =>
    alterar(
      'filamentos',
      estado.filamentos.map((filamento) =>
        filamento.id === id ? { ...filamento, ...mudanca } : filamento,
      ),
    );

  const adicionarFilamento = () =>
    alterar('filamentos', [
      ...estado.filamentos,
      {
        id: globalThis.crypto.randomUUID(),
        precoKg: 0,
        pesoGramas: 0,
      },
    ]);

  return (
    <Painel titulo="Material">
      <div className="grid gap-3">
        {estado.filamentos.map((filamento, indice) => (
          <div
            key={filamento.id}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1.25rem] items-end gap-3"
          >
            <CampoMoeda
              label="Preço do filamento /kg"
              ajuda={
                indice === 0
                  ? 'Rolo de 1 kg? É o preço que você pagou nele.'
                  : undefined
              }
              valor={filamento.precoKg}
              onChange={(valor) =>
                alterarFilamento(filamento.id, { precoKg: valor })
              }
            />
            <Campo
              label="Peso da peça"
              sufixo="g"
              inputMode="decimal"
              ajuda={
                indice === 0
                  ? 'O fatiador mostra esse peso antes de imprimir.'
                  : undefined
              }
              value={filamento.pesoGramas}
              onChange={(evento) =>
                alterarFilamento(filamento.id, {
                  pesoGramas: Math.max(Number(evento.target.value) || 0, 0),
                })
              }
            />
            {indice > 0 && (
              <button
                type="button"
                aria-label={`Remover filamento ${indice + 1}`}
                onClick={() =>
                  alterar(
                    'filamentos',
                    estado.filamentos.filter((item) => item.id !== filamento.id),
                  )
                }
                className="mb-1.5 w-5 text-center text-tinta-2 hover:text-vermelho focus-visible:outline focus-visible:outline-2 focus-visible:outline-vermelho"
              >
                ×
              </button>
            )}
            {indice === 0 && <span aria-hidden className="w-5" />}
          </div>
        ))}
      </div>

      <div className="mt-3 border-t-[1.5px] border-tinta pt-2">
        <button
          type="button"
          onClick={adicionarFilamento}
          className="text-[11px] font-semibold uppercase tracking-wider text-vermelho hover:text-vermelho-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vermelho"
        >
          + Adicionar filamento
        </button>
      </div>
    </Painel>
  );
}
