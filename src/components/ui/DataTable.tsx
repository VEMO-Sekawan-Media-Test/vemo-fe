import React from 'react';
import { clsx } from 'clsx';

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  className?: string;
  rowClassName?: string;
}

export default function DataTable({ columns, data, emptyMessage = 'No data available', className, rowClassName }: DataTableProps) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className={clsx('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className={clsx('hover:bg-gray-50 transition-colors', rowClassName)}>
                {columns.map(col => (
                  <td key={col.key} className={clsx('px-6 py-4 whitespace-nowrap text-sm', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
