// PDF text extraction engine preserving page boundaries

export interface ExtractedPDFResult {
  text: string;
  pageCount: number;
  pages: Array<{ pageNumber: number; text: string; wordCount: number }>;
  isLowText: boolean;
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<ExtractedPDFResult> {
  // Dynamic import of pdf-parse to avoid webpack bundling issues in server routes
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");

  const pages: Array<{ pageNumber: number; text: string; wordCount: number }> = [];

  const customPagerender = (pageData: any) => {
    return pageData.getTextContent().then((textContent: any) => {
      let lastY: number | null = null;
      let text = "";
      for (const item of textContent.items) {
        if (lastY == null || Math.abs(item.transform[5] - lastY) < 2) {
          text += item.str + " ";
        } else {
          text += "\n" + item.str + " ";
        }
        lastY = item.transform[5];
      }

      const cleanText = text.replace(/\s+/g, " ").trim();
      const pageNum = pageData.pageIndex + 1;
      const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

      pages.push({
        pageNumber: pageNum,
        text: cleanText,
        wordCount,
      });

      return `\n\n--- [Page ${pageNum}] ---\n${cleanText}`;
    });
  };

  try {
    const data = await pdfParse(pdfBuffer, {
      pagerender: customPagerender,
    });

    // Sort pages in ascending page order
    pages.sort((a, b) => a.pageNumber - b.pageNumber);

    const totalWords = pages.reduce((acc, p) => acc + p.wordCount, 0);
    const avgWordsPerPage = pages.length > 0 ? totalWords / pages.length : 0;
    // If average words per page is less than 20, document is likely a scan requiring OCR
    const isLowText = pages.length > 0 && avgWordsPerPage < 20;

    return {
      text: data.text || pages.map((p) => `--- [Page ${p.pageNumber}] ---\n${p.text}`).join("\n\n"),
      pageCount: data.numpages || pages.length || 1,
      pages,
      isLowText,
    };
  } catch (err: any) {
    throw new Error(`Failed to extract digital text from PDF: ${err.message || String(err)}`);
  }
}
