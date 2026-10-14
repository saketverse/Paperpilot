// OCR processing engine using Tesseract.js (WASM / pure JS)
import { createWorker } from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  wordCount: number;
}

export async function extractTextWithOCR(
  imageBuffer: Buffer,
  language: string = "eng"
): Promise<OCRResult> {
  let worker: any = null;
  try {
    worker = await createWorker(language);

    const ret = await worker.recognize(imageBuffer);
    const cleanText = (ret.data.text || "").replace(/\s+/g, " ").trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

    return {
      text: cleanText,
      confidence: ret.data.confidence || 0,
      wordCount,
    };
  } catch (err: any) {
    console.error("OCR execution error:", err);
    throw new Error(`OCR processing failed: ${err.message || String(err)}`);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore cleanup error
      }
    }
  }
}
