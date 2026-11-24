# Regras de negócio — FitStreak

## Datas e fuso horário

- Todo registro pertence a um **dia local de America/Recife** (UTC−3, sem horário de verão), no formato `AAAA-MM-DD`.
- A conversão usa `Intl.DateTimeFormat` com `timeZone: 'America/Recife'`; a aritmética de dias (ontem, semanas, meses) é feita sobre a data em UTC puro. Assim, o fuso do aparelho, horário de verão de outros países ou viagens não criam “dias extras”.
- Semanas vão de **segunda a domingo**.
- Registros com data futura (relógio do aparelho adiantado em algum momento) são ignorados no cálculo da ofensiva.

## Dia acompanhado

Um dia é **acompanhado** quando existe pelo menos um destes registros nele:

1. Uma refeição do plano registrada;
2. Uma refeição livre registrada;
3. Um registro de água.

Não contam como atividade: abrir o app, editar configurações ou escrever observações do dia. O motivo de cada dia contar aparece no dashboard e no detalhe do dia no calendário.

Não é exigido completar todas as refeições nem bater a meta de água — os indicadores de alimentação e hidratação são independentes.

## Ofensiva (streak)

- Calculada **a partir do histórico** (não há contador incrementado ao abrir o app).
- **Ofensiva atual:** número de dias acompanhados consecutivos terminando hoje. Se hoje ainda não tem registro, mas ontem tinha, a ofensiva continua viva (“em risco”) até o fim do dia.
- Um dia sem registros interrompe a sequência.
- **Refeições livres não quebram a ofensiva**: elas contam como dia acompanhado.
- **Recorde:** maior sequência já registrada. O valor é guardado em `records.bestStreak` e nunca diminui, mesmo que registros sejam apagados.
- Registros podem ser feitos para datas passadas (ex.: esqueceu de registrar ontem); a ofensiva é recalculada automaticamente.

## Hidratação

- Meta padrão: **3.300 ml/dia** (orientação da nutricionista), configurável de 500 a 10.000 ml.
- Cada registro guarda a meta vigente. Alterar a meta vale para hoje e para os próximos dias; dias anteriores mantêm a meta da época.
- Cada dia começa do zero: não há compensação de dias anteriores.
- Registros aceitam de 1 a 3.000 ml (inteiros). É possível desfazer o último registro do dia ou remover qualquer registro.
- **Meta atingida:** total do dia ≥ meta do dia.
- Média diária e % de dias com meta consideram apenas dias com registro de água.

## Refeições

- O plano tem 8 categorias independentes (café da manhã c/ raiz, café da manhã, almoço c/ feijão, almoço, lanche, jantar, jantar c/ raiz, ceia), agrupadas em 5 momentos do dia para o acompanhamento diário. O usuário escolhe a variação que fez.
- Um registro pode ser: opção principal; com substituições (por item: principal, substituição listada, outro alimento do grupo indicado ou “não consumi”); sugestão de preparo; ou descrição livre. Horário, data e observações são registrados.
- O registro guarda o texto do que foi consumido, preservando o histórico mesmo se o plano mudar.
- Não há cálculo de calorias ou macronutrientes.

## Refeições livres

- Planejadas: **2 por semana** (segunda a domingo). O app mostra quantas foram usadas, sem bloquear nem punir registros acima disso.
- Podem ocupar um momento do dia (ex.: no lugar do jantar), que então aparece como “livre” no dashboard.
- No calendário, o dia com refeição livre aparece em azul — não é confundido com dia sem acompanhamento.

## Calendário

| Cor | Significado |
| --- | --- |
| Verde | Dia acompanhado e meta de água atingida |
| Amarelo | Dia acompanhado, meta de água não atingida |
| Azul | Dia com refeição livre |
| Cinza | Sem registros |

## Conquistas

- Avaliadas automaticamente após cada alteração e ao abrir o app/virar o dia.
- Uma vez desbloqueadas, **nunca são removidas** (mesmo apagando registros). A data de desbloqueio é registrada.
- Conquistas de ofensiva usam o **recorde** (maior sequência), então continuam válidas após perder a ofensiva.
- Conquistas secretas ficam ocultas até serem desbloqueadas.

| Tipo | Critérios |
| --- | --- |
| Ofensiva | 1, 3, 7, 13 (“Dia 13 — Não invente moda”), 14, 21, 30, 42 (“A resposta para tudo”), 50, 67 (“SIX SEVEN!”), 75, 100, 180 e 365 dias |
| Hidratação | 1.000 ml acumulados; meta atingida em 1, 7 e 30 dias; 10, 50 e 100 litros acumulados |
| Alimentação | 1ª refeição; dia completo (5 momentos com refeição ou refeição livre); refeições em 10 dias; 50 e 100 refeições; 1ª refeição livre; semana completa (seg–dom acompanhados, ≤ 2 refeições livres) |
| Secretas | 2 refeições livres na mesma semana; voltar após perder a ofensiva; meta de água em dia de refeição livre; 30 dias acompanhados; 50 e 100 dias de ofensiva; > 9.000 ml acumulados; desfazer registro de água; exportar backup; 10 refeições com substituições; 5 sugestões de preparo diferentes; sábado + domingo seguidos; 31/12 + 01/01 seguidos |

A conquista do dia 13 é apenas humor: não interfere nas orientações nem impede registrar refeição livre.

## Exportação e importação

- **Formato:** JSON `{ app: "fitstreak", schemaVersion, exportedAt, planVersion, data }`. Nome: `fitstreak-backup-AAAA-MM-DD.json`.
- **Validação:** apenas `JSON.parse` (nada é executado); tamanho máximo 10 MB; `app` precisa ser `fitstreak`; versões mais novas que o app são recusadas; versões antigas são migradas; cada registro é validado (tipos, datas, horários, limites) e inválidos são descartados com aviso; campos desconhecidos são preservados e informados.
- **Antes de importar:** resumo (data do backup, quantidades, período, avisos) e confirmação explícita.
- **Mesclar:** união por id sem duplicar; configurações atuais mantidas; conquistas com a data mais antiga; recorde com o maior valor; observações do mesmo dia são concatenadas.
- **Substituir:** troca todos os dados (confirmação destacada).
- **Backup preventivo:** antes de mesclar, substituir ou restaurar, os dados atuais são salvos automaticamente (últimos 3 mantidos). Se o backup preventivo falhar, a importação é cancelada.
