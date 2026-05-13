import type { ReactNode } from 'react'

interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  emptyText?: string
}

export function Table<T>({ columns, rows, rowKey, emptyText = 'No records found.' }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slateBrand-200 bg-white dark:border-slateBrand-800 dark:bg-slateBrand-900">
      <table className="min-w-full divide-y divide-slateBrand-200 dark:divide-slateBrand-800">
        <thead className="bg-slateBrand-100/70 dark:bg-slateBrand-800/60">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slateBrand-600 dark:text-slateBrand-300">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slateBrand-100 dark:divide-slateBrand-800">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slateBrand-50/70 dark:hover:bg-slateBrand-800/50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-slateBrand-700 dark:text-slateBrand-100">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <div className="p-4 text-center text-sm text-slateBrand-500">{emptyText}</div>
      ) : null}
    </div>
  )
}