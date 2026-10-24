import React from 'react';

type DataTableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  /** Set false only for specialized form/print tables that need their own visual language. */
  standardStyle?: boolean;
};

/** Shared table primitive for application data lists. Keeps column headers visible and consistent even when tbody is empty. */
export function DataTable({ className = '', standardStyle = true, ...props }: DataTableProps) {
  const shared = standardStyle ? 'data-table' : '';
  return <table {...props} className={`${shared} ${className}`.trim()} />;
}
