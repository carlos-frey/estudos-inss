#!/usr/bin/env python3
"""Gera src/data/concursos/hemobras-empregos.json a partir do texto do edital Hemobrás 2024.

Fontes (extraídas com pdftotext do DOU de 06/12/2024 e da Retificação nº 1 de 10/12/2024):
  hemobras/edital-2024-especificos.txt  — Anexo I, II - Conhecimentos Específicos
  hemobras/retificacao-1.txt            — conteúdos substituídos/incluídos
Uso: python3 scripts/gen_hemobras.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
ESP = (HERE / 'hemobras/edital-2024-especificos.txt').read_text()
RET = (HERE / 'hemobras/retificacao-1.txt').read_text()
OUT = HERE.parent / 'src/data/concursos/hemobras-empregos.json'

CARGOS = {
    'assistente': 'Assistente Industrial e de Gestão Corporativa',
    'tecnico': 'Técnico Industrial e de Gestão Corporativa',
    'analista-adm': 'Analista Administrativo de Assuntos Corporativos',
    'analista-ind': 'Analista Industrial de Hemoderivados e Biotecnologia',
}
NIVEL = {'assistente': 'medio', 'tecnico': 'tecnico', 'analista-adm': 'superior', 'analista-ind': 'superior'}

# (código, título, cargo, título no texto do edital)
EMPREGOS = [
    (1, 'Assistente Administrativo', 'assistente', 'ASSISTENTE ADMINISTRATIVO'),
    (2, 'Arquivo', 'assistente', 'ARQUIVO'),
    (3, 'Ambiental', 'tecnico', 'AMBIENTAL'),
    (4, 'Automação Industrial', 'tecnico', 'AUTOMAÇÃO INDUSTRIAL'),
    (5, 'Controle de Qualidade', 'tecnico', 'CONTROLE DE QUALIDADE'),
    (6, 'Elétrica', 'tecnico', 'ELÉTRICA'),
    (7, 'Fracionamento do Plasma', 'tecnico', 'FRACIONAMENTO DO PLASMA'),
    (8, 'Logística', 'tecnico', 'LOGÍSTICA TÉCNICO DE GESTÃO CORPORATIVA - LOGÍSTICA FARMACÊUTICA ARMAZENAMENTO'),
    (9, 'Mecânica', 'tecnico', 'MECÂNICA'),
    (10, 'Refrigeração', 'tecnico', 'REFRIGERAÇÃO'),
    (11, 'Segurança do Trabalho', 'tecnico', 'SEGURANÇA DO TRABALHO'),
    (12, 'Tecnologia da Informação e Operação', 'tecnico', 'TECNOLOGIA DA INFORMAÇÃO E OPERAÇÃO'),
    (13, 'Administração de Pessoal', 'analista-adm', 'ADMINISTRAÇÃO DE PESSOAL'),
    (14, 'Analista de Contrato', 'analista-adm', 'ANALISTA DE CONTRATO'),
    (15, 'Analista Jurídico', 'analista-adm', 'ANALISTA JURÍDICO'),
    (16, 'Assessoria Administrativa', 'analista-adm', 'ASSESSORIA ADMINISTRATIVA'),
    (17, 'Auditoria Interna', 'analista-adm', 'AUDITORIA INTERNA'),
    (18, 'Compras Nacionais e Internacionais', 'analista-adm', 'COMPRAS NACIONAIS E INTERNACIONAIS'),
    (19, 'Contabilidade', 'analista-adm', 'CONTABILIDADE'),
    (20, 'Desenvolvimento de Pessoas', 'analista-adm', 'DESENVOLVIMENTO DE PESSOAS'),
    (21, 'Gestão de Riscos e Conformidade', 'analista-adm', 'GESTÃO DE RISCO E CONFORMIDADE'),
    (22, 'Inteligência de Mercado', 'analista-adm', 'INTELIGÊNCIA DE MERCADO'),
    (23, 'Jornalismo', 'analista-adm', 'JORNALISMO'),
    (24, 'Licitação e Contratos', 'analista-adm', 'LICITAÇÃO E CONTRATOS'),
    (25, 'Logística Farmacêutica 2', 'analista-adm', 'LOGÍSTICA FARMACÊUTICA 2'),
    (26, 'Orçamento e Finanças', 'analista-adm', 'ORÇAMENTO E FINANÇAS'),
    (27, 'Planejamento Estratégico', 'analista-adm', 'PLANEJAMENTO ESTRATÉGICO'),
    (28, 'Tecnologia da Informação', 'analista-adm', 'TECNOLOGIA DA INFORMAÇÃO'),
    (29, 'Armazenamento e Distribuição de Medicamentos', 'analista-ind', 'ARMAZENAMENTO E DISTRIBUIÇÃO DE MEDICAMENTOS'),
    (30, 'Assuntos Regulatórios', 'analista-ind', 'ASSUNTOS REGULATÓRIOS'),
    (31, 'Controle da Qualidade 1', 'analista-ind', 'CONTROLE DA QUALIDADE 1'),
    (32, 'Controle da Qualidade 2', 'analista-ind', 'CONTROLE DA QUALIDADE 2'),
    (33, 'Controle da Qualidade 3', 'analista-ind', 'CONTROLE DA QUALIDADE 3'),
    (34, 'Engenharia Ambiental', 'analista-ind', 'ENGENHARIA AMBIENTAL'),
    (35, 'Engenharia de Automação e Controle', 'analista-ind', 'ENGENHARIA DE AUTOMAÇÃO E CONTROLE'),
    (36, 'Engenharia Mecânica', 'analista-ind', 'ENGENHARIA MECÂNICA'),
    (37, None, 'analista-ind', 'ENGENHARIA QUÍMICA'),  # suprimido pela Retificação nº 1
    (38, 'Fracionamento Industrial do Plasma 1', 'analista-ind', 'FRACIONAMENTO INDUSTRIAL DO PLASMA 1'),
    (39, 'Fracionamento Industrial do Plasma 2', 'analista-ind', 'FRACIONAMENTO INDUSTRIAL DO PLASMA 2'),
    (40, 'Garantia da Qualidade', 'analista-ind', 'GARANTIA DA QUALIDADE 2'),  # renomeado na retificação
    (41, 'Planejamento e Controle de Produção', 'analista-ind', 'PLANEJAMENTO E CONTROLE DE PRODUÇÃO'),
    (42, 'Plasma e Hemocomponentes', 'analista-ind', 'PLASMA E HEMOCOMPONENTES'),
    (43, 'Segurança do Trabalho', 'analista-ind', 'SEGURANÇA DO TRABALHO'),
    (44, 'Tecnologia da Informação e Operação', 'analista-ind', 'TECNOLOGIA DA INFORMAÇÃO E OPERAÇÃO'),
]

CARGO_HEADINGS = [
    'II. TÉCNICO INDUSTRIAL E DE GESTÃO CORPORATIVA',
    'III. ANALISTA ADMINISTRATIVO DE ASSUNTOS CORPORATIVOS',
    'IV. ANALISTA INDUSTRIAL DE HEMODERIVADOS E BIOTECNOLOGIA',
]


def between(text: str, start: str, end: str) -> str:
    a = text.index(start) + len(start)
    return text[a:text.index(end, a)].strip()


def retificacao() -> dict[int, str]:
    cq = between(RET, 'Técnico Industrial e de Gestão Corporativa - Controle de Qualidade passa a vigorar com a seguinte redação: "', '"')
    lf2 = between(RET, 'Logística Farmacêutica 2 passa a vigorar com a seguinte redação: "', '"')
    # o texto da retificação vem com blocos de outras publicações do DOU intercalados
    lf2 = re.sub(r'Es ?te documento pode ser verificado.*?Nº 238, quarta-feira, 11 de dezembro de 2024', ' ', lf2)
    civil = between(RET, 'EMPREGO 45: ENGENHARIA CIVIL', '2.2 O cargo/emprego')
    civil = civil[civil.index('(Anexo I):') + len('(Anexo I):'):]
    civil = re.sub(r'tipos de solo:.*?(?=características e classificação geral)', 'tipos de solo: ', civil, flags=re.S)
    if 'características e classificação geral' not in civil:  # coluna cortada no DOU: completa pelo texto corrido
        civil = civil.split('tipos de solo:')[0] + 'tipos de solo: ' + between(RET, 'Sondagens de Reconhecimento do Subsolo, tipos e apresentações; tipos de solo:', 'Inglês técnico.') + 'Inglês técnico.'
    eletrica = between(RET, 'EMPREGO 46: ENGENHARIA ELÉTRICA', '3. Ficam retificados')
    eletrica = eletrica[eletrica.index('(Anexo I):') + len('(Anexo I):'):]
    fix = lambda s: re.sub(r'\s+', ' ', re.sub(r'Este documento pode ser verificado.*?ICP-Brasil\. Seção 3 ISSN 1677-7069', ' ', s)).strip()
    return {5: fix(cq), 25: fix(lf2), 45: fix(civil), 46: fix(eletrica)}


def split_top(s: str, seps: str) -> list[str]:
    """Divide s pelos separadores fora de parênteses."""
    out, depth, cur = [], 0, ''
    for ch in s:
        depth += ch == '('
        depth -= ch == ')' and depth > 0
        if ch in seps and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    return [p.strip(' .') for p in out if p.strip(' .')]


UP = 'A-ZÁÉÍÓÚÂÊÔÃÕÇ'
ABBREV = re.compile(r'(?:\bn|nº|\bart|\barts|\bDec|\bEx|\bS\.A|\bLtda|\bVol|\bp|\bpág|\bInc|\bséc|\bsr|\bsra|\bDr|\bPe)$', re.I)


def sentences(s: str) -> list[str]:
    out, depth, cur, i = [], 0, '', 0
    while i < len(s):
        ch = s[i]
        depth += ch == '('
        depth -= ch == ')' and depth > 0
        cur += ch
        if ch == '.' and depth == 0 and i + 2 < len(s) and s[i + 1] == ' ' and re.match(f'[{UP}0-9"“]', s[i + 2]):
            if not ABBREV.search(cur[:-1]) and not re.search(r'\b[A-Z]$', cur[:-1]):
                out.append(cur)
                cur = ''
        i += 1
    out.append(cur)
    return [x.strip(' .;') for x in out if x.strip(' .;')]


def cap(s: str) -> str:
    s = s.strip(' .;,:-–')
    return s[:1].upper() + s[1:] if s else s


def leaf(t: str) -> dict:
    return {'title': cap(re.sub(r'^(e|E)\s+', '', t.strip()))}


def label_node(sent: str) -> dict:
    """'Rótulo: a; b; c' vira nó com filhos; senão, folha."""
    m = re.match(r'^([^:;()]{3,70}):\s*(.+)$', sent)
    if not m:
        return leaf(sent)
    label, rest = m.group(1), m.group(2)
    parts = split_top(rest, ';')
    if len(parts) < 2:
        commas = split_top(rest, ',')
        if len(commas) >= 3 and all(len(c) <= 80 for c in commas):
            parts = commas
    if len(parts) >= 2:
        return {'title': cap(label), 'children': [leaf(p) for p in parts]}
    return leaf(sent)


SMALL = {'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'a', 'o', 'para', 'por', 'com', 'no', 'na', 'nos', 'nas'}
KEEP_UPPER = {'ERM', 'COSO', 'ISO', 'NBR', 'IEC', 'TI', 'SUS', 'RDC', 'BPF', 'PCP', 'ERP', 'MRP', 'WMS', 'TMS', 'S&OP'}


def nice_title(s: str) -> str:
    words = s.lower().split()
    out = []
    for i, w in enumerate(words):
        if w.upper() in KEEP_UPPER:
            out.append(w.upper())
        elif i and w in SMALL:
            out.append(w)
        else:
            out.append(w[:1].upper() + w[1:])
    return ' '.join(out)


def items(sent: str) -> list[dict]:
    """Frase com rótulo vira um nó; frase longa sem rótulo listando assuntos vira várias folhas irmãs."""
    node = label_node(sent)
    if 'children' in node or len(sent) <= 160:
        return [node]
    out: list[str] = []
    for part in split_top(sent, ';'):
        commas = split_top(part, ',')
        out.extend(commas if len(part) > 160 and len(commas) >= 3 else [part])
    return [leaf(x) for x in out] if len(out) >= 3 else [node]


def is_caps_label(sent: str) -> str | None:
    m = re.match(rf'^([{UP}0-9 ,&/()–-]{{4,}}):\s*(.*)$', sent)
    if m and sum(c.isalpha() for c in m.group(1)) >= 4:
        return m.group(1)
    return None


STRONG = re.compile(r'^((?:Direito|Noções de|Conhecimentos? de|Conhecimento em|Legislação|Língua|Informática)[^:;()]{0,60}):\s*(.*)$')


def group_by_discipline(sents: list[str]) -> list[dict] | None:
    if sum(bool(STRONG.match(s)) for s in sents) < 3:
        return None
    out: list[dict] = []
    section = None
    for s in sents:
        m = STRONG.match(s)
        if m:
            section = {'title': cap(m.group(1)), 'children': []}
            out.append(section)
            if m.group(2).strip():
                section['children'].extend(items(m.group(2)))
        elif section is not None:
            section['children'].extend(items(s))
        else:
            out.extend(items(s))
    for sec in out:
        if sec.get('children') == []:
            del sec['children']
    return out


def parse_unnumbered(text: str) -> list[dict]:
    sents = sentences(text)
    if sum(bool(is_caps_label(s)) for s in sents) < 2:
        return group_by_discipline(sents) if len(sents) > 30 and group_by_discipline(sents) else [x for s in sents for x in items(s)]
    out: list[dict] = []
    section = None
    for s in sents:
        lab = is_caps_label(s)
        if lab:
            rest = s.split(':', 1)[1].strip()
            section = {'title': cap(nice_title(lab) if lab.isupper() else lab), 'children': []}
            out.append(section)
            if rest:
                section['children'].extend(items(rest))
        elif section is not None:
            section['children'].extend(items(s))
        else:
            out.extend(items(s))
    for sec in out:
        if 'children' in sec and not sec['children']:
            del sec['children']
    return out


NUM = re.compile(r'(?:(?<=^)|(?<=\s))(\d{1,2}(?:\.\d{1,2})*)\.?\s(?=[' + UP + r'"“])')


def parse_numbered(text: str) -> list[dict] | None:
    """Segue a numeração do edital (1., 2.1., …), aceitando só números que continuam a sequência."""
    def nexts(last: tuple[int, ...]) -> set[tuple[int, ...]]:
        c = {last + (1,)}
        for k in range(len(last)):
            c.add(last[:k] + (last[k] + 1,))
        return c

    marks, last = [], None
    for m in NUM.finditer(text):
        n = tuple(int(x) for x in m.group(1).split('.'))
        if (last is None and n == (1,)) or (last is not None and n in nexts(last)):
            marks.append((m.start(), m.end(), n))
            last = n
    if len(marks) < 3:
        return None
    root: list[dict] = []
    stack: list[tuple[tuple[int, ...], dict]] = []
    for i, (a, b, n) in enumerate(marks):
        body = text[b:marks[i + 1][0] if i + 1 < len(marks) else len(text)].strip()
        ss = sentences(body)
        node = {'title': cap(body.rstrip(' .;'))}
        while stack and stack[-1][0] != n[:len(stack[-1][0])]:
            stack.pop()
        while stack and len(stack[-1][0]) >= len(n):
            stack.pop()
        parent = stack[-1][1] if stack else None
        if parent is None:
            root.append(node)
        else:
            if 'children' not in parent:
                # o texto do pai vira título curto (1ª frase); o restante, se houver, vira o 1º filho
                ps = sentences(parent['title'])
                parent['children'] = items('. '.join(ps[1:])) if len(ps) > 1 else []
                parent['title'] = cap(ps[0]) if ps else parent['title']
            parent['children'].append(node)
        stack.append((n, node))
    prefix = text[:marks[0][0]].strip()

    return ([*parse_unnumbered(prefix)] if prefix else []) + root


def parse(text: str) -> list[dict]:
    return parse_numbered(text) or parse_unnumbered(text)


def main():
    text = ESP
    for h in CARGO_HEADINGS:
        text = text.replace(h, ' ')
    text = text.replace('II - CONHECIMENTOS ESPECÍFICOS I. ASSISTENTE INDUSTRIAL E DE GESTÃO CORPORATIVA', '')
    pos, spans = 0, []
    for code, _, _, heading in EMPREGOS:
        i = text.index(heading, pos)
        spans.append((i, i + len(heading)))
        pos = i + len(heading)
    raw = {}
    for k, (code, *_rest) in enumerate(EMPREGOS):
        end = spans[k + 1][0] if k + 1 < len(spans) else len(text)
        raw[code] = text[spans[k][1]:end].strip()
    raw.update(retificacao())

    out = []
    for code, title, cargo, _ in EMPREGOS + [(45, 'Engenharia Civil', 'analista-ind', ''), (46, 'Engenharia Elétrica', 'analista-ind', '')]:
        if title is None:
            continue
        out.append({
            'code': code,
            'title': title,
            'cargo': CARGOS[cargo],
            'nivel': NIVEL[cargo],
            'retificado': code in (5, 25, 45, 46),
            'children': parse(raw[code]),
        })
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    n_leaves = lambda ns: sum(n_leaves(x['children']) if x.get('children') else 1 for x in ns)
    for e in out:
        print(f"{e['code']:>2} {e['title'][:40]:<40} top={len(e['children']):>3} folhas={n_leaves(e['children'])}")


if __name__ == '__main__':
    main()
