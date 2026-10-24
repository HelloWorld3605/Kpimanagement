import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Unit, UnitMember } from '../../types/org';
import {
  DraftRow,
  ParsedRow,
  applyParsed,
  draftIssues,
  fromDraft,
  indent,
  insertRow,
  move,
  outdent,
  outlineNumbers,
  removeAt,
  rowChanges,
  toDraft } from
'../../utils/orgEditor';

/** Trạng thái trình sửa cơ cấu: cây nháp + hoàn tác + kiểm tra trước khi lưu */
export function useOrgEditor(open: boolean, units: Unit[], members: UnitMember[]) {
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [history, setHistory] = useState<DraftRow[][]>([]);
  const [activeKey, setActiveKey] = useState<string>();
  const [focusKey, setFocusKey] = useState<string>();
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Mỗi lần mở: nạp lại từ cơ cấu đang lưu
  useEffect(() => {
    if (!open) return;
    const d = toDraft(units);
    setRows(d);
    setHistory([]);
    setActiveKey(d[0]?.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const commit = useCallback((next: DraftRow[], focus?: string) => {
    if (next === rowsRef.current) return;
    setHistory((h) => [...h.slice(-49), rowsRef.current]);
    setRows(next);
    if (focus) {
      setActiveKey(focus);
      setFocusKey(focus);
    }
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      setRows(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  const at = (key: string) => rowsRef.current.findIndex((r) => r.key === key);

  const actions = {
    /** Sửa ô: gộp các lần gõ liên tiếp trên cùng ô thành một bước hoàn tác */
    edit: (key: string, patch: Partial<DraftRow>) => {
      setRows((prev) => prev.map((r) => r.key === key ? { ...r, ...patch } : r));
    },
    snapshot: () => setHistory((h) => [...h.slice(-49), rowsRef.current]),
    indent: (key: string) => commit(indent(rowsRef.current, at(key)), key),
    outdent: (key: string) => commit(outdent(rowsRef.current, at(key)), key),
    moveUp: (key: string) => commit(move(rowsRef.current, at(key), -1), key),
    moveDown: (key: string) => commit(move(rowsRef.current, at(key), 1), key),
    remove: (key: string) => {
      const i = at(key);
      const next = removeAt(rowsRef.current, i);
      commit(next, next[Math.max(0, i - 1)]?.key);
    },
    add: (key: string, asChild: boolean) => {
      const r = insertRow(rowsRef.current, at(key), asChild);
      commit(r.rows, r.key);
    },
    applyParsed: (parsed: ParsedRow[], targetKey: string, mode: 'append' | 'replace') => commit(applyParsed(rowsRef.current, parsed, targetKey, mode)),
    clearAll: () => commit(rowsRef.current.slice(0, 1), rowsRef.current[0]?.key),
    reset: () => commit(toDraft(units))
  };

  const numbers = useMemo(() => outlineNumbers(rows), [rows]);
  const changes = useMemo(() => rowChanges(rows, units), [rows, units]);
  const issues = useMemo(() => draftIssues(rows, units, members), [rows, units, members]);
  const directCount = useMemo(() => {
    const m = new Map<string, number>();
    members.forEach((x) => m.set(x.unitId, (m.get(x.unitId) ?? 0) + 1));
    return m;
  }, [members]);

  const summary = {
    added: changes.filter((c) => c === 'new').length,
    edited: changes.filter((c) => c === 'edited' || c === 'moved').length,
    removed: issues.removed.length
  };
  const dirty = summary.added + summary.edited + summary.removed > 0;
  const errorCount = Object.keys(issues.rows).length + issues.removedWithStaff.length;

  return {
    rows,
    numbers,
    changes,
    issues,
    directCount,
    summary,
    dirty,
    errorCount,
    canUndo: history.length > 0,
    undo,
    activeKey,
    setActiveKey,
    focusKey,
    clearFocus: () => setFocusKey(undefined),
    actions,
    build: () => fromDraft(rows, units)
  };
}

export type OrgEditorState = ReturnType<typeof useOrgEditor>;