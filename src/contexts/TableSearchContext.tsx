import React, { createContext, useContext, useMemo, useState } from 'react';

type TableSearchValue = {query: string;setQuery: (q: string) => void;};

const TableSearchContext = createContext<TableSearchValue>({ query: '', setQuery: () => undefined });

/** Từ khoá đang tìm của thanh công cụ bảng → khung bảng tô chữ trùng */
export function TableSearchProvider({ children }: {children: React.ReactNode;}) {
  const [query, setQuery] = useState('');
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <TableSearchContext.Provider value={value}>{children}</TableSearchContext.Provider>;
}

export const useTableSearch = () => useContext(TableSearchContext);

/** Bỏ dấu từng ký tự, giữ nguyên độ dài để vị trí khớp vẫn trỏ đúng chữ gốc */
export function foldText(text: string) {
  let out = '';
  for (const ch of text) {
    if (ch === 'đ' || ch === 'Đ') out += 'd';else
    out += (ch.normalize('NFD')[0] ?? ch).toLowerCase()[0] ?? ch;
    // Ký tự ngoài BMP chiếm 2 đơn vị UTF-16: giữ đủ độ dài
    if (ch.length === 2) out += ' ';
  }
  return out;
}