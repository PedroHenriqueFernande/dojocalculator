import type { Capacidade } from '@/lib/calculo';
import { formatarMoeda } from '@/lib/formato';

export function CapacidadeProdutiva({ capacidade }: { capacidade: Capacidade }) {
  if (capacidade.pecasPorDia === 0) return null;

  return (
    <section className="painel mt-6 p-4" aria-label="Capacidade produtiva">
      <h3 className="titulo-painel mb-3">Se você produzir isso o mês inteiro</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica
          rotulo="Lucro por hora de impressora"
          valor={formatarMoeda(capacidade.lucroPorHora)}
        />
        <Metrica
          rotulo="Por dia"
          valor={formatarMoeda(capacidade.lucroPorDia)}
          nota={`${capacidade.pecasPorDia} ${capacidade.pecasPorDia === 1 ? 'peça' : 'peças'}`}
        />
        <Metrica
          rotulo="Potencial no mês"
          valor={formatarMoeda(capacidade.potencialMensal)}
        />
      </div>

      <p className="mt-3 text-[10px] leading-snug text-tinta-3">
        Considerando {capacidade.horasUteisConsideradas}h de impressão por dia e{' '}
        {capacidade.diasUteisConsiderados} dias no mês, com a impressora sempre ocupada
        por esta peça.
      </p>
    </section>
  );
}

function Metrica({
  rotulo,
  valor,
  nota,
}: {
  rotulo: string;
  valor: string;
  nota?: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-tinta-2">
        {rotulo}
      </p>
      <p className="numero font-display text-xl font-bold leading-tight">{valor}</p>
      {nota && <p className="text-[10px] text-tinta-3">{nota}</p>}
    </div>
  );
}
