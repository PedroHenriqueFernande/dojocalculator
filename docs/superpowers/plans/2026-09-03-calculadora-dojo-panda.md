# Calculadora Dojo Panda — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o frontend da calculadora de precificação 3D da Dojo Panda, com o motor de cálculo portado fielmente do System3D Lab e provado por testes de paridade.

**Architecture:** Motor de cálculo puro em TypeScript (`src/lib/calculo/`), sem React e sem I/O — entra objeto, sai objeto. Dados fixos em JSON. A UI é uma página só: `useState` para as entradas, resultado derivado direto na renderização, sem estado de resultado e sem `useEffect` de sincronização.

**Tech Stack:** Next.js 16 (App Router, export estático) · React 19 · TypeScript · Tailwind 4 · Vitest.

**Leitura obrigatória antes de começar:** `CLAUDE.md` (padrão de engenharia) e `docs/superpowers/specs/2026-09-03-calculadora-dojo-panda-design.md` (spec).

**Fonte do cálculo:** `../system3dlab/backend/src/modules/precificacao/orcamentos/calculadora/`.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/calculo/tipos.ts` | Tipos de entrada e saída do motor |
| `src/lib/calculo/custo.ts` | Custo base: material, energia, amortização, manutenção, projeto |
| `src/lib/calculo/preco.ts` | Preço por canal — uma função com as variações de Shopee e ML |
| `src/lib/calculo/resultado.ts` | Resumo unitário, cascata do lucro, capacidade produtiva |
| `src/lib/calculo/index.ts` | `calcular(entrada) → Resultado`, orquestra os três acima |
| `src/lib/dados/*.json` | Impressoras, canais, tarifas de energia, markups |
| `src/lib/formato.ts` | Formatação e parsing de moeda, percentual e tempo |
| `src/components/calculadora.tsx` | Estado das entradas e composição da tela |
| `src/components/secao-*.tsx` | Os quatro blocos de entrada |
| `src/components/painel-resultado.tsx` | Preços, razão de custo e cascata (também é a barra fixa do mobile) |
| `src/components/comparativo-canais.tsx` | Abas, cards dos três canais e edição das taxas |
| `src/components/capacidade-produtiva.tsx` | Lucro por hora, peças por dia, potencial mensal |
| `src/components/ui/*.tsx` | Cinco primitivos: campo, campo-moeda, select, painel, botão |

---

## Task 1: Scaffold do projeto

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Criar o projeto**

O diretório já é um repositório git com `CLAUDE.md`, `.gitignore` e `docs/`. Não use `create-next-app` (ele exige diretório vazio). Crie os arquivos manualmente.

`package.json`:

```json
{
  "name": "dojocalculator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3020",
    "build": "next build",
    "start": "next start -p 3020",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^16.2.7",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.2",
    "@types/node": "^25.5.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "^16.2.7",
    "postcss": "8.5.15",
    "tailwindcss": "^4.2.2",
    "typescript": "^6.0.2",
    "vitest": "^3.2.4"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
```

`postcss.config.mjs`:

```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

- [ ] **Step 2: Instalar**

Run: `npm install`
Expected: instala sem erro; cria `node_modules/` e `package-lock.json`.

- [ ] **Step 3: Criar a página mínima**

`src/app/globals.css`:

```css
@import "tailwindcss";
```

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calculadora de Preço 3D · Dojo Panda',
  description: 'Descubra quanto cobrar pela sua peça impressa em 3D.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
export default function Home() {
  return <main>Calculadora</main>;
}
```

- [ ] **Step 4: Verificar que o build passa**

Run: `npm run build`
Expected: `✓ Compiled successfully` e a pasta `out/` gerada.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js, Tailwind e Vitest"
```

---

## Task 2: Gerar as fixtures-ouro a partir do System3D Lab

Estas fixtures são a prova de que o motor portado devolve exatamente os mesmos números da origem. Todas as tasks seguintes do motor validam contra elas.

**Files:**
- Create (temporário, no outro repositório): `../system3dlab/backend/scripts/gerar-ouro-dojo.ts`
- Create: `src/lib/calculo/fixtures/ouro.json`

- [ ] **Step 1: Escrever o script gerador**

Crie `../system3dlab/backend/scripts/gerar-ouro-dojo.ts`. As classes são TypeScript comum e instanciam sem NestJS, sem banco e sem tenant:

```ts
import { CustoBaseService } from '../src/modules/precificacao/orcamentos/calculadora/custo-base.service';
import { CanalPrecoService } from '../src/modules/precificacao/orcamentos/calculadora/canal-preco.service';
import { ShopeeStrategy } from '../src/modules/precificacao/orcamentos/calculadora/estrategias/shopee.strategy';
import { MercadoLivreStrategy } from '../src/modules/precificacao/orcamentos/calculadora/estrategias/mercadolivre.strategy';
import { CapacidadeProdutivaService } from '../src/modules/precificacao/orcamentos/calculadora/capacidade-produtiva.service';
import type { TaxasConfig } from '../src/modules/precificacao/orcamentos/calculadora/preco-strategy.interface';

const custoBaseService = new CustoBaseService();
const canalPrecoService = new CanalPrecoService(
  new ShopeeStrategy(),
  new MercadoLivreStrategy(),
);
const capacidadeService = new CapacidadeProdutivaService();

const MARKUPS = {
  DEMANDA_PADRAO: { consumidor: 1.6, lojista: 1.4 },
  PROJETO_EXCLUSIVO: { consumidor: 2.4, lojista: 2.0 },
  SAZONAL: { consumidor: 2.0, lojista: 1.6 },
};

const CANAIS: TaxasConfig[] = [
  { canalVenda: 'DIRETA', canalLabel: 'Venda direta', tipoCanal: 'DIRETA', taxaMarket: 0, taxaFixa: 0, impostos: [] },
  { canalVenda: 'SHOPEE', canalLabel: 'Shopee', tipoCanal: 'SHOPEE', taxaMarket: 14, taxaFixa: 4, taxaFixaTipo: 'VALOR', freteGratisShopee: false, impostos: [] },
  { canalVenda: 'MERCADOLIVRE', canalLabel: 'Mercado Livre', tipoCanal: 'MERCADOLIVRE', taxaMarket: 16, taxaFixa: 6.5, taxaFixaTipo: 'VALOR', limitePrecoBaixoMl: 12.5, impostos: [] },
];

const CENARIOS = [
  {
    nome: 'base-uma-peca',
    entrada: {
      precoKg: 89.9, pesoGramas: 42, quantidade: 1, tempoImpressaoMin: 200,
      precoCompraImpressora: 5000, vidaUtilHorasImpressora: 7000, custoManutencaoMes: 50,
      consumoKwh: 0.14, custoKwh: 0.85, itensProjeto: [],
      percentualFalha: 0, valorFrete: 0,
      perfil: 'DEMANDA_PADRAO' as const, ajusteMarkup: 1,
      impostoPercentual: 0, taxaPagamentoPercentual: 0,
      freteGratisShopee: false,
    },
  },
  {
    nome: 'shopee-frete-gratis',
    entrada: {
      precoKg: 89.9, pesoGramas: 42, quantidade: 1, tempoImpressaoMin: 200,
      precoCompraImpressora: 5000, vidaUtilHorasImpressora: 7000, custoManutencaoMes: 50,
      consumoKwh: 0.14, custoKwh: 0.85, itensProjeto: [],
      percentualFalha: 0, valorFrete: 0,
      perfil: 'DEMANDA_PADRAO' as const, ajusteMarkup: 1,
      impostoPercentual: 0, taxaPagamentoPercentual: 0,
      freteGratisShopee: true,
    },
  },
  {
    nome: 'ml-preco-baixo',
    entrada: {
      precoKg: 60, pesoGramas: 3, quantidade: 1, tempoImpressaoMin: 8,
      precoCompraImpressora: 1800, vidaUtilHorasImpressora: 5000, custoManutencaoMes: 25,
      consumoKwh: 0.06, custoKwh: 0.85, itensProjeto: [],
      percentualFalha: 0, valorFrete: 0,
      perfil: 'DEMANDA_PADRAO' as const, ajusteMarkup: 1,
      impostoPercentual: 0, taxaPagamentoPercentual: 0,
      freteGratisShopee: false,
    },
  },
  {
    nome: 'lote-com-falha-e-frete',
    entrada: {
      precoKg: 110, pesoGramas: 85, quantidade: 5, tempoImpressaoMin: 145,
      precoCompraImpressora: 3000, vidaUtilHorasImpressora: 6000, custoManutencaoMes: 30,
      consumoKwh: 0.12, custoKwh: 0.92, itensProjeto: [],
      percentualFalha: 8, valorFrete: 12,
      perfil: 'DEMANDA_PADRAO' as const, ajusteMarkup: 1,
      impostoPercentual: 0, taxaPagamentoPercentual: 0,
      freteGratisShopee: false,
    },
  },
  {
    nome: 'exclusivo-com-impostos-e-projeto',
    entrada: {
      precoKg: 149.9, pesoGramas: 260, quantidade: 2, tempoImpressaoMin: 620,
      precoCompraImpressora: 9000, vidaUtilHorasImpressora: 8000, custoManutencaoMes: 80,
      consumoKwh: 0.16, custoKwh: 0.78,
      itensProjeto: [
        { nome: 'Caixa', valorUnitario: 3.4, quantidade: 2 },
        { nome: 'Ímã', valorUnitario: 0.75, quantidade: 8 },
      ],
      percentualFalha: 5, valorFrete: 24.9,
      perfil: 'PROJETO_EXCLUSIVO' as const, ajusteMarkup: 1.2,
      impostoPercentual: 6, taxaPagamentoPercentual: 3.99,
      freteGratisShopee: false,
    },
  },
  {
    nome: 'sazonal-sem-impressora',
    entrada: {
      precoKg: 89.9, pesoGramas: 30, quantidade: 1, tempoImpressaoMin: 90,
      precoCompraImpressora: 0, vidaUtilHorasImpressora: 0, custoManutencaoMes: 0,
      consumoKwh: 0.1, custoKwh: 0.85, itensProjeto: [],
      percentualFalha: 0, valorFrete: 0,
      perfil: 'SAZONAL' as const, ajusteMarkup: 1,
      impostoPercentual: 0, taxaPagamentoPercentual: 0,
      freteGratisShopee: false,
    },
  },
];

const arredondar = (v: number) => Math.round(v * 100) / 100;

const saida = CENARIOS.map(({ nome, entrada }) => {
  const custoBase = custoBaseService.calcular({
    materiais: [{
      filamentoId: 'x', nome: 'Filamento', material: 'PLA', cor: '-',
      precoKg: entrada.precoKg, pesoGramas: entrada.pesoGramas,
    }],
    tempoImpressaoMin: entrada.tempoImpressaoMin,
    precoCompraImpressora: entrada.precoCompraImpressora,
    vidaUtilHorasImpressora: entrada.vidaUtilHorasImpressora,
    custoManutencaoMes: entrada.custoManutencaoMes,
    consumoKwh: entrada.consumoKwh,
    custoKwh: entrada.custoKwh,
    quantidade: entrada.quantidade,
    custosFixosSelecionados: [],
    totalCustosFixosSelecionados: 0,
    acessoriosEmbalagens: entrada.itensProjeto.map((item) => {
      const valorUnitario = arredondar(item.valorUnitario);
      return { nome: item.nome, valorUnitario, quantidade: item.quantidade, total: arredondar(valorUnitario * item.quantidade) };
    }),
    nomeImpressora: 'Impressora',
  });

  const configs = CANAIS.map((canal) =>
    canal.canalVenda === 'SHOPEE'
      ? { ...canal, freteGratisShopee: entrada.freteGratisShopee }
      : canal,
  );

  const precificacao = (markupBase: number) => ({
    markup: arredondar(markupBase * entrada.ajusteMarkup),
    impostoPercentual: entrada.impostoPercentual,
    taxaPagamentoPercentual: entrada.taxaPagamentoPercentual,
  });

  const consumidor = canalPrecoService.calcularTodosCanais(
    custoBase.custoTotalBase, precificacao(MARKUPS[entrada.perfil].consumidor),
    configs, custoBase, entrada.percentualFalha, undefined, entrada.valorFrete,
  );
  const lojista = canalPrecoService.calcularTodosCanais(
    custoBase.custoTotalBase, precificacao(MARKUPS[entrada.perfil].lojista),
    configs, custoBase, entrada.percentualFalha, undefined, entrada.valorFrete,
  );
  const capacidade = capacidadeService.calcular(
    entrada.tempoImpressaoMin, entrada.quantidade, consumidor,
  );

  return { nome, entrada, custoBase, consumidor, lojista, capacidade };
});

console.log(JSON.stringify(saida, null, 2));
```

- [ ] **Step 2: Rodar e salvar a saída**

```bash
cd ../system3dlab/backend
npx ts-node -P tsconfig.prisma.json scripts/gerar-ouro-dojo.ts > ../../dojocalculator/src/lib/calculo/fixtures/ouro.json
```

Crie a pasta antes se necessário: `mkdir -p src/lib/calculo/fixtures`.

Expected: `ouro.json` com um array de 6 objetos. Confira que `[0].custoBase.custoMaterial` é `3.78` e que `[0].consumidor[0].precoVenda` é um número maior que zero.

- [ ] **Step 3: Apagar o script temporário**

```bash
rm ../system3dlab/backend/scripts/gerar-ouro-dojo.ts
```

O outro repositório não fica alterado. Confirme com `git -C ../system3dlab status --short` — a saída deve estar vazia.

- [ ] **Step 4: Commit**

```bash
git add src/lib/calculo/fixtures/ouro.json
git commit -m "test: captura fixtures-ouro do System3D Lab"
```

---

## Task 3: Tipos do motor

**Files:**
- Create: `src/lib/calculo/tipos.ts`

- [ ] **Step 1: Escrever os tipos**

```ts
export type PerfilEscassez = 'DEMANDA_PADRAO' | 'PROJETO_EXCLUSIVO' | 'SAZONAL';
export type TipoCanal = 'DIRETA' | 'SHOPEE' | 'MERCADOLIVRE';

export interface ItemProjeto {
  nome: string;
  valorUnitario: number;
  quantidade: number;
}

export interface FaixaTaxaFixa {
  precoMinimo: number;
  precoMaximo: number;
  taxaFixa: number;
  ehPercentual: boolean;
  valorPercentual: number | null;
}

export interface Canal {
  id: TipoCanal;
  nome: string;
  taxaMarket: number;
  taxaFixa: number;
  taxaFixaTipo: 'VALOR' | 'PERCENTUAL';
  faixasTaxaFixa?: FaixaTaxaFixa[];
  freteGratisShopee?: boolean;
}

export interface EntradaCalculo {
  precoKg: number;
  pesoGramas: number;
  quantidade: number;
  tempoImpressaoMin: number;
  precoCompraImpressora: number;
  vidaUtilHorasImpressora: number;
  custoManutencaoMes: number;
  consumoKwh: number;
  custoKwh: number;
  itensProjeto: ItemProjeto[];
  percentualFalha: number;
  valorFrete: number;
  perfilEscassez: PerfilEscassez;
  ajusteMarkup: number;
  impostoPercentual: number;
  taxaPagamentoPercentual: number;
  canais: Canal[];
}

export interface CustoBase {
  custoMaterial: number;
  custoEnergia: number;
  custoAmortizacao: number;
  amortizacaoHora: number;
  custoManutencaoPorHora: number;
  custoManutencaoRateado: number;
  custoProjeto: number;
  custoTotalBase: number;
  tempoTotalHoras: number;
}

export interface PrecoCanal {
  taxaMarket: number;
  valorTaxaMarket: number;
  taxaFixa: number;
  impostoPercentual: number;
  valorImposto: number;
  taxaPagamentoPercentual: number;
  valorTaxaPagamento: number;
  totalTaxas: number;
  percentualTaxas: number;
  markup: number;
  percentualFalha: number;
  valorFalha: number;
  valorFrete: number;
  precoVendaSemFalha: number;
  precoVendaSemFrete: number;
  precoVenda: number;
  lucroLiquido: number;
}

export type ResultadoCanal =
  | { ok: true; preco: PrecoCanal }
  | { ok: false; motivo: string };

export interface ResumoUnitario {
  material: number;
  energia: number;
  amortizacao: number;
  manutencao: number;
  projeto: number;
  falhas: number;
  frete: number;
  taxasCanal: number;
  totalCustos: number;
  precoFinal: number;
  lucroLiquido: number;
}

export interface ItemCascata {
  label: string;
  valor: number;
  tipo: 'receita' | 'deducao' | 'custo' | 'resultado';
}

export interface Capacidade {
  lucroPorPeca: number;
  lucroPorHora: number;
  pecasPorDia: number;
  lucroPorDia: number;
  potencialMensal: number;
  horasUteisConsideradas: number;
  diasUteisConsiderados: number;
}

export interface ResultadoDoCanal {
  canalId: TipoCanal;
  canalNome: string;
  consumidor: ResultadoCanal;
  lojista: ResultadoCanal;
  resumoConsumidor: ResumoUnitario | null;
  resumoLojista: ResumoUnitario | null;
  cascata: ItemCascata[];
  capacidade: Capacidade | null;
}

export interface Resultado {
  custoBase: CustoBase;
  markupConsumidor: number;
  markupLojista: number;
  canais: ResultadoDoCanal[];
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calculo/tipos.ts
git commit -m "feat: tipos do motor de cálculo"
```

---

## Task 4: Custo base

**Files:**
- Create: `src/lib/calculo/custo.ts`
- Test: `src/lib/calculo/custo.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/calculo/custo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { arredondar, calcularCustoBase, HORAS_FIXAS_MES } from './custo';

describe('calcularCustoBase', () => {
  it('mantém 520 horas fixas por mês, como a origem', () => {
    expect(HORAS_FIXAS_MES).toBe(520);
  });

  it('arredonda para duas casas como a origem', () => {
    expect(arredondar(3.784)).toBe(3.78);
    expect(arredondar(3.785)).toBe(3.79);
  });

  it.each(ouro.map((c) => [c.nome, c] as const))(
    'reproduz o custo base do cenário %s',
    (_nome, cenario) => {
      const resultado = calcularCustoBase({
        precoKg: cenario.entrada.precoKg,
        pesoGramas: cenario.entrada.pesoGramas,
        quantidade: cenario.entrada.quantidade,
        tempoImpressaoMin: cenario.entrada.tempoImpressaoMin,
        precoCompraImpressora: cenario.entrada.precoCompraImpressora,
        vidaUtilHorasImpressora: cenario.entrada.vidaUtilHorasImpressora,
        custoManutencaoMes: cenario.entrada.custoManutencaoMes,
        consumoKwh: cenario.entrada.consumoKwh,
        custoKwh: cenario.entrada.custoKwh,
        itensProjeto: cenario.entrada.itensProjeto,
      });

      expect(resultado.custoMaterial).toBe(cenario.custoBase.custoMaterial);
      expect(resultado.custoEnergia).toBe(cenario.custoBase.custoEnergia);
      expect(resultado.custoAmortizacao).toBe(cenario.custoBase.custoAmortizacao);
      expect(resultado.amortizacaoHora).toBe(cenario.custoBase.amortizacaoHora);
      expect(resultado.custoManutencaoRateado).toBe(cenario.custoBase.custoManutencaoRateado);
      expect(resultado.custoProjeto).toBe(cenario.custoBase.totalAcessoriosEmbalagens);
      expect(resultado.custoTotalBase).toBe(cenario.custoBase.custoTotalBase);
    },
  );

  it('não divide por zero quando a impressora não tem vida útil', () => {
    const resultado = calcularCustoBase({
      precoKg: 90, pesoGramas: 10, quantidade: 1, tempoImpressaoMin: 60,
      precoCompraImpressora: 5000, vidaUtilHorasImpressora: 0, custoManutencaoMes: 0,
      consumoKwh: 0.1, custoKwh: 0.85, itensProjeto: [],
    });

    expect(resultado.amortizacaoHora).toBe(0);
    expect(resultado.custoAmortizacao).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/calculo/custo.test.ts`
Expected: FAIL — `Failed to resolve import "./custo"`.

- [ ] **Step 3: Implementar**

`src/lib/calculo/custo.ts`:

```ts
import type { CustoBase, EntradaCalculo, ItemProjeto } from './tipos';

const HORAS_UTEIS_DIA = 20;
const DIAS_UTEIS_MES = 26;

export const HORAS_FIXAS_MES = HORAS_UTEIS_DIA * DIAS_UTEIS_MES;

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

type EntradaCusto = Pick<
  EntradaCalculo,
  | 'precoKg' | 'pesoGramas' | 'quantidade' | 'tempoImpressaoMin'
  | 'precoCompraImpressora' | 'vidaUtilHorasImpressora' | 'custoManutencaoMes'
  | 'consumoKwh' | 'custoKwh' | 'itensProjeto'
>;

export function totalDoItem(item: ItemProjeto): number {
  return arredondar(arredondar(item.valorUnitario) * item.quantidade);
}

export function calcularCustoBase(entrada: EntradaCusto): CustoBase {
  const custoMaterial = arredondar(
    (entrada.precoKg / 1000) * entrada.pesoGramas * entrada.quantidade,
  );

  const tempoTotalHoras = (entrada.tempoImpressaoMin / 60) * entrada.quantidade;

  const custoEnergia =
    (entrada.tempoImpressaoMin / 60) *
    entrada.consumoKwh *
    entrada.custoKwh *
    entrada.quantidade;

  const amortizacaoHora =
    entrada.vidaUtilHorasImpressora > 0
      ? entrada.precoCompraImpressora / entrada.vidaUtilHorasImpressora
      : 0;
  const custoAmortizacao = amortizacaoHora * tempoTotalHoras;

  const custoManutencaoPorHora = entrada.custoManutencaoMes / HORAS_FIXAS_MES;
  const custoManutencaoRateado = custoManutencaoPorHora * tempoTotalHoras;

  const custoProjeto = entrada.itensProjeto.reduce(
    (total, item) => total + totalDoItem(item),
    0,
  );

  const custoTotalBase =
    custoMaterial +
    custoEnergia +
    custoAmortizacao +
    custoManutencaoRateado +
    custoProjeto;

  return {
    custoMaterial,
    custoEnergia: arredondar(custoEnergia),
    custoAmortizacao: arredondar(custoAmortizacao),
    amortizacaoHora: arredondar(amortizacaoHora),
    custoManutencaoPorHora: arredondar(custoManutencaoPorHora),
    custoManutencaoRateado: arredondar(custoManutencaoRateado),
    custoProjeto: arredondar(custoProjeto),
    custoTotalBase: arredondar(custoTotalBase),
    tempoTotalHoras,
  };
}
```

> **Nota de paridade:** o `custoTotalBase` soma os valores **não arredondados** de energia, amortização e manutenção (só o material entra já arredondado, como na origem) e arredonda no fim. Somar os campos arredondados daria centavos de diferença em alguns cenários.

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/calculo/custo.test.ts`
Expected: PASS — 9 testes (2 + 6 cenários + 1 borda).

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculo/custo.ts src/lib/calculo/custo.test.ts
git commit -m "feat: custo base com paridade provada contra a origem"
```

---

## Task 5: Preço por canal

**Files:**
- Create: `src/lib/calculo/preco.ts`
- Test: `src/lib/calculo/preco.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/calculo/preco.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { calcularMarkup, calcularPrecoCanal, MARKUPS_ESCASSEZ } from './preco';
import type { Canal, PerfilEscassez, TipoCanal } from './tipos';

function canaisDoCenario(freteGratisShopee: boolean): Canal[] {
  return [
    { id: 'DIRETA', nome: 'Venda direta', taxaMarket: 0, taxaFixa: 0, taxaFixaTipo: 'VALOR' },
    { id: 'SHOPEE', nome: 'Shopee', taxaMarket: 14, taxaFixa: 4, taxaFixaTipo: 'VALOR', freteGratisShopee },
    { id: 'MERCADOLIVRE', nome: 'Mercado Livre', taxaMarket: 16, taxaFixa: 6.5, taxaFixaTipo: 'VALOR' },
  ];
}

describe('calcularMarkup', () => {
  it('multiplica o perfil pelo ajuste manual e arredonda', () => {
    expect(calcularMarkup('DEMANDA_PADRAO', 1)).toEqual({ consumidor: 1.6, lojista: 1.4 });
    expect(calcularMarkup('PROJETO_EXCLUSIVO', 1.2)).toEqual({ consumidor: 2.88, lojista: 2.4 });
  });

  it('expõe os três perfis da origem', () => {
    expect(MARKUPS_ESCASSEZ.SAZONAL).toEqual({ consumidor: 2, lojista: 1.6 });
  });
});

describe('calcularPrecoCanal', () => {
  const cenarios = ouro.flatMap((cenario) =>
    (['consumidor', 'lojista'] as const).flatMap((publico) =>
      cenario[publico].map((esperado, indice) => ({
        rotulo: `${cenario.nome}/${publico}/${esperado.canalLabel}`,
        cenario, publico, indice, esperado,
      })),
    ),
  );

  it.each(cenarios.map((c) => [c.rotulo, c] as const))(
    'reproduz o preço de %s',
    (_rotulo, { cenario, publico, indice, esperado }) => {
      const markup = calcularMarkup(
        cenario.entrada.perfil as PerfilEscassez,
        cenario.entrada.ajusteMarkup,
      )[publico];

      const resultado = calcularPrecoCanal({
        custoTotalBase: cenario.custoBase.custoTotalBase,
        custoMaterial: cenario.custoBase.custoMaterial,
        canal: canaisDoCenario(cenario.entrada.freteGratisShopee)[indice],
        markup,
        impostoPercentual: cenario.entrada.impostoPercentual,
        taxaPagamentoPercentual: cenario.entrada.taxaPagamentoPercentual,
        percentualFalha: cenario.entrada.percentualFalha,
        valorFrete: cenario.entrada.valorFrete,
      });

      expect(resultado.ok).toBe(true);
      if (!resultado.ok) return;

      expect(resultado.preco.precoVenda).toBe(esperado.precoVenda);
      expect(resultado.preco.lucroLiquido).toBe(esperado.lucroLiquido);
      expect(resultado.preco.totalTaxas).toBe(esperado.totalTaxas);
      expect(resultado.preco.valorFalha).toBe(esperado.valorFalha);
      expect(resultado.preco.precoVendaSemFalha).toBe(esperado.precoVendaSemFalha);
      expect(resultado.preco.precoVendaSemFrete).toBe(esperado.precoVendaSemFrete);
    },
  );

  it('recusa o cálculo quando as taxas somam 100% ou mais', () => {
    const resultado = calcularPrecoCanal({
      custoTotalBase: 10, custoMaterial: 5,
      canal: { id: 'DIRETA', nome: 'Venda direta', taxaMarket: 60, taxaFixa: 0, taxaFixaTipo: 'VALOR' },
      markup: 1.6, impostoPercentual: 30, taxaPagamentoPercentual: 10,
      percentualFalha: 0, valorFrete: 0,
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.motivo).toContain('100%');
  });

  it('soma 6 pontos de comissão na Shopee com frete grátis', () => {
    const comum = {
      custoTotalBase: 20, custoMaterial: 10, markup: 1.6,
      impostoPercentual: 0, taxaPagamentoPercentual: 0,
      percentualFalha: 0, valorFrete: 0,
    };
    const semFrete = calcularPrecoCanal({ ...comum, canal: canaisDoCenario(false)[1] });
    const comFrete = calcularPrecoCanal({ ...comum, canal: canaisDoCenario(true)[1] });

    expect(semFrete.ok && semFrete.preco.taxaMarket).toBe(14);
    expect(comFrete.ok && comFrete.preco.taxaMarket).toBe(20);
    expect(comFrete.ok && semFrete.ok && comFrete.preco.precoVenda).toBeGreaterThan(semFrete.preco.precoVenda);
  });

  it('aplica o divisor reduzido do Mercado Livre abaixo de R$ 12,50', () => {
    const abaixo = calcularPrecoCanal({
      custoTotalBase: 1, custoMaterial: 0.5, canal: canaisDoCenario(false)[2],
      markup: 1.6, impostoPercentual: 0, taxaPagamentoPercentual: 0,
      percentualFalha: 0, valorFrete: 0,
    });

    expect(abaixo.ok).toBe(true);
    if (!abaixo.ok) return;
    // (1 × 1,6 + 6,50) ÷ (1 − 0,16 − 0,5) = 8,10 ÷ 0,34
    expect(abaixo.preco.precoVenda).toBe(23.82);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/calculo/preco.test.ts`
Expected: FAIL — `Failed to resolve import "./preco"`.

- [ ] **Step 3: Implementar**

`src/lib/calculo/preco.ts`:

```ts
import { arredondar } from './custo';
import type {
  Canal, FaixaTaxaFixa, PerfilEscassez, PrecoCanal, ResultadoCanal,
} from './tipos';

const LIMITE_PRECO_BAIXO_ML = 12.5;
const COMISSAO_EXTRA_FRETE_GRATIS_SHOPEE = 6;
const DIVISOR_EXTRA_ML_PRECO_BAIXO = 0.5;

export const MARKUPS_ESCASSEZ: Record<
  PerfilEscassez,
  { consumidor: number; lojista: number }
> = {
  DEMANDA_PADRAO: { consumidor: 1.6, lojista: 1.4 },
  PROJETO_EXCLUSIVO: { consumidor: 2.4, lojista: 2 },
  SAZONAL: { consumidor: 2, lojista: 1.6 },
};

export function calcularMarkup(perfil: PerfilEscassez, ajuste: number) {
  const base = MARKUPS_ESCASSEZ[perfil];
  return {
    consumidor: arredondar(base.consumidor * ajuste),
    lojista: arredondar(base.lojista * ajuste),
  };
}

interface EntradaPreco {
  custoTotalBase: number;
  custoMaterial: number;
  canal: Canal;
  markup: number;
  impostoPercentual: number;
  taxaPagamentoPercentual: number;
  percentualFalha: number;
  valorFrete: number;
}

/**
 * A origem tem três classes (genérico, Shopee, Mercado Livre) com o corpo do
 * cálculo duplicado, separadas só pela injeção de dependência do NestJS. Aqui
 * são uma função com as duas diferenças reais aplicadas no ponto onde ocorrem.
 */
export function calcularPrecoCanal(entrada: EntradaPreco): ResultadoCanal {
  const percentualFalha = arredondar(
    Math.min(Math.max(entrada.percentualFalha || 0, 0), 100),
  );
  const valorFalha = arredondar(
    Math.max(entrada.custoMaterial, 0) * (percentualFalha / 100),
  );
  const valorFrete = arredondar(Math.max(entrada.valorFrete || 0, 0));

  const semFalha = precificar(entrada, 0);
  if (!semFalha.ok) return semFalha;

  const semFrete = precificar(entrada, valorFalha);
  if (!semFrete.ok) return semFrete;

  const final = precificar(entrada, arredondar(valorFalha + valorFrete));
  if (!final.ok) return final;

  const lucroLiquido = arredondar(
    final.preco.precoVenda -
      final.preco.totalTaxas -
      entrada.custoTotalBase -
      valorFalha -
      valorFrete,
  );

  return {
    ok: true,
    preco: {
      ...final.preco,
      lucroLiquido,
      percentualFalha,
      valorFalha,
      valorFrete,
      precoVendaSemFalha: semFalha.preco.precoVenda,
      precoVendaSemFrete: semFrete.preco.precoVenda,
    },
  };
}

function precificar(entrada: EntradaPreco, custoRepasse: number): ResultadoCanal {
  const { canal } = entrada;

  const comissao =
    canal.id === 'SHOPEE' && canal.freteGratisShopee
      ? canal.taxaMarket + COMISSAO_EXTRA_FRETE_GRATIS_SHOPEE
      : canal.taxaMarket;

  const percentualTotal =
    comissao + entrada.impostoPercentual + entrada.taxaPagamentoPercentual;

  const subtotalMarkup =
    entrada.custoTotalBase * entrada.markup + Math.max(custoRepasse, 0);

  const taxaFixa = resolverTaxaFixa(subtotalMarkup, canal);
  const divisor = 1 - (percentualTotal + taxaFixa.percentual) / 100;

  if (divisor <= 0) {
    return {
      ok: false,
      motivo: `${canal.nome}: as taxas somam 100% ou mais do preço. Não existe preço de venda possível com essa configuração.`,
    };
  }

  let precoVenda = (subtotalMarkup + taxaFixa.valor) / divisor;

  if (canal.id === 'MERCADOLIVRE' && precoVenda < LIMITE_PRECO_BAIXO_ML) {
    const divisorBaixo = divisor - DIVISOR_EXTRA_ML_PRECO_BAIXO;

    if (divisorBaixo <= 0) {
      return {
        ok: false,
        motivo: `${canal.nome}: com a taxa extra de produto abaixo de R$ 12,50, as taxas ultrapassam 100% do preço.`,
      };
    }

    precoVenda = (subtotalMarkup + taxaFixa.valor) / divisorBaixo;
  }

  const valorTaxaMarket = precoVenda * (comissao / 100);
  const valorTaxaFixa =
    taxaFixa.percentual > 0 ? precoVenda * (taxaFixa.percentual / 100) : taxaFixa.valor;
  const valorImposto = precoVenda * (entrada.impostoPercentual / 100);
  const valorTaxaPagamento = precoVenda * (entrada.taxaPagamentoPercentual / 100);

  const totalTaxas =
    valorTaxaMarket + valorTaxaFixa + valorImposto + valorTaxaPagamento;

  return {
    ok: true,
    preco: {
      taxaMarket: arredondar(comissao),
      valorTaxaMarket: arredondar(valorTaxaMarket),
      taxaFixa: arredondar(valorTaxaFixa),
      impostoPercentual: arredondar(entrada.impostoPercentual),
      valorImposto: arredondar(valorImposto),
      taxaPagamentoPercentual: arredondar(entrada.taxaPagamentoPercentual),
      valorTaxaPagamento: arredondar(valorTaxaPagamento),
      totalTaxas: arredondar(totalTaxas),
      percentualTaxas: precoVenda > 0 ? arredondar((totalTaxas / precoVenda) * 100) : 0,
      markup: arredondar(entrada.markup),
      percentualFalha: 0,
      valorFalha: 0,
      valorFrete: 0,
      precoVendaSemFalha: arredondar(precoVenda),
      precoVendaSemFrete: arredondar(precoVenda),
      precoVenda: arredondar(precoVenda),
      lucroLiquido: arredondar(
        precoVenda - entrada.custoTotalBase - Math.max(custoRepasse, 0) - totalTaxas,
      ),
    },
  };
}

function resolverTaxaFixa(
  precoEstimado: number,
  canal: Canal,
): { valor: number; percentual: number } {
  if (canal.taxaFixaTipo === 'PERCENTUAL') {
    return { valor: 0, percentual: canal.taxaFixa || 0 };
  }

  const faixa = canal.faixasTaxaFixa?.find(
    (f: FaixaTaxaFixa) =>
      precoEstimado >= f.precoMinimo && precoEstimado <= f.precoMaximo,
  );

  if (!faixa) return { valor: canal.taxaFixa || 0, percentual: 0 };

  return faixa.ehPercentual && faixa.valorPercentual !== null
    ? { valor: 0, percentual: faixa.valorPercentual }
    : { valor: faixa.taxaFixa, percentual: 0 };
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/calculo/preco.test.ts`
Expected: PASS — 40 testes (2 de markup + 36 de paridade + 4 de regra).

Se algum caso de paridade falhar por centavos, o erro está em ordem de arredondamento: compare com `canal-preco.service.ts` e `estrategias/` linha a linha antes de mudar a fixture. **A fixture é a verdade; o porte é que se ajusta.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculo/preco.ts src/lib/calculo/preco.test.ts
git commit -m "feat: preço por canal consolidado em uma função, com paridade provada"
```

---

## Task 6: Resumo, cascata e capacidade

**Files:**
- Create: `src/lib/calculo/resultado.ts`
- Test: `src/lib/calculo/resultado.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/calculo/resultado.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { calcularCapacidade, montarCascata, montarResumoUnitario } from './resultado';
import type { CustoBase, PrecoCanal } from './tipos';

const primeiro = ouro[0];

function custoBaseDe(cenario: typeof primeiro): CustoBase {
  return {
    custoMaterial: cenario.custoBase.custoMaterial,
    custoEnergia: cenario.custoBase.custoEnergia,
    custoAmortizacao: cenario.custoBase.custoAmortizacao,
    amortizacaoHora: cenario.custoBase.amortizacaoHora,
    custoManutencaoPorHora: cenario.custoBase.custoManutencaoPorHora,
    custoManutencaoRateado: cenario.custoBase.custoManutencaoRateado,
    custoProjeto: cenario.custoBase.totalAcessoriosEmbalagens,
    custoTotalBase: cenario.custoBase.custoTotalBase,
    tempoTotalHoras: (cenario.entrada.tempoImpressaoMin / 60) * cenario.entrada.quantidade,
  };
}

describe('calcularCapacidade', () => {
  it.each(ouro.map((c) => [c.nome, c] as const))(
    'reproduz a capacidade produtiva do cenário %s',
    (_nome, cenario) => {
      const esperado = cenario.capacidade[0];
      const resultado = calcularCapacidade(
        cenario.entrada.tempoImpressaoMin,
        cenario.entrada.quantidade,
        cenario.consumidor[0].lucroLiquido,
      );

      expect(resultado.lucroPorPeca).toBe(esperado.lucroPorPeca);
      expect(resultado.lucroPorHora).toBe(esperado.lucroPorHora);
      expect(resultado.pecasPorDia).toBe(esperado.pecasPorDia);
      expect(resultado.lucroPorDia).toBe(esperado.lucroPorDia);
      expect(resultado.potencialMensal).toBe(esperado.potencialMensal);
    },
  );

  it('devolve zeros quando o tempo de impressão é zero', () => {
    const resultado = calcularCapacidade(0, 1, 10);
    expect(resultado.lucroPorHora).toBe(0);
    expect(resultado.pecasPorDia).toBe(0);
    expect(resultado.potencialMensal).toBe(0);
  });
});

describe('montarResumoUnitario', () => {
  it('divide cada componente pela quantidade', () => {
    const lote = ouro.find((c) => c.nome === 'lote-com-falha-e-frete')!;
    const resumo = montarResumoUnitario(
      custoBaseDe(lote),
      lote.consumidor[0] as unknown as PrecoCanal,
      lote.entrada.quantidade,
    );

    expect(resumo.material).toBe(
      Math.round((lote.custoBase.custoMaterial / 5) * 100) / 100,
    );
    expect(resumo.precoFinal).toBe(
      Math.round((lote.consumidor[0].precoVenda / 5) * 100) / 100,
    );
    expect(resumo.totalCustos).toBeGreaterThan(0);
  });
});

describe('montarCascata', () => {
  it('abre com a receita e fecha com o resultado', () => {
    const cascata = montarCascata(
      custoBaseDe(primeiro),
      primeiro.consumidor[1] as unknown as PrecoCanal,
      'Shopee',
    );

    expect(cascata[0].tipo).toBe('receita');
    expect(cascata[cascata.length - 1].tipo).toBe('resultado');
  });

  it('omite as linhas que valem zero', () => {
    const cascata = montarCascata(
      custoBaseDe(primeiro),
      primeiro.consumidor[0] as unknown as PrecoCanal,
      'Venda direta',
    );

    expect(cascata.some((item) => item.label.includes('Frete'))).toBe(false);
    expect(cascata.some((item) => item.label.includes('Reserva'))).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/calculo/resultado.test.ts`
Expected: FAIL — `Failed to resolve import "./resultado"`.

- [ ] **Step 3: Implementar**

`src/lib/calculo/resultado.ts`:

```ts
import { arredondar } from './custo';
import type {
  Capacidade, CustoBase, ItemCascata, PrecoCanal, ResumoUnitario,
} from './tipos';

const HORAS_UTEIS_DIA = 20;
const DIAS_UTEIS_MES = 26;

function porQuantidade(valor: number, quantidade: number): number {
  return arredondar(valor / (quantidade > 0 ? quantidade : 1));
}

export function calcularCapacidade(
  tempoImpressaoMin: number,
  quantidade: number,
  lucroLiquidoDoLote: number,
): Capacidade {
  const tempoHoras = tempoImpressaoMin / 60;
  const lucroPorPeca = quantidade > 0 ? lucroLiquidoDoLote / quantidade : 0;
  const lucroPorHora = tempoHoras > 0 ? lucroPorPeca / tempoHoras : 0;
  const pecasPorDia = tempoHoras > 0 ? Math.floor(HORAS_UTEIS_DIA / tempoHoras) : 0;
  const lucroPorDia = pecasPorDia * lucroPorPeca;

  return {
    lucroPorPeca: arredondar(lucroPorPeca),
    lucroPorHora: arredondar(lucroPorHora),
    pecasPorDia,
    lucroPorDia: arredondar(lucroPorDia),
    potencialMensal: arredondar(lucroPorDia * DIAS_UTEIS_MES),
    horasUteisConsideradas: HORAS_UTEIS_DIA,
    diasUteisConsiderados: DIAS_UTEIS_MES,
  };
}

export function montarResumoUnitario(
  custoBase: CustoBase,
  preco: PrecoCanal,
  quantidade: number,
): ResumoUnitario {
  const falhas = porQuantidade(preco.valorFalha, quantidade);
  const frete = porQuantidade(preco.valorFrete, quantidade);
  const taxasCanal = porQuantidade(preco.totalTaxas, quantidade);
  const custoUnitarioBase = porQuantidade(custoBase.custoTotalBase, quantidade);

  return {
    material: porQuantidade(custoBase.custoMaterial, quantidade),
    energia: porQuantidade(custoBase.custoEnergia, quantidade),
    amortizacao: porQuantidade(custoBase.custoAmortizacao, quantidade),
    manutencao: porQuantidade(custoBase.custoManutencaoRateado, quantidade),
    projeto: porQuantidade(custoBase.custoProjeto, quantidade),
    falhas,
    frete,
    taxasCanal,
    totalCustos: arredondar(custoUnitarioBase + falhas + frete + taxasCanal),
    precoFinal: porQuantidade(preco.precoVenda, quantidade),
    lucroLiquido: porQuantidade(preco.lucroLiquido, quantidade),
  };
}

export function montarCascata(
  custoBase: CustoBase,
  preco: PrecoCanal,
  canalNome: string,
): ItemCascata[] {
  const itens: ItemCascata[] = [
    { label: 'Preço de venda', valor: preco.precoVenda, tipo: 'receita' },
  ];

  const deducao = (label: string, valor: number) => {
    if (valor > 0) itens.push({ label, valor: -valor, tipo: 'deducao' });
  };
  const custo = (label: string, valor: number) => {
    if (valor > 0) itens.push({ label, valor: -valor, tipo: 'custo' });
  };

  deducao(`Reserva para falhas (${preco.percentualFalha}%)`, preco.valorFalha);
  custo('Frete repassado', preco.valorFrete);
  deducao(`Taxa ${canalNome} (${preco.taxaMarket}%)`, preco.valorTaxaMarket);
  deducao(`Taxa fixa ${canalNome}`, preco.taxaFixa);
  deducao(`Imposto (${preco.impostoPercentual}%)`, preco.valorImposto);
  deducao(
    `Taxa de pagamento (${preco.taxaPagamentoPercentual}%)`,
    preco.valorTaxaPagamento,
  );

  custo('Material', custoBase.custoMaterial);
  custo('Energia', custoBase.custoEnergia);
  custo('Amortização da impressora', custoBase.custoAmortizacao);
  custo('Manutenção da impressora', custoBase.custoManutencaoRateado);
  custo('Custos do projeto', custoBase.custoProjeto);

  itens.push({ label: 'Lucro líquido', valor: preco.lucroLiquido, tipo: 'resultado' });

  return itens;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/calculo/resultado.test.ts`
Expected: PASS — 10 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculo/resultado.ts src/lib/calculo/resultado.test.ts
git commit -m "feat: resumo unitário, cascata do lucro e capacidade produtiva"
```

---

## Task 7: Orquestrador `calcular()`

**Files:**
- Create: `src/lib/calculo/index.ts`
- Test: `src/lib/calculo/index.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/calculo/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import ouro from './fixtures/ouro.json';
import { calcular } from './index';
import type { Canal, EntradaCalculo, PerfilEscassez } from './tipos';

function entradaDoCenario(cenario: (typeof ouro)[number]): EntradaCalculo {
  const canais: Canal[] = [
    { id: 'DIRETA', nome: 'Venda direta', taxaMarket: 0, taxaFixa: 0, taxaFixaTipo: 'VALOR' },
    { id: 'SHOPEE', nome: 'Shopee', taxaMarket: 14, taxaFixa: 4, taxaFixaTipo: 'VALOR', freteGratisShopee: cenario.entrada.freteGratisShopee },
    { id: 'MERCADOLIVRE', nome: 'Mercado Livre', taxaMarket: 16, taxaFixa: 6.5, taxaFixaTipo: 'VALOR' },
  ];

  return {
    precoKg: cenario.entrada.precoKg,
    pesoGramas: cenario.entrada.pesoGramas,
    quantidade: cenario.entrada.quantidade,
    tempoImpressaoMin: cenario.entrada.tempoImpressaoMin,
    precoCompraImpressora: cenario.entrada.precoCompraImpressora,
    vidaUtilHorasImpressora: cenario.entrada.vidaUtilHorasImpressora,
    custoManutencaoMes: cenario.entrada.custoManutencaoMes,
    consumoKwh: cenario.entrada.consumoKwh,
    custoKwh: cenario.entrada.custoKwh,
    itensProjeto: cenario.entrada.itensProjeto,
    percentualFalha: cenario.entrada.percentualFalha,
    valorFrete: cenario.entrada.valorFrete,
    perfilEscassez: cenario.entrada.perfil as PerfilEscassez,
    ajusteMarkup: cenario.entrada.ajusteMarkup,
    impostoPercentual: cenario.entrada.impostoPercentual,
    taxaPagamentoPercentual: cenario.entrada.taxaPagamentoPercentual,
    canais,
  };
}

describe('calcular', () => {
  it.each(ouro.map((c) => [c.nome, c] as const))(
    'reproduz ponta a ponta o cenário %s',
    (_nome, cenario) => {
      const resultado = calcular(entradaDoCenario(cenario));

      expect(resultado.custoBase.custoTotalBase).toBe(cenario.custoBase.custoTotalBase);
      expect(resultado.canais).toHaveLength(3);

      resultado.canais.forEach((canal, indice) => {
        expect(canal.consumidor.ok).toBe(true);
        expect(canal.lojista.ok).toBe(true);
        if (!canal.consumidor.ok || !canal.lojista.ok) return;

        expect(canal.consumidor.preco.precoVenda).toBe(cenario.consumidor[indice].precoVenda);
        expect(canal.lojista.preco.precoVenda).toBe(cenario.lojista[indice].precoVenda);
        expect(canal.capacidade?.potencialMensal).toBe(cenario.capacidade[indice].potencialMensal);
      });
    },
  );

  it('devolve o motivo do erro por canal em vez de lançar exceção', () => {
    const entrada = entradaDoCenario(ouro[0]);
    const resultado = calcular({ ...entrada, impostoPercentual: 95, taxaPagamentoPercentual: 10 });

    const direta = resultado.canais[0];
    expect(direta.consumidor.ok).toBe(false);
    expect(direta.resumoConsumidor).toBeNull();
    expect(direta.cascata).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/calculo/index.test.ts`
Expected: FAIL — `Failed to resolve import "./index"`.

- [ ] **Step 3: Implementar**

`src/lib/calculo/index.ts`:

```ts
import { calcularCustoBase } from './custo';
import { calcularMarkup, calcularPrecoCanal } from './preco';
import { calcularCapacidade, montarCascata, montarResumoUnitario } from './resultado';
import type { EntradaCalculo, Resultado, ResultadoDoCanal } from './tipos';

export * from './tipos';
export { arredondar, HORAS_FIXAS_MES } from './custo';
export { MARKUPS_ESCASSEZ } from './preco';

export function calcular(entrada: EntradaCalculo): Resultado {
  const custoBase = calcularCustoBase(entrada);
  const markup = calcularMarkup(entrada.perfilEscassez, entrada.ajusteMarkup);

  const canais: ResultadoDoCanal[] = entrada.canais.map((canal) => {
    const comum = {
      custoTotalBase: custoBase.custoTotalBase,
      custoMaterial: custoBase.custoMaterial,
      canal,
      impostoPercentual: entrada.impostoPercentual,
      taxaPagamentoPercentual: entrada.taxaPagamentoPercentual,
      percentualFalha: entrada.percentualFalha,
      valorFrete: entrada.valorFrete,
    };

    const consumidor = calcularPrecoCanal({ ...comum, markup: markup.consumidor });
    const lojista = calcularPrecoCanal({ ...comum, markup: markup.lojista });

    return {
      canalId: canal.id,
      canalNome: canal.nome,
      consumidor,
      lojista,
      resumoConsumidor: consumidor.ok
        ? montarResumoUnitario(custoBase, consumidor.preco, entrada.quantidade)
        : null,
      resumoLojista: lojista.ok
        ? montarResumoUnitario(custoBase, lojista.preco, entrada.quantidade)
        : null,
      cascata: consumidor.ok
        ? montarCascata(custoBase, consumidor.preco, canal.nome)
        : [],
      capacidade: consumidor.ok
        ? calcularCapacidade(
            entrada.tempoImpressaoMin,
            entrada.quantidade,
            consumidor.preco.lucroLiquido,
          )
        : null,
    };
  });

  return {
    custoBase,
    markupConsumidor: markup.consumidor,
    markupLojista: markup.lojista,
    canais,
  };
}
```

- [ ] **Step 4: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS — todos os arquivos de teste verdes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculo/index.ts src/lib/calculo/index.test.ts
git commit -m "feat: orquestrador calcular() com paridade ponta a ponta"
```

---

## Task 8: Dados em JSON

**Files:**
- Create: `src/lib/dados/impressoras.json`, `canais.json`, `tarifas-energia.json`
- Create: `src/lib/dados/index.ts`

- [ ] **Step 1: Impressoras**

`src/lib/dados/impressoras.json` — copiadas de `../system3dlab/backend/src/modules/precificacao/impressoras/impressoras-padrao.ts`, **sem** o campo `taxaHoraria` (morto na origem, ver spec seção 4):

```json
{
  "referencia": "2026-09",
  "itens": [
    { "chave": "bambu-lab-a1", "nome": "Bambu Lab A1", "marca": "Bambu Lab", "precoCompra": 3000, "vidaUtilHoras": 6000, "consumoKwh": 0.12, "custoManutencaoMes": 30 },
    { "chave": "bambu-lab-a1-mini", "nome": "Bambu Lab A1 Mini", "marca": "Bambu Lab", "precoCompra": 1800, "vidaUtilHoras": 5000, "consumoKwh": 0.06, "custoManutencaoMes": 25 },
    { "chave": "bambu-lab-p1s", "nome": "Bambu Lab P1S", "marca": "Bambu Lab", "precoCompra": 5000, "vidaUtilHoras": 7000, "consumoKwh": 0.14, "custoManutencaoMes": 50 },
    { "chave": "bambu-lab-x1-carbon", "nome": "Bambu Lab X1 Carbon", "marca": "Bambu Lab", "precoCompra": 9000, "vidaUtilHoras": 8000, "consumoKwh": 0.16, "custoManutencaoMes": 80 },
    { "chave": "creality-ender-3-v3-se", "nome": "Creality Ender-3 V3 SE", "marca": "Creality", "precoCompra": 1600, "vidaUtilHoras": 4000, "consumoKwh": 0.1, "custoManutencaoMes": 40 },
    { "chave": "creality-ender-3-v3-ke", "nome": "Creality Ender-3 V3 KE", "marca": "Creality", "precoCompra": 2200, "vidaUtilHoras": 4500, "consumoKwh": 0.11, "custoManutencaoMes": 45 },
    { "chave": "creality-k1c", "nome": "Creality K1C", "marca": "Creality", "precoCompra": 3800, "vidaUtilHoras": 6000, "consumoKwh": 0.14, "custoManutencaoMes": 60 },
    { "chave": "original-prusa-mk4s", "nome": "Original Prusa MK4S", "marca": "Prusa Research", "precoCompra": 6500, "vidaUtilHoras": 8000, "consumoKwh": 0.1, "custoManutencaoMes": 45 },
    { "chave": "elegoo-neptune-4-pro", "nome": "Elegoo Neptune 4 Pro", "marca": "Elegoo", "precoCompra": 2200, "vidaUtilHoras": 4500, "consumoKwh": 0.11, "custoManutencaoMes": 45 },
    { "chave": "anycubic-kobra-3-combo", "nome": "Anycubic Kobra 3 Combo", "marca": "Anycubic", "precoCompra": 3000, "vidaUtilHoras": 5000, "consumoKwh": 0.12, "custoManutencaoMes": 50 }
  ]
}
```

- [ ] **Step 2: Canais**

`src/lib/dados/canais.json` — valores do seed da origem (`prisma/seed.ts:107-136`):

```json
{
  "referencia": "2026-09",
  "itens": [
    { "id": "DIRETA", "nome": "Venda direta", "taxaMarket": 0, "taxaFixa": 0, "taxaFixaTipo": "VALOR" },
    { "id": "SHOPEE", "nome": "Shopee", "taxaMarket": 14, "taxaFixa": 4, "taxaFixaTipo": "VALOR", "freteGratisShopee": false },
    { "id": "MERCADOLIVRE", "nome": "Mercado Livre", "taxaMarket": 16, "taxaFixa": 6.5, "taxaFixaTipo": "VALOR" }
  ]
}
```

- [ ] **Step 3: Tarifas de energia**

Antes de escrever o arquivo, pesquise a tarifa residencial média (B1, com tributos) por estado e use os valores encontrados. Registre a fonte e a data no campo `referencia`. Se a pesquisa não for possível, use `0.85` para todas as UFs e deixe o campo `referencia` explícito sobre isso — um valor uniforme declarado é melhor que 27 números inventados.

`src/lib/dados/tarifas-energia.json`:

```json
{
  "referencia": "<fonte e data da consulta>",
  "padrao": 0.85,
  "itens": [
    { "uf": "AC", "tarifa": 0.00 },
    { "uf": "AL", "tarifa": 0.00 }
  ]
}
```

Preencha as 27 UFs: AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO.

- [ ] **Step 4: Ponto de acesso tipado**

`src/lib/dados/index.ts`:

```ts
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

export const IMPRESSORAS: Impressora[] = impressoras.itens;
export const CANAIS_PADRAO: Canal[] = canais.itens as Canal[];
export const TARIFAS_ENERGIA = tarifas.itens;
export const TARIFA_PADRAO = tarifas.padrao;

export const IMPRESSORA_MANUAL = 'manual';
```

- [ ] **Step 5: Verificar e commitar**

Run: `npx tsc --noEmit`
Expected: sem erros.

```bash
git add src/lib/dados
git commit -m "feat: dados fixos de impressoras, canais e tarifas de energia"
```

---

## Task 9: Formatação e máscara de moeda

**Files:**
- Create: `src/lib/formato.ts`
- Test: `src/lib/formato.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

`src/lib/formato.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatarMoeda, formatarPercentual, formatarTempo, lerMoeda } from './formato';

describe('formatarMoeda', () => {
  it('formata no padrão brasileiro', () => {
    expect(formatarMoeda(1234.5)).toBe('R$ 1.234,50');
    expect(formatarMoeda(0)).toBe('R$ 0,00');
    expect(formatarMoeda(-12.3)).toBe('-R$ 12,30');
  });

  it('omite o símbolo quando pedido', () => {
    expect(formatarMoeda(1234.5, { simbolo: false })).toBe('1.234,50');
  });
});

describe('lerMoeda', () => {
  it('lê o que a pessoa digita', () => {
    expect(lerMoeda('1234,5')).toBe(1234.5);
    expect(lerMoeda('R$ 1.234,50')).toBe(1234.5);
    expect(lerMoeda('89.90')).toBe(89.9);
    expect(lerMoeda('89,90')).toBe(89.9);
  });

  it('devolve null para entrada vazia ou inválida', () => {
    expect(lerMoeda('')).toBeNull();
    expect(lerMoeda('   ')).toBeNull();
    expect(lerMoeda('abc')).toBeNull();
  });

  it('trata ponto como separador de milhar quando há vírgula decimal', () => {
    expect(lerMoeda('1.234.567,89')).toBe(1234567.89);
  });
});

describe('formatarTempo', () => {
  it('mostra horas e minutos', () => {
    expect(formatarTempo(200)).toBe('3h 20min');
    expect(formatarTempo(45)).toBe('45min');
    expect(formatarTempo(120)).toBe('2h');
  });
});

describe('formatarPercentual', () => {
  it('usa vírgula e corta zeros à direita', () => {
    expect(formatarPercentual(14)).toBe('14%');
    expect(formatarPercentual(3.99)).toBe('3,99%');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/formato.test.ts`
Expected: FAIL — `Failed to resolve import "./formato"`.

- [ ] **Step 3: Implementar**

`src/lib/formato.ts`:

```ts
const MOEDA = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const DECIMAL = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatarMoeda(valor: number, opcoes?: { simbolo?: boolean }): string {
  if (opcoes?.simbolo === false) return DECIMAL.format(valor);
  // Intl separa "R$" do numero com espaco inquebravel (U+00A0). Escrito como
  // escape de proposito: o caractere literal e invisivel no editor.
  return MOEDA.format(valor).replace(/\u00A0/g, ' ');
}

/**
 * Aceita o que a pessoa realmente digita ou cola: "1234,5", "R$ 1.234,50",
 * "89.90". Quando existe vírgula, o ponto é separador de milhar; quando não
 * existe, o ponto é o decimal.
 */
export function lerMoeda(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, '').trim();
  if (!limpo) return null;

  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo;

  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

export function formatarTempo(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = Math.round(minutos % 60);

  if (horas === 0) return `${resto}min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h ${resto}min`;
}

export function formatarPercentual(valor: number): string {
  const texto = Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  return `${texto}%`;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/formato.test.ts`
Expected: PASS — 9 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/formato.ts src/lib/formato.test.ts
git commit -m "feat: formatação e leitura de moeda, tempo e percentual"
```

---

## Task 10: Tokens visuais da direção "Selo"

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Escrever os tokens**

`src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-papel: #FFFFFF;
  --color-tinta: #100E0D;
  --color-tinta-2: #5C5651;
  --color-tinta-3: #6E675F;
  --color-superficie: #F5F3F1;
  --color-vermelho: #D01B2E;
  --color-vermelho-2: #A81523;

  --radius-campo: 2px;
  --radius-painel: 3px;
  --radius-modal: 4px;

  --font-display: 'Shippori Mincho', Georgia, serif;
  --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
}

@layer base {
  html { color-scheme: light; }

  body {
    background: var(--color-papel);
    color: var(--color-tinta);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  /* Todo número em coluna ou campo alinha na vírgula. */
  input[type="text"], input[type="number"], .numero {
    font-variant-numeric: tabular-nums;
  }

  ::selection { background: var(--color-vermelho); color: #FFF; }
}

@layer components {
  /*
   * A direção visual é barulhenta por natureza. A sombra sólida de 4px é
   * exclusiva de painel de primeiro nível; card fica em 3px; nada aninhado
   * dentro de painel recebe sombra. Ver spec, seção 8.2.
   */
  .painel {
    background: var(--color-papel);
    border: 1.5px solid var(--color-tinta);
    border-radius: var(--radius-painel);
    box-shadow: 4px 4px 0 var(--color-tinta);
  }

  .card-canal {
    background: var(--color-papel);
    border: 1.5px solid var(--color-tinta);
    border-radius: var(--radius-painel);
    box-shadow: 3px 3px 0 var(--color-tinta);
  }

  .titulo-painel {
    font-weight: 700;
    font-size: 0.5625rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
}
```

- [ ] **Step 2: Carregar as fontes**

Em `src/app/layout.tsx`, troque o `<html>` por:

```tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Shippori_Mincho } from 'next/font/google';
import './globals.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--fonte-sans',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'], weight: ['400', '500', '600'], variable: '--fonte-mono',
});
const display = Shippori_Mincho({
  subsets: ['latin'], weight: ['600', '700'], variable: '--fonte-display',
});

export const metadata: Metadata = {
  title: 'Calculadora de Preço 3D · Dojo Panda',
  description: 'Descubra quanto cobrar pela sua peça impressa em 3D.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

E aponte os tokens de fonte no `@theme` para as variáveis do `next/font`:

```css
  --font-display: var(--fonte-display), Georgia, serif;
  --font-sans: var(--fonte-sans), system-ui, sans-serif;
  --font-mono: var(--fonte-mono), ui-monospace, monospace;
```

- [ ] **Step 3: Verificar o build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, sem aviso de fonte.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: tokens visuais e tipografia da direção Selo"
```

---

## Task 11: Primitivos de UI

Cinco componentes, todos com dois ou mais usos reais nas telas seguintes. Nada além disso — aba, badge e alerta ficam inline onde forem usados (`CLAUDE.md`, seção "Sem abstração prematura").

**Files:**
- Create: `src/components/ui/painel.tsx`, `campo.tsx`, `campo-moeda.tsx`, `select.tsx`, `botao.tsx`

- [ ] **Step 1: Painel**

`src/components/ui/painel.tsx`:

```tsx
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
```

- [ ] **Step 2: Campo**

`src/components/ui/campo.tsx`:

```tsx
import { useId } from 'react';

interface CampoProps extends Omit<React.ComponentProps<'input'>, 'className'> {
  label: string;
  /** Esconde o rótulo visualmente sem tirá-lo do leitor de tela. Usado nas
   *  linhas repetidas da lista de custos do projeto, onde o cabeçalho já
   *  nomeia a coluna. O label continua existindo e continua associado. */
  ocultarLabel?: boolean;
  sufixo?: string;
  ajuda?: string;
}

export function Campo({ label, ocultarLabel, sufixo, ajuda, ...props }: CampoProps) {
  const id = useId();
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className={ocultarLabel ? 'sr-only' : 'block text-[11px] text-tinta-2 mb-1'}
      >
        {label}
      </label>
      <div className="flex items-center border-[1.5px] border-tinta rounded-[--radius-campo] bg-papel focus-within:shadow-[2px_2px_0_var(--color-vermelho)]">
        <input
          {...props}
          id={id}
          aria-describedby={idAjuda}
          className="w-full bg-transparent px-2 py-1.5 font-mono text-sm outline-none"
        />
        {sufixo && (
          <span className="px-2 text-[11px] text-tinta-3 shrink-0">{sufixo}</span>
        )}
      </div>
      {ajuda && (
        <p id={idAjuda} className="mt-1 text-[10px] text-tinta-3">{ajuda}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Campo de moeda**

Mantém o texto digitado enquanto o campo tem foco e formata ao sair — assim a pessoa consegue apagar e digitar livremente, sem o cursor pulando. O valor numérico sobe para o pai a cada tecla.

`src/components/ui/campo-moeda.tsx`:

```tsx
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

export function CampoMoeda({ label, valor, onChange, ajuda, ocultarLabel }: CampoMoedaProps) {
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
```

- [ ] **Step 4: Select e botão**

`src/components/ui/select.tsx`:

```tsx
import { useId } from 'react';

interface SelectProps extends Omit<React.ComponentProps<'select'>, 'className'> {
  label: string;
  opcoes: Array<{ valor: string; rotulo: string }>;
}

export function Select({ label, opcoes, ...props }: SelectProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-[11px] text-tinta-2 mb-1">
        {label}
      </label>
      <select
        {...props}
        id={id}
        className="w-full border-[1.5px] border-tinta rounded-[--radius-campo] bg-papel px-2 py-1.5 text-sm outline-none focus:shadow-[2px_2px_0_var(--color-vermelho)]"
      >
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
        ))}
      </select>
    </div>
  );
}
```

`src/components/ui/botao.tsx`:

```tsx
interface BotaoProps extends Omit<React.ComponentProps<'button'>, 'className'> {
  variante?: 'primario' | 'secundario';
}

export function Botao({ variante = 'primario', ...props }: BotaoProps) {
  const base =
    'rounded-[--radius-campo] border-[1.5px] border-tinta px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-transform active:translate-x-[2px] active:translate-y-[2px]';

  const estilo =
    variante === 'primario'
      ? 'bg-tinta text-papel shadow-[3px_3px_0_var(--color-vermelho)] active:shadow-[1px_1px_0_var(--color-vermelho)]'
      : 'bg-papel text-tinta shadow-[3px_3px_0_var(--color-tinta)] active:shadow-[1px_1px_0_var(--color-tinta)]';

  return <button {...props} className={`${base} ${estilo}`} />;
}
```

- [ ] **Step 5: Verificar e commitar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros.

```bash
git add src/components/ui
git commit -m "feat: primitivos de UI da direção Selo"
```

---

## Task 12: Estado da calculadora e seções de entrada

**Files:**
- Create: `src/components/calculadora.tsx`, `secao-material.tsx`, `secao-impressao.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Estado e cenário inicial**

`src/components/calculadora.tsx` — as entradas são `useState`; o resultado é derivado na renderização, sem estado próprio e sem efeito.

```tsx
'use client';

import { useState } from 'react';
import { calcular, type Canal, type PerfilEscassez, type ItemProjeto } from '@/lib/calculo';
import { CANAIS_PADRAO, IMPRESSORAS, TARIFA_PADRAO } from '@/lib/dados';
import { SecaoMaterial } from './secao-material';
import { SecaoImpressao } from './secao-impressao';

export interface EstadoCalculadora {
  precoRolo: number;
  pesoRolo: number;
  pesoGramas: number;
  impressoraChave: string;
  precoCompraImpressora: number;
  vidaUtilHorasImpressora: number;
  custoManutencaoMes: number;
  consumoKwh: number;
  uf: string;
  custoKwh: number;
  tempoImpressaoMin: number;
  quantidade: number;
  percentualFalha: number;
  itensProjeto: ItemProjeto[];
  valorFrete: number;
  perfilEscassez: PerfilEscassez;
  ajusteMarkup: number;
  impostoPercentual: number;
  taxaPagamentoPercentual: number;
  canais: Canal[];
  canalAtivo: string;
}

const P1S = IMPRESSORAS.find((i) => i.chave === 'bambu-lab-p1s')!;

const ESTADO_INICIAL: EstadoCalculadora = {
  precoRolo: 89.9,
  pesoRolo: 1000,
  pesoGramas: 42,
  impressoraChave: P1S.chave,
  precoCompraImpressora: P1S.precoCompra,
  vidaUtilHorasImpressora: P1S.vidaUtilHoras,
  custoManutencaoMes: P1S.custoManutencaoMes,
  consumoKwh: P1S.consumoKwh,
  uf: 'SP',
  custoKwh: TARIFA_PADRAO,
  tempoImpressaoMin: 200,
  quantidade: 1,
  percentualFalha: 0,
  itensProjeto: [],
  valorFrete: 0,
  perfilEscassez: 'DEMANDA_PADRAO',
  ajusteMarkup: 1,
  impostoPercentual: 0,
  taxaPagamentoPercentual: 0,
  canais: CANAIS_PADRAO,
  canalAtivo: 'DIRETA',
};

export function Calculadora() {
  const [estado, setEstado] = useState(ESTADO_INICIAL);

  const alterar = <C extends keyof EstadoCalculadora>(
    campo: C,
    valor: EstadoCalculadora[C],
  ) => setEstado((atual) => ({ ...atual, [campo]: valor }));

  const precoKg =
    estado.pesoRolo > 0 ? (estado.precoRolo / estado.pesoRolo) * 1000 : 0;

  const resultado = calcular({
    precoKg,
    pesoGramas: estado.pesoGramas,
    quantidade: estado.quantidade,
    tempoImpressaoMin: estado.tempoImpressaoMin,
    precoCompraImpressora: estado.precoCompraImpressora,
    vidaUtilHorasImpressora: estado.vidaUtilHorasImpressora,
    custoManutencaoMes: estado.custoManutencaoMes,
    consumoKwh: estado.consumoKwh,
    custoKwh: estado.custoKwh,
    itensProjeto: estado.itensProjeto,
    percentualFalha: estado.percentualFalha,
    valorFrete: estado.valorFrete,
    perfilEscassez: estado.perfilEscassez,
    ajusteMarkup: estado.ajusteMarkup,
    impostoPercentual: estado.impostoPercentual,
    taxaPagamentoPercentual: estado.taxaPagamentoPercentual,
    canais: estado.canais,
  });

  const canalAtivo =
    resultado.canais.find((c) => c.canalId === estado.canalAtivo) ?? resultado.canais[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between border-b-2 border-tinta pb-3">
        <h1 className="font-display text-lg font-bold">
          DOJO PANDA <span className="text-vermelho">・</span> 3D
        </h1>
        <span className="rounded-[--radius-campo] bg-vermelho px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-papel">
          Calculadora
        </span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="grid gap-5">
          <SecaoMaterial estado={estado} alterar={alterar} precoKg={precoKg} />
          <SecaoImpressao estado={estado} alterar={alterar} setEstado={setEstado} />
        </div>
        <pre className="painel overflow-auto p-4 text-[10px]">
          {JSON.stringify({ custoBase: resultado.custoBase, canalAtivo }, null, 2)}
        </pre>
      </div>
    </main>
  );
}
```

> O `<pre>` é andaime temporário para conferir os números durante as tasks 12–13. Ele sai na Task 14.

- [ ] **Step 2: Seção Material**

`src/components/secao-material.tsx`:

```tsx
'use client';

import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';
import { formatarMoeda } from '@/lib/formato';
import type { EstadoCalculadora } from './calculadora';

interface Props {
  estado: EstadoCalculadora;
  alterar: <C extends keyof EstadoCalculadora>(campo: C, valor: EstadoCalculadora[C]) => void;
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
      <div className="mt-3">
        <Campo
          label="Peso da peça"
          sufixo="g"
          inputMode="decimal"
          ajuda={`Equivale a ${formatarMoeda(precoKg)} por quilo. O fatiador mostra esse peso antes de imprimir.`}
          value={estado.pesoGramas}
          onChange={(e) => alterar('pesoGramas', Math.max(Number(e.target.value) || 0, 0))}
        />
      </div>
    </Painel>
  );
}
```

- [ ] **Step 3: Seção Impressão**

`src/components/secao-impressao.tsx`:

```tsx
'use client';

import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';
import { Select } from './ui/select';
import { IMPRESSORAS, IMPRESSORA_MANUAL, TARIFAS_ENERGIA, TARIFA_PADRAO } from '@/lib/dados';
import type { EstadoCalculadora } from './calculadora';

interface Props {
  estado: EstadoCalculadora;
  alterar: <C extends keyof EstadoCalculadora>(campo: C, valor: EstadoCalculadora[C]) => void;
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
            label="Vida útil" sufixo="h" inputMode="numeric"
            value={estado.vidaUtilHorasImpressora}
            onChange={(e) => alterar('vidaUtilHorasImpressora', Math.max(Number(e.target.value) || 0, 0))}
          />
          <Campo
            label="Consumo" sufixo="kW" inputMode="decimal"
            ajuda="Potência média. Uma impressora comum fica entre 0,06 e 0,16."
            value={estado.consumoKwh}
            onChange={(e) => alterar('consumoKwh', Math.max(Number(e.target.value) || 0, 0))}
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
          label="Tempo" sufixo="min" inputMode="numeric"
          value={estado.tempoImpressaoMin}
          onChange={(e) => alterar('tempoImpressaoMin', Math.max(Number(e.target.value) || 0, 0))}
        />
        <Campo
          label="Quantidade" inputMode="numeric"
          value={estado.quantidade}
          onChange={(e) => alterar('quantidade', Math.max(Number(e.target.value) || 1, 1))}
        />
        <Campo
          label="Reserva p/ falha" sufixo="%" inputMode="decimal"
          value={estado.percentualFalha}
          onChange={(e) => alterar('percentualFalha', Math.min(Math.max(Number(e.target.value) || 0, 0), 100))}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Select
          label="Estado"
          value={estado.uf}
          onChange={(e) => trocarUf(e.target.value)}
          opcoes={TARIFAS_ENERGIA.map((t) => ({ valor: t.uf, rotulo: t.uf }))}
        />
        <CampoMoeda
          label="Tarifa de energia"
          ajuda="Procure o valor do kWh na sua conta de luz."
          valor={estado.custoKwh}
          onChange={(valor) => alterar('custoKwh', valor)}
        />
      </div>
    </Painel>
  );
}
```

- [ ] **Step 4: Ligar na página**

`src/app/page.tsx`:

```tsx
import { Calculadora } from '@/components/calculadora';

export default function Home() {
  return <Calculadora />;
}
```

- [ ] **Step 5: Conferir no navegador**

Run: `npm run dev`
Abra `http://localhost:3020`. Confirme: trocar a impressora muda os quatro valores; escolher "Outra impressora…" abre os campos manuais; trocar a UF muda a tarifa; o JSON do andaime recalcula a cada tecla.

- [ ] **Step 6: Commit**

```bash
git add src/components src/app/page.tsx
git commit -m "feat: estado da calculadora e seções de material e impressão"
```

---

## Task 13: Seções de custos do projeto e precificação

**Files:**
- Create: `src/components/secao-projeto.tsx`, `secao-precificacao.tsx`
- Modify: `src/components/calculadora.tsx`

- [ ] **Step 1: Seção Custos do projeto**

`src/components/secao-projeto.tsx`:

```tsx
'use client';

import { totalDoItem } from '@/lib/calculo/custo';
import { formatarMoeda } from '@/lib/formato';
import type { ItemProjeto } from '@/lib/calculo';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';
import { Painel } from './ui/painel';
import type { EstadoCalculadora } from './calculadora';

interface Props {
  estado: EstadoCalculadora;
  alterar: <C extends keyof EstadoCalculadora>(campo: C, valor: EstadoCalculadora[C]) => void;
}

export function SecaoProjeto({ estado, alterar }: Props) {
  const alterarItem = (indice: number, mudanca: Partial<ItemProjeto>) =>
    alterar(
      'itensProjeto',
      estado.itensProjeto.map((item, i) => (i === indice ? { ...item, ...mudanca } : item)),
    );

  const total = estado.itensProjeto.reduce((soma, item) => soma + totalDoItem(item), 0);

  return (
    <Painel titulo="Custos do projeto">
      {estado.itensProjeto.length === 0 && (
        <p className="mb-3 text-[11px] text-tinta-3">
          Caixa, ímã, parafuso, tinta, etiqueta — o que entra na peça além do filamento.
        </p>
      )}

      {estado.itensProjeto.map((item, indice) => (
        <div key={indice} className="mb-2 grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
          <Campo
            label="Item"
            ocultarLabel={indice > 0}
            value={item.nome}
            onChange={(e) => alterarItem(indice, { nome: e.target.value })}
          />
          <div className="w-28">
            <CampoMoeda
              label="Valor"
              ocultarLabel={indice > 0}
              valor={item.valorUnitario}
              onChange={(valor) => alterarItem(indice, { valorUnitario: valor })}
            />
          </div>
          <div className="w-16">
            <Campo
              label="Qtd."
              ocultarLabel={indice > 0}
              inputMode="numeric"
              value={item.quantidade}
              onChange={(e) => alterarItem(indice, { quantidade: Math.max(Number(e.target.value) || 1, 1) })}
            />
          </div>
          <button
            type="button"
            aria-label={`Remover ${item.nome || 'item'}`}
            onClick={() => alterar('itensProjeto', estado.itensProjeto.filter((_, i) => i !== indice))}
            className="mb-1.5 px-2 text-tinta-2 hover:text-vermelho"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="mt-3 flex items-center justify-between border-t-[1.5px] border-tinta pt-2">
        <button
          type="button"
          onClick={() => alterar('itensProjeto', [...estado.itensProjeto, { nome: '', valorUnitario: 0, quantidade: 1 }])}
          className="text-[11px] font-semibold uppercase tracking-wider text-vermelho hover:text-vermelho-2"
        >
          + Adicionar item
        </button>
        <span className="font-mono text-sm font-semibold">{formatarMoeda(total)}</span>
      </div>

      <div className="mt-4 border-t-[1.5px] border-dashed border-tinta-3 pt-3">
        <CampoMoeda
          label="Frete que você repassa ao cliente"
          ajuda="Entra no preço final sem gerar lucro."
          valor={estado.valorFrete}
          onChange={(valor) => alterar('valorFrete', valor)}
        />
      </div>
    </Painel>
  );
}
```

- [ ] **Step 2: Seção Precificação**

`src/components/secao-precificacao.tsx`:

```tsx
'use client';

import type { PerfilEscassez } from '@/lib/calculo';
import { Campo } from './ui/campo';
import { Painel } from './ui/painel';
import { Select } from './ui/select';
import type { EstadoCalculadora } from './calculadora';

const PERFIS: Array<{ valor: PerfilEscassez; rotulo: string; explicacao: string }> = [
  { valor: 'DEMANDA_PADRAO', rotulo: 'Demanda padrão', explicacao: 'Peça de catálogo, que qualquer um consegue imprimir.' },
  { valor: 'PROJETO_EXCLUSIVO', rotulo: 'Projeto exclusivo', explicacao: 'Modelagem sua ou sob encomenda. Vale mais porque só você faz.' },
  { valor: 'SAZONAL', rotulo: 'Sazonal', explicacao: 'Natal, Dia das Mães, evento com data marcada.' },
];

interface Props {
  estado: EstadoCalculadora;
  alterar: <C extends keyof EstadoCalculadora>(campo: C, valor: EstadoCalculadora[C]) => void;
  markupConsumidor: number;
  markupLojista: number;
}

export function SecaoPrecificacao({ estado, alterar, markupConsumidor, markupLojista }: Props) {
  const perfil = PERFIS.find((p) => p.valor === estado.perfilEscassez)!;

  return (
    <Painel titulo="Precificação">
      <Select
        label="Tipo de peça"
        value={estado.perfilEscassez}
        onChange={(e) => alterar('perfilEscassez', e.target.value as PerfilEscassez)}
        opcoes={PERFIS.map((p) => ({ valor: p.valor, rotulo: p.rotulo }))}
      />
      <p className="mt-1 text-[10px] text-tinta-3">{perfil.explicacao}</p>

      <div className="mt-3">
        <label htmlFor="ajuste-markup" className="block text-[11px] text-tinta-2 mb-1">
          Ajuste de markup
        </label>
        <div className="flex items-center gap-3">
          <input
            id="ajuste-markup"
            type="range" min={1} max={2} step={0.05}
            value={estado.ajusteMarkup}
            onChange={(e) => alterar('ajusteMarkup', Number(e.target.value))}
            className="flex-1 accent-[var(--color-vermelho)]"
          />
          <span className="w-12 font-mono text-sm">{estado.ajusteMarkup.toFixed(2)}×</span>
        </div>
        <p className="mt-1 text-[10px] text-tinta-3">
          Multiplicador final: {markupConsumidor.toFixed(2)}× no consumidor,{' '}
          {markupLojista.toFixed(2)}× no lojista.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Campo
          label="Imposto" sufixo="%" inputMode="decimal"
          ajuda="MEI costuma deixar em 0."
          value={estado.impostoPercentual}
          onChange={(e) => alterar('impostoPercentual', Math.min(Math.max(Number(e.target.value) || 0, 0), 100))}
        />
        <Campo
          label="Taxa de pagamento" sufixo="%" inputMode="decimal"
          ajuda="Maquininha, Pix com taxa, gateway."
          value={estado.taxaPagamentoPercentual}
          onChange={(e) => alterar('taxaPagamentoPercentual', Math.min(Math.max(Number(e.target.value) || 0, 0), 100))}
        />
      </div>
    </Painel>
  );
}
```

- [ ] **Step 3: Montar as quatro seções**

Em `calculadora.tsx`, importe as duas novas e substitua o bloco da coluna esquerda:

```tsx
        <div className="grid gap-5">
          <SecaoMaterial estado={estado} alterar={alterar} precoKg={precoKg} />
          <SecaoImpressao estado={estado} alterar={alterar} setEstado={setEstado} />
          <SecaoProjeto estado={estado} alterar={alterar} />
          <SecaoPrecificacao
            estado={estado}
            alterar={alterar}
            markupConsumidor={resultado.markupConsumidor}
            markupLojista={resultado.markupLojista}
          />
        </div>
```

- [ ] **Step 4: Conferir no navegador**

Run: `npm run dev`
Confirme: adicionar e remover itens funciona, o total soma, o slider muda os dois multiplicadores exibidos e o JSON do andaime reflete tudo.

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat: seções de custos do projeto e precificação"
```

---

## Task 14: Painel de resultado

Um único componente serve à coluna direita no desktop e à barra fixa no mobile — o mesmo preço renderizado duas vezes acabaria divergindo.

**Files:**
- Create: `src/components/painel-resultado.tsx`
- Modify: `src/components/calculadora.tsx` (remove o andaime `<pre>`)

- [ ] **Step 1: Implementar o painel**

`src/components/painel-resultado.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { formatarMoeda } from '@/lib/formato';
import type { ResultadoDoCanal } from '@/lib/calculo';

interface Props {
  canal: ResultadoDoCanal;
  quantidade: number;
}

export function PainelResultado({ canal, quantidade }: Props) {
  const [aberto, setAberto] = useState(false);

  if (!canal.consumidor.ok) {
    return (
      <section className="painel border-vermelho p-4" role="alert">
        <h2 className="titulo-painel mb-2 text-vermelho">Sem preço possível</h2>
        <p className="text-xs text-tinta-2">{canal.consumidor.motivo}</p>
      </section>
    );
  }

  const resumo = canal.resumoConsumidor!;
  const lojista = canal.lojista.ok ? canal.resumoLojista! : null;

  return (
    <section
      className="painel fixed inset-x-0 bottom-0 z-10 rounded-none border-x-0 border-b-0 shadow-none lg:static lg:rounded-[--radius-painel] lg:border-[1.5px] lg:shadow-[4px_4px_0_var(--color-tinta)]"
      aria-label="Resultado do cálculo"
    >
      <div className="p-4">
        <div className="rounded-[--radius-campo] bg-vermelho p-3 text-papel">
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] opacity-85">
            Consumidor final {quantidade > 1 && '· por peça'}
          </p>
          <p className="font-display text-3xl font-bold">{formatarMoeda(resumo.precoFinal)}</p>
          <p className="text-[10px] opacity-85">
            lucro {formatarMoeda(resumo.lucroLiquido)}
            {resumo.precoFinal > 0 &&
              ` · ${Math.round((resumo.lucroLiquido / resumo.precoFinal) * 100)}%`}
          </p>
        </div>

        {lojista && (
          <div className="mt-2 flex items-baseline justify-between border-[1.5px] border-tinta px-3 py-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-tinta-2">
              Lojista
            </span>
            <span className="font-display text-lg font-bold">
              {formatarMoeda(lojista.precoFinal)}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="mt-3 w-full text-left text-[10px] font-semibold uppercase tracking-wider text-vermelho lg:hidden"
        >
          {aberto ? 'Ocultar detalhes ⌄' : 'Ver detalhes ⌃'}
        </button>

        <div className={`${aberto ? 'block' : 'hidden'} lg:block`}>
          <dl className="mt-3 border-t-[1.5px] border-tinta pt-2">
            <Linha termo="Material" valor={resumo.material} />
            <Linha termo="Energia" valor={resumo.energia} />
            <Linha termo="Amortização" valor={resumo.amortizacao} />
            <Linha termo="Manutenção" valor={resumo.manutencao} />
            {resumo.projeto > 0 && <Linha termo="Custos do projeto" valor={resumo.projeto} />}
            {resumo.falhas > 0 && <Linha termo="Reserva para falhas" valor={resumo.falhas} />}
            {resumo.taxasCanal > 0 && <Linha termo="Taxas do canal" valor={resumo.taxasCanal} />}
            {resumo.frete > 0 && <Linha termo="Frete" valor={resumo.frete} />}
            <div className="mt-1 flex justify-between border-t-[1.5px] border-tinta pt-1 text-[11px] font-bold">
              <dt>Custo total</dt>
              <dd className="font-mono">{formatarMoeda(resumo.totalCustos)}</dd>
            </div>
          </dl>

          {canal.cascata.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-tinta-2">
                Como o preço vira lucro
              </summary>
              <dl className="mt-2">
                {canal.cascata.map((item, indice) => (
                  <div key={indice} className="flex justify-between py-0.5 text-[10px]">
                    <dt className={item.tipo === 'resultado' ? 'font-bold' : 'text-tinta-2'}>
                      {item.label}
                    </dt>
                    <dd
                      className={`font-mono ${
                        item.valor < 0 ? 'text-tinta-2' : 'font-semibold'
                      }`}
                    >
                      {formatarMoeda(item.valor)}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}

function Linha({ termo, valor }: { termo: string; valor: number }) {
  return (
    <div className="flex justify-between py-0.5 text-[10px]">
      <dt className="text-tinta-2">{termo}</dt>
      <dd className="font-mono">{formatarMoeda(valor)}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Ligar no lugar do andaime**

Em `calculadora.tsx`, troque o `<pre>` por `<PainelResultado canal={canalAtivo} quantidade={estado.quantidade} />` e adicione `className="pb-40 lg:pb-6"` no `<main>` — a barra fixa do mobile não pode cobrir o último campo.

Adicione também um `<div className="lg:hidden h-4" />` no fim da coluna de entradas se sobrar conteúdo escondido.

- [ ] **Step 3: Conferir nos dois tamanhos**

Run: `npm run dev`
No desktop: painel fica na coluna direita, detalhamento sempre aberto. Estreite a janela abaixo de 1024px: o painel gruda no rodapé e o botão "Ver detalhes" aparece. Confirme que nenhum campo fica coberto ao rolar até o fim.

- [ ] **Step 4: Commit**

```bash
git add src/components
git commit -m "feat: painel de resultado, responsivo entre coluna e barra fixa"
```

---

## Task 15: Comparativo de canais

**Files:**
- Create: `src/components/comparativo-canais.tsx`
- Modify: `src/components/calculadora.tsx`

- [ ] **Step 1: Implementar**

`src/components/comparativo-canais.tsx`:

```tsx
'use client';

import { formatarMoeda } from '@/lib/formato';
import type { Canal, ResultadoDoCanal } from '@/lib/calculo';
import { Campo } from './ui/campo';
import { CampoMoeda } from './ui/campo-moeda';

interface Props {
  canais: Canal[];
  resultados: ResultadoDoCanal[];
  canalAtivo: string;
  onSelecionar: (id: string) => void;
  onAlterarCanal: (id: string, mudanca: Partial<Canal>) => void;
}

export function ComparativoCanais({
  canais, resultados, canalAtivo, onSelecionar, onAlterarCanal,
}: Props) {
  const ativo = canais.find((c) => c.id === canalAtivo);

  return (
    <section className="mt-6" aria-label="Comparativo de canais de venda">
      <div role="tablist" className="mb-3 flex flex-wrap gap-2">
        {resultados.map((resultado) => (
          <button
            key={resultado.canalId}
            role="tab"
            aria-selected={resultado.canalId === canalAtivo}
            onClick={() => onSelecionar(resultado.canalId)}
            className={`rounded-[--radius-campo] border-[1.5px] border-tinta px-3 py-1.5 text-[10px] font-semibold ${
              resultado.canalId === canalAtivo ? 'bg-tinta text-papel' : 'bg-papel'
            }`}
          >
            {resultado.canalNome}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {resultados.map((resultado) => (
          <div key={resultado.canalId} className="card-canal p-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-tinta-2">
              {resultado.canalNome}
            </p>
            {resultado.consumidor.ok && resultado.resumoConsumidor ? (
              <>
                <p className="font-display text-lg font-bold">
                  {formatarMoeda(resultado.resumoConsumidor.precoFinal)}
                </p>
                <p className="text-[10px] text-tinta-2">
                  lucro {formatarMoeda(resultado.resumoConsumidor.lucroLiquido)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-[10px] text-vermelho">
                {resultado.consumidor.ok ? '' : resultado.consumidor.motivo}
              </p>
            )}
          </div>
        ))}
      </div>

      {ativo && ativo.id !== 'DIRETA' && (
        <div className="painel mt-4 p-4">
          <h3 className="titulo-painel mb-3">Taxas · {ativo.nome}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo
              label="Comissão" sufixo="%" inputMode="decimal"
              value={ativo.taxaMarket}
              onChange={(e) =>
                onAlterarCanal(ativo.id, {
                  taxaMarket: Math.min(Math.max(Number(e.target.value) || 0, 0), 100),
                })
              }
            />
            <CampoMoeda
              label="Taxa fixa"
              valor={ativo.taxaFixa}
              onChange={(valor) => onAlterarCanal(ativo.id, { taxaFixa: valor })}
            />
            {ativo.id === 'SHOPEE' && (
              <label className="flex items-end gap-2 pb-1.5 text-[11px]">
                <input
                  type="checkbox"
                  checked={ativo.freteGratisShopee ?? false}
                  onChange={(e) => onAlterarCanal(ativo.id, { freteGratisShopee: e.target.checked })}
                  className="accent-[var(--color-vermelho)]"
                />
                Programa de Frete Grátis (+6%)
              </label>
            )}
          </div>
          <p className="mt-2 text-[10px] text-tinta-3">
            Valores de referência de setembro de 2026. Confira a tabela atual da plataforma.
          </p>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Ligar**

Em `calculadora.tsx`, adicione depois da grade de duas colunas:

```tsx
      <ComparativoCanais
        canais={estado.canais}
        resultados={resultado.canais}
        canalAtivo={estado.canalAtivo}
        onSelecionar={(id) => alterar('canalAtivo', id)}
        onAlterarCanal={(id, mudanca) =>
          alterar('canais', estado.canais.map((c) => (c.id === id ? { ...c, ...mudanca } : c)))
        }
      />
```

- [ ] **Step 3: Conferir**

Run: `npm run dev`
Confirme: trocar de aba muda o painel de resultado; marcar o frete grátis da Shopee sobe o preço dela; zerar a comissão iguala à venda direta.

- [ ] **Step 4: Commit**

```bash
git add src/components
git commit -m "feat: comparativo de canais com edição de taxas"
```

---

## Task 16: Capacidade produtiva e revisão final

**Files:**
- Create: `src/components/capacidade-produtiva.tsx`
- Modify: `src/components/calculadora.tsx`

- [ ] **Step 1: Implementar**

`src/components/capacidade-produtiva.tsx`:

```tsx
import { formatarMoeda } from '@/lib/formato';
import type { Capacidade } from '@/lib/calculo';

export function CapacidadeProdutiva({ capacidade }: { capacidade: Capacidade }) {
  if (capacidade.pecasPorDia === 0) return null;

  return (
    <section className="painel mt-6 p-4" aria-label="Capacidade produtiva">
      <h3 className="titulo-painel mb-3">Se você produzir isso o mês inteiro</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica rotulo="Lucro por hora de impressora" valor={formatarMoeda(capacidade.lucroPorHora)} />
        <Metrica
          rotulo="Por dia"
          valor={formatarMoeda(capacidade.lucroPorDia)}
          nota={`${capacidade.pecasPorDia} peças`}
        />
        <Metrica rotulo="Potencial no mês" valor={formatarMoeda(capacidade.potencialMensal)} />
      </div>
      <p className="mt-3 text-[10px] text-tinta-3">
        Considerando {capacidade.horasUteisConsideradas}h de impressão por dia e{' '}
        {capacidade.diasUteisConsiderados} dias no mês, com a impressora sempre ocupada por esta peça.
      </p>
    </section>
  );
}

function Metrica({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-tinta-2">{rotulo}</p>
      <p className="font-display text-xl font-bold">{valor}</p>
      {nota && <p className="text-[10px] text-tinta-3">{nota}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Ligar**

Em `calculadora.tsx`, depois do comparativo:

```tsx
      {canalAtivo.capacidade && <CapacidadeProdutiva capacidade={canalAtivo.capacidade} />}
```

- [ ] **Step 3: Rodar a checagem completa**

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Expected: testes verdes, sem erro de tipo, sem erro de lint, build gerando `out/`.

- [ ] **Step 4: Revisão manual no navegador**

Percorra a lista de `CLAUDE.md`, seção "Checagem antes de concluir":

- Fluxo principal: alterar cada campo muda o preço
- Dado vazio: apagar o peso da peça mostra R$ 0,00 sem quebrar
- Erro de regra: imposto 95% + taxa de pagamento 10% mostra a mensagem no painel e nos cards, sem tela branca
- Teclado: `Tab` percorre todos os campos e o foco fica visível (sombra vermelha)
- Responsividade: 360px, 768px, 1280px e 1920px
- Zoom em 200%: nada escapa da tela

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat: capacidade produtiva"
```

---

## Auto-revisão do plano

**Cobertura do spec:**

| Seção do spec | Task |
|---|---|
| 5.1 Custo base | 4 |
| 5.2 Markup | 5 |
| 5.3 Preço por canal, Shopee, ML, faixas | 5 |
| 5.4 Capacidade produtiva | 6, 16 |
| 5.5 Resumo unitário | 6 |
| 5.6 Cascata | 6, 14 |
| 6 Dados em JSON | 8 |
| 7 Arquitetura | 1, 12 |
| 8.1 Layout e distribuição dos campos | 12, 13, 14 |
| 8.2 Direção visual e tokens | 10, 11 |
| 8.3 Estados | 12 (cenário inicial), 14 (erro), 16 (revisão) |
| 9 Testes | 2, 4, 5, 6, 7, 9 |

**Pendência conhecida:** as tarifas por UF (Task 8, Step 3) exigem pesquisa na hora da execução. O plano define o formato do arquivo e a saída aceitável caso a pesquisa falhe, então não é um placeholder — é uma instrução com resultado determinado nos dois caminhos.
