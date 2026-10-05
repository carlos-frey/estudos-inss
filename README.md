# INSS Tracker

Tracker de progresso do edital de **Técnico do Seguro Social** (base: edital INSS 2022, Cebraspe).
React + Vite + MUI, publicado no GitHub Pages.

- Árvore matéria → tópico → subtópico; o estado dos pais é derivado das folhas (marcar todos os filhos marca o pai).
- Progresso ponderado pelo nº de itens da prova (P2 = 70 de 120). Pesos da P1 são estimativas: edite em `src/data/edital-2022.ts`.
- Revisões espaçadas (24h, 7d, 30d) ao marcar um tópico.
- Botão "Simulado" desabilitado em todos os nós (ação a implementar).
- Progresso em localStorage, exportar/importar `.json` e sync opcional com o Google Drive.

## Desenvolvimento
```
npm install
npm run dev     # http://localhost:5173/estudos-inss/
npm test
npm run build
```

## Sync com o Google Drive (configuração única)
1. No Google Cloud Console crie um projeto e ative a **Google Drive API**.
2. Tela de consentimento OAuth: tipo Externo, adicione seu e-mail como usuário de teste.
3. Credenciais → ID do cliente OAuth → Aplicativo da Web, com as origens
   `http://localhost:5173` e `https://carlos-frey.github.io`.
4. Local: `echo VITE_GOOGLE_CLIENT_ID=<id> > .env.local`. Deploy: variável do repositório
   `VITE_GOOGLE_CLIENT_ID` (Settings → Secrets and variables → Actions → Variables).

O app usa só o escopo `drive.appdata` (pasta oculta do app, sem acesso aos seus outros arquivos).
Sem o Client ID o botão do Drive não aparece.

## Deploy
Settings → Pages → Source: **GitHub Actions**. Cada push na `main` roda `.github/workflows/deploy.yml`.

## Quando sair o edital novo
Atualize `src/data/edital-2022.ts`. Os ids vêm da posição na árvore, então só acrescente itens no fim
de cada lista para não deslocar o progresso já salvo.
