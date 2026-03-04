/**
 * 数据库操作层 - 使用 better-sqlite3
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Grade, Unit, Word } from '@/types';

// 数据库路径 - 使用项目根目录下的 wordapp.db
const dbPath = path.join(process.cwd(), '../wordapp.db');

// 确保数据库文件存在
if (!fs.existsSync(dbPath)) {
  throw new Error(`Database file not found: ${dbPath}`);
}

// 创建数据库连接
const db = new Database(dbPath, { readonly: true });

/**
 * 获取所有年级列表
 */
export function getGrades(): Grade[] {
  const stmt = db.prepare('SELECT id, name, cover, mark_note FROM grade');
  return stmt.all() as Grade[];
}

/**
 * 获取指定年级的单元列表
 */
export function getUnits(grade: string): Unit[] {
  const stmt = db.prepare(`
    SELECT u.grade, CAST(u.unit AS INTEGER) as unit, u.name, COUNT(w.id) as word_count
    FROM unit u
    LEFT JOIN word w ON u.grade = w.grade AND u.unit = w.unit
    WHERE u.grade = ?
    GROUP BY u.grade, u.unit
    ORDER BY u.unit
  `);
  const results = stmt.all(grade) as any[];
  return results.map(r => ({ ...r, unit: Number(r.unit) }));
}

/**
 * 获取指定年级和单元的单词列表
 */
export function getWords(grade: string, unit?: number): Word[] {
  let sql = 'SELECT id, word, grade, unit, phonetic, chinese_definition, mark, page FROM word WHERE grade = ?';
  const params: any[] = [grade];

  if (unit !== undefined) {
    sql += ' AND unit = ?';
    params.push(String(unit));
  }

  sql += ' ORDER BY unit, id';

  const stmt = db.prepare(sql);
  return stmt.all(...params) as Word[];
}

/**
 * 获取随机单词（用于练习模式）
 * 注意：数据库中的 unit 列是 TEXT 类型，需要将数字转换为字符串
 */
export function getRandomWords(grade: string, units: number[], count: number = 20): Word[] {
  if (units.length === 0) return [];

  const placeholders = units.map(() => '?').join(',');
  const sql = `
    SELECT id, word, grade, unit, phonetic, chinese_definition, mark, page
    FROM word
    WHERE grade = ? AND unit IN (${placeholders})
    ORDER BY RANDOM()
    LIMIT ?
  `;

  const stmt = db.prepare(sql);
  // Convert units to strings since the unit column is TEXT in the database
  return stmt.all(grade, ...units.map(String), count) as Word[];
}

/**
 * 根据ID获取单词
 */
export function getWordById(id: number): Word | null {
  const stmt = db.prepare('SELECT id, word, grade, unit, phonetic, chinese_definition, mark, page FROM word WHERE id = ?');
  return stmt.get(id) as Word | null;
}

// 导出类型以供其他模块使用
export type { Grade, Unit, Word } from '@/types';
