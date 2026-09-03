import { useId } from 'react';

interface CampoProps extends Omit<React.ComponentProps<'input'>, 'className'> {
  label: string;
  /**
   * Esconde o rótulo visualmente sem tirá-lo do leitor de tela. Usado nas
   * linhas repetidas da lista de custos do projeto, onde a primeira linha já
   * nomeia a coluna. O label continua existindo e continua associado.
   */
  ocultarLabel?: boolean;
  sufixo?: string;
  ajuda?: string;
}

export function Campo({ label, ocultarLabel, sufixo, ajuda, ...props }: CampoProps) {
  const id = useId();
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;

  return (
    <div>
      <label htmlFor={id} className={ocultarLabel ? 'sr-only' : 'rotulo'}>
        {label}
      </label>
      <div className="flex items-center rounded-campo border-[1.5px] border-tinta bg-papel focus-within:shadow-[2px_2px_0_var(--color-vermelho)]">
        <input
          {...props}
          id={id}
          aria-describedby={idAjuda}
          className="w-full min-w-0 bg-transparent px-2 py-1.5 font-mono text-sm outline-none"
        />
        {sufixo && (
          <span aria-hidden className="shrink-0 px-2 text-[11px] text-tinta-3">
            {sufixo}
          </span>
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
