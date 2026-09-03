interface PainelProps {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}

export function Painel({ titulo, children, className = '' }: PainelProps) {
  return (
    <section className={`painel p-4 ${className}`}>
      <h2 className="titulo-painel mb-3">{titulo}</h2>
      {children}
    </section>
  );
}
