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
 * O "R$" é prefixo fixo do campo, não parte do texto editável: assim ele não
 * some ao focar nem reaparece ao sair, e a máscara não precisa preservar o
 * símbolo enquanto a pessoa digita.
 *
 * O rascunho existe só durante a edição, para o campo poder ficar vazio ou
 * conter algo ainda incompleto ("89,") sem ser reformatado a cada tecla. O
 * número sobe para o pai assim que der para lê-lo.
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
      prefixo="R$"
      inputMode="decimal"
      value={rascunho ?? formatarMoeda(valor, { simbolo: false })}
      onChange={(evento) => {
        const texto = evento.target.value;
        setRascunho(texto);

        const numero = lerMoeda(texto);
        if (numero !== null && numero >= 0) onChange(numero);
      }}
      onFocus={() => setRascunho(formatarMoeda(valor, { simbolo: false }))}
      onBlur={() => setRascunho(null)}
    />
  );
}
