import canais from './canais.json';
import impressoras from './impressoras.json';
import tarifas from './tarifas-energia.json';
import type { Canal } from '@/lib/calculo';

export interface Impressora {
  chave: string;
  nome: string;
  marca: string;
  precoCompra: number;
  vidaUtilHoras: number;
  consumoKwh: number;
  custoManutencaoMes: number;
}

export interface TarifaEnergia {
  uf: string;
  nome: string;
  tarifa: number;
}

export const IMPRESSORAS: Impressora[] = impressoras.itens;
export const CANAIS_PADRAO: Canal[] = canais.itens as Canal[];
export const TARIFAS_ENERGIA: TarifaEnergia[] = tarifas.itens;
export const TARIFA_PADRAO = tarifas.padrao;

export const IMPRESSORA_MANUAL = 'manual';
