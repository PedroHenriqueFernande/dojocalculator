import { useId } from 'react';

interface SelectProps extends Omit<React.ComponentProps<'select'>, 'className'> {
  label: string;
  opcoes: Array<{ valor: string; rotulo: string }>;
}

export function Select({ label, opcoes, ...props }: SelectProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {label}
      </label>
      <select
        {...props}
        id={id}
        className="w-full rounded-campo border-[1.5px] border-tinta bg-papel px-2 py-1.5 text-sm outline-none focus:shadow-[2px_2px_0_var(--color-vermelho)]"
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}
