'use client';

import type { Canal, ResultadoDoCanal } from '@/lib/calculo';
import { formatarMoeda } from '@/lib/formato';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';

interface Props {
  canais: Canal[];
  resultados: ResultadoDoCanal[];
  canalAtivo: string;
  onSelecionar: (id: string) => void;
  onAlterarCanal: (id: string, mudanca: Partial<Canal>) => void;
}

export function ComparativoCanais({
  canais,
  resultados,
  canalAtivo,
  onSelecionar,
  onAlterarCanal,
}: Props) {
  const ativo = canais.find((c) => c.id === canalAtivo);

  return (
    <section aria-label="Canais de venda">
      <h2 className="titulo-painel mb-2 text-tinta-2">Onde você vende</h2>

      <div className="mb-3 flex flex-wrap gap-2">
        {resultados.map((resultado) => {
          const selecionado = resultado.canalId === canalAtivo;

          return (
            <button
              key={resultado.canalId}
              type="button"
              aria-pressed={selecionado}
              onClick={() => onSelecionar(resultado.canalId)}
              className={`rounded-campo border-[1.5px] border-tinta px-3 py-1.5 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermelho ${
                selecionado ? 'bg-tinta text-papel' : 'bg-papel text-tinta'
              }`}
            >
              {resultado.canalNome}
            </button>
          );
        })}
      </div>

      {/*
        Linhas, não cards lado a lado: os preços ficam alinhados na mesma
        coluna, e comparar três valores empilhados é mais rápido do que
        varrer três caixas na horizontal.
      */}
      <div className="grid gap-2">
        {resultados.map((resultado) => (
          <div
            key={resultado.canalId}
            className="card-canal flex items-center justify-between gap-3 px-3 py-2"
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.09em] text-tinta-2">
              {resultado.canalNome}
            </span>

            {resultado.consumidor.ok && resultado.resumoConsumidor ? (
              <span className="flex items-baseline gap-2 text-right">
                <span className="text-[10px] text-tinta-2">
                  lucro {formatarMoeda(resultado.resumoConsumidor.lucroLiquido)}
                </span>
                <span className="numero font-display text-lg font-bold leading-tight">
                  {formatarMoeda(resultado.resumoConsumidor.precoFinal)}
                </span>
              </span>
            ) : (
              <span className="text-right text-[10px] leading-snug text-vermelho">
                sem preço possível
              </span>
            )}
          </div>
        ))}
      </div>

      {ativo && ativo.id !== 'DIRETA' && (
        <div className="painel mt-3 p-4">
          <h3 className="titulo-painel mb-3">Taxas · {ativo.nome}</h3>

          <div className="grid grid-cols-2 gap-3">
            <Campo
              label="Comissão"
              sufixo="%"
              inputMode="decimal"
              value={ativo.taxaMarket}
              onChange={(e) =>
                onAlterarCanal(ativo.id, {
                  taxaMarket: Math.min(Math.max(Number(e.target.value) || 0, 0), 100),
                })
              }
            />
            <CampoMoeda
              label="Taxa fixa"
              valor={ativo.taxaFixa}
              onChange={(valor) => onAlterarCanal(ativo.id, { taxaFixa: valor })}
            />

            {ativo.id === 'SHOPEE' && (
              <label className="col-span-2 flex items-center gap-2 text-[11px] leading-snug">
                <input
                  type="checkbox"
                  checked={ativo.freteGratisShopee ?? false}
                  onChange={(e) =>
                    onAlterarCanal(ativo.id, { freteGratisShopee: e.target.checked })
                  }
                  className="accent-vermelho"
                />
                Programa de Frete Grátis (+6%)
              </label>
            )}
          </div>

          <p className="mt-2 text-[10px] leading-snug text-tinta-3">
            Valores de referência de setembro de 2026. Confira a tabela atual da
            plataforma — elas mudam.
          </p>
        </div>
      )}
    </section>
  );
}
