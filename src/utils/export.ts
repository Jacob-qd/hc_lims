export function exportCSV(data: Record<string, unknown>[], filename: string, headers?: string[]) {
  if (!data.length) return;
  const keys = headers || Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => keys.map(k => {
      const val = row[k]?.toString() || '';
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportPDF(title: string, content: string, filename: string) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 14, 30);
  doc.save(`${filename}.pdf`);
}

export function exportFromTable(selector: string, filename: string) {
  const table = document.querySelector(selector);
  if (!table) return;
  const rows = Array.from(table.querySelectorAll('tr'));
  const data = rows.map(row => {
    const cells = Array.from(row.querySelectorAll('td, th'));
    return cells.map(c => c.textContent?.trim() || '');
  });
  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
