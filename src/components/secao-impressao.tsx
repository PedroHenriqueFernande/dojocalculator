'use client';

import {
  IMPRESSORA_MANUAL,
  IMPRESSORAS,
  TARIFA_PADRAO,
  TARIFAS_ENERGIA,
} from '@/lib/dados';
import { formatarTempo } from '@/lib/formato';
import type { Alterar, EstadoCalculadora } from './calculadora';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';
import { Select } from './ui/select';

interface Props {
  estado: EstadoCalculadora;
  alterar: Alterar;
  setEstado: React.Dispatch<React.SetStateAction<EstadoCalculadora>>;
}

export function SecaoImpressao({ estado, alterar, setEstado }: Props) {
  const manual = estado.impressoraChave === IMPRESSORA_MANUAL;

  const trocarImpressora = (chave: string) => {
    const impressora = IMPRESSORAS.find((i) => i.chave === chave);

    setEstado((atual) => ({
      ...atual,
      impressoraChave: chave,
      ...(impressora && {
        precoCompraImpressora: impressora.precoCompra,
        vidaUtilHorasImpressora: impressora.vidaUtilHoras,
        custoManutencaoMes: impressora.custoManutencaoMes,
        consumoKwh: impressora.consumoKwh,
      }),
    }));
  };

  const trocarUf = (uf: string) => {
    const tarifa = TARIFAS_ENERGIA.find((t) => t.uf === uf);
    setEstado((atual) => ({ ...atual, uf, custoKwh: tarifa?.tarifa ?? TARIFA_PADRAO }));
  };

  return (
    <Painel titulo="Impressão">
      <Select
        label="Impressora"
        value={estado.impressoraChave}
        onChange={(e) => trocarImpressora(e.target.value)}
        opcoes={[
          ...IMPRESSORAS.map((i) => ({ valor: i.chave, rotulo: i.nome })),
          { valor: IMPRESSORA_MANUAL, rotulo: 'Outra impressora…' },
        ]}
      />

      {manual && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t-[1.5px] border-dashed border-tinta-3 pt-3">
          <CampoMoeda
            label="Preço de compra"
            valor={estado.precoCompraImpressora}
            onChange={(valor) => alterar('precoCompraImpressora', valor)}
          />
          <Campo
            label="Vida útil"
            sufixo="h"
            inputMode="numeric"
            value={estado.vidaUtilHorasImpressora}
            onChange={(e) =>
              alterar('vidaUtilHorasImpressora', Math.max(Number(e.target.value) || 0, 0))
            }
          />
          <Campo
            label="Consumo"
            sufixo="kW"
            inputMode="decimal"
            ajuda="Potência média. Uma impressora comum fica entre 0,06 e 0,16."
            value={estado.consumoKwh}
            onChange={(e) =>
              alterar('consumoKwh', Math.max(Number(e.target.value) || 0, 0))
            }
          />
          <CampoMoeda
            label="Manutenção por mês"
            valor={estado.custoManutencaoMes}
            onChange={(valor) => alterar('custoManutencaoMes', valor)}
          />
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Campo
          label="Tempo"
          sufixo="min"
          inputMode="numeric"
          ajuda={formatarTempo(estado.tempoImpressaoMin)}
          value={estado.tempoImpressaoMin}
          onChange={(e) =>
            alterar('tempoImpressaoMin', Math.max(Number(e.target.value) || 0, 0))
          }
        />
        <Campo
          label="Quantidade"
          inputMode="numeric"
          value={estado.quantidade}
          onChange={(e) => alterar('quantidade', Math.max(Number(e.target.value) || 1, 1))}
        />
        <Campo
          label="Reserva p/ falha"
          sufixo="%"
          inputMode="decimal"
          ajuda="Nem toda peça sai boa."
          value={estado.percentualFalha}
          onChange={(e) =>
            alterar(
              'percentualFalha',
              Math.min(Math.max(Number(e.target.value) || 0, 0), 100),
            )
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-[1fr_1fr] gap-3">
        <Select
          label="Estado"
          value={estado.uf}
          onChange={(e) => trocarUf(e.target.value)}
          opcoes={TARIFAS_ENERGIA.map((t) => ({ valor: t.uf, rotulo: t.nome }))}
        />
        <CampoMoeda
          label="Tarifa de energia"
          ajuda="Valor de referência. Confira o kWh na sua conta de luz."
          valor={estado.custoKwh}
          onChange={(valor) => alterar('custoKwh', valor)}
        />
      </div>
    </Painel>
  );
}
