// html2pdf.js (html2canvas + jsPDF) touches `window`/`document` at import time.
// Disabling SSR here means this route only ever renders client-side, so the
// dynamic import in exportPDF() below never runs during server rendering.
export const ssr = false;
