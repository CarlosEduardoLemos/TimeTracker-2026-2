# Responsividade — Time Tracker

**Projeto:** Time Tracker Open Source  
**Versão:** 1.0.0  
**Status:** Rascunho  
**Data:** Setembro de 2026

---

## 1. Objetivo

Este documento define as diretrizes de responsividade do **Dashboard PWA** do Time Tracker.

O Agente Desktop não faz parte deste escopo.

---

## 2. Diretriz geral

O Dashboard deve se adaptar a diferentes larguras de tela sem comprometer:

- leitura das informações;
- acesso às funcionalidades;
- navegação;
- gráficos;
- tabelas;
- formulários.

Não deve existir transbordamento horizontal desnecessário na página.

---

## 3. Breakpoints

Os breakpoints específicos ainda serão definidos durante a implementação.

A interface deverá considerar pelo menos três comportamentos:

| Faixa | Comportamento esperado |
| --- | --- |
| Tela pequena | Conteúdo empilhado e navegação compacta |
| Tela média | Distribuição intermediária dos componentes |
| Tela grande | Aproveitamento amplo do espaço disponível |

Os valores exatos serão definidos conforme os testes da interface.

---

## 4. Componentes principais

### Painel

Cards e informações de acompanhamento devem reorganizar-se conforme o espaço disponível.

```text
Tela grande

[ Card ][ Card ][ Card ][ Card ]


Tela pequena

[ Card ]
[ Card ]
[ Card ]
[ Card ]
```

---

### Tabelas

Tabelas com muitas informações devem manter acesso ao conteúdo em telas menores.

Quando necessário, poderão utilizar:

- redução de colunas visíveis;
- reorganização das informações;
- rolagem horizontal no componente.

---

### Gráficos

Gráficos devem ajustar sua largura ao espaço disponível sem perder legibilidade.

---

### Formulários

Formulários de:

- colaboradores;
- tasks;
- jornada;
- configurações;

devem reorganizar campos conforme a largura da tela.

---

### Relatórios

Filtros e ações devem permanecer acessíveis em diferentes larguras.

O botão de exportação CSV/PDF deve continuar disponível.

---

## 5. Navegação

A navegação deve permitir acesso às principais áreas:

```text
Painel
Colaboradores
Tasks
Relatórios
Configurações
```

Em telas menores, a navegação poderá assumir uma apresentação compacta.

A forma visual será definida durante a implementação.

---

## 6. Critérios 

A interface responsiva deve garantir:

- conteúdo legível;
- ações acessíveis;
- ausência de sobreposição entre componentes;
- adaptação de cards, tabelas, gráficos e formulários;
- manutenção das funcionalidades disponíveis;
- navegação utilizável por teclado.

---

## 7. Tecnologias

O Dashboard utiliza:

- React;
- Vite;
- Tailwind CSS;
- Recharts.

A estratégia de responsividade deverá utilizar os recursos disponíveis no frontend definido pelo projeto.

---

## 8. Pendências

Ainda precisam ser definidos durante implementação e testes:

- valores exatos dos breakpoints;
- largura mínima suportada;
- navegadores suportados;
- comportamento final das tabelas em telas pequenas;
- protótipos ou referências visuais para cada tamanho de tela.  