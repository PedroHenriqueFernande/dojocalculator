# Dojo Panda — Calculadora de Preço 3D

Calculadora de precificação para impressão 3D, vendida como infoproduto low ticket (R$ 19,90) pela Dojo Panda Story. O motor de cálculo é portado do System3D Lab (`../system3dlab`), isolado e sem cadastros.

Design e escopo: `docs/superpowers/specs/2026-09-03-calculadora-dojo-panda-design.md`.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind 4 · export estático. Sem banco de dados. Sem backend nesta fase.

---

# Padrão de engenharia

Estabilidade, clareza, previsibilidade, manutenibilidade, simplicidade e segurança acima de sofisticação técnica. Engenharia sólida, não demonstração de conhecimento.

**Princípio principal:** código simples, explícito e confiável — nunca código abstrato, fragmentado ou "engenhoso".

## Ordem de prioridade em caso de conflito

1. Correção
2. Segurança
3. Integridade dos dados
4. Clareza
5. Simplicidade
6. Manutenibilidade
7. Consistência
8. Performance
9. Elegância arquitetural

Nunca sacrifique os primeiros pelos últimos.

## Alterações cirúrgicas

Antes de mexer em código existente, entenda como ele funciona. Identifique o problema, a causa, o menor conjunto de alterações necessário, o que pode ser afetado e como preservar o comportamento atual.

Se a funcionalidade cabe em 2 ou 3 arquivos, ela não vira refatoração de 15. Não use uma tarefa pequena para reorganizar arquitetura, renomear em massa, trocar padrões ou bibliotecas, recriar componentes ou alterar contratos internos.

**Regra de ouro:** "preciso realmente modificar isso para resolver corretamente a tarefa atual?" Se não, não modifique. *"Ficaria mais elegante"* não é motivo.

Refatore apenas por motivo técnico concreto: bug estrutural, duplicação problemática, risco de manutenção, performance, segurança, ou bloqueio real para a implementação.

Ao encontrar código ruim, classifique antes de agir:

- **Não interfere na tarefa** → deixe como está
- **Interfere, mas é local** → corrija localmente
- **Impede solução segura** → refatore só o necessário para desbloquear
- **Risco crítico** → corrija e explique por que a mudança estrutural foi necessária

## Sem gambiarras

Proibido: hacks temporários · `setTimeout` para corrigir sincronização · valores mágicos espalhados · condicionais que mascaram bugs · `!important` em série · manipulação direta do DOM sem necessidade · estado duplicado · chamadas desnecessárias · erro tratado em silêncio · `try/catch` vazio · conversão de tipo insegura · `any` para fugir da tipagem · funções gigantes com múltiplos efeitos colaterais · lógica de negócio dentro de componente visual · duplicar código para evitar entender o que já existe.

Corrija a causa. Não esconda o sintoma.

## Sem abstração prematura

Não transforme trechos automaticamente em hook, helper, service, factory, provider, context, adapter, repository, wrapper, utility ou componente genérico.

Abstraia quando houver reutilização real ou separação de responsabilidade real. Função usada uma vez pode continuar local. Componente usado só naquela tela fica perto daquela tela. Se a abstração apenas desloca a complexidade para outro arquivo, ela não vale a pena.

**Regra prática deste projeto:** primitivo compartilhado nasce quando tem 2+ usos reais, não antes.

## Sem fragmentação excessiva

Não quebre uma funcionalidade simples em `Component.tsx` + `.types.ts` + `.utils.ts` + `.constants.ts` + `.hooks.ts` + `.styles.ts`. Agrupe o que pertence ao mesmo contexto.

Separe arquivo quando isso melhorar compreensão, reutilização, responsabilidade, testabilidade ou manutenção — nunca por hábito.

Mesma regra para componentes: nem toda `div`, título, linha ou botão vira componente. Um componente precisa de responsabilidade própria, reutilização, complexidade relevante, comportamento próprio ou isolamento que realmente melhore a leitura.

## Legibilidade

Nomes claros, fluxo previsível, variáveis semanticamente corretas, tipos bem definidos.

Comentário explica **por que** algo não óbvio existe — nunca narra o código. Nada de `// Busca os usuários` acima de `getUsers()`.

## Tipagem

Sem `any`, sem cast desnecessário, sem `as unknown as`, sem tipos excessivamente genéricos, sem interface duplicada, sem tipo incompatível forçado. Prefira inferência quando for clara. Tipagem aumenta segurança e legibilidade — não gera centenas de linhas de tipos.

## Estado e efeitos

Antes de criar `useState`: **esse valor é estado ou pode ser derivado?** Valor derivável se calcula direto, não se armazena.

Proibido sincronizar estado com efeito:

```ts
useEffect(() => { setSomething(otherSomething); }, [otherSomething]);
```

`useEffect` serve para efeito colateral real, não como ferramenta universal. Nada de cadeia `efeito A → estado → efeito B → estado → efeito C`. Operação que acontece em resposta a um clique é tratada no fluxo daquele clique.

## Performance

Sem otimização prematura. Não use `useMemo`, `useCallback`, memoização, virtualização ou cache local automaticamente. Escreva o código correto primeiro; otimize quando houver motivo mensurável ou risco evidente.

## Erros

Nunca ignore erro em silêncio — sem `catch {}`, sem `.catch(() => {})`. Decida conscientemente: exibir ao usuário, registrar, interromper, permitir retry ou devolver fallback.

## Assíncrono

Evite race condition, request duplicado, loading inconsistente, atualização após unmount e ação duplicada por múltiplos cliques. Trate com loading, bloqueio da ação, idempotência, cancelamento ou controle de concorrência — sem complexidade além da necessária.

## Dependências

Antes de instalar qualquer biblioteca: já existe algo no projeto que resolve? A plataforma já resolve? Dá para implementar de forma simples? É realmente necessária?

Cada dependência aumenta manutenção, tamanho, risco de segurança e incompatibilidade futura.

## Padrões do projeto

Procure como problemas semelhantes já foram resolvidos aqui e siga o padrão existente. Não introduza uma segunda arquitetura dentro da mesma aplicação. Se o padrão existente for claramente ruim, faça a menor melhoria estrutural necessária — não uma reescrita.

## Contratos compartilhados

Cuidado extremo ao alterar API, props, tipos compartilhados, schema, banco, hook usado em vários lugares, service ou componente global. Procure todos os usos antes. Não conserte uma tela quebrando três.

## Limites da tarefa

Tarefa de frontend não altera backend. Tarefa de tabela não reorganiza modelo de banco. Encontrou outro problema que não bloqueia a tarefa atual? Reporte, não corrija em cadeia.

Sempre que possível, **evolua o código existente** em vez de recriar a funcionalidade por preferir outra abordagem.

## Segurança

Validação no servidor, autorização, sanitização, proteção contra injeção, tratamento de upload, rate limiting, exposição de dado sensível, secrets, cookies, tokens, CORS, permissões, mass assignment. Nunca confie apenas no frontend para regra importante. Nunca coloque credencial, token ou secret no código.

## Checagem antes de concluir

Fluxo principal funciona · sem regressão óbvia · loading funciona · erro funciona · dado vazio funciona · múltiplos cliques não quebram · nulos tratados · componentes compartilhados não afetados · responsividade preservada · tipagem correta · regra de negócio intacta.

---

O resultado esperado: outro sênior abre o código e pensa *"isso é simples, correto e faz sentido"* — não *"por que sete abstrações para isso?"* nem *"funciona, mas ninguém deveria mexer nisso de novo"*.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
