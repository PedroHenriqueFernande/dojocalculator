'use client';

import { useState } from 'react';
import type { ResultadoDoCanal } from '@/lib/calculo';
import { formatarMoeda } from '@/lib/formato';
import { Botao } from './ui/botao';

interface Props {
  canal: ResultadoDoCanal;
  quantidade: number;
  /** Nada preenchido ainda: não há peça para precificar. */
  semCusto: boolean;
}

type EstadoCopia =
  | { status: 'copiado'; valor: number }
  | { status: 'erro'; mensagem: string }
  | null;

/**
 * O mesmo componente serve à coluna da direita no desktop e à barra fixa no
 * rodapé do mobile — só o posicionamento muda. Dois componentes renderizando
 * o mesmo preço divergiriam na primeira alteração.
 */
export function PainelResultado({ canal, quantidade, semCusto }: Props) {
  const [aberto, setAberto] = useState(false);
  const [copia, setCopia] = useState<EstadoCopia>(null);

  const posicao =
    'fixed inset-x-0 bottom-0 z-10 max-h-[70vh] overflow-y-auto rounded-none border-x-0 border-b-0 shadow-none lg:static lg:max-h-none lg:overflow-visible lg:rounded-painel lg:border-[1.5px] lg:shadow-[4px_4px_0_var(--color-tinta)]';

  /*
   * Com custo zero a fórmula ainda devolve preço — a taxa fixa do canal
   * precisa ser coberta de qualquer jeito, e no Mercado Livre isso dispara a
   * regra dos R$ 12,50 e produz um "lucro" que é só artefato do gross-up.
   * Está certo como matemática e é enganoso como tela, então enquanto não há
   * peça para precificar não há preço para mostrar.
   */
  if (semCusto) {
    return (
      <section className={`painel p-4 ${posicao}`} aria-label="Resultado do cálculo">
        <h2 className="titulo-painel mb-2 text-tinta-2">Seu preço aparece aqui</h2>
        <p className="text-xs leading-relaxed text-tinta-2">
          Preencha o <strong>preço do filamento</strong>, o <strong>peso da peça</strong> e
          o <strong>tempo de impressão</strong>. O cálculo acompanha cada tecla.
        </p>
      </section>
    );
  }

  if (!canal.consumidor.ok) {
    return (
      <section className={`painel border-vermelho p-4 ${posicao}`} role="alert">
        <h2 className="titulo-painel mb-2 text-vermelho">Sem preço possível</h2>
        <p className="text-xs leading-relaxed text-tinta-2">{canal.consumidor.motivo}</p>
      </section>
    );
  }

  const resumo = canal.resumoConsumidor;
  const lojista = canal.lojista.ok ? canal.resumoLojista : null;
  if (!resumo) return null;

  const margem =
    resumo.precoFinal > 0 ? Math.round((resumo.lucroLiquido / resumo.precoFinal) * 100) : 0;

  // A confirmação vale para o valor que foi copiado, não para um intervalo de
  // tempo: mexeu em qualquer campo, o preço muda e o rótulo volta sozinho.
  // Evita temporizador e evita atualizar estado de componente desmontado.
  const copiadoAgora = copia?.status === 'copiado' && copia.valor === resumo.precoFinal;

  const copiarPreco = async () => {
    const texto = formatarMoeda(resumo.precoFinal);

    if (!navigator.clipboard) {
      setCopia({
        status: 'erro',
        mensagem: 'Seu navegador não libera a cópia automática. Selecione o valor e copie.',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(texto);
      setCopia({ status: 'copiado', valor: resumo.precoFinal });
    } catch {
      setCopia({
        status: 'erro',
        mensagem: 'Não deu para copiar. Selecione o valor e copie na mão.',
      });
    }
  };

  return (
    <section className={`painel p-4 ${posicao}`} aria-label="Resultado do cálculo">
      <div className="rounded-campo bg-vermelho p-3 text-papel">
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] opacity-85">
          Consumidor final{quantidade > 1 && ' · por peça'}
        </p>
        <p className="numero font-display text-3xl font-bold leading-tight">
          {formatarMoeda(resumo.precoFinal)}
        </p>
        <p className="text-[10px] opacity-85">
          lucro {formatarMoeda(resumo.lucroLiquido)} · {margem}%
        </p>
      </div>

      {lojista && (
        <div className="mt-2 flex items-baseline justify-between border-[1.5px] border-tinta px-3 py-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-tinta-2">
            Lojista
          </span>
          <span className="numero font-display text-lg font-bold">
            {formatarMoeda(lojista.precoFinal)}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <Botao onClick={copiarPreco} aria-live="polite">
          {copiadoAgora ? 'Copiado' : 'Copiar preço'}
        </Botao>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="text-[10px] font-semibold uppercase tracking-wider text-vermelho focus-visible:outline focus-visible:outline-2 focus-visible:outline-vermelho lg:hidden"
        >
          {aberto ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>
      </div>

      {copia?.status === 'erro' && (
        <p role="alert" className="mt-2 text-[10px] leading-snug text-vermelho">
          {copia.mensagem}
        </p>
      )}

      <div className={`${aberto ? 'block' : 'hidden'} lg:block`}>
        <dl className="mt-3 border-t-[1.5px] border-tinta pt-2">
          <Linha termo="Material" valor={resumo.material} />
          <Linha termo="Energia" valor={resumo.energia} />
          <Linha termo="Amortização" valor={resumo.amortizacao} />
          <Linha termo="Manutenção" valor={resumo.manutencao} />
          {resumo.projeto > 0 && <Linha termo="Custos do projeto" valor={resumo.projeto} />}
          {resumo.falhas > 0 && <Linha termo="Reserva para falhas" valor={resumo.falhas} />}
          {resumo.taxasCanal > 0 && (
            <Linha termo="Taxas do canal" valor={resumo.taxasCanal} />
          )}
          {resumo.frete > 0 && <Linha termo="Frete" valor={resumo.frete} />}

          <div className="mt-1 flex justify-between border-t-[1.5px] border-tinta pt-1 text-[11px] font-bold">
            <dt>Custo total</dt>
            <dd className="numero font-mono">{formatarMoeda(resumo.totalCustos)}</dd>
          </div>
        </dl>

        {canal.cascata.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-tinta-2">
              Como o preço vira lucro
            </summary>
            <dl className="mt-2">
              {canal.cascata.map((item, indice) => (
                <div key={indice} className="flex justify-between gap-3 py-0.5 text-[10px]">
                  <dt
                    className={
                      item.tipo === 'resultado' ? 'font-bold' : 'text-tinta-2'
                    }
                  >
                    {item.label}
                  </dt>
                  <dd
                    className={`numero shrink-0 font-mono ${
                      item.tipo === 'resultado' ? 'font-bold' : 'text-tinta-2'
                    }`}
                  >
                    {formatarMoeda(item.valor)}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>
    </section>
  );
}

function Linha({ termo, valor }: { termo: string; valor: number }) {
  return (
    <div className="flex justify-between py-0.5 text-[10px]">
      <dt className="text-tinta-2">{termo}</dt>
      <dd className="numero font-mono">{formatarMoeda(valor)}</dd>
    </div>
  );
}
