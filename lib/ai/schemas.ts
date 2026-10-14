import { z } from "zod";

export const ExtractedKeyPointSchema = z.object({
  point: z.string().describe("A key fact or piece of information extracted directly from the document"),
  category: z.string().describe("Category such as Eligibility, Process, Contact, Instruction, General"),
  pageNumber: z.number().int().optional().describe("Source page number where this point appears"),
  sourceExcerpt: z.string().optional().describe("Short verbatim quote from the document supporting this fact"),
});

export const ImportantDateSchema = z.object({
  date: z.string().describe("The date or timeframe mentioned in the document"),
  description: z.string().describe("What happens on this date (e.g. Last date to submit application)"),
  dateType: z.enum(["deadline", "event", "issue_date", "meeting", "other"]).describe("Type of date: distinguish deadlines from meeting or issue dates"),
  isAmbiguous: z.boolean().default(false).describe("True if the year or exact day is uncertain or relative"),
  pageNumber: z.number().int().optional().describe("Source page number"),
  sourceExcerpt: z.string().optional().describe("Short source excerpt"),
});

export const EligibilityRequirementSchema = z.object({
  requirement: z.string().describe("Condition or criteria stated in document"),
  appliesTo: z.string().default("All applicants").describe("Who this requirement applies to (e.g. SC/ST students, final year, general)"),
  isMandatory: z.boolean().default(true).describe("Whether this requirement is strictly required or optional"),
  pageNumber: z.number().int().optional().describe("Source page number"),
  sourceExcerpt: z.string().optional().describe("Short source excerpt"),
});

export const RequiredDocumentItemSchema = z.object({
  documentName: z.string().describe("Name of the certificate, mark sheet, ID, or form required"),
  notes: z.string().optional().describe("Special instructions like self-attested, original, or gazetted sign"),
  isMandatory: z.boolean().default(true),
  pageNumber: z.number().int().optional().describe("Source page number"),
  sourceExcerpt: z.string().optional().describe("Short source excerpt"),
});

export const ActionPlanItemSchema = z.object({
  title: z.string().describe("Actionable task title"),
  description: z.string().optional().describe("How or where to complete this step"),
  suggestedDueDate: z.string().optional().describe("Suggested deadline (YYYY-MM-DD format if known)"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  pageNumber: z.number().int().optional().describe("Source page number"),
});

export const AmountAndFeeSchema = z.object({
  feeName: z.string().describe("Name of the fee, scholarship amount, stipend, or fine"),
  amount: z.string().describe("Monetary value with currency (e.g. ₹500, ₹25,000/year, $50)"),
  isRefundable: z.boolean().default(false),
  deadline: z.string().optional().describe("Payment deadline if specified"),
  pageNumber: z.number().int().optional().describe("Source page number"),
  sourceExcerpt: z.string().optional().describe("Short source excerpt"),
});

export const AnalysisResultSchema = z.object({
  documentTitle: z.string().describe("Official or clear title of the document"),
  documentType: z.string().describe("Type of document: Scholarship, Admission, Circular, Exam, Job/Internship, Invoice, General"),
  purpose: z.string().describe("One or two sentence summary of the primary purpose and audience of this document"),
  summary: z.string().describe("Comprehensive concise overview of the document contents"),
  simpleExplanationEnglish: z.string().describe("Plain English breakdown written in friendly, simple conversational tone for students/everyday readers"),
  simpleExplanationHindi: z.string().describe("Simple Hindi (Hinglish/Devanagari) explanation in plain language preserving key names, dates, amounts"),
  keyPoints: z.array(ExtractedKeyPointSchema).default([]),
  importantDates: z.array(ImportantDateSchema).default([]),
  eligibilityRequirements: z.array(EligibilityRequirementSchema).default([]),
  requiredDocuments: z.array(RequiredDocumentItemSchema).default([]),
  actionItems: z.array(ActionPlanItemSchema).default([]),
  amountsAndFees: z.array(AmountAndFeeSchema).default([]),
  uncertainties: z.array(z.string()).default([]).describe("Points that are missing, blurred, ambiguous, or need verification"),
});

export type AnalysisResultOutput = z.infer<typeof AnalysisResultSchema>;
