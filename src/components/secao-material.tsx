'use client';

import { formatarMoeda } from '@/lib/formato';
import type { Alterar, EstadoCalculadora } from './calculadora';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';

interface Props {
  estado: EstadoCalculadora;
  alterar: Alterar;
  precoKg: number;
}

export function SecaoMaterial({ estado, alterar, precoKg }: Props) {
  return (
    <Painel titulo="Material">
      <div className="grid grid-cols-2 gap-3">
        <CampoMoeda
          label="Preço do rolo"
          valor={estado.precoRolo}
          onChange={(valor) => alterar('precoRolo', valor)}
        />
        <Campo
          label="Peso do rolo"
          sufixo="g"
          inputMode="numeric"
          value={estado.pesoRolo}
          onChange={(e) => alterar('pesoRolo', Math.max(Number(e.target.value) || 0, 0))}
        />
      </div>

      {/* Meia largura: o dado tem dois ou três dígitos, não merece a linha inteira. */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Campo
          label="Peso da peça"
          sufixo="g"
          inputMode="decimal"
          ajuda={`Dá ${formatarMoeda(precoKg)} por quilo. O fatiador mostra esse peso antes de imprimir.`}
          value={estado.pesoGramas}
          onChange={(e) =>
            alterar('pesoGramas', Math.max(Number(e.target.value) || 0, 0))
          }
        />
      </div>
    </Painel>
  );
}
