export type DocumentStatus = 'uploaded' | 'extracting' | 'analyzing' | 'completed' | 'failed';

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type SupportedLanguage = 'en' | 'hi';

export interface UserProfile {
  id: string;
  display_name: string | null;
  preferred_language: SupportedLanguage;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface ExtractedKeyPoint {
  point: string;
  category: string;
  pageNumber?: number;
  sourceExcerpt?: string;
}

export interface ImportantDate {
  date: string;
  description: string;
  dateType: 'deadline' | 'event' | 'issue_date' | 'meeting' | 'other';
  isAmbiguous: boolean;
  pageNumber?: number;
  sourceExcerpt?: string;
}

export interface EligibilityRequirement {
  requirement: string;
  appliesTo: string;
  isMandatory: boolean;
  pageNumber?: number;
  sourceExcerpt?: string;
}

export interface RequiredDocumentItem {
  documentName: string;
  notes?: string;
  isMandatory: boolean;
  pageNumber?: number;
  sourceExcerpt?: string;
}

export interface ActionPlanItem {
  id?: string;
  title: string;
  description?: string;
  suggestedDueDate?: string;
  priority: TaskPriority;
  pageNumber?: number;
}

export interface AmountAndFee {
  feeName: string;
  amount: string;
  isRefundable: boolean;
  deadline?: string;
  pageNumber?: number;
  sourceExcerpt?: string;
}

export interface AnalysisResult {
  documentTitle: string;
  documentType: string;
  purpose: string;
  summary: string;
  simpleExplanationEnglish: string;
  simpleExplanationHindi: string;
  keyPoints: ExtractedKeyPoint[];
  importantDates: ImportantDate[];
  eligibilityRequirements: EligibilityRequirement[];
  requiredDocuments: RequiredDocumentItem[];
  actionItems: ActionPlanItem[];
  amountsAndFees: AmountAndFee[];
  uncertainties: string[];
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  status: DocumentStatus;
  document_type: string;
  extracted_text: string | null;
  page_count: number;
  analysis_result: AnalysisResult | null;
  error_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRecord {
  id: string;
  user_id: string;
  document_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  task_type: string;
  status: TaskStatus;
  source_page: number | null;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
  documents?: {
    original_filename: string;
    document_type: string;
  };
}

export interface ChatMessageRecord {
  id: string;
  user_id: string;
  document_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source_references: Array<{
    pageNumber?: number;
    quote?: string;
    section?: string;
  }> | null;
  created_at: string;
}
