/* =========================================================
   AutoMatch AT — Banco de Dados (v3)
   10 modelos · campos estendidos para busca, filtro e FIPE
   ========================================================= */

const MODELOS = [
  {
    id: "hb20-16-at",
    modelo: "Hyundai HB20 1.6 AT",
    marca: "Hyundai",
    familia: "HB20",
    anosIdeais: "2016–2018",
    cambio: "Automático 6 marchas",
    tipoCambio: "at",
    faixaPreco: "R$ 52.000 – R$ 68.000",
    precoMin: 52000,
    precoMax: 68000,
    kmAlvo: "até 80.000 km",
    categoria: "Hatch",
    foco: "Custo-benefício e revenda fácil",
    pontosFortes: [
      "Motor 1.6 com bom torque para cidade",
      "Peças baratas e ampla rede de oficinas",
      "Boa desvalorização estabilizada"
    ],
    pontosAtencao: [
      "Câmbio 6AT pode apresentar solavancos se sem manutenção",
      "Acabamento interno simples nas versões de entrada"
    ],
    versoesMirar: ["1.6 Comfort Plus", "1.6 Premium"],
    versoesEvitar: ["1.0 Comfort (sem automático)"],
    fipeMarca: 26,
    fipeBusca: "HB20 1.6",
    tags: ["hatch", "popular", "revenda", "economico"],
    links: {
      guia: "https://www.youtube.com/results?search_query=hb20+1.6+automatico+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "onix-14-at",
    modelo: "Chevrolet Onix 1.4 AT",
    marca: "Chevrolet",
    familia: "Onix",
    anosIdeais: "2016–2018",
    cambio: "Automático 6 marchas",
    tipoCambio: "at",
    faixaPreco: "R$ 48.000 – R$ 62.000",
    precoMin: 48000,
    precoMax: 62000,
    kmAlvo: "até 80.000 km",
    categoria: "Hatch",
    foco: "Economia e praticidade urbana",
    pontosFortes: [
      "Motor 1.4 econômico e confiável",
      "Carro mais vendido do Brasil — peças em abundância",
      "Bom espaço interno para a categoria"
    ],
    pontosAtencao: [
      "Motor pode ser fraco em subidas com carga",
      "Suspensão mais firme em piso irregular"
    ],
    versoesMirar: ["1.4 LTZ", "1.4 Advantage"],
    versoesEvitar: ["1.0 Joy (sem automático)"],
    fipeMarca: 23,
    fipeBusca: "ONIX 1.4",
    tags: ["hatch", "popular", "economico", "urbano"],
    links: {
      guia: "https://www.youtube.com/results?search_query=onix+1.4+automatico+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "peugeot-208-16-at6",
    modelo: "Peugeot 208 1.6 AT6",
    marca: "Peugeot",
    familia: "208",
    anosIdeais: "2018–2020",
    cambio: "Automático 6 marchas (Aisin)",
    tipoCambio: "at",
    faixaPreco: "R$ 52.000 – R$ 70.000",
    precoMin: 52000,
    precoMax: 70000,
    kmAlvo: "até 70.000 km",
    categoria: "Hatch",
    foco: "Design europeu e conforto acima da média",
    pontosFortes: [
      "Câmbio Aisin de 6 marchas — suave e confiável",
      "Design diferenciado e painel i-Cockpit",
      "Boa dirigibilidade e estabilidade"
    ],
    pontosAtencao: [
      "Rede de concessionárias menor que marcas populares",
      "Peças de acabamento podem ser mais caras"
    ],
    versoesMirar: ["Griffe 1.6 AT6", "Allure 1.6 AT6"],
    versoesEvitar: ["Active 1.6 manual"],
    fipeMarca: 48,
    fipeBusca: "208 1.6",
    tags: ["hatch", "europeu", "design", "conforto"],
    links: {
      guia: "https://www.youtube.com/results?search_query=peugeot+208+1.6+at6+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "peugeot-2008-16-at6",
    modelo: "Peugeot 2008 1.6 AT6",
    marca: "Peugeot",
    familia: "2008",
    anosIdeais: "2018–2020",
    cambio: "Automático 6 marchas (Aisin)",
    tipoCambio: "at",
    faixaPreco: "R$ 62.000 – R$ 82.000",
    precoMin: 62000,
    precoMax: 82000,
    kmAlvo: "até 70.000 km",
    categoria: "SUV Compacto",
    foco: "Espaço de SUV com consumo de hatch",
    pontosFortes: [
      "Porta-malas generoso (355 L) para a categoria",
      "Posição de dirigir elevada e boa visibilidade",
      "Mesmo câmbio Aisin 6AT confiável do 208"
    ],
    pontosAtencao: [
      "Consumo um pouco acima de hatches menores",
      "Valor de revenda menor que concorrentes japoneses"
    ],
    versoesMirar: ["Griffe 1.6 AT6", "Allure 1.6 AT6 Pack"],
    versoesEvitar: ["Allure 1.6 manual"],
    fipeMarca: 48,
    fipeBusca: "2008 1.6",
    tags: ["suv", "europeu", "espaco", "familia"],
    links: {
      guia: "https://www.youtube.com/results?search_query=peugeot+2008+usado+automatico+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "nissan-march-16-cvt",
    modelo: "Nissan March 1.6 Xtronic",
    marca: "Nissan",
    familia: "March",
    anosIdeais: "2017–2020",
    cambio: "CVT Xtronic",
    tipoCambio: "cvt",
    faixaPreco: "R$ 46.000 – R$ 60.000",
    precoMin: 46000,
    precoMax: 60000,
    kmAlvo: "até 80.000 km",
    categoria: "Hatch",
    foco: "Preço acessível com câmbio CVT confiável",
    pontosFortes: [
      "CVT Xtronic — suave e de boa durabilidade",
      "Um dos automáticos mais baratos do mercado",
      "Direção leve, ideal para cidade"
    ],
    pontosAtencao: [
      "Motor 1.6 com resposta tímida em estrada",
      "Acabamento básico nas versões S e SV"
    ],
    versoesMirar: ["SL 1.6 Xtronic", "SV 1.6 Xtronic"],
    versoesEvitar: ["1.0 S (sem automático)"],
    fipeMarca: 43,
    fipeBusca: "MARCH 1.6",
    tags: ["hatch", "barato", "cvt", "urbano"],
    links: {
      guia: "https://www.youtube.com/results?search_query=nissan+march+xtronic+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "nissan-versa-16-cvt",
    modelo: "Nissan Versa 1.6 Xtronic",
    marca: "Nissan",
    familia: "Versa",
    anosIdeais: "2018–2020",
    cambio: "CVT Xtronic",
    tipoCambio: "cvt",
    faixaPreco: "R$ 56.000 – R$ 72.000",
    precoMin: 56000,
    precoMax: 72000,
    kmAlvo: "até 80.000 km",
    categoria: "Sedã",
    foco: "Espaço de sedã médio por preço de compacto",
    pontosFortes: [
      "Porta-malas de 460 L — um dos maiores da faixa",
      "Banco traseiro espaçoso para passageiros",
      "CVT Xtronic confiável e econômica"
    ],
    pontosAtencao: [
      "Design conservador pode não agradar todos",
      "Motor 1.6 pede rotação em ultrapassagens"
    ],
    versoesMirar: ["SL 1.6 Xtronic", "Unique 1.6 Xtronic"],
    versoesEvitar: ["1.0 S (motorização fraca e sem CVT)"],
    fipeMarca: 43,
    fipeBusca: "VERSA 1.6",
    tags: ["seda", "espaco", "cvt", "familia"],
    links: {
      guia: "https://www.youtube.com/results?search_query=nissan+versa+xtronic+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "toyota-etios-15-at",
    modelo: "Toyota Etios 1.5 AT",
    marca: "Toyota",
    familia: "Etios",
    anosIdeais: "2017–2019",
    cambio: "Automático 4 marchas",
    tipoCambio: "at",
    faixaPreco: "R$ 56.000 – R$ 72.000",
    precoMin: 56000,
    precoMax: 72000,
    kmAlvo: "até 100.000 km",
    categoria: "Hatch / Sedã",
    foco: "Confiabilidade Toyota a preço acessível",
    pontosFortes: [
      "Mecânica Toyota — baixíssimo custo de manutenção",
      "Motor 1.5 Dual VVT-i eficiente e durável",
      "Histórico de pouquíssimas falhas mecânicas"
    ],
    pontosAtencao: [
      "Câmbio de 4 marchas — consumo rodoviário maior",
      "Design datado com acabamento simples"
    ],
    versoesMirar: ["Platinum 1.5 AT", "XLS 1.5 AT"],
    versoesEvitar: ["X 1.3 manual (motorização mais fraca)"],
    fipeMarca: 56,
    fipeBusca: "ETIOS",
    tags: ["hatch", "seda", "confiavel", "toyota", "duravel"],
    links: {
      guia: "https://www.youtube.com/results?search_query=toyota+etios+1.5+automatico+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "honda-fit-15-cvt",
    modelo: "Honda Fit 1.5 CVT",
    marca: "Honda",
    familia: "Fit",
    anosIdeais: "2015–2018",
    cambio: "CVT com simulação de 7 marchas",
    tipoCambio: "cvt",
    faixaPreco: "R$ 62.000 – R$ 82.000",
    precoMin: 62000,
    precoMax: 82000,
    kmAlvo: "até 90.000 km",
    categoria: "Hatch",
    foco: "Espaço interno imbatível e versatilidade",
    pontosFortes: [
      "Banco traseiro Magic Seat — configurações únicas",
      "Porta-malas de até 363 L com versatilidade extrema",
      "Motor i-VTEC potente e econômico"
    ],
    pontosAtencao: [
      "Valor de compra mais alto que concorrentes diretos",
      "CVT pode apresentar vibração se fluido não trocado em dia"
    ],
    versoesMirar: ["EXL 1.5 CVT", "EX 1.5 CVT"],
    versoesEvitar: ["DX 1.5 manual (versão de entrada sem CVT)"],
    fipeMarca: 25,
    fipeBusca: "FIT",
    tags: ["hatch", "cvt", "espaco", "versatil", "honda"],
    links: {
      guia: "https://www.youtube.com/results?search_query=honda+fit+cvt+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "honda-city-15-cvt",
    modelo: "Honda City 1.5 CVT",
    marca: "Honda",
    familia: "City",
    anosIdeais: "2015–2018",
    cambio: "CVT com simulação de 7 marchas",
    tipoCambio: "cvt",
    faixaPreco: "R$ 64.000 – R$ 85.000",
    precoMin: 64000,
    precoMax: 85000,
    kmAlvo: "até 90.000 km",
    categoria: "Sedã",
    foco: "Sedã compacto premium com excelente revenda",
    pontosFortes: [
      "Acabamento superior ao Fit na mesma plataforma",
      "Porta-malas de 536 L — referência entre sedãs compactos",
      "Revenda forte — Honda valoriza no mercado usado"
    ],
    pontosAtencao: [
      "Preço de compra mais salgado da lista",
      "Suspensão pode parecer firme em lombadas"
    ],
    versoesMirar: ["EXL 1.5 CVT", "EX 1.5 CVT"],
    versoesEvitar: ["DX 1.5 manual (sem câmbio CVT)"],
    fipeMarca: 25,
    fipeBusca: "CITY",
    tags: ["seda", "cvt", "premium", "revenda", "honda"],
    links: {
      guia: "https://www.youtube.com/results?search_query=honda+city+cvt+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  },
  {
    id: "vw-polo-16-at",
    modelo: "Volkswagen Polo 1.6 MSI AT",
    marca: "Volkswagen",
    familia: "Polo",
    anosIdeais: "2018–2020",
    cambio: "Automático 6 marchas (Aisin)",
    tipoCambio: "at",
    faixaPreco: "R$ 62.000 – R$ 80.000",
    precoMin: 62000,
    precoMax: 80000,
    kmAlvo: "até 70.000 km",
    categoria: "Hatch",
    foco: "Projeto moderno com segurança e tecnologia",
    pontosFortes: [
      "Plataforma MQB — estabilidade e segurança de referência",
      "Multimídia com Android Auto / Apple CarPlay",
      "Acabamento de bom nível e boa insonorização"
    ],
    pontosAtencao: [
      "Motor 1.6 MSI aspirado — desempenho apenas suficiente",
      "Câmbio Aisin pode não ser tão ágil quanto o DSG"
    ],
    versoesMirar: ["Highline 1.6 MSI AT", "Comfortline 1.6 MSI AT"],
    versoesEvitar: ["1.0 MPI (sem automático, motor fraco)"],
    fipeMarca: 59,
    fipeBusca: "POLO",
    tags: ["hatch", "tecnologia", "seguranca", "moderno"],
    links: {
      guia: "https://www.youtube.com/results?search_query=polo+1.6+msi+automatico+usado+review",
      referencia: "https://veiculos.fipe.org.br/"
    }
  }
];
