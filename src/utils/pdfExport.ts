import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const INVALID_FOLDER_CHARS = /[\\/:*?"<>|]+/g;

/** Sanitizes a company name into a safe filesystem directory name, keeping it human-readable. */
export function sanitizeFolderName(name: string): string {
  return name.replace(INVALID_FOLDER_CHARS, '-').trim() || 'application';
}

/** Rasterizes a single already-A4-sized .doc-page element (see .pdf-export-root in document.css). */
async function renderPageCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
}

function canvasesToPdfBlob(canvases: HTMLCanvasElement[]): Blob {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  canvases.forEach((canvas, i) => {
    if (i > 0) pdf.addPage();
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
  });
  return pdf.output('blob');
}

/** Rasterizes each page element once and returns the canvases, reusable across multiple PDF outputs. */
export async function renderPageCanvases(pageElements: HTMLElement[]): Promise<HTMLCanvasElement[]> {
  const canvases: HTMLCanvasElement[] = [];
  for (const el of pageElements) {
    canvases.push(await renderPageCanvas(el));
  }
  return canvases;
}

export function buildPdfBlob(canvases: HTMLCanvasElement[]): Blob {
  return canvasesToPdfBlob(canvases);
}

async function writeFile(dir: FileSystemDirectoryHandle, filename: string, blob: Blob): Promise<void> {
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

/** Creates (or reuses) a subdirectory named after the company and writes the given named PDF blobs into it. */
export async function writeApplicationPdfs(
  folder: FileSystemDirectoryHandle,
  companyFolderName: string,
  files: Array<{ filename: string; blob: Blob }>,
): Promise<void> {
  const companyDir = await folder.getDirectoryHandle(companyFolderName, { create: true });
  for (const { filename, blob } of files) {
    await writeFile(companyDir, filename, blob);
  }
}
