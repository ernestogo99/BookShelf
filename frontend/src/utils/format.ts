/** Formatação de dados vindos da API (datas em string, etc.). */

const MONTHS_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/** "2024-06-29T22:54:00" → "29 jun 2024". Robusto a string nula/ inválida. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = MONTHS_PT[d.getMonth()] ?? '';
  return `${day} ${month} ${d.getFullYear()}`;
}

/** Junta autores em "A, B e C" (ou string vazia). */
export function formatAuthors(authors: string[] | null | undefined): string {
  if (!authors || authors.length === 0) return 'Autor desconhecido';
  if (authors.length === 1) return authors[0] ?? '';
  return `${authors.slice(0, -1).join(', ')} e ${authors[authors.length - 1]}`;
}

/** Metadados curtos do livro: "Editora · 2020 · 320 págs". */
export function formatBookMeta(parts: {
  publisher?: string | null;
  published_year?: number | null;
  pages?: number | null;
}): string {
  const out: string[] = [];
  if (parts.publisher) out.push(parts.publisher);
  if (parts.published_year) out.push(String(parts.published_year));
  if (parts.pages) out.push(`${parts.pages} págs`);
  return out.join(' · ');
}
