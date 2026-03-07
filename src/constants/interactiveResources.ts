export interface InteractiveSimulation {
  id: number;
  title: string;
  description: string;
  category: string;
  series: string;
  link: string;
}

export const MOCKED_SIMULATIONS: InteractiveSimulation[] = [
  // Biologia
  {
    id: 1,
    title: 'Transporte Celular',
    description: 'Explore simulações interativas de Transporte Celular.',
    category: 'Biologia',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/membrane-transport/latest/membrane-transport_all.html?locale=pt_BR'
  },
  {
    id: 2,
    title: 'Seleção Natural',
    description: 'Explore simulações interativas de Seleção Natural.',
    category: 'Biologia',
    series: '3° ano EM',
    link: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html?locale=pt_BR'
  },
  {
    id: 3,
    title: 'Fundamentos da Expressão Genética',
    description: 'Explore simulações interativas de Fundamentos da Expressão Genética.',
    category: 'Biologia',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_all.html?locale=pt_BR'
  },
  {
    id: 4,
    title: 'Neurônio',
    description: 'Explore simulações interativas de Neurônio.',
    category: 'Biologia',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/neuron/latest/neuron_all.html?locale=pt_BR'
  },
  {
    id: 5,
    title: 'Visão Colorida',
    description: 'Explore simulações interativas de Visão Colorida.',
    category: 'Biologia',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html?locale=pt_BR'
  },
  {
    id: 6,
    title: 'Polaridade da Molécula',
    description: 'Explore simulações interativas de Polaridade da Molécula.',
    category: 'Biologia',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/molecule-polarity/latest/molecule-polarity_all.html?locale=pt_BR'
  },

  // Física
  {
    id: 7,
    title: 'Densidade',
    description: 'Explore simulações interativas de Densidade.',
    category: 'Física',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/density/latest/density_all.html?locale=pt_BR'
  },
  {
    id: 8,
    title: 'Difusão',
    description: 'Explore simulações interativas de Difusão.',
    category: 'Física',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/diffusion/latest/diffusion_all.html?locale=pt_BR'
  },
  {
    id: 9,
    title: 'Massas e Molas',
    description: 'Explore simulações interativas de Massas e Molas.',
    category: 'Física',
    series: '3° ano EM',
    link: 'https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_all.html?locale=pt_BR'
  },
  {
    id: 10,
    title: 'Interferência de Onda',
    description: 'Explore simulações interativas de Interferência de Onda.',
    category: 'Física',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html?locale=pt_BR'
  },
  {
    id: 11,
    title: 'Estados da Matéria',
    description: 'Explore simulações interativas de Estados da Matéria.',
    category: 'Física',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_all.html?locale=pt_BR'
  },
  {
    id: 12,
    title: 'Movimento de Projétil',
    description: 'Explore simulações interativas de Movimento de Projétil.',
    category: 'Física',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html?locale=pt_BR'
  },
  {
    id: 13,
    title: 'Efeito Estufa',
    description: 'Explore simulações interativas de Efeito Estufa.',
    category: 'Física',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_all.html?locale=pt_BR'
  },
  {
    id: 14,
    title: 'Ímã e Bússola',
    description: 'Explore simulações interativas de Ímã e Bússola.',
    category: 'Física',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/magnet-and-compass/latest/magnet-and-compass_all.html?locale=pt_BR'
  },
  {
    id: 15,
    title: 'Pressão',
    description: 'Explore simulações interativas de Pressão.',
    category: 'Física',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html?locale=pt_BR'
  },
  {
    id: 16,
    title: 'Sistema Solar',
    description: 'Explore simulações interativas de Sistema Solar.',
    category: 'Física',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/my-solar-system/latest/my-solar-system_all.html?locale=pt_BR'
  },

  // Química
  {
    id: 17,
    title: 'Propriedades dos Gases',
    description: 'Explore simulações interativas de Propriedades dos Gases.',
    category: 'Química',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_all.html?locale=pt_BR'
  },
  {
    id: 18,
    title: 'Isótopos e Massa Atômica',
    description: 'Explore simulações interativas de Isótopos e Massa Atômica.',
    category: 'Química',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_all.html?locale=pt_BR'
  },
  {
    id: 19,
    title: 'Geometria Molecular',
    description: 'Explore simulações interativas de Geometria Molecular.',
    category: 'Química',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=pt_BR'
  },
  {
    id: 20,
    title: 'Balanceamento de Equações Químicas',
    description: 'Explore simulações interativas de Balanceamento de Equações Químicas.',
    category: 'Química',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html?locale=pt_BR'
  },
  {
    id: 21,
    title: 'Escala de pH',
    description: 'Explore simulações interativas de Escala de pH.',
    category: 'Química',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html?locale=pt_BR'
  },
  {
    id: 22,
    title: 'Molaridade',
    description: 'Explore simulações interativas de Molaridade.',
    category: 'Química',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/molarity/latest/molarity_all.html?locale=pt_BR'
  },
  {
    id: 23,
    title: 'Reagentes, Produtos e Excesso',
    description: 'Explore simulações interativas de Reagentes, Produtos e Excesso.',
    category: 'Química',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_all.html?locale=pt_BR'
  },
  {
    id: 24,
    title: 'Soluções Ácido-Base',
    description: 'Explore simulações interativas de Soluções Ácido-Base.',
    category: 'Química',
    series: '2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html?locale=pt_BR'
  },

  // Matemática
  {
    id: 25,
    title: 'Associe Frações',
    description: 'Explore simulações interativas de Associe Frações.',
    category: 'Matemática',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher_all.html?locale=pt_BR'
  },
  {
    id: 26,
    title: 'Equações na Balança',
    description: 'Aprenda princípios de igualdade e balanciamento de equações usando uma balança interativa.',
    category: 'Matemática',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html?locale=pt_BR'
  },
  {
    id: 27,
    title: 'Traçando Retas',
    description: 'Explore simulações interativas de Traçando Retas.',
    category: 'Matemática',
    series: '3° ano EM',
    link: 'https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_all.html?locale=pt_BR'
  },
  {
    id: 28,
    title: 'Gerador de Funções',
    description: 'Explore simulações interativas de Gerador de Funções.',
    category: 'Matemática',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_all.html?locale=pt_BR'
  },
  {
    id: 29,
    title: 'Modelo de Área, Álgebra',
    description: 'Explore simulações interativas de Modelo de Área, Álgebra.',
    category: 'Matemática',
    series: '1° ano EM',
    link: 'https://phet.colorado.edu/sims/html/area-model-algebra/latest/area-model-algebra_all.html?locale=pt_BR'
  },
  {
    id: 30,
    title: 'Tour Trigonométrico',
    description: 'Explore simulações interativas de Tour Trigonométrico.',
    category: 'Matemática',
    series: '1° e 2° ano EM',
    link: 'https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_all.html?locale=pt_BR'
  },

  // História
  {
    id: 31,
    title: 'Tour Virtual: As Pirâmides de Gizé',
    description: 'Explore o complexo de pirâmides do Egito Antigo em 3D guiado.',
    category: 'História',
    series: '1° ano EM',
    link: 'https://artsandculture.google.com/project/ancient-egypt'
  },
  {
    id: 32,
    title: 'Smithsonian Learning Lab',
    description: 'Acesso a milhões de recursos digitais, imagens e artefatos históricos para pesquisa.',
    category: 'História',
    series: '3° ano EM',
    link: 'https://learninglab.si.edu/'
  },
  {
    id: 33,
    title: 'David Rumsey Map Collection',
    description: 'Coleção impressionante de mapas históricos de alta resolução de todo o mundo.',
    category: 'História',
    series: '2° ano EM',
    link: 'https://www.davidrumsey.com/'
  },
  {
    id: 34,
    title: 'World History Encyclopedia',
    description: 'Enciclopedia completa, visual e revisada por pares sobre a história global.',
    category: 'História',
    series: '1° ano EM',
    link: 'https://www.worldhistory.org/'
  },
  {
    id: 35,
    title: 'Big History Project',
    description: 'Jornada interativa que explora o passado desde o Big Bang até a modernidade.',
    category: 'História',
    series: '3° ano EM',
    link: 'https://www.bighistoryproject.com/home'
  },
  {
    id: 36,
    title: 'Tour Virtual: Museu das Bandeiras (Goiás Velho)',
    description: 'Passeio em 360 graus pelo museu localizado na antiga capital que preserva a história do ciclo do ouro.',
    category: 'História',
    series: '2° ano EM',
    link: 'https://tour360.meupasseiovirtual.com/035581/150118/tourvirtual/'
  },

  // Geografia
  {
    id: 37,
    title: 'Google Earth Timelapse',
    description: 'Visualize as mudanças drásticas do planeta Terra (desmatamento, urbanização) de 1984 até hoje.',
    category: 'Geografia',
    series: '2° e 3° ano EM',
    link: 'https://earthengine.google.com/timelapse/'
  },
  {
    id: 38,
    title: 'Gapminder: O Mundo em Bolhas',
    description: 'Gráficos interativos impressionantes sobre renda vs expectativa de vida de países nos últimos 200 anos.',
    category: 'Geografia',
    series: '2° ano EM',
    link: 'https://www.gapminder.org/tools/'
  },
  {
    id: 39,
    title: 'Seterra: Jogos Geográficos',
    description: 'Gamifique a aula de geografia identificando países, capitais e rios no mapa interativo.',
    category: 'Geografia',
    series: '1° ano EM',
    link: 'https://www.geoguessr.com/seterra/pt'
  },
  {
    id: 40,
    title: 'NASA Earth Observations',
    description: 'Imagens de satélite globais analisando clima, vegetação e oceanos pela NASA.',
    category: 'Geografia',
    series: '1° e 2° ano EM',
    link: 'https://neo.gsfc.nasa.gov/'
  },
  {
    id: 41,
    title: 'IBGE Cidades: Goiás',
    description: 'Painel interativo com estatísticas, mapas e infográficos sobre todos os municípios goianos.',
    category: 'Geografia',
    series: '1° e 2° ano EM',
    link: 'https://cidades.ibge.gov.br/brasil/go/panorama'
  },
  {
    id: 42,
    title: 'Explorando Ecossistemas',
    description: 'Tour interativo focado na natureza e ambientes diversos.',
    category: 'Geografia',
    series: '1° ano EM',
    link: 'https://artsandculture.google.com/project/natural-history'
  },

  // Artes
  {
    id: 43,
    title: 'Museus pelo Mundo',
    description: 'Explore museus mundialmente famosos pelas exposições virtuais.',
    category: 'Artes',
    series: '2° ano EM',
    link: 'https://artsandculture.google.com/project/streetviews'
  },
  {
    id: 44,
    title: 'Movimentos Artísticos',
    description: 'Explore interativamente as técnicas artísticas, pinceladas e estilos.',
    category: 'Artes',
    series: '1° e 2° ano EM',
    link: 'https://artsandculture.google.com/category/art-movement'
  },
  {
    id: 45,
    title: 'MoMA Learning',
    description: 'Recursos educacionais do Museu de Arte Moderna para analisar arte e artistas.',
    category: 'Artes',
    series: '1° ano EM',
    link: 'https://www.moma.org/learn/moma_learning/'
  },
  {
    id: 46,
    title: 'Artistas Históricos',
    description: 'Linha do tempo e visualização em altíssima resolução de obras.',
    category: 'Artes',
    series: '3° ano EM',
    link: 'https://artsandculture.google.com/category/artist'
  },
  {
    id: 47,
    title: 'A Coleção do MET',
    description: 'Explore centenas de milhares de obras de arte da coleção The Metropolitan Museum of Art.',
    category: 'Artes',
    series: '1° ano EM',
    link: 'https://www.metmuseum.org/art/collection'
  }
];

