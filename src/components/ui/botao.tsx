interface BotaoProps extends Omit<React.ComponentProps<'button'>, 'className'> {
  variante?: 'primario' | 'secundario';
}

export function Botao({ variante = 'primario', type = 'button', ...props }: BotaoProps) {
  const base =
    'rounded-campo border-[1.5px] border-tinta px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-transform active:translate-x-[2px] active:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermelho';

  const estilo =
    variante === 'primario'
      ? 'bg-tinta text-papel shadow-[3px_3px_0_var(--color-vermelho)] active:shadow-[1px_1px_0_var(--color-vermelho)]'
      : 'bg-papel text-tinta shadow-[3px_3px_0_var(--color-tinta)] active:shadow-[1px_1px_0_var(--color-tinta)]';

  return <button {...props} type={type} className={`${base} ${estilo}`} />;
}
