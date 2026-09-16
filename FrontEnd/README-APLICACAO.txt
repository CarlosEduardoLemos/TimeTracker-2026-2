Este pacote é um OVERLAY da pasta FrontEnd, baseado no estado do repositório após o commit 2d16c84.

NÃO apague a pasta FrontEnd existente.
Extraia este ZIP e copie a pasta FrontEnd por cima da FrontEnd do seu repositório, aceitando substituir os arquivos existentes.
Arquivos que não aparecem neste pacote devem permanecer como estão no repositório.

Depois execute:
  cd FrontEnd
  npm ci
  npm test
  npm run build

Antes do commit:
  git status
  git diff -- FrontEnd
