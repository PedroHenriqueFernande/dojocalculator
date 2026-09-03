# Calculadora de Preço 3D — Dojo Panda

**Data:** 2026-09-03
**Status:** aprovado, pronto para plano de implementação

---

## 1. Contexto

Infoproduto low ticket (R$ 19,90) vendido pela **Dojo Panda Story**. O produto é uma calculadora de precificação para impressão 3D, isolada — o mesmo motor de cálculo do **System3D Lab** (sistema de gestão do Pedro), sem nenhuma funcionalidade em volta.

Público: quem está começando em impressão 3D e não consegue calcular o preço de uma peça. A dor não é "não sei quanto paguei no filamento" — é "não sei quanto cobrar, quanto disso é lucro, e por que na Shopee eu saio no prejuízo".

Sociedade 50/50; a marca e a responsabilidade ficam com a Dojo Panda Story.

**Fase atual: apenas frontend.** Backend e autenticação entram depois e não devem forçar refatoração do que for construído agora.

---

## 2. Decisões

| Tema | Decisão |
|---|---|
| Canais de venda | Venda direta + Shopee + Mercado Livre, com as estratégias específicas |
| Filamento | Campos livres: preço por kg e peso da peça — sem presets, sem cadastro |
| Manutenção da impressora | Mantida, vem no preset de cada impressora |
| Custos fixos mensais do negócio | **Fora** — não entra o rateio de aluguel/luz/internet ÷ 520 h |
| Custos do projeto | Dentro (mecanismo `acessoriosEmbalagens`, renomeado) |
| Capacidade produtiva | Mantida |
| Markup | 3 perfis de escassez + ajuste manual |
| Tarifa de energia | Dropdown por UF, editável |
| Persistência | Nenhuma. F5 zera. Sem banco de dados |
| Trava de acesso | Nenhuma agora; auth entra na fase de backend |
| Layout | Duas colunas no desktop, coluna única com barra fixa no mobile |
| Identidade | Direção "Selo": branco, preto, vermelho; sombra sólida deslocada |
| Campo de dinheiro | Máscara brasileira completa |

---

## 3. Escopo

### Dentro

Custo de material · custo de energia · amortização da impressora · manutenção rateada · custos do projeto · reserva de falha · frete repassado · imposto e taxa de pagamento · markup por perfil + ajuste manual · preço ao consumidor e ao lojista · três canais de venda · comparativo entre canais · cascata do lucro · capacidade produtiva.

### Fora

Cadastros de qualquer tipo (filamento, impressora, canal, custo) · rateio de custo fixo mensal · salvar, listar ou editar orçamento · geração de PDF · proposta personalizada · upload e parsing de G-code · controle de estoque · multi-moeda (BRL apenas) · multi-tenant · internacionalização · autenticação · banco de dados.

---

## 4. O que não será portado, e por quê

Duas descobertas na leitura do código-fonte:

**`custoTempo` está morto.** Ele é somado ao custo total em `custo-base.service.ts` mas está fixo em `0` na linha 47. Nunca contribui com nada.

**`taxaHoraria` é dado órfão.** Toda impressora do `IMPRESSORAS_PADRAO` carrega uma taxa horária (R$ 6/h na A1, R$ 10/h na X1 Carbon), mas como o único consumidor dela seria o `custoTempo`, o campo não entra em conta nenhuma.

Nenhum dos dois será portado, e `taxaHoraria` sai do JSON de impressoras. Se a intenção original era cobrar hora-máquina **além** da amortização, isso é cálculo novo — decisão de produto para outro momento, não portabilidade.

---

## 5. Motor de cálculo

Porta fiel em TypeScript puro, sem NestJS, sem injeção de dependência. Mesmas fórmulas e mesmo arredondamento (`Math.round(v * 100) / 100`) do sistema de origem.

### 5.1 Custo base

Origem: `backend/src/modules/precificacao/orcamentos/calculadora/custo-base.service.ts`

```
custoMaterial     = (precoKg / 1000) × pesoGramas × quantidade
tempoTotalHoras   = (tempoImpressaoMin / 60) × quantidade
custoEnergia      = (tempoImpressaoMin / 60) × consumoKwh × custoKwh × quantidade
amortizacaoHora   = precoCompraImpressora / vidaUtilHorasImpressora
custoAmortizacao  = amortizacaoHora × tempoTotalHoras

HORAS_FIXAS_MES        = 20 h/dia × 26 dias = 520
custoManutencaoPorHora = custoManutencaoMes / HORAS_FIXAS_MES
custoManutencaoRateado = custoManutencaoPorHora × tempoTotalHoras

custoProjeto      = Σ (valorUnitario × quantidade)

custoTotalBase = custoMaterial + custoEnergia + custoAmortizacao
               + custoManutencaoRateado + custoProjeto
```

`custoFixoRateado` some da fórmula (era `totalCustosFixos / 520 × tempoTotalHoras`).

O preço do filamento é informado sempre por quilo, que é como o mercado
vende e anuncia. Não há conversão a partir do peso do rolo.

### 5.2 Markup

Origem: constantes `MARKUPS_ESCASSEZ` em `orcamentos.service.ts:51`

| Perfil | Consumidor | Lojista |
|---|---|---|
| Demanda padrão | 1,6 | 1,4 |
| Projeto exclusivo | 2,4 | 2,0 |
| Sazonal | 2,0 | 1,6 |

```
markupEfetivo = arredondar(markupBase × ajusteManual)
```

`ajusteManual` tem mínimo 1 e padrão 1. O cálculo roda duas vezes — uma com o markup de consumidor, outra com o de lojista — produzindo os dois preços.

### 5.3 Preço por canal

Origem: `canal-preco.service.ts` e `estrategias/`

```
valorFalha    = custoMaterial × (percentualFalha / 100)
custoRepasse  = valorFalha + valorFrete

percentualTotal = taxaMarket + impostoPercentual + taxaPagamentoPercentual

divisor       = 1 − (percentualTotal + taxaFixaPercentual) / 100
subtotalMarkup = custoTotalBase × markup + custoRepasse
precoVenda    = (subtotalMarkup + taxaFixaValor) / divisor

lucroLiquido  = precoVenda − totalTaxas − custoTotalBase − valorFalha − valorFrete
```

`divisor <= 0` é erro de regra: as taxas somam 100% ou mais e não existe preço possível. A UI mostra mensagem explícita e não renderiza número.

Cada canal é calculado três vezes para alimentar a UI: sem falha, sem frete, e final. Isso permite mostrar quanto a reserva de falha e o frete custam em preço final.

**Shopee** (`shopee.strategy.ts`): quando o Programa de Frete Grátis está ativo, a comissão efetiva vira `taxaMarket + 6`.

**Mercado Livre** (`mercadolivre.strategy.ts`): se o preço calculado ficar abaixo de R$ 12,50, recalcula com `divisor − 0,5`.

**Faixas de taxa fixa** (`resolverFaixaTaxaFixa`): mantido. Hoje nenhum canal usa faixas, mas é o mecanismo que permite corrigir a tabela do Mercado Livre por JSON, sem tocar em código, quando ela mudar.

**Uma função, não três.** Na origem, `generico`, `shopee` e `mercadolivre` são três classes separadas por causa da injeção de dependência do NestJS, e o corpo do cálculo — taxas, totais, lucro — está copiado inteiro nas três. Sem NestJS não existe motivo para manter a duplicação, e copiá-la para um projeto novo seria importar um problema de manutenção conhecido: qualquer correção de fórmula precisaria ser feita em triplicata.

Aqui é uma função com as duas diferenças reais aplicadas como ajuste de entrada — a comissão efetiva da Shopee e o divisor reduzido do Mercado Livre. Menos código e uma única fonte da verdade. Os casos-ouro da seção 9 existem justamente para provar que essa consolidação não muda nenhum resultado.

**Simplificações:** o array `impostos[]` por canal sai — ficam os dois campos globais (`impostoPercentual`, `taxaPagamentoPercentual`) que o formulário já expunha. A taxa de gateway por canal (`taxaGatewayPercent` / `taxaGatewayFixa`) também sai: para os três canais desta calculadora ela seria sempre zero, e o custo de processamento já é coberto pela taxa de pagamento global. Conversão de moeda sai inteira.

### 5.4 Capacidade produtiva

Origem: `capacidade-produtiva.service.ts`

```
lucroPorPeca    = lucroLiquido / quantidade
lucroPorHora    = lucroPorPeca / (tempoImpressaoMin / 60)
pecasPorDia     = floor(20 / (tempoImpressaoMin / 60))
lucroPorDia     = pecasPorDia × lucroPorPeca
potencialMensal = lucroPorDia × 26
```

Base declarada na tela: 20 h/dia, 26 dias/mês.

### 5.5 Resumo unitário

Origem: `montarResumoPrecificacao` em `orcamentos.service.ts:2260`. Divide cada componente pela quantidade e devolve custo unitário, preço e lucro para consumidor e lojista. Portado sem o campo `custoFixo`.

### 5.6 Cascata

Origem: `montarCascata`. Lista ordenada de receita → deduções → custos → resultado, alimentando a visualização expansível do lucro. Portada sem os itens de custo fixo e de tempo.

---

## 6. Dados

Quatro arquivos JSON em `src/lib/dados/`. Nenhum banco.

**`impressoras.json`** — as 10 do `IMPRESSORAS_PADRAO` (Bambu Lab A1, A1 Mini, P1S, X1 Carbon; Creality Ender-3 V3 SE, V3 KE, K1C; Prusa MK4S; Elegoo Neptune 4 Pro; Anycubic Kobra 3 Combo). Campos: `chave`, `nome`, `marca`, `modelo`, `precoCompra`, `vidaUtilHoras`, `consumoKwh`, `custoManutencaoMes`. Sem `taxaHoraria`. Inclui uma opção "Outra impressora" que libera os campos para digitação manual.

**`canais.json`** — Venda direta (0% / R$ 0), Shopee (14% + R$ 4,00, com toggle de frete grátis), Mercado Livre (16% + R$ 6,50, com a regra dos R$ 12,50). Todos os valores editáveis na interface.

**`tarifas-energia.json`** — tarifa residencial média das 27 UFs, com fallback R$ 0,85. Editável.

**`markups.json`** — os três perfis de escassez.

> **Dado com validade.** Tarifas de energia e taxas de marketplace envelhecem. Cada arquivo carrega um campo `referencia` com a data, e a interface deixa tudo editável. Revisão anual entra no calendário do produto — uma calculadora paga com taxa de Shopee de dois anos atrás vira problema de suporte.

---

## 7. Arquitetura

Next.js 16 · React 19 · TypeScript · Tailwind 4 · export estático. Mesma stack do System3D Lab, para que o conhecimento seja transferível e o backend de autenticação encaixe depois sem trocar de fundação.

Sem Zustand, sem React Query, sem react-hook-form: não há servidor, não há cache, e o formulário tem uma tela só. As entradas são `useState` no componente raiz; o resultado é **derivado**, calculado direto na renderização a partir delas. Não há estado de resultado, não há efeito de sincronização. Sem `useMemo` — o motor é aritmética pura sobre um punhado de números, e memoizar isso seria otimização sem motivo mensurável.

```
src/
  app/
    layout.tsx  page.tsx  globals.css
  lib/
    calculo/
      tipos.ts        entradas e saídas
      custo.ts        custo base
      preco.ts        preço por canal — núcleo + Shopee + Mercado Livre
      resultado.ts    resumo unitário, cascata, capacidade produtiva
      index.ts        calcular(entrada) → resultado
    dados/
      impressoras.json  canais.json  tarifas-energia.json  markups.json
    formato.ts        moeda, percentual, tempo
  components/
    calculadora.tsx        estado das entradas + composição da tela
    secao-material.tsx
    secao-impressao.tsx
    secao-projeto.tsx
    secao-precificacao.tsx
    painel-resultado.tsx
    comparativo-canais.tsx
    capacidade-produtiva.tsx
    ui/
      campo.tsx  campo-moeda.tsx  select.tsx  painel.tsx  botao.tsx
```

O motor não importa nada de React. É função pura: entra objeto, sai objeto.

Três decisões sobre estrutura, para não fragmentar por hábito:

**A cascata do lucro não tem arquivo próprio.** É uma lista renderizada dentro do painel de resultado, usada em um lugar só.

**A barra fixa do mobile não é um componente separado.** É o mesmo `painel-resultado.tsx` reposicionado por CSS. Dois componentes renderizando o mesmo número seria duplicação esperando para divergir.

**A pasta `ui/` nasce com cinco primitivos, não mais.** São os que já têm dois ou mais usos reais na tela. Aba, badge e alerta ficam inline onde forem usados até que apareça o segundo uso.

---

## 8. Interface

### 8.1 Layout

**Desktop (≥ 900px)** — duas colunas. Esquerda: quatro blocos de entrada. Direita: painel de resultado *sticky* com preço ao consumidor em destaque, preço lojista, e o razão de custo unitário. Abaixo, na largura toda: abas de canal, comparativo dos três, cascata do lucro (expansível) e capacidade produtiva.

Distribuição dos campos entre os blocos:

| Bloco | Campos |
|---|---|
| Material | Preço do filamento /kg · peso da peça |
| Impressão | Impressora (dropdown) · tempo · quantidade · reserva de falha (%) · UF e tarifa de energia |
| Custos do projeto | Lista de itens (nome, valor unitário, quantidade) · frete repassado |
| Precificação | Perfil de escassez · ajuste de markup · imposto (%) · taxa de pagamento (%) |

As taxas de cada canal (comissão, taxa fixa, frete grátis da Shopee) ficam na área de canais, junto das abas — são configuração do canal, não da peça, e misturá-las aos campos da peça confundiria os dois níveis.

Escolher "Outra impressora" no dropdown libera preço de compra, vida útil, consumo e manutenção para digitação — necessário porque não há cadastro e dez modelos não cobrem todo mundo.

**Mobile (< 900px)** — coluna única na mesma ordem. O painel de resultado vira barra fixa no rodapé com o preço ao consumidor, que expande para o detalhamento completo.

Sem botão "calcular". Recalcula a cada tecla — é o que torna o markup interessante de mexer, e é o momento em que o produto prova seu valor.

### 8.2 Direção visual — "Selo"

Papel branco, tinta preta, vermelho de carimbo. Profundidade gráfica: sombra sólida deslocada, sem desfoque, como placas recortadas e coladas.

**Regra de contenção** — a estética é barulhenta por natureza, então o uso é regrado:

- Sombra sólida de 4px: **apenas painéis de primeiro nível**, dois ou três por tela
- Cards de canal: 3px, ficando um degrau abaixo na hierarquia
- Nada aninhado dentro de painel ganha sombra
- Bloco vermelho cheio: **exclusivo do preço ao consumidor**; lojista fica em contorno
- Shippori Mincho: só em números grandes e títulos de painel. Labels e corpo são sempre Plex Sans — mincho a 10px é ilegível

**Tokens**

```css
--papel:     #FFFFFF
--tinta:     #100E0D    /* 19:1  — texto, contornos, sombras */
--tinta-2:   #5C5651    /* 7,2:1 — texto secundário */
--tinta-3:   #6E675F    /* 5,6:1 — placeholder, legenda */
--superficie:#F5F3F1    /* zebra de tabela, estado desabilitado */
--vermelho:  #D01B2E    /* 5,4:1 — selo, foco, preço, alerta */
--vermelho-2:#A81523    /* hover */

--r-1: 2px   campos, badges
--r-2: 3px   painéis, cards
--r-3: 4px   modal

--borda: 1.5px solid var(--tinta)

--sombra-painel: 4px 4px 0 var(--tinta)
--sombra-card:   3px 3px 0 var(--tinta)
--sombra-botao:  3px 3px 0 var(--vermelho)
--sombra-foco:   2px 2px 0 var(--vermelho)

espaçamento: 4 · 8 · 12 · 16 · 24 · 32 · 48
```

**Tipografia** — Shippori Mincho 700 (display: preço 32px, números de canal 18px) · IBM Plex Sans 400/600/700 (títulos de painel 9px uppercase tracking .13em; corpo 13px; label 11px) · IBM Plex Mono 500 com `tabular-nums` (todos os valores em campo e em coluna numérica).

**Sem verde.** Lucro positivo é tinta; lucro negativo é vermelho. Introduzir uma quarta cor por semântica quebraria a identidade, e o vermelho já carrega bem o sinal de atenção.

**Microinteração** — botão primário desce `translate(2px, 2px)` no clique com a sombra caindo para 1px. Tátil, barato, coerente com placa colada. Nada além disso.

**Acessibilidade** — foco visível pela sombra vermelha de 2px somada a `outline` para modo de alto contraste. Todos os pares de cor acima passam WCAG AA para texto normal. Navegação completa por teclado. Campos com `label` associado e `inputmode="decimal"` nos numéricos.

### 8.3 Estados

Primeira abertura vem zerada, com um estado vazio explícito no lugar do preço: *"Seu preço aparece aqui"* mais a lista do que preencher. Os canais mostram travessão em vez de valor, e a capacidade produtiva não aparece.

Esse estado vazio não é decoração. Com custo zero a fórmula ainda devolve preço — a taxa fixa do canal precisa ser coberta de qualquer maneira, e no Mercado Livre isso derruba o resultado abaixo de R$ 12,50, dispara o divisor reduzido e produz um "lucro" que é só artefato do gross-up. Matematicamente correto; como tela, diria a um iniciante que dá para lucrar vendendo nada. Enquanto não há peça, não há preço.

A única exceção ao zero é a tarifa de energia, que parte de R$ 0,85 — quase ninguém sabe o valor do kWh de cabeça, e o campo é ajustável pelo estado.

Demais estados: digitando (recálculo contínuo), erro de campo (valor inválido ou negativo) e erro de regra (taxas somando ≥ 100% derrubam o cálculo, com explicação no lugar do número).

Não há estado de carregamento: o cálculo é síncrono e local.

---

## 9. Testes

Correção do cálculo **é** o produto. Se a conta erra, os R$ 19,90 viram reembolso.

O motor nasce com testes em Vitest, escritos antes da implementação.

**Como os casos-ouro são produzidos:** as classes de cálculo da origem são TypeScript comum — `new CustoBaseService()` e `new CanalPrecoService(new ShopeeStrategy(), new MercadoLivreStrategy())` instanciam sem NestJS, sem banco e sem tenant. Um script descartável em `../system3dlab` roda uma bateria de cenários por essas classes e imprime a saída, que vira arquivo de fixture aqui. A paridade passa a ser verificável, não assumida.

Os cenários:

- **Casos-ouro** — saídas capturadas da origem, cravadas como asserção, garantindo paridade fórmula a fórmula
- **Limites** — divisor ≤ 0 (taxas ≥ 100%), quantidade 1 e > 1, tempo zero, vida útil zero
- **Regra do Mercado Livre** — preço logo abaixo e logo acima de R$ 12,50
- **Regra da Shopee** — frete grátis ligado e desligado

Componentes de UI não recebem teste unitário nesta fase. O valor está no motor.

---

## 10. Fora desta fase

Autenticação e backend · trava de acesso pós-compra · salvar orçamento · exportar PDF · presets de filamento · histórico · comparação de cenários lado a lado · landing page de venda.

**Preço manual (cálculo reverso)** também fica de fora, e vale registrar por quê: a origem tem `precoConsumidorManual` / `precoLojistaManual`, onde a pessoa fixa o preço e vê a margem resultante em vez do contrário. É uma funcionalidade forte para este público — *"meu concorrente cobra R$ 35, eu sobrevivo nesse preço?"* — mas não foi pedida, e incluí-la em silêncio seria ampliar escopo por conta própria. Fica registrada aqui para ser puxada quando você decidir.

Nenhuma decisão desta fase deve precisar ser desfeita para acomodar essas. O motor puro e o estado local isolado no componente raiz garantem isso: quando o backend chegar, ele passa a alimentar os JSON e a envolver a página, sem tocar nas telas.

---

## 11. Riscos

**Dados envelhecendo** — tarifas de energia e taxas de marketplace mudam. Mitigado por deixar tudo editável e datado, mas exige revisão anual.

**Fidelidade do cálculo** — divergir do System3D Lab quebraria a promessa de "é a mesma calculadora". Mitigado pelos casos-ouro.

**A estética "Selo" em tela densa** — sombra sólida em excesso vira ruído visual. Mitigado pela regra de contenção da seção 8.2, que precisa ser respeitada em cada componente novo.

**Produto sem trava** — enquanto não houver autenticação, quem tiver o link usa. Aceito conscientemente para esta fase.
