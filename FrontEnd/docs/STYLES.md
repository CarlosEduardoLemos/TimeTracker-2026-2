# Estilos e interface

## Organização

Tailwind CSS é a base visual. `src/index.css` contém variáveis, classes reutilizáveis, impressão e regras globais de acessibilidade.

## Tema

`useTheme()` persiste `timetracker-theme` e aplica `data-theme` ao `<html>`.

## Classes compartilhadas

| Classe | Finalidade |
| --- | --- |
| `control`, `icon-control` | Controles compactos do Dashboard |
| `primary-button`, `secondary-button` | Ações principais/secundárias |
| `form-field` | Inputs, selects e textareas das novas páginas, incluindo focus/disabled/dark |
| `avatar`, `status-dot` | Avatar e indicador de estado |
| `skip-link` | Atalho de teclado para o conteúdo principal |

## Responsividade

- layout principal sem overflow horizontal desnecessário;
- Sidebar fixa em desktop e drawer em telas menores que `lg`;
- cards reorganizados por breakpoints;
- tabelas podem usar rolagem horizontal dentro do próprio componente;
- formulários usam grids responsivos e mantêm labels próximas dos campos;
- largura mínima suportada pelo CSS atual: 320 px.

## Acessibilidade

- foco visível global não deve ser removido;
- controles somente com ícone exigem nome acessível;
- drawer mobile suporta `Escape` e retorno de foco;
- estados de integração/erro usam texto, não somente cor;
- `prefers-reduced-motion` reduz animações/transições;
- gráficos devem possuir contexto textual e não depender exclusivamente de cor para transmitir significado.
