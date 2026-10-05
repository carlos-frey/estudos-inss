import type { Concurso, Subject } from '../../domain/types'
import { ACCENTS, law, leafs, n, PLANALTO, subject } from '../build'

// Edital INSS 2022 (Cebraspe), item 14 — base até sair o edital novo.
// Pesos da P1 são estimativa (o edital só diz 50 itens no total da P1).

const subjects: Subject[] = [
  subject({
    id: 'inss.pt',
    title: 'Língua Portuguesa',
    short: 'Português',
    group: 'P1',
    weight: 15,
    accent: ACCENTS.rose,
    icon: 'book',
    children: [
    ...leafs(
      'Compreensão e interpretação de textos',
      'Tipologia textual',
      'Ortografia oficial',
      'Acentuação gráfica',
    ),
    n('Emprego das classes de palavras', leafs('Substantivo, adjetivo e artigo', 'Pronomes', 'Verbos', 'Advérbio, preposição e conjunção')),
    ...leafs('Emprego do sinal indicativo de crase'),
    n('Sintaxe da oração e do período', leafs('Termos da oração', 'Período composto por coordenação', 'Período composto por subordinação')),
    ...leafs('Pontuação', 'Concordância nominal e verbal', 'Regências nominal e verbal', 'Significação das palavras'),
    n('Redação de correspondências oficiais (Manual de Redação da Presidência)'),
  ]}),

  subject({
    id: 'inss.et',
    title: 'Ética no Serviço Público',
    short: 'Ética',
    group: 'P1',
    weight: 5,
    accent: ACCENTS.amber,
    icon: 'ethics',
    children: [
    law('Decreto nº 1.171/1994 (Código de Ética do Servidor)', `${PLANALTO}/decreto/d1171.htm`, leafs('Regras deontológicas', 'Principais deveres do servidor', 'Vedações ao servidor', 'Comissões de Ética')),
    law('Decreto nº 6.029/2007 (Sistema de Gestão da Ética)', `${PLANALTO}/_ato2007-2010/2007/decreto/d6029.htm`),
  ]}),

  subject({
    id: 'inss.co',
    title: 'Noções de Direito Constitucional',
    short: 'Constitucional',
    group: 'P1',
    weight: 5,
    accent: ACCENTS.emerald,
    icon: 'gavel',
    children: [
    n('Direitos e garantias fundamentais', [
      ...leafs('Direitos e deveres individuais e coletivos', 'Direito à vida, à liberdade, à igualdade, à segurança e à propriedade', 'Direitos sociais', 'Nacionalidade', 'Cidadania e direitos políticos', 'Garantias constitucionais individuais', 'Garantias dos direitos coletivos, sociais e políticos'),
    ], { lawUrl: `${PLANALTO}/constituicao/constituicao.htm` }),
    n('Administração Pública (CF, arts. 37 a 41)', leafs('Art. 37: princípios e regras gerais', 'Art. 38: servidor eleito', 'Arts. 39 a 41: servidores públicos, estabilidade'), { lawUrl: `${PLANALTO}/constituicao/constituicao.htm` }),
  ]}),

  subject({
    id: 'inss.ad',
    title: 'Noções de Direito Administrativo',
    short: 'Administrativo',
    group: 'P1',
    weight: 10,
    accent: ACCENTS.sky,
    icon: 'bank',
    children: [
    n('Estado, governo e administração pública', leafs('Conceitos e elementos', 'Poderes e organização', 'Natureza, fins e princípios')),
    n('Direito administrativo: conceito, fontes e princípios'),
    n('Organização administrativa da União', leafs('Administração direta', 'Administração indireta')),
    n('Agentes públicos', [
      ...leafs('Espécies e classificação', 'Poderes, deveres e prerrogativas', 'Cargo, emprego e função públicos'),
      law('Regime Jurídico Único (Lei nº 8.112/1990)', `${PLANALTO}/leis/l8112cons.htm`, [
        ...leafs('Provimento', 'Vacância', 'Remoção, redistribuição e substituição', 'Direitos e vantagens', 'Regime disciplinar', 'Responsabilidade civil, criminal e administrativa'),
      ]),
    ]),
    n('Poderes administrativos', leafs('Poder hierárquico', 'Poder disciplinar', 'Poder regulamentar', 'Poder de polícia', 'Uso e abuso do poder')),
    n('Ato administrativo', leafs('Validade e eficácia', 'Atributos', 'Extinção, desfazimento e sanatória', 'Classificação, espécies e exteriorização', 'Vinculação e discricionariedade')),
    n('Serviços públicos', leafs('Conceito, classificação, regulamentação e controle', 'Forma, meios e requisitos', 'Delegação: concessão, permissão, autorização')),
    n('Controle e responsabilização da administração', [
      ...leafs('Controle administrativo', 'Controle judicial', 'Controle legislativo', 'Responsabilidade civil do Estado'),
      law('Lei nº 8.429/1992 (Improbidade Administrativa)', `${PLANALTO}/leis/l8429.htm`),
    ]),
    law('Lei nº 9.784/1999 (Processo Administrativo)', `${PLANALTO}/leis/l9784.htm`),
  ]}),

  subject({
    id: 'inss.inf',
    title: 'Noções de Informática',
    short: 'Informática',
    group: 'P1',
    weight: 10,
    accent: ACCENTS.violet,
    icon: 'computer',
    children: [
    n('Conceitos de Internet e intranet'),
    n('Conceitos básicos e modos de utilização de tecnologias, ferramentas, aplicativos e procedimentos de informática'),
    n('Aplicativos de escritório LibreOffice', leafs('Writer (edição de textos)', 'Calc (planilhas)', 'Impress (apresentações)')),
    n('Sistemas operacionais Windows 7 e 10', undefined, { outdated: true }),
    n('Navegação e correio eletrônico'),
    n('Segurança e proteção: vírus, worms e derivados'),
  ]}),

  subject({
    id: 'inss.rl',
    title: 'Raciocínio Lógico-Matemático',
    short: 'Raciocínio Lógico',
    group: 'P1',
    weight: 5,
    accent: ACCENTS.orange,
    icon: 'functions',
    children: [
    n('Conceitos básicos de raciocínio lógico', leafs('Proposições e valores lógicos', 'Sentenças abertas', 'Número de linhas da tabela-verdade', 'Conectivos', 'Proposições simples e compostas')),
    n('Tautologia'),
    n('Operação com conjuntos'),
    n('Cálculos com porcentagens'),
  ]}),

  subject({
    id: 'inss.es',
    title: 'Conhecimentos Específicos: Seguridade Social',
    short: 'Seguridade Social',
    group: 'P2',
    weight: 70,
    accent: ACCENTS.indigo,
    icon: 'health',
    children: [
    n('Seguridade Social', leafs('Origem e evolução legislativa no Brasil', 'Conceituação', 'Organização e princípios constitucionais')),
    n('Legislação Previdenciária', [n('Conteúdo, fontes, autonomia'), n('Aplicação das normas previdenciárias', leafs('Vigência', 'Hierarquia', 'Interpretação e integração'))]),
    n('Regime Geral de Previdência Social', [
      ...leafs('Segurados obrigatórios', 'Filiação e inscrição'),
      n('Conceito, características e abrangência', leafs('Empregado', 'Empregado doméstico', 'Contribuinte individual', 'Trabalhador avulso', 'Segurado especial')),
      n('Segurado facultativo: conceito, características, filiação e inscrição'),
      n('Trabalhadores excluídos do Regime Geral'),
    ]),
    n('Empresa e empregador doméstico: conceito previdenciário'),
    n('Financiamento da Seguridade Social', [
      n('Receitas da União'),
      n('Receitas das contribuições sociais', leafs('Dos segurados', 'Das empresas', 'Do empregador doméstico', 'Do produtor rural', 'Do clube de futebol profissional', 'Sobre a receita de concursos de prognósticos', 'Receitas de outras fontes')),
      n('Salário de contribuição', leafs('Conceito', 'Parcelas integrantes e não integrantes', 'Limites mínimo e máximo', 'Contribuições inferiores ao salário mínimo e complementação', 'Reajustamento')),
      n('Arrecadação e recolhimento das contribuições', leafs('Competência do INSS e da Receita Federal do Brasil', 'Obrigações da empresa e demais contribuintes', 'Prazo de recolhimento', 'Recolhimento fora do prazo: juros, multa e atualização')),
    ]),
    n('Decadência e prescrição'),
    n('Crimes contra a seguridade social'),
    n('Recurso das decisões administrativas'),
    n('Plano de Benefícios da Previdência Social', leafs('Beneficiários', 'Espécies de prestações e benefícios', 'Disposições gerais e específicas', 'Períodos de carência', 'Salário de benefício', 'Renda mensal do benefício', 'Reajustamento do valor dos benefícios')),
    n('Manutenção, perda e restabelecimento da qualidade de segurado'),
    n('Serviços Previdenciários', leafs('Serviço social', 'Reabilitação profissional')),
    n('Benefícios decorrentes de legislações especiais', leafs(
      'Pensão especial: Síndrome de Talidomida (Lei nº 7.070/1982)',
      'Pensão especial dos seringueiros (Lei nº 7.986/1989)',
      'Pensão especial de ex-combatente (Lei nº 8.059/1990)',
      'Pensão às vítimas de hemodiálise de Caruaru (Lei nº 9.422/1996)',
      'Pensão vitalícia às vítimas do Césio 137 (Lei nº 9.425/1996)',
      'Aposentadoria e pensão excepcional ao anistiado político (Lei nº 10.559/2002)',
      'Pensão especial às pessoas atingidas pela hanseníase (Lei nº 11.520/2007)',
      'Pensão especial para crianças com Síndrome Congênita do Zika Vírus (Lei nº 13.985/2020)',
    )),
    n('Seguro-desemprego do pescador artesanal (seguro defeso)', [
      law('Lei nº 10.779/2003', `${PLANALTO}/leis/2003/l10.779.htm`),
      law('Decreto nº 8.424/2015', `${PLANALTO}/_ato2015-2018/2015/decreto/d8424.htm`),
    ]),
    n('Lei Orgânica da Assistência Social (LOAS)', [
      n('Benefício de prestação continuada (BPC/LOAS)'),
      n('Auxílio-Inclusão'),
      law('Lei nº 8.742/1993', `${PLANALTO}/leis/l8742.htm`),
      law('Lei nº 14.176/2021', `${PLANALTO}/_ato2019-2022/2021/lei/L14176.htm`),
      law('Decreto nº 6.214/2007', `${PLANALTO}/_ato2007-2010/2007/decreto/d6214.htm`),
    ]),
    n('Regimes Próprios de Previdência Social (União, estados, DF e municípios)', [
      ...leafs('Certidão de Tempo de Contribuição', 'Contagem recíproca', 'Compensação previdenciária'),
      law('Lei nº 9.796/1999', `${PLANALTO}/leis/l9796.htm`),
      n('Decreto nº 10.188/2019'),
    ]),
    law('Emenda Constitucional nº 103/2019 (Reforma da Previdência)', `${PLANALTO}/constituicao/emendas/emc/emc103.htm`, [
      ...leafs('Regras permanentes (art. 201 da CF)', 'Regras de transição: pedágio e pontos', 'Regras de transição: idade mínima progressiva', 'Cálculo dos benefícios (nova regra)', 'Pensão por morte e acumulação de benefícios', 'Disposições sobre o RPPS'),
    ]),
    law('Lei Complementar nº 142/2013 (Aposentadoria da pessoa com deficiência)', `${PLANALTO}/leis/lcp/lcp142.htm`),
    law('Lei nº 8.212/1991 (Custeio da Seguridade Social)', `${PLANALTO}/leis/l8212cons.htm`, [
      ...leafs('Título I: Disposições gerais e Seguridade Social', 'Título II: Saúde, Previdência e Assistência Social', 'Título III: Financiamento da Seguridade Social (receitas e contribuições)', 'Título IV: Contribuição da União', 'Título V: Arrecadação e recolhimento', 'Título VI: Disposições finais'),
    ]),
    law('Lei nº 8.213/1991 (Plano de Benefícios)', `${PLANALTO}/leis/l8213cons.htm`, [
      n('Título I: Finalidade e princípios'),
      n('Título II: Regime Geral de Previdência Social', leafs('Beneficiários: segurados e dependentes', 'Inscrição e filiação', 'Prestações em geral', 'Período de carência', 'Salário de benefício', 'Renda mensal do benefício')),
      n('Benefícios', leafs('Aposentadoria por invalidez', 'Aposentadoria por idade', 'Aposentadoria por tempo de contribuição', 'Aposentadoria especial', 'Auxílio por incapacidade temporária (doença)', 'Salário-família', 'Salário-maternidade', 'Auxílio-acidente', 'Pensão por morte', 'Auxílio-reclusão', 'Abono de permanência')),
      n('Acidente do trabalho e doença ocupacional'),
      n('Contagem recíproca de tempo de serviço'),
      n('Serviço social e reabilitação profissional'),
      n('Justificação administrativa e legislação complementar'),
      n('Disposições finais e transitórias'),
    ]),
    law('Decreto nº 3.048/1999 (Regulamento da Previdência Social)', `${PLANALTO}/decreto/d3048.htm`, [
      ...leafs('Livro I: Previdência Social e Regime Geral', 'Livro II: Prestações e benefícios', 'Livro III: Custeio e arrecadação', 'Livro IV: Disposições gerais e transitórias'),
    ]),
    n('Instrução Normativa PRES/INSS nº 128/2022', undefined, { outdated: true }),
    n('O servidor público como agente de desenvolvimento social'),
    n('Saúde e qualidade de vida no serviço público'),
  ]}),
]

export const inss: Concurso = {
  id: 'inss',
  name: 'INSS',
  org: 'INSS',
  cargo: 'Técnico do Seguro Social',
  banca: 'Cebraspe',
  editalLabel: 'Edital 2022',
  editalUrl: 'https://www.gov.br/inss/pt-br/assuntos/inss-e-autorizado-a-nomear-mais-250-tecnicos-aprovados-no-ultimo-concurso/EditalconcursoINSS2022.pdf',
  unit: 'itens',
  total: 120,
  groups: [
    { id: 'P1', label: 'P1 · Básicos', short: 'P1' },
    { id: 'P2', label: 'P2 · Específicos', short: 'P2' },
  ],
  subjects,
  look: { gradient: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 55%, #A21CAF 100%)', glow: 'rgba(79,70,229,0.5)' },
  notes: ['Certo/errado: cada erro anula um acerto', 'Mínimo: P1 ≥ 10, P2 ≥ 21 e total ≥ 36'],
}
