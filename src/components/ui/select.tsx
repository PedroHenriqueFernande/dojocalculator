'use client';

import { useEffect, useId, useRef, useState } from 'react';

/** Combina com max-h-60 na lista; usado para decidir se ela cabe abaixo. */
const ALTURA_MAXIMA_LISTA = 240;

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface SelectProps {
  label: string;
  value: string;
  opcoes: OpcaoSelect[];
  onChange: (valor: string) => void;
  ajuda?: string;
}

/**
 * Listbox próprio em vez de <select> nativo.
 *
 * O gatilho do select nativo até aceita estilo, mas a lista aberta é desenhada
 * pelo sistema operacional e não há CSS que a alcance de forma confiável — era
 * o único pedaço da tela fora da identidade. Aqui a lista é DOM comum.
 *
 * Trocar o nativo por um botão significa reimplementar o que ele dava de
 * graça, então está tudo aqui: papéis ARIA de combobox e listbox, setas,
 * Home/End, Enter, Escape, Tab, busca por digitação (essencial na lista de 27
 * estados), rolagem acompanhando a opção ativa, clique fora e devolução do
 * foco ao gatilho ao fechar.
 */
export function Select({ label, value, opcoes, onChange, ajuda }: SelectProps) {
  const id = useId();
  const idRotulo = `${id}-rotulo`;
  const idValor = `${id}-valor`;
  const idLista = `${id}-lista`;
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;
  const idOpcao = (indice: number) => `${id}-opcao-${indice}`;

  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const [paraCima, setParaCima] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gatilhoRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const busca = useRef({ texto: '', em: 0 });

  const indiceSelecionado = opcoes.findIndex((opcao) => opcao.valor === value);
  const selecionada = opcoes[indiceSelecionado];

  useEffect(() => {
    if (!aberto) return;

    const aoApontarFora = (evento: PointerEvent) => {
      if (!containerRef.current?.contains(evento.target as Node)) setAberto(false);
    };

    document.addEventListener('pointerdown', aoApontarFora);
    return () => document.removeEventListener('pointerdown', aoApontarFora);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    listaRef.current?.children[ativo]?.scrollIntoView({ block: 'nearest' });
  }, [aberto, ativo]);

  const abrir = () => {
    // Perto do rodapé — no celular, quase sempre — a lista não cabe abaixo do
    // gatilho e sairia da tela. Medimos na hora de abrir e viramos para cima
    // quando o espaço de cima for maior.
    const caixa = gatilhoRef.current?.getBoundingClientRect();
    if (caixa) {
      const espacoAbaixo = window.innerHeight - caixa.bottom;
      setParaCima(espacoAbaixo < ALTURA_MAXIMA_LISTA + 8 && caixa.top > espacoAbaixo);
    }

    setAtivo(Math.max(indiceSelecionado, 0));
    setAberto(true);
  };

  const escolher = (indice: number) => {
    const opcao = opcoes[indice];
    if (opcao) onChange(opcao.valor);
    setAberto(false);
    gatilhoRef.current?.focus();
  };

  /**
   * Digitar "sa" salta para Santa Catarina. O buffer expira comparando o
   * instante da tecla anterior, sem temporizador para limpar depois.
   */
  const buscarPorTexto = (tecla: string) => {
    const agora = Date.now();
    busca.current.texto =
      agora - busca.current.em > 500 ? tecla : busca.current.texto + tecla;
    busca.current.em = agora;

    const alvo = busca.current.texto.toLowerCase();
    const encontrado = opcoes.findIndex((opcao) =>
      opcao.rotulo.toLowerCase().startsWith(alvo),
    );
    if (encontrado < 0) return;

    setAtivo(encontrado);
    if (!aberto) onChange(opcoes[encontrado].valor);
  };

  const aoTeclar = (evento: React.KeyboardEvent) => {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();

      if (!aberto) {
        abrir();
        return;
      }

      const passo = evento.key === 'ArrowDown' ? 1 : -1;
      setAtivo((atual) =>
        Math.min(Math.max(atual + passo, 0), opcoes.length - 1),
      );
      return;
    }

    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      if (aberto) escolher(ativo);
      else abrir();
      return;
    }

    if (aberto && evento.key === 'Home') {
      evento.preventDefault();
      setAtivo(0);
      return;
    }

    if (aberto && evento.key === 'End') {
      evento.preventDefault();
      setAtivo(opcoes.length - 1);
      return;
    }

    if (aberto && evento.key === 'Escape') {
      evento.preventDefault();
      setAberto(false);
      return;
    }

    if (evento.key === 'Tab') {
      setAberto(false);
      return;
    }

    if (evento.key.length === 1 && !evento.metaKey && !evento.ctrlKey) {
      buscarPorTexto(evento.key);
    }
  };

  return (
    <div className="min-w-0" ref={containerRef}>
      <span id={idRotulo} className="rotulo">
        {label}
      </span>

      <div className="relative">
        <button
          ref={gatilhoRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={aberto}
          aria-controls={aberto ? idLista : undefined}
          aria-activedescendant={aberto ? idOpcao(ativo) : undefined}
          aria-labelledby={`${idRotulo} ${idValor}`}
          aria-describedby={idAjuda}
          onClick={() => (aberto ? setAberto(false) : abrir())}
          onKeyDown={aoTeclar}
          className="flex w-full items-center justify-between gap-2 rounded-campo border-[1.5px] border-tinta bg-papel px-2 py-1.5 text-left text-sm outline-none focus-visible:shadow-[2px_2px_0_var(--color-vermelho)]"
        >
          <span id={idValor} className="truncate">
            {selecionada?.rotulo ?? ''}
          </span>
          <svg
            viewBox="0 0 10 6"
            aria-hidden
            className={`h-[6px] w-[10px] shrink-0 transition-transform duration-150 ${
              aberto ? 'rotate-180' : ''
            }`}
          >
            <path d="M0 0h10L5 6z" fill="currentColor" />
          </svg>
        </button>

        {aberto && (
          <ul
            ref={listaRef}
            id={idLista}
            role="listbox"
            aria-labelledby={idRotulo}
            className={`absolute inset-x-0 z-30 max-h-60 ${
              paraCima ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'
            } overflow-y-auto rounded-campo border-[1.5px] border-tinta bg-papel shadow-[3px_3px_0_var(--color-tinta)]`}
          >
            {opcoes.map((opcao, indice) => {
              const estaSelecionada = opcao.valor === value;
              const estaAtiva = indice === ativo;

              return (
                <li
                  key={opcao.valor}
                  id={idOpcao(indice)}
                  role="option"
                  aria-selected={estaSelecionada}
                  onPointerEnter={() => setAtivo(indice)}
                  onClick={() => escolher(indice)}
                  // A barra vermelha marca o valor atual por sombra interna, e
                  // não por borda, para a lista não deslocar o texto ao mudar
                  // de seleção.
                  className={`cursor-pointer px-2 py-1.5 text-sm ${
                    estaAtiva ? 'bg-tinta text-papel' : 'text-tinta'
                  } ${
                    estaSelecionada
                      ? 'font-semibold shadow-[inset_3px_0_0_var(--color-vermelho)]'
                      : ''
                  }`}
                >
                  {opcao.rotulo}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {ajuda && (
        <p id={idAjuda} className="mt-1 text-[10px] leading-snug text-tinta-3">
          {ajuda}
        </p>
      )}
    </div>
  );
}
