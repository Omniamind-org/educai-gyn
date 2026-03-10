import { extractText, getDocumentProxy } from "npm:unpdf";

const MAX_EXTRACTED_TEXT_LENGTH = 12000;
const MAX_EXTRACTED_SNIPPET_LENGTH = 1200;

function normalizePdfText(text: string): string {
  return text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractPdfTextFromBuffer(buffer: ArrayBuffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  const normalizedText = normalizePdfText(text);

  return {
    totalPages,
    text: normalizedText.slice(0, MAX_EXTRACTED_TEXT_LENGTH),
    snippet: normalizedText.slice(0, MAX_EXTRACTED_SNIPPET_LENGTH),
  };
}
