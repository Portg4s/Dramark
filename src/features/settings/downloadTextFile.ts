type DownloadTextFileInput = {
  content: string;
  fileName: string;
  mimeType: string;
};

export function createDatedExportFileName(date = new Date()) {
  return `dramark-export-${date.toISOString().slice(0, 10)}.json`;
}

export function downloadTextFile({ content, fileName, mimeType }: DownloadTextFileInput) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
