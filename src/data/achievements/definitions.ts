export type AchievementCategory = 'ofensiva' | 'hidratacao' | 'alimentacao' | 'secreta';

export type AchievementMetric =
  | 'bestStreak'
  | 'trackedDays'
  | 'streakRuns'
  | 'totalWaterMl'
  | 'goalDays'
  | 'mealCount'
  | 'mealDays'
  | 'fullDays'
  | 'freeMealCount'
  | 'maxFreeMealsInAWeek'
  | 'substitutionMeals'
  | 'distinctSuggestions'
  | 'waterUndos'
  | 'exports'
  | 'plannedWeek'
  | 'weekendCombo'
  | 'newYearStreak'
  | 'waterOnFreeMealDay';

export type CelebrationStyle = 'default' | 'six-seven' | 'thirteen' | 'forty-two' | 'legendary';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  metric: AchievementMetric;
  target: number;
  /** Texto curto da condição de desbloqueio. */
  condition: string;
  secret?: boolean;
  celebration?: CelebrationStyle;
}

const streak = (
  days: number,
  id: string,
  title: string,
  emoji: string,
  description: string,
  celebration?: CelebrationStyle,
): AchievementDef => ({
  id,
  title,
  description,
  emoji,
  category: 'ofensiva',
  metric: 'bestStreak',
  target: days,
  condition: `Alcançar ${days} ${days === 1 ? 'dia' : 'dias'} de ofensiva`,
  celebration,
});

export const ACHIEVEMENTS: AchievementDef[] = [
  // ---- Ofensiva ----
  streak(1, 'streak-1', 'Primeiro passo', '👟', 'Começou! Toda jornada lendária começa com um único registro.'),
  streak(3, 'streak-3', 'Ainda é novidade', '🌱', 'Três dias seguidos. A empolgação ainda está fresquinha.'),
  streak(7, 'streak-7', 'Uma semana de respeito', '🗓️', 'Sete dias seguidos. A primeira semana a gente nunca esquece.'),
  streak(
    13,
    'streak-13',
    'Dia 13 — Não invente moda',
    '🐈‍⬛',
    'Segundo as tradições da internet e a superstição popular, hoje não é um bom dia para arriscar aquela refeição livre. O universo pode estar de mau humor. (É só brincadeira: siga normalmente as orientações da sua nutricionista.)',
    'thirteen',
  ),
  streak(14, 'streak-14', 'Duas semanas', '✌️', 'Catorze dias. Isso já tem cara de consistência.'),
  streak(21, 'streak-21', 'Hábito em construção', '🧱', 'Três semanas seguidas. Tijolo por tijolo, o hábito vai subindo.'),
  streak(30, 'streak-30', 'Um mês de respeito', '🏅', 'Um mês inteiro de acompanhamento. Respeito conquistado.'),
  streak(
    42,
    'streak-42',
    'A resposta para tudo',
    '🌌',
    'Você chegou ao número 42. Segundo o Guia do Mochileiro das Galáxias, essa é a resposta para a vida, o universo e tudo mais. Pena que não explica como resistir a uma pizza.',
    'forty-two',
  ),
  streak(50, 'streak-50', 'Meio centenário', '🎯', 'Cinquenta dias. Metade do caminho para o lendário.'),
  streak(
    67,
    'streak-67',
    'SIX SEVEN!',
    '🤲',
    '67 DIAS! SIX SEVEN! Você chegou ao meme. Ninguém sabe exatamente o motivo, mas agora você tem obrigação de comemorar.',
    'six-seven',
  ),
  streak(75, 'streak-75', 'Quase um veterano', '🎖️', 'Setenta e cinco dias de persistência. Os novatos pedem conselho para você.'),
  streak(100, 'streak-100', 'O lendário', '💯', 'Cem dias seguidos. Isso não é sorte, é método.', 'legendary'),
  streak(180, 'streak-180', 'Meio ano', '🚀', 'Seis meses de ofensiva. Persistência absurda.', 'legendary'),
  streak(365, 'streak-365', 'Um ano inteiro', '👑', 'Um ano inteiro. Lenda viva, com direito a coroa.', 'legendary'),

  // ---- Hidratação ----
  {
    id: 'water-1l',
    title: 'Primeiro litro',
    description: 'O primeiro litro registrado. A garrafinha agradece.',
    emoji: '💧',
    category: 'hidratacao',
    metric: 'totalWaterMl',
    target: 1000,
    condition: 'Registrar 1.000 ml de água no total',
  },
  {
    id: 'water-goal-1',
    title: 'Meta batida!',
    description: 'Primeira meta diária de hidratação atingida.',
    emoji: '🎯',
    category: 'hidratacao',
    metric: 'goalDays',
    target: 1,
    condition: 'Atingir a meta de água em 1 dia',
  },
  {
    id: 'water-goal-7',
    title: 'Hidratação em HD',
    description: 'Sete dias atingindo a meta de água. Pele, rins e humor agradecem.',
    emoji: '🌊',
    category: 'hidratacao',
    metric: 'goalDays',
    target: 7,
    condition: 'Atingir a meta de água em 7 dias',
  },
  {
    id: 'water-goal-30',
    title: 'Aquaman de carteirinha',
    description: 'Trinta dias batendo a meta. Os peixes já te consideram da família.',
    emoji: '🔱',
    category: 'hidratacao',
    metric: 'goalDays',
    target: 30,
    condition: 'Atingir a meta de água em 30 dias',
  },
  {
    id: 'water-10l',
    title: 'Dez mil mililitros',
    description: '10.000 ml acumulados. Parece muito porque é muito.',
    emoji: '🪣',
    category: 'hidratacao',
    metric: 'totalWaterMl',
    target: 10000,
    condition: 'Acumular 10.000 ml de água',
  },
  {
    id: 'water-50l',
    title: 'Caixa d’água ambulante',
    description: '50 litros acumulados. Dá pra encher uma banheira pequena.',
    emoji: '🛁',
    category: 'hidratacao',
    metric: 'totalWaterMl',
    target: 50000,
    condition: 'Acumular 50 litros de água',
  },
  {
    id: 'water-100l',
    title: 'Represa pessoal',
    description: '100 litros acumulados. Engenheiros hidráulicos estão impressionados.',
    emoji: '🏞️',
    category: 'hidratacao',
    metric: 'totalWaterMl',
    target: 100000,
    condition: 'Acumular 100 litros de água',
  },

  // ---- Alimentação ----
  {
    id: 'meal-1',
    title: 'Prato registrado',
    description: 'Primeira refeição registrada. O plano saiu do papel.',
    emoji: '🍽️',
    category: 'alimentacao',
    metric: 'mealCount',
    target: 1,
    condition: 'Registrar 1 refeição',
  },
  {
    id: 'meal-full-day',
    title: 'Dia completo',
    description: 'Todos os momentos do dia acompanhados. Café, almoço, lanche, jantar e ceia.',
    emoji: '🧩',
    category: 'alimentacao',
    metric: 'fullDays',
    target: 1,
    condition: 'Acompanhar todas as refeições de um dia',
  },
  {
    id: 'meal-days-10',
    title: 'Dez dias de prato feito',
    description: 'Dez dias diferentes acompanhando a alimentação.',
    emoji: '📒',
    category: 'alimentacao',
    metric: 'mealDays',
    target: 10,
    condition: 'Registrar refeições em 10 dias',
  },
  {
    id: 'meal-50',
    title: 'Cinquenta pratos',
    description: '50 refeições registradas. Já dá pra escrever um livro de receitas.',
    emoji: '📚',
    category: 'alimentacao',
    metric: 'mealCount',
    target: 50,
    condition: 'Registrar 50 refeições',
  },
  {
    id: 'meal-100',
    title: 'Centena gastronômica',
    description: '100 refeições registradas. Isso é dedicação de chef.',
    emoji: '👨‍🍳',
    category: 'alimentacao',
    metric: 'mealCount',
    target: 100,
    condition: 'Registrar 100 refeições',
  },
  {
    id: 'free-1',
    title: 'Liberdade planejada',
    description: 'Primeira refeição livre registrada. Ela faz parte do plano, aproveite!',
    emoji: '🍕',
    category: 'alimentacao',
    metric: 'freeMealCount',
    target: 1,
    condition: 'Registrar 1 refeição livre',
  },
  {
    id: 'planned-week',
    title: 'Semana no roteiro',
    description: 'Uma semana completa (segunda a domingo) acompanhada, respeitando a frequência de refeições livres.',
    emoji: '🧭',
    category: 'alimentacao',
    metric: 'plannedWeek',
    target: 1,
    condition: 'Acompanhar os 7 dias de uma semana com até 2 refeições livres',
  },

  // ---- Secretas ----
  {
    id: 'secret-vontade',
    title: 'Não era fome, era vontade',
    description: 'Usou as duas refeições livres da semana, exatamente como o plano permite.',
    emoji: '😋',
    category: 'secreta',
    metric: 'maxFreeMealsInAWeek',
    target: 2,
    condition: 'Registrar 2 refeições livres na mesma semana',
    secret: true,
  },
  {
    id: 'secret-participar',
    title: 'O importante é participar',
    description: 'Perdeu a ofensiva e voltou a acompanhar. Recomeçar também é progresso.',
    emoji: '🔁',
    category: 'secreta',
    metric: 'streakRuns',
    target: 2,
    condition: 'Voltar a acompanhar depois de perder a ofensiva',
    secret: true,
  },
  {
    id: 'secret-agua-por-favor',
    title: 'Água, por favor',
    description: 'Bateu a meta de água no dia da refeição livre. A nutricionista aprova.',
    emoji: '🥤',
    category: 'secreta',
    metric: 'waterOnFreeMealDay',
    target: 1,
    condition: 'Atingir a meta de água em um dia com refeição livre',
    secret: true,
  },
  {
    id: 'secret-algoritmo',
    title: 'O algoritmo está orgulhoso',
    description: '30 dias acompanhados no total. Seu feed agora só mostra brócolis.',
    emoji: '🤖',
    category: 'secreta',
    metric: 'trackedDays',
    target: 30,
    condition: 'Acompanhar 30 dias no total',
    secret: true,
  },
  {
    id: 'secret-thanos',
    title: 'Nem o Thanos conseguiria',
    description: '50 dias de ofensiva. Nem com um estalar de dedos dá pra apagar isso.',
    emoji: '🫰',
    category: 'secreta',
    metric: 'bestStreak',
    target: 50,
    condition: 'Alcançar 50 dias de ofensiva',
    secret: true,
  },
  {
    id: 'secret-escolhido',
    title: 'O escolhido',
    description: '100 dias de ofensiva. A profecia estava certa.',
    emoji: '🕶️',
    category: 'secreta',
    metric: 'bestStreak',
    target: 100,
    condition: 'Alcançar 100 dias de ofensiva',
    secret: true,
  },
  {
    id: 'secret-9000',
    title: 'It’s over 9000!',
    description: 'Mais de 9.000 ml de água acumulados. O medidor de poder explodiu.',
    emoji: '🔥',
    category: 'secreta',
    metric: 'totalWaterMl',
    target: 9001,
    condition: 'Acumular mais de 9.000 ml de água',
    secret: true,
  },
  {
    id: 'secret-ctrl-z',
    title: 'Ctrl + Z',
    description: 'Desfez um registro de água. Errar é humano; desfazer é tecnologia.',
    emoji: '⌨️',
    category: 'secreta',
    metric: 'waterUndos',
    target: 1,
    condition: 'Desfazer um registro de água',
    secret: true,
  },
  {
    id: 'secret-backup',
    title: 'Backup é amor',
    description: 'Exportou seus dados. Seu eu do futuro manda um abraço.',
    emoji: '💾',
    category: 'secreta',
    metric: 'exports',
    target: 1,
    condition: 'Exportar um backup',
    secret: true,
  },
  {
    id: 'secret-variedade',
    title: 'Variedade é o tempero',
    description: '10 refeições com substituições da lista. Repertório de respeito.',
    emoji: '🧂',
    category: 'secreta',
    metric: 'substitutionMeals',
    target: 10,
    condition: 'Registrar 10 refeições usando substituições',
    secret: true,
  },
  {
    id: 'secret-masterchef',
    title: 'MasterChef de marmita',
    description: 'Preparou 5 sugestões diferentes da nutricionista. Cozinha liberada.',
    emoji: '🍳',
    category: 'secreta',
    metric: 'distinctSuggestions',
    target: 5,
    condition: 'Registrar 5 sugestões de preparo diferentes',
    secret: true,
  },
  {
    id: 'secret-fds',
    title: 'Fim de semana raiz',
    description: 'Acompanhou sábado e domingo seguidos. Nem o churrasco te parou.',
    emoji: '🏖️',
    category: 'secreta',
    metric: 'weekendCombo',
    target: 1,
    condition: 'Acompanhar um sábado e o domingo seguinte',
    secret: true,
  },
  {
    id: 'secret-ano-novo',
    title: 'Ano novo, mesma ofensiva',
    description: 'Atravessou a virada do ano sem quebrar a sequência. Fogos merecidos.',
    emoji: '🎆',
    category: 'secreta',
    metric: 'newYearStreak',
    target: 1,
    condition: 'Acompanhar 31/12 e 01/01 em sequência',
    secret: true,
  },
];

export const ACHIEVEMENT_CATEGORY_LABEL: Record<AchievementCategory, string> = {
  ofensiva: 'Ofensiva',
  hidratacao: 'Hidratação',
  alimentacao: 'Alimentação',
  secreta: 'Secretas',
};
