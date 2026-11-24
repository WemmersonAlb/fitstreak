import type { MealCategory, MealSlot, FoodPortion, Recipe } from '../../types';

/**
 * Fonte: "Plano alimentar" (Amanda Diniz — Nutricionista, CRN-6 42020).
 * Transcrição fiel do PDF em docs/nutricionista/plano-alimentar.pdf.
 * Para atualizar o plano, edite somente este arquivo e substitutions.ts.
 */
export const PLAN_VERSION = 'amanda-diniz-v1';

const p = (food: string, measure: string, amount: number, unit: 'g' | 'ml' = 'g'): FoodPortion => ({
  food,
  measure,
  amount,
  unit,
});

const SALAD: FoodPortion = p('Salada e/ou legumes', '1 A vontade', 0);

export const GENERAL_GUIDELINES: string[] = [
  'Sugestão: beber 200-500ml de água em jejum;',
  'Aumentar o consumo de salada e vegetais;',
  'Evitar beber líquidos conjunto as refeições, esperar 30 minutos;',
  'Se atentar nas quantidades e pesar os alimentos sempre que possível;',
];

export const MEAL_CATEGORIES: MealCategory[] = [
  {
    id: 'cafe_raiz',
    slot: 'cafe',
    name: 'Café da manhã c/ raiz',
    groups: [
      {
        id: 'proteina',
        label: 'Proteína',
        main: p('Ovo de galinha frito/mexido', '2 Unidade(s) média(s)', 100),
        substitutions: [
          p('Peito de frango desfiado', '2 Colher(es) de sopa cheia(s)', 50),
          p('Atum em óleo', '4 Colher(es) de sopa cheia(s)', 60),
          p('Acém moído cozido', '2 Colher(es) de sopa cheia(s)', 55),
        ],
        groupRef: { group: 4, portions: 1 },
      },
      {
        id: 'carboidrato',
        label: 'Carboidrato',
        main: p('Mandioca/Aipim cozido', '4 Colher(es) de sopa rasa(s)', 100),
        substitutions: [
          p('Inhame cozido', '4 Fatia(s) pequena(s)', 120),
          p('Batata doce cozida', '4 Fatia(s) pequena(s)', 160),
        ],
        groupRef: { group: 5, portions: 4 },
      },
      {
        id: 'laticinio',
        label: 'Complemento',
        main: p('Requeijão light', '1 Colher(es) de sopa cheia(s)', 30),
        substitutions: [
          p('Creme de ricota light', '1.5 Colher(es) de sopa', 30),
          p('Queijo coalho', '1 Fatia(s) pequena(s)', 15),
          p('Iogurte natural', '0.5 Unidade(s)', 85, 'ml'),
        ],
        groupRef: { group: 13, portions: 0.5 },
      },
    ],
    notes: [],
    suggestions: [],
  },
  {
    id: 'cafe',
    slot: 'cafe',
    name: 'Café da manhã',
    groups: [
      {
        id: 'proteina',
        label: 'Proteína',
        main: p('Ovo de galinha cozido', '2 Unidade(s) grande(s)', 110),
        substitutions: [
          p('Peito de frango desfiado', '2 Colher(es) de sopa cheia(s)', 50),
          p('Acém moído cozido', '2 Colher(es) de sopa cheia(s)', 55),
          p('Atum em óleo', '4 Colher(es) de sopa cheia(s)', 60),
        ],
        groupRef: { group: 4, portions: 1 },
      },
      {
        id: 'carboidrato',
        label: 'Carboidrato',
        main: p('Cuscuz de milho cozido', '1 Pedaço(s) pequeno(s)', 90),
        substitutions: [
          p('Pão de forma integral', '2 Fatia(s)', 50),
          p('Goma de tapioca', '2 Colher(es) de sopa cheia(s)', 40),
        ],
        groupRef: { group: 12, portions: 2 },
      },
      {
        id: 'laticinio',
        label: 'Complemento',
        main: p('Requeijão light', '1 Colher(es) de sopa cheia(s)', 30),
        substitutions: [
          p('Creme de ricota light', '1.5 Colher(es) de sopa', 30),
          p('Queijo coalho', '1 Fatia(s) pequena(s)', 15),
          p('Iogurte natural', '0.5 Unidade(s)', 85, 'ml'),
        ],
        groupRef: { group: 13, portions: 0.5 },
      },
    ],
    notes: [
      'Essa sua refeição deve ser sempre acompanhada de uma porção de frutas, e em cima das frutas pode ir uma colher rasa de farelo de aveia.',
    ],
    suggestions: [
      { id: 'cafe-01', number: '01', title: 'Omelete de atum', description: '1 ovo + 80g de atum + 1 fatia de queijo.' },
      {
        id: 'cafe-02',
        number: '02',
        title: 'Crepioca',
        description:
          '2 col de goma de tapioca + 1 ovo, misture e leve à frigideira, recheie com frango desfiado e tomates.',
      },
      { id: 'cafe-03', number: '03', title: 'Tapiovo', description: '40g de goma de tapioca + 2 ovos + 1 fatia de queijo.' },
      {
        id: 'cafe-05',
        number: '05',
        title: 'Tapioca rendada',
        description:
          'Rala o queijo coalho (20g) na frigideira, coloca a goma de tapioca por cima e recheie com frango desfiado (60g) ou ovo (2 unds).',
      },
      {
        id: 'cafe-06',
        number: '06',
        title: 'Cuscuz',
        description: '1 pedaço (90g) + 2 ovos ou frango + 1 fatia de queijo ou 1 col de requeijão light.',
      },
      {
        id: 'cafe-07',
        number: '07',
        title: 'Panqueca de banana',
        description:
          '2 ovos + aveia (42g) + 1 banana - misture tudo e leve à frigideira - pode colocar em cima canela.',
      },
    ],
    reviewNotes: [
      'A numeração das sugestões no PDF pula do 03 para o 05 (não existe sugestão 04).',
      'O título "Observações:" aparece duplicado no PDF.',
    ],
  },
  {
    id: 'almoco_feijao',
    slot: 'almoco',
    name: 'Almoço c/ feijão',
    groups: [
      {
        id: 'proteina',
        label: 'Proteína',
        main: p('Filé de frango grelhado', '2.5 Bife(s) pequeno(s)', 125),
        substitutions: [
          p('Patinho moído refogado', '5 Colher(es) de sopa cheia(s)', 125),
          p('Contra filé sem gordura grelhado', '2.5 Bife(s) pequeno(s)', 100),
        ],
        groupRef: { group: 4, portions: 2.5 },
      },
      {
        id: 'carboidrato',
        label: 'Carboidrato',
        main: p('Arroz branco cozido', '3 Colher(es) de sopa cheia(s)', 75),
        substitutions: [
          p('Batata inglesa cozida', '6 Colher(es) de sopa cheia(s)', 180),
          p('Inhame cozido', '3 Fatia(s) pequena(s)', 90),
        ],
        groupRef: { group: 5, portions: 3 },
      },
      {
        id: 'leguminosa',
        label: 'Leguminosa',
        main: p('Feijão preto cozido', '2 Concha(s) pequena(s) cheia(s)', 130),
        substitutions: [
          p('Feijão verde', '4 Colher(es) de sopa', 74),
          p('Grão de bico cozido', '2 Colher(es) de arroz cheia(s)', 90),
        ],
        groupRef: { group: 6, portions: 2 },
      },
      {
        id: 'fruta',
        label: 'Fruta',
        main: p('Abacaxi', '2 Fatia(s) pequena(s)', 150),
        substitutions: [p('Laranja pera', '1 Unidade(s) média(s)', 140)],
        groupRef: { group: 9, portions: 1 },
      },
      { id: 'salada', label: 'Salada', main: SALAD, substitutions: [], freeQuantity: true },
    ],
    notes: [],
    suggestions: [],
  },
  {
    id: 'almoco',
    slot: 'almoco',
    name: 'Almoço',
    groups: [
      {
        id: 'proteina',
        label: 'Proteína',
        main: p('Filé de frango grelhado', '2.5 Bife(s) pequeno(s)', 125),
        substitutions: [
          p('Acém moído cozido', '5 Colher(es) de sopa cheia(s)', 137.5),
          p('Fígado bovino grelhado', '1.3 Bife(s) médio(s)', 137.5),
        ],
        groupRef: { group: 4, portions: 2.5 },
      },
      {
        id: 'carboidrato',
        label: 'Carboidrato',
        main: p('Arroz branco cozido', '6 Colher(es) de sopa cheia(s)', 150),
        substitutions: [
          p('Batata inglesa sauté', '12 Colher(es) de sopa rasa(s)', 300),
          p('Macarrão cozido', '6 Colher(es) de arroz rasa(s)', 150),
        ],
        groupRef: { group: 5, portions: 6 },
      },
      {
        id: 'fruta',
        label: 'Fruta',
        main: p('Abacaxi', '2 Fatia(s) pequena(s)', 150),
        substitutions: [p('Laranja pera', '1 Unidade(s) média(s)', 140)],
        groupRef: { group: 9, portions: 1 },
      },
      { id: 'salada', label: 'Salada', main: SALAD, substitutions: [], freeQuantity: true },
    ],
    notes: [
      'Você pode mesclar os alimentos, por exemplo, metade da quantidade de arroz e metade de batata inglesa cozida.',
      'Sempre coloque verduras e legumes no seu prato do almoço, lembre que isso vai lhe dar saciedade - a quantidade é livre, pode colocar muitas folhas.',
      'A quantidade de legumes e verduras é livre, fique à vontade para colocar mais no prato.',
      'Seu purê de batata pode ser feito sem leite. Receita: Cozinhar a batata - amasse (com ela ainda quente) - mistura com um pouco de queio ralado, uma colher de sopa de manteiga e um pouco de água - mexa até ficar com a textura desejada.',
      'Varie sempre o sabor, formato do corte e preparo desses legumes.',
      'Coloque na airfryer com temperos em cima;',
      'Pode fazer um gratinado de varios legumes (com queijo coalho ou mussarela light)',
      'Refogado de repolho e cenoura: refoque cebola e alho no azeite até dourar, enquanto espera corte a cenoura e o repolho, adicione a frigideira e deixe refogar, tempera a gosto com temperos naturais;',
      'Legumes ao forno: leve os legumes ao forno (abobrinha, batata, cenoura...) coloque azeite e temperos por cima, e leve ao forno por aproximadamente 15 minutos;',
      'Legumes no vapor ou na airfryer;',
      'Aposte em temperos e formatos diferentes pra sempre mudar seu paladar e alimentar-se bem desse grupo.',
    ],
    suggestions: [],
    reviewNotes: [
      'No PDF, "Acém moído cozido - 5 Colher(es) de sopa cheia(s) (137.5g)" aparece duas vezes nas substituições de proteína; exibido apenas uma vez.',
      'Na receita de purê, o PDF diz "queio ralado" (provavelmente "queijo ralado"). Texto preservado.',
    ],
  },
  {
    id: 'lanche',
    slot: 'lanche',
    name: 'Lanche',
    groups: [
      {
        id: 'fruta',
        label: 'Fruta',
        main: p('Banana prata', '1 Unidade(s) grande(s)', 55),
        substitutions: [
          p('Maçã argentina', '1 Unidade(s) pequena(s)', 80),
          p('Melão', '2 Fatia(s) grande(s)', 230),
          p('Uva Rubi ou Itália', '15 Unidade(s)', 120),
        ],
        groupRef: { group: 9, portions: 1 },
      },
      {
        id: 'paes',
        label: 'Pães e fibras',
        main: p('Pão de forma integral', '2 Fatia(s)', 50),
        substitutions: [
          p('Pão de forma tradicional', '2 Fatia(s)', 50),
          p('Pão tipo folha/rap', '2 Unidade(s) média(s)', 80),
          p('Torrada tradicional', '4 Unidade(s)', 40),
        ],
        groupRef: { group: 12, portions: 2 },
      },
      {
        id: 'laticinio',
        label: 'Complemento',
        main: p('Queijo coalho', '1 Fatia(s) pequena(s)', 15),
        substitutions: [
          p('Queijo muçarela', '0.5 Fatia(s) grande(s)', 15),
          p('Requeijão light', '1 Colher(es) de sopa cheia(s)', 30),
        ],
        groupRef: { group: 13, portions: 0.5 },
      },
    ],
    notes: [],
    suggestions: [
      {
        id: 'lanche-01',
        number: '01',
        title: 'Sanduíche',
        description: '2 fatias de pão de forma + 20g de queijo coalho ou mussarela light',
      },
      {
        id: 'lanche-02',
        number: '02',
        title: 'Panqueca de banana',
        description:
          '1 colher de sopa de aveia + 1 ovo + 1 banana - mistura tudo e leva a frigideira. Pode colocar em cima 1 quadrado de chocolate meio amargo;',
      },
      {
        id: 'lanche-03',
        number: '03',
        title: 'Omelete doce',
        description:
          '1 ovo + 1 col de sopa de aveia (10g) - leve a frigideira e coloque em cima 1 col de sopa de geleia de fruta sem açucar;',
      },
      {
        id: 'lanche-04',
        number: '04',
        title: 'Bowl de iogurte',
        description:
          'Bowl de iogurte natural (170ml) + 1 porção de fruta + 1 col de sopa de aveia em flocos + chia + granola;',
      },
      {
        id: 'lanche-05',
        number: '05',
        title: 'Sanduíche com proteína',
        description: '2 fatias de pão de forma + frango desfiado ou atum + 1 porção de frutas;',
      },
      {
        id: 'lanche-06',
        number: '06',
        title: 'Uva com aveia e granola',
        description: 'Uva (cortada em pedaços) + aveia (10g) + granola (10g);',
      },
    ],
  },
  {
    id: 'jantar',
    slot: 'jantar',
    name: 'Jantar',
    groups: [
      {
        id: 'proteina',
        label: 'Proteína',
        main: p('Ovo de galinha frito/mexido', '3 Unidade(s) média(s)', 150),
        substitutions: [
          p('Peito de frango desfiado', '3 Colher(es) de sopa cheia(s)', 75),
          p('Acém moído cozido', '3 Colher(es) de sopa cheia(s)', 83),
        ],
        groupRef: { group: 4, portions: 1.5 },
      },
      {
        id: 'carboidrato',
        label: 'Carboidrato',
        main: p('Cuscuz de milho cozido', '1 Pedaço(s) pequeno(s)', 90),
        substitutions: [
          p('Pão de forma tradicional', '2 Fatia(s)', 50),
          p('Goma de tapioca', '2 Colher(es) de sopa cheia(s)', 40),
        ],
        groupRef: { group: 12, portions: 2 },
      },
      {
        id: 'laticinio',
        label: 'Complemento',
        main: p('Queijo coalho', '1 Fatia(s) pequena(s)', 15),
        substitutions: [
          p('Creme de ricota light', '1.5 Colher(es) de sopa', 30),
          p('Requeijão light', '1 Colher(es) de sopa cheia(s)', 30),
        ],
        groupRef: { group: 13, portions: 0.5 },
      },
    ],
    notes: [],
    suggestions: [],
  },
  {
    id: 'jantar_raiz',
    slot: 'jantar',
    name: 'Jantar c/ raiz',
    groups: [
      {
        id: 'proteina',
        label: 'Proteína',
        main: p('Filé de frango grelhado', '1.5 Bife(s) pequeno(s)', 75),
        substitutions: [
          p('Ovo de galinha frito/mexido', '3 Unidade(s) média(s)', 150),
          p('Patinho moído refogado', '3 Colher(es) de sopa cheia(s)', 75),
        ],
        groupRef: { group: 4, portions: 1.5 },
      },
      {
        id: 'carboidrato',
        label: 'Carboidrato',
        main: p('Inhame cozido', '4 Fatia(s) pequena(s)', 120),
        substitutions: [
          p('Mandioca/Aipim cozido', '4 Colher(es) de sopa rasa(s)', 100),
          p('Batata inglesa cozida', '8 Colher(es) de sopa cheia(s)', 240),
        ],
        groupRef: { group: 5, portions: 4 },
      },
      {
        id: 'laticinio',
        label: 'Complemento',
        main: p('Requeijão light zero lactose', '1 Colher(es) de sopa cheia(s)', 30),
        substitutions: [
          p('Queijo coalho', '1 Fatia(s) pequena(s)', 15),
          p('Queijo muçarela', '0.5 Fatia(s) grande(s)', 15),
        ],
        groupRef: { group: 13, portions: 0.5 },
      },
    ],
    notes: [],
    suggestions: [
      {
        id: 'jantar-01',
        number: '01',
        title: 'Batata recheada gratinada',
        description:
          'Cozinhar a batata por 8 minutos, faz um buraco no meio dela e recheia com frango, coloca queijo em cima e leva à airfryer por 15 minutos;',
      },
      {
        id: 'jantar-02',
        number: '02',
        title: 'Raiz com proteína e queijo',
        description: 'Batata doce ou macaxeira ou inhame + frango ou ovos + queijo;',
      },
      {
        id: 'jantar-03',
        number: '03',
        title: 'Sanduíche de frango',
        description:
          '2 fatias de pão de forma + 100g de frango desfiado + 1 fatia de queijo; Você também pode adicionar passata de tomate e tomate, levando a airfryer por 10 minutos, fica parecendo uma pizza fit;',
      },
      {
        id: 'jantar-04',
        number: '04',
        title: 'Hot dog fit',
        description:
          '2 fatias de pão de forma ou 1 pão francês + 100g de carne moída + 1 col de sopa de milho + tomate, orégano e mostarda à gosto;',
      },
      {
        id: 'jantar-05',
        number: '05',
        title: 'Tapioca',
        description: '3 col de sopa de goma de tapioca + 100g de frango desfiado + 1 fatia de queijo;',
      },
      {
        id: 'jantar-06',
        number: '06',
        title: 'Sanduíche de atum',
        description:
          'Atum (compra o em óleo que vem na latinha e descarta o óleo, pode colocar numa peneira pra facilitar e passar em água corrente para retirar o óleo) + 2 fatias de pão de forma + 1 fatia de queijo + tomate + orégano e mostarda á gosto;',
      },
      {
        id: 'jantar-07',
        number: '07',
        title: 'Banana comprida',
        description: 'Banana comprida (1) + ovos ou carne ou frango + queijo;',
      },
    ],
    reviewNotes: [
      'As sugestões de preparo aparecem no PDF apenas na página do "Jantar c/ raiz"; a página "Jantar" não tem sugestões próprias.',
    ],
  },
  {
    id: 'ceia',
    slot: 'ceia',
    name: 'Ceia',
    groups: [
      {
        id: 'fruta',
        label: 'Fruta',
        main: p('Uva Rubi ou Itália', '15 Unidade(s)', 120),
        substitutions: [p('Melancia', '1 Fatia(s) média(s)', 200), p('Morango', '10 Unidade(s)', 200)],
        groupRef: { group: 9, portions: 1 },
      },
      {
        id: 'cereal',
        label: 'Pães e fibras',
        main: p('Aveia em flocos', '3 Colher(es) de sopa rasa(s)', 21),
        substitutions: [p('Granola', '2 Colher(es) de sopa cheia(s)', 22)],
        groupRef: { group: 12, portions: 1 },
      },
      {
        id: 'laticinio',
        label: 'Laticínio',
        main: p('Iogurte natural ou zero', '1 Unidade(s)', 170, 'ml'),
        substitutions: [p('Iogurte grego desnatado ou light', '1 Unidade(s)', 100)],
        groupRef: { group: 13, portions: 1 },
      },
    ],
    notes: [],
    suggestions: [],
    reviewNotes: [
      'No PDF, "Uva Rubi ou Itália - 15 Unidade(s) (120g)" aparece como opção principal e também como substituição; exibida apenas como principal.',
    ],
  },
];

export const MEAL_SLOTS: MealSlot[] = [
  { id: 'cafe', name: 'Café da manhã', categories: ['cafe', 'cafe_raiz'], emoji: '☕' },
  { id: 'almoco', name: 'Almoço', categories: ['almoco', 'almoco_feijao'], emoji: '🍽️' },
  { id: 'lanche', name: 'Lanche', categories: ['lanche'], emoji: '🍌' },
  { id: 'jantar', name: 'Jantar', categories: ['jantar', 'jantar_raiz'], emoji: '🌙' },
  { id: 'ceia', name: 'Ceia', categories: ['ceia'], emoji: '🥣' },
];

export const RECIPES: Recipe[] = [
  {
    id: 'salada-folhas',
    title: 'Salada de alface, rúcula e agrião',
    author: 'Prof. Bianca Innocencio',
    servings: '1 porção(ões)',
    ingredients: ['Alface crespa - 3 Folha média (30g)', 'Rúcula - 6 Folhas (36g)', 'Agrião - 6 Ramos médios (30g)'],
    steps: ['Misturar todos os ingredientes e servir.'],
  },
];

export const FREE_MEAL_GUIDELINES = {
  title: 'Refeições livres - 2x na semana',
  weeklyLimit: 2,
  intro:
    'É importante você colocar alimentos que você esteja com vontade de comer na refeição livre pois é exatamente nesse momento que você irá degustar esses alimentos, porém é sempre importante lembrar que você não precisa ingerir grandes quantidades, pois se você controlar a quantidade com toda a certeza você poderá realizar mais vezes ao longo dos meses essa refeição livre.',
  recommendations: [
    'Escolha alimentos que você realmente está com vontade de comer;',
    'Controle a quantidade da refeição;',
    'Tente treinar no dia que você sabe que irá fazer a refeição livre;',
    'Siga o plano nas outras refeições e aumente o consumo de fibras (frutas e legumes) principalmente quando for realizar a refeição livre;',
    'Não esqueça de beber a quantidade certa de água!',
  ],
  closing:
    'Lembre-se que eventos e datas especiais sempre irão acontecer pelo resto do ano, o importante é aprender a lidar da melhor forma com as situações sem deixar de aproveitar o momento!',
};

export const NUTRITIONIST = {
  name: 'Amanda Diniz',
  crn: 'CRN-6 42020',
};

export function getCategory(id: string): MealCategory | undefined {
  return MEAL_CATEGORIES.find((c) => c.id === id);
}

export function getSlot(id: string): MealSlot | undefined {
  return MEAL_SLOTS.find((s) => s.id === id);
}
