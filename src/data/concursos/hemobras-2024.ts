import type { Concurso, Emprego, Subject } from '../../domain/types'
import { ACCENTS, build, type Draft, law, leafs, n, PLANALTO, subject } from '../build'
import empregosJson from './hemobras-empregos.json'

// Concurso Público Hemobrás nº 1, de 06/12/2024 (Instituto Consulplan), com a Retificação nº 1 (10/12/2024).
// Conhecimentos do emprego gerados por scripts/gen_hemobras.py a partir do Anexo I.

const HEMOBRAS_DOCS = 'https://hemobras.gov.br/wp-content/uploads'

const subjects: Subject[] = [
  subject({
    id: 'hemobras.pt',
    title: 'Língua Portuguesa',
    short: 'Português',
    group: 'CB',
    weight: 10,
    accent: ACCENTS.rose,
    icon: 'book',
    children: [
      n('Elementos de construção do texto e seu sentido', leafs('Gênero do texto: literário e não literário; narrativo, descritivo e argumentativo', 'Interpretação e organização interna')),
      n('Semântica', leafs('Sentido e emprego dos vocábulos', 'Campos semânticos', 'Emprego de tempos e modos dos verbos')),
      n('Morfologia', leafs('Reconhecimento, emprego e sentido das classes gramaticais', 'Processos de formação de palavras', 'Mecanismos de flexão dos nomes e verbos')),
      n('Sintaxe', leafs('Frase, oração e período', 'Termos da oração', 'Processos de coordenação e subordinação', 'Concordância nominal e verbal', 'Transitividade e regência de nomes e verbos', 'Colocação pronominal', 'Mecanismos de coesão textual')),
      ...leafs('Ortografia', 'Acentuação gráfica', 'Emprego do sinal indicativo de crase', 'Pontuação'),
      n('Reescrita de frases', leafs('Substituição', 'Deslocamento', 'Paralelismo')),
      n('Variação linguística: norma culta'),
    ],
  }),
  subject({
    id: 'hemobras.rl',
    title: 'Raciocínio Lógico-Matemático',
    short: 'Raciocínio Lógico',
    group: 'CB',
    weight: 5,
    accent: ACCENTS.orange,
    icon: 'functions',
    children: [
      n('Lógica', leafs('Princípio da Regressão ou Reversão', 'Lógica dedutiva, argumentativa e quantitativa', 'Lógica matemática qualitativa', 'Sequências lógicas com números, letras e figuras')),
      n('Proporcionalidade', leafs('Regra de três simples e composta', 'Razões especiais')),
      n('Contagem', leafs('Análise combinatória', 'Probabilidade')),
      n('Progressões aritmética e geométrica'),
      n('Conjuntos', leafs('Relações de pertinência, inclusão e igualdade', 'Operações: união, interseção e diferença', 'Conjuntos numéricos')),
      n('Álgebra', leafs('Equações de 1º e 2º grau', 'Inequações de 1º e 2º grau', 'Funções de 1º e 2º grau', 'Matrizes, determinantes e sistemas lineares', 'Polinômios')),
      n('Geometria', leafs('Geometria plana', 'Geometria espacial', 'Trigonometria', 'Geometria analítica')),
    ],
  }),
  subject({
    id: 'hemobras.et',
    title: 'Código de Ética, Conduta e Integridade',
    short: 'Ética',
    group: 'CB',
    weight: 5,
    accent: ACCENTS.amber,
    icon: 'ethics',
    children: [
      law('Código de Ética, Conduta e Integridade da Hemobrás (documento completo)', `${HEMOBRAS_DOCS}/2024/10/Codigo-de-Etica-Conduta-e-Integridade-1_compressed-1.pdf`),
    ],
  }),
  subject({
    id: 'hemobras.hb',
    title: 'Conhecimentos sobre a Hemobrás',
    short: 'Hemobrás',
    group: 'CE',
    weight: 10,
    accent: ACCENTS.red,
    icon: 'blood',
    children: [
      law('Estatuto Social vigente da Hemobrás', `${HEMOBRAS_DOCS}/2024/04/12.-Estatuto-Social-alterado-na-1aAGO-2aAGE-de-19.04.24-vigente-a-partir-de-19.04.24_Comprimir.pdf`),
      law('Regimento Interno da Hemobrás', `${HEMOBRAS_DOCS}/2024/03/1.a.-Anexo-da-Resolucao-no-001.2024.CADM-Regimento-Interno-da-Hemobras_3a-rev.-ajuste-CTC.pdf`),
      n('Missão, Visão e Valores da Hemobrás'),
    ],
  }),
  subject({
    id: 'hemobras.lg',
    title: 'Legislação e Temas Transversais',
    short: 'Legislação',
    group: 'CE',
    weight: 10,
    accent: ACCENTS.sky,
    icon: 'policy',
    children: [
      n('IN Conjunta MP/CGU nº 01/2016: controles internos, gestão de riscos e governança'),
      law('Lei nº 10.972/2004: autoriza a criação da Hemobrás', `${PLANALTO}/_ato2004-2006/2004/lei/l10.972.htm`),
      law('Lei nº 13.303/2016: estatuto jurídico da empresa pública', `${PLANALTO}/_ato2015-2018/2016/lei/l13303.htm`),
      law('Decreto nº 8.945/2016: regulamenta a Lei nº 13.303/2016', `${PLANALTO}/_ato2015-2018/2016/decreto/d8945.htm`),
      law('Lei nº 10.205/2001: Lei do Sangue', `${PLANALTO}/leis/leis_2001/l10205.htm`),
      law('Lei nº 12.846/2013: Lei Anticorrupção', `${PLANALTO}/_ato2011-2014/2013/lei/l12846.htm`),
      law('Lei nº 13.709/2018: LGPD', `${PLANALTO}/_ato2015-2018/2018/lei/l13709.htm`, leafs('Capítulo I: Disposições preliminares', 'Capítulo II: Do tratamento de dados pessoais', 'Capítulo III: Dos direitos do titular')),
      n('RDC nº 658/2022: Boas Práticas de Fabricação de Medicamentos', leafs('Capítulo I: Disposições iniciais', 'Capítulo II: Do Sistema da Qualidade Farmacêutica', 'Capítulo III: Do Pessoal')),
    ],
  }),
]

interface EmpregoJson {
  code: number
  title: string
  cargo: string
  nivel: Emprego['nivel']
  retificado: boolean
  children: Draft[]
}

const empregos: Emprego[] = (empregosJson as EmpregoJson[]).map((e) => {
  const id = `e${String(e.code).padStart(2, '0')}`
  const sid = `hemobras.${id}`
  return {
    id,
    code: e.code,
    title: e.title,
    cargo: e.cargo,
    nivel: e.nivel,
    retificado: e.retificado,
    subject: {
      id: sid,
      title: `Conhecimentos do emprego: ${e.title}`,
      short: e.title,
      group: 'CE',
      weight: 60,
      accent: ACCENTS.indigo,
      icon: 'work',
      children: build(sid, e.children),
    },
  }
})

export const hemobras: Concurso = {
  id: 'hemobras',
  name: 'Hemobrás',
  org: 'Hemobrás',
  cargo: 'Todos os empregos',
  banca: 'Instituto Consulplan',
  editalLabel: 'Edital 2024',
  editalUrl: 'https://cdn.direcaoconcursos.com.br/uploads/2024/12/edital-hemobras.pdf',
  unit: 'pontos',
  total: 100,
  groups: [
    { id: 'CB', label: 'Básicos', short: 'Básicos' },
    { id: 'CE', label: 'Específicos', short: 'Específicos' },
  ],
  subjects,
  empregos,
  look: { gradient: 'linear-gradient(135deg, #991B1B 0%, #DC2626 50%, #DB2777 100%)', glow: 'rgba(220,38,38,0.45)' },
  notes: ['50 questões de múltipla escolha (A a D)', 'Mínimo: 50% do total e 40% dos específicos'],
}
