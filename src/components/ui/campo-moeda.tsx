'use client';

import { useState } from 'react';
import { formatarMoeda, lerMoeda } from '@/lib/formato';
import { Campo } from './campo';

interface CampoMoedaProps {
  label: string;
  valor: number;
  onChange: (valor: number) => void;
  ajuda?: string;
  ocultarLabel?: boolean;
}

/**
 * Mostra o valor formatado em repouso e o texto cru enquanto tem foco, para
 * a pessoa poder apagar e digitar sem o cursor pular. O número sobe para o
 * pai a cada tecla; o rascunho existe só enquanto o campo está em edição.
 */
export function CampoMoeda({
  label,
  valor,
  onChange,
  ajuda,
  ocultarLabel,
}: CampoMoedaProps) {
  const [rascunho, setRascunho] = useState<string | null>(null);

  return (
    <Campo
      label={label}
      ocultarLabel={ocultarLabel}
      ajuda={ajuda}
      inputMode="decimal"
      value={rascunho ?? formatarMoeda(valor)}
      onChange={(evento) => {
        const texto = evento.target.value;
        setRascunho(texto);

        const numero = lerMoeda(texto);
        if (numero !== null && numero >= 0) onChange(numero);
      }}
      onFocus={() => setRascunho(valor ? formatarMoeda(valor, { simbolo: false }) : '')}
      onBlur={() => setRascunho(null)}
    />
  );
}
