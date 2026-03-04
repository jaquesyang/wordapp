/**
 * API client functions
 */

export interface Grade {
  id: string;
  name: string | null;
  cover: string | null;
  mark_note: string | null;
}

export interface Unit {
  grade: string;
  unit: number;
  name: string;
  word_count: number;
}

export interface Word {
  id: number;
  word: string;
  grade: string;
  unit: number;
  phonetic: string | null;
  chinese_definition: string | null;
  mark: string | null;
  page: number | null;
}

export async function fetchGrades(): Promise<Grade[]> {
  const res = await fetch('/api/grades', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch grades');
  return res.json();
}

export async function fetchUnits(grade: string): Promise<Unit[]> {
  const res = await fetch(`/api/units?grade=${encodeURIComponent(grade)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch units');
  return res.json();
}

export async function fetchWords(grade: string, unit?: number): Promise<Word[]> {
  const url = unit
    ? `/api/words?grade=${encodeURIComponent(grade)}&unit=${unit}`
    : `/api/words?grade=${encodeURIComponent(grade)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch words');
  return res.json();
}

export async function fetchRandomWords(grade: string, units: number[], count: number = 20): Promise<Word[]> {
  const unitsParam = units.join(',');
  const res = await fetch(
    `/api/words/random?grade=${encodeURIComponent(grade)}&units=${unitsParam}&count=${count}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch random words');
  return res.json();
}

export async function fetchWordById(id: number): Promise<Word | null> {
  const res = await fetch(`/api/words/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch word');
  return res.json();
}
