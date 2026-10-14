import { extractTextFromPDF, ExtractedPDFResult } from "./pdf";
import { extractTextWithOCR, OCRResult } from "./ocr";

export interface ProcessedDocumentData {
  text: string;
  pageCount: number;
  wordCount: number;
  isOCRApplied: boolean;
  extractionQuality: "high" | "moderate" | "poor";
  warning?: string;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function validateDocumentFile(file: { name: string; type: string; size: number }): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 15MB limit. (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  const isAllowedType = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
    file.name.toLowerCase().endsWith(".pdf") ||
    file.name.toLowerCase().endsWith(".png") ||
    file.name.toLowerCase().endsWith(".jpg") ||
    file.name.toLowerCase().endsWith(".jpeg") ||
    file.name.toLowerCase().endsWith(".webp");

  if (!isAllowedType) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload a PDF, PNG, JPG, or WEBP document.",
    };
  }

  return { valid: true };
}

export async function processDocumentBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ProcessedDocumentData> {
  const isPDF = mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
  const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(filename);

  if (isPDF) {
    try {
      const pdfResult: ExtractedPDFResult = await extractTextFromPDF(buffer);

      const totalWords = pdfResult.pages.reduce((sum, p) => sum + p.wordCount, 0);

      if (totalWords < 5) {
        return {
          text: "",
          pageCount: pdfResult.pageCount,
          wordCount: totalWords,
          isOCRApplied: false,
          extractionQuality: "poor",
          warning: "No readable digital text found in this PDF. It appears to be an unsearchable scan or image-only document.",
        };
      }

      return {
        text: pdfResult.text,
        pageCount: pdfResult.pageCount,
        wordCount: totalWords,
        isOCRApplied: false,
        extractionQuality: pdfResult.isLowText ? "moderate" : "high",
        warning: pdfResult.isLowText ? "Document contains low text density per page; some details might be embedded in graphics." : undefined,
      };
    } catch (err: any) {
      throw new Error(`PDF parsing error: ${err.message || String(err)}`);
    }
  }

  if (isImage) {
    try {
      const ocrResult: OCRResult = await extractTextWithOCR(buffer);

      if (ocrResult.wordCount < 5) {
        return {
          text: ocrResult.text,
          pageCount: 1,
          wordCount: ocrResult.wordCount,
          isOCRApplied: true,
          extractionQuality: "poor",
          warning: "Image text could not be clearly recognized. Please ensure the image is sharp, well-lit, and legible.",
        };
      }

      return {
        text: `--- [Page 1] ---\n${ocrResult.text}`,
        pageCount: 1,
        wordCount: ocrResult.wordCount,
        isOCRApplied: true,
        extractionQuality: ocrResult.confidence > 70 ? "high" : "moderate",
        warning: ocrResult.confidence <= 70 ? "OCR confidence is moderate. Please verify critical numbers, dates, and amounts against the original image." : undefined,
      };
    } catch (err: any) {
      throw new Error(`OCR processing error: ${err.message || String(err)}`);
    }
  }

  throw new Error("Unsupported document format for text extraction.");
}
