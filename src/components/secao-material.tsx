'use client';

import type { Alterar, EstadoCalculadora } from './calculadora';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';

interface Props {
  estado: EstadoCalculadora;
  alterar: Alterar;
}

export function SecaoMaterial({ estado, alterar }: Props) {
  return (
    <Painel titulo="Material">
      {/* Dois campos de poucos dígitos, meia largura cada. */}
      <div className="grid grid-cols-2 gap-3">
        <CampoMoeda
          label="Preço do filamento por kg"
          ajuda="Rolo de 1 kg? É o preço que você pagou nele."
          valor={estado.precoKg}
          onChange={(valor) => alterar('precoKg', valor)}
        />
        <Campo
          label="Peso da peça"
          sufixo="g"
          inputMode="decimal"
          ajuda="O fatiador mostra esse peso antes de imprimir."
          value={estado.pesoGramas}
          onChange={(e) =>
            alterar('pesoGramas', Math.max(Number(e.target.value) || 0, 0))
          }
        />
      </div>
    </Painel>
  );
}
