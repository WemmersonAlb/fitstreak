# 🔥 FitStreak

Aplicativo pessoal de acompanhamento nutricional. Transforma o plano alimentar e as orientações da nutricionista em uma experiência prática no celular: consulte o cardápio, registre refeições e água, acompanhe sua ofensiva de dias consecutivos, desbloqueie conquistas e veja sua evolução.

- 100% no navegador: sem servidor, sem login, sem serviços pagos.
- Funciona offline (PWA) e pode ser instalado na tela inicial.
- Idioma pt-BR, unidades métricas e datas no fuso **America/Recife**.

## Funcionalidades

| Área | O que faz |
| --- | --- |
| **Início** | Saudação, ofensiva atual com recorde e próxima conquista, progresso do dia (alimentação, hidratação, registro), hidratação rápida e refeições do dia. |
| **Alimentação** | Refeições do dia por momento (café, almoço, lanche, jantar, ceia) com variações do PDF; cardápio completo com as 8 categorias; lista de substituição com busca (15 grupos); sugestões de preparo; refeições livres. |
| **Hidratação** | Garrafa animada, botões +250/+350/+500/+750/+1.000 ml, quantidade personalizada, desfazer, lista de registros e gráfico de 7 dias. Meta padrão 3.300 ml (configurável). |
| **Histórico** | Calendário mensal com legenda de cores, detalhes de cada dia (refeições, água, refeição livre, motivo de o dia contar, observações), histórico de ofensivas. |
| **Estatísticas** | Indicadores gerais e gráficos (água 7/30/90 dias, % de dias com meta, refeições por semana, evolução da ofensiva e mensal). Apenas dados reais. |
| **Conquistas** | 41 conquistas (ofensiva, hidratação, alimentação e secretas), com celebrações especiais para 13, 42 e 67 dias. |
| **Ajustes** | Nome, tema (escuro/claro/sistema), meta de água, horários sugeridos, exportar/importar backup, backups automáticos. |

## Tecnologias

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · Lucide React · Recharts · React Router (HashRouter) · vite-plugin-pwa (Workbox) · Vitest + React Testing Library.

## Requisitos

- Node.js 20 ou superior (testado com Node 22)
- npm 10+

## Executar localmente

```bash
npm install        # instala dependências
npm run dev        # servidor em http://localhost:5173
npm test           # executa os testes
npm run build      # gera a versão de produção em dist/
npm run preview    # serve o build localmente
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie o projeto para a branch `main`.
2. No repositório, acesse **Settings → Pages → Build and deployment** e escolha **Source: GitHub Actions**.
3. A cada push na `main`, o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) instala as dependências, roda os testes, gera o build e publica.
4. O endereço será `https://<usuario>.github.io/<repositorio>/`.

O caminho base é definido automaticamente pela variável `BASE_PATH` (nome do repositório; `/` para repositórios `usuario.github.io`). As rotas usam `HashRouter` (`/#/historico`), então atualizar qualquer página interna funciona em hospedagem estática, sem erros 404.

Para gerar manualmente um build para um subcaminho:

```bash
BASE_PATH=/meu-repo/ npm run build          # Linux/macOS
$env:BASE_PATH="/meu-repo/"; npm run build  # PowerShell
```

## Como funciona a persistência

- Todos os dados ficam no **LocalStorage** do navegador, na chave `fitstreak:data`.
- Os componentes nunca acessam o LocalStorage diretamente: tudo passa por `StorageRepository` ([src/services/storage/repository.ts](src/services/storage/repository.ts)) e pelo contexto `AppDataProvider`.
- Cada alteração é salva automaticamente.
- O esquema é versionado (`schemaVersion`). Ao carregar, os dados são **migrados e validados** ([src/services/storage/schema.ts](src/services/storage/schema.ts)):
  - registros inválidos são descartados e o original é guardado como backup automático;
  - JSON corrompido é isolado em `fitstreak:corrupted:<data>` e o app inicia vazio, avisando o usuário;
  - campos desconhecidos são preservados em `extras`.
- Se o LocalStorage estiver indisponível (ex.: modo privado), o app funciona em memória e exibe um aviso.

> ⚠️ Os dados ficam apenas neste aparelho/navegador. Limpar os dados do site apaga o histórico. **Exporte backups regularmente.**

## Backup e recuperação

**Exportar:** Ajustes → *Exportar backup*. Gera `fitstreak-backup-AAAA-MM-DD.json` com versão do esquema, data, configurações, meta de água, registros de refeições e água, refeições livres, observações, conquistas, recordes e versão do plano.

**Importar:** Ajustes → *Importar backup* → selecione o arquivo. O app valida estrutura e versão, mostra um resumo (data, quantidades, período, avisos) e pergunta como importar:

- **Mesclar:** une registros por identificador, sem duplicar; mantém suas configurações; conquistas ficam com a data mais antiga e o recorde com o maior valor.
- **Substituir:** troca todos os dados pelos do arquivo (exige confirmação).

Antes de qualquer importação, um **backup automático** dos dados atuais é criado (até 3 são mantidos) e pode ser restaurado em Ajustes → *Backups automáticos*.

**Trocar de aparelho:** exporte no aparelho antigo, abra o app no novo e importe com *Substituir*.

## Atualizar o plano nutricional

Os dados do plano são estáticos e independentes dos componentes:

- [src/data/nutrition/plan.ts](src/data/nutrition/plan.ts): categorias de refeição, opções principais, substituições, observações, sugestões de preparo, receitas, orientações gerais e de refeições livres.
- [src/data/nutrition/substitutions.ts](src/data/nutrition/substitutions.ts): lista de substituição (grupos 1 a 15).

Ao receber um novo plano, edite esses arquivos e altere `PLAN_VERSION`. Os registros antigos guardam o texto do que foi consumido, então o histórico não se perde. Os PDFs originais ficam em `docs/nutricionista/` (ignorados pelo git por conterem dados pessoais).

## Estrutura

```
src/
  components/   common, layout, dashboard, meals, hydration, achievements, charts, calendar, backup
  pages/        Dashboard, Nutrition, Hydration, History (+Stats), Achievements, Settings
  data/         nutrition (plano + substituições), achievements (definições)
  services/     storage, backup, streak, achievements, hydration, meals, stats
  state/        AppDataContext (estado + ações), ToastContext
  hooks/        useToday, useApplyTheme, useWaterActions
  utils/        date (fuso America/Recife), format
  types/        tipos de domínio
```

Regras de negócio detalhadas: [docs/regras-de-negocio.md](docs/regras-de-negocio.md).

## Pendências conhecidas

- Pontos do PDF que merecem revisão com a nutricionista estão listados em Ajustes → *Sobre o plano* (sugestão 04 ausente no café da manhã, itens duplicados no almoço e na ceia, erro de digitação "queio").
- Não há notificações/lembretes (fora do escopo desta versão).
