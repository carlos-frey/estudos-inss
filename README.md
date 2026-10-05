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
O app grava um `progress.json` na pasta oculta do app no Drive de cada usuário (escopo `drive.appdata`,
classificado pelo Google como **não sensível**: o app não enxerga nenhum outro arquivo).
Sem o Client ID, o botão de nuvem não aparece e o app funciona só com o navegador.

1. Em https://console.cloud.google.com crie um projeto (ex.: "Trilha do Edital").
2. **APIs e serviços → Biblioteca**: ative a **Google Drive API**.
3. **Google Auth Platform → Branding/Público** (tela de consentimento): tipo **Externo**, nome do app,
   e-mail de suporte. Em **Acesso a dados**, adicione o escopo `.../auth/drive.appdata`.
   - Para só você usar: deixe em **Teste** e adicione seu e-mail em usuários de teste.
   - Para qualquer pessoa usar: **Publicar app** (em produção). Por ser um escopo não sensível, não exige a verificação completa do Google.
4. **Clientes → Criar cliente → Aplicativo da Web**, com origens JavaScript autorizadas
   `https://carlos-frey.github.io` e `http://localhost:5173`. Copie o **ID do cliente**
   (termina em `.apps.googleusercontent.com`; não é segredo, vai no código do site).
5. Deploy: `gh variable set VITE_GOOGLE_CLIENT_ID -R carlos-frey/estudos-inss --body "<id>"` e rode o
   workflow de novo. Local: `echo VITE_GOOGLE_CLIENT_ID=<id> > .env.local`.

Como funciona: o login abre um popup do Google; a sessão dura 1 hora (fica guardada só na aba). Mudanças
sobem 4 s depois da última edição e ao sair da aba; ao abrir em outro aparelho, o merge é por tópico
(vence a alteração mais recente). Quando a sessão expira, o ícone de nuvem fica amarelo e um clique reconecta.
O emprego escolhido na Hemobrás também é sincronizado.

## Deploy
Settings → Pages → Source: **GitHub Actions**. Cada push na `main` roda `.github/workflows/deploy.yml`.
