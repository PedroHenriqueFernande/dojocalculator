'use client';

import { useState } from 'react';
import { calcular } from '@/lib/calculo';
import type { Canal, ItemProjeto, PerfilEscassez } from '@/lib/calculo';
import { CANAIS_PADRAO, TARIFA_PADRAO } from '@/lib/dados';
import { CapacidadeProdutiva } from './capacidade-produtiva';
import { ComparativoCanais } from './comparativo-canais';
import { PainelResultado } from './painel-resultado';
import { SecaoImpressao } from './secao-impressao';
import { SecaoMaterial } from './secao-material';
import { SecaoPrecificacao } from './secao-precificacao';
import { SecaoProjeto } from './secao-projeto';

export interface EstadoCalculadora {
  precoKg: number;
  pesoGramas: number;
  impressoraChave: string;
  precoCompraImpressora: number;
  vidaUtilHorasImpressora: number;
  custoManutencaoMes: number;
  consumoKwh: number;
  uf: string;
  custoKwh: number;
  tempoImpressaoMin: number;
  quantidade: number;
  percentualFalha: number;
  itensProjeto: ItemProjeto[];
  valorFrete: number;
  perfilEscassez: PerfilEscassez;
  ajusteMarkup: number;
  impostoPercentual: number;
  taxaPagamentoPercentual: number;
  canais: Canal[];
  canalAtivo: string;
}

export type Alterar = <C extends keyof EstadoCalculadora>(
  campo: C,
  valor: EstadoCalculadora[C],
) => void;

// Comeca zerada: a pessoa preenche com os numeros da peca dela. A unica
// excecao e a tarifa de energia, que parte da media nacional porque quase
// ninguem sabe o valor do kWh de cabeca — e ela e ajustavel pelo estado.
const ESTADO_INICIAL: EstadoCalculadora = {
  precoKg: 0,
  pesoGramas: 0,
  impressoraChave: '',
  precoCompraImpressora: 0,
  vidaUtilHorasImpressora: 0,
  custoManutencaoMes: 0,
  consumoKwh: 0,
  uf: '',
  custoKwh: TARIFA_PADRAO,
  tempoImpressaoMin: 0,
  quantidade: 1,
  percentualFalha: 0,
  itensProjeto: [],
  valorFrete: 0,
  perfilEscassez: 'DEMANDA_PADRAO',
  ajusteMarkup: 1,
  impostoPercentual: 0,
  taxaPagamentoPercentual: 0,
  canais: CANAIS_PADRAO,
  canalAtivo: 'DIRETA',
};

export function Calculadora() {
  const [estado, setEstado] = useState(ESTADO_INICIAL);

  const alterar: Alterar = (campo, valor) =>
    setEstado((atual) => ({ ...atual, [campo]: valor }));

  const resultado = calcular({
    precoKg: estado.precoKg,
    pesoGramas: estado.pesoGramas,
    quantidade: estado.quantidade,
    tempoImpressaoMin: estado.tempoImpressaoMin,
    precoCompraImpressora: estado.precoCompraImpressora,
    vidaUtilHorasImpressora: estado.vidaUtilHorasImpressora,
    custoManutencaoMes: estado.custoManutencaoMes,
    consumoKwh: estado.consumoKwh,
    custoKwh: estado.custoKwh,
    itensProjeto: estado.itensProjeto,
    percentualFalha: estado.percentualFalha,
    valorFrete: estado.valorFrete,
    perfilEscassez: estado.perfilEscassez,
    ajusteMarkup: estado.ajusteMarkup,
    impostoPercentual: estado.impostoPercentual,
    taxaPagamentoPercentual: estado.taxaPagamentoPercentual,
    canais: estado.canais,
  });

  const canalAtivo =
    resultado.canais.find((c) => c.canalId === estado.canalAtivo) ?? resultado.canais[0];

  const semCusto = resultado.custoBase.custoTotalBase === 0;

  return (
    // O padding inferior no mobile existe para o último bloco escapar da barra
    // fixa de preço, que mede 222px recolhida. 256px dá folga para as variações
    // dela (sem preço lojista, estado de erro) sem precisar medir em runtime.
    <main className="mx-auto max-w-6xl px-4 py-6 pb-64 lg:px-8 lg:pb-10">
      <header className="mb-6 flex items-center justify-between border-b-2 border-tinta pb-3">
        <h1 className="font-display text-lg font-bold tracking-tight">
          DOJO PANDA <span className="text-vermelho">・</span> 3D
        </h1>
        <span className="rounded-campo bg-vermelho px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-papel">
          Calculadora
        </span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="grid gap-5">
          <SecaoMaterial estado={estado} alterar={alterar} />
          <SecaoImpressao estado={estado} alterar={alterar} setEstado={setEstado} />
          <SecaoProjeto estado={estado} alterar={alterar} />
          <SecaoPrecificacao
            estado={estado}
            alterar={alterar}
            markupConsumidor={resultado.markupConsumidor}
            markupLojista={resultado.markupLojista}
          />
        </div>

        {/*
          A coluna da direita responde "quanto cobrar" — preço, composição do
          custo e o mesmo cálculo em cada canal. A da esquerda é "o que você
          tem". Juntar os canais aqui também elimina o vazio que sobrava
          embaixo do painel de resultado no desktop.
        */}
        <div className="grid gap-5">
          <div className="lg:sticky lg:top-6">
            <PainelResultado
              canal={canalAtivo}
              quantidade={estado.quantidade}
              semCusto={semCusto}
            />
          </div>

          <ComparativoCanais
            canais={estado.canais}
            resultados={resultado.canais}
            canalAtivo={estado.canalAtivo}
            semCusto={semCusto}
            onSelecionar={(id) => alterar('canalAtivo', id)}
            onAlterarCanal={(id, mudanca) =>
              alterar(
                'canais',
                estado.canais.map((c) => (c.id === id ? { ...c, ...mudanca } : c)),
              )
            }
          />
        </div>
      </div>

      {!semCusto && canalAtivo.capacidade && (
        <CapacidadeProdutiva capacidade={canalAtivo.capacidade} />
      )}
    </main>
  );
}
