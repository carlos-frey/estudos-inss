# Trilha do Edital

Tracker do conteúdo programático de concursos públicos, tópico a tópico.
React + Vite + MUI, publicado em https://carlos-frey.github.io/estudos-inss/.

Concursos disponíveis:
- **INSS**: Técnico do Seguro Social, edital 2022 (Cebraspe). Os pesos da P1 são estimativa; ajuste em `src/data/concursos/inss-2022.ts`.
- **Hemobrás**: edital 2024 (Instituto Consulplan) com a Retificação nº 1. São 5 matérias comuns e 45 empregos; você escolhe o seu e os conhecimentos do emprego (60 pontos) entram na prova.

Recursos:
- Árvore matéria → tópico → subtópico. O estado dos pais é calculado das folhas: marcar todos os filhos marca o pai.
- Progresso ponderado pelo peso de cada matéria na prova (itens ou pontos).
- Revisões espaçadas (24h, 7d, 30d) ao marcar um tópico.
- Botão "Simulado" desabilitado em todos os nós (ação a implementar).
- Progresso em localStorage, exportar/importar `.json` e sync opcional com o Google Drive. O progresso da versão antiga, só com o INSS, é migrado automaticamente.

## Adicionar ou atualizar um concurso
1. Crie `src/data/concursos/<nome>.ts` exportando um `Concurso` (veja `inss-2022.ts`). Use ids com o prefixo do concurso.
2. Registre-o em `src/data/registry.ts` e adicione o prefixo em `src/domain/migrate.ts` (`KNOWN_PREFIXES`).
3. Hemobrás: os conhecimentos do emprego são gerados a partir do texto do edital com
   `python3 scripts/gen_hemobras.py` (fontes em `scripts/hemobras/`), que gera `hemobras-empregos.json`.

Os ids vêm da posição na árvore. Em um edital já em uso, só acrescente itens no fim das listas para não deslocar o progresso salvo.

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
