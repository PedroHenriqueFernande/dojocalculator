'use client';

import { useState } from 'react';
import { calcular } from '@/lib/calculo';
import type { Canal, ItemProjeto, PerfilEscassez } from '@/lib/calculo';
import { CANAIS_PADRAO, IMPRESSORAS, TARIFAS_ENERGIA } from '@/lib/dados';
import { CapacidadeProdutiva } from './capacidade-produtiva';
import { ComparativoCanais } from './comparativo-canais';
import { PainelResultado } from './painel-resultado';
import { SecaoImpressao } from './secao-impressao';
import { SecaoMaterial } from './secao-material';
import { SecaoPrecificacao } from './secao-precificacao';
import { SecaoProjeto } from './secao-projeto';

export interface EstadoCalculadora {
  precoRolo: number;
  pesoRolo: number;
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

const IMPRESSORA_INICIAL =
  IMPRESSORAS.find((i) => i.chave === 'bambu-lab-p1s') ?? IMPRESSORAS[0];
const UF_INICIAL = TARIFAS_ENERGIA.find((t) => t.uf === 'SP') ?? TARIFAS_ENERGIA[0];

// A tela nunca nasce zerada: quem acabou de comprar vê um resultado válido
// antes de digitar qualquer coisa.
const ESTADO_INICIAL: EstadoCalculadora = {
  precoRolo: 89.9,
  pesoRolo: 1000,
  pesoGramas: 42,
  impressoraChave: IMPRESSORA_INICIAL.chave,
  precoCompraImpressora: IMPRESSORA_INICIAL.precoCompra,
  vidaUtilHorasImpressora: IMPRESSORA_INICIAL.vidaUtilHoras,
  custoManutencaoMes: IMPRESSORA_INICIAL.custoManutencaoMes,
  consumoKwh: IMPRESSORA_INICIAL.consumoKwh,
  uf: UF_INICIAL.uf,
  custoKwh: UF_INICIAL.tarifa,
  tempoImpressaoMin: 200,
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

  const precoKg = estado.pesoRolo > 0 ? (estado.precoRolo / estado.pesoRolo) * 1000 : 0;

  const resultado = calcular({
    precoKg,
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-44 lg:px-8 lg:pb-10">
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
          <SecaoMaterial estado={estado} alterar={alterar} precoKg={precoKg} />
          <SecaoImpressao estado={estado} alterar={alterar} setEstado={setEstado} />
          <SecaoProjeto estado={estado} alterar={alterar} />
          <SecaoPrecificacao
            estado={estado}
            alterar={alterar}
            markupConsumidor={resultado.markupConsumidor}
            markupLojista={resultado.markupLojista}
          />
        </div>

        <div className="lg:sticky lg:top-6">
          <PainelResultado canal={canalAtivo} quantidade={estado.quantidade} />
        </div>
      </div>

      <ComparativoCanais
        canais={estado.canais}
        resultados={resultado.canais}
        canalAtivo={estado.canalAtivo}
        onSelecionar={(id) => alterar('canalAtivo', id)}
        onAlterarCanal={(id, mudanca) =>
          alterar(
            'canais',
            estado.canais.map((c) => (c.id === id ? { ...c, ...mudanca } : c)),
          )
        }
      />

      {canalAtivo.capacidade && (
        <CapacidadeProdutiva capacidade={canalAtivo.capacidade} />
      )}
    </main>
  );
}
