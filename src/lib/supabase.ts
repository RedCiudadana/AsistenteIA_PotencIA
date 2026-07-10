import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AppSettings {
  id: string;
  institution_name: string;
  institution_dept: string | null;
  institution_state: string | null;
  institution_website: string | null;
  institution_email: string | null;
  ai_name: string;
  ai_role: string;
  response_style: 'muy_formal' | 'formal' | 'semiformal';
  ai_cite_sources: boolean;
  ai_suggest_next: boolean;
  ai_use_emojis: boolean;
  search_country: string;
  compact_mode: boolean;
  show_timestamps: boolean;
  show_typing_indicator: boolean;
  notify_ai_errors: boolean;
  notify_new_docs: boolean;
  notify_flow_complete: boolean;
  max_context_tokens: number;
  enable_telemetry: boolean;
  show_debug_info: boolean;
  active_model_id:  string | null;
  platform_name:    string;
  platform_tagline: string;
  quick_actions:    string[];
  updated_at: string;
}

export interface AiProvider {
  id: string;
  name: string;
  provider_key: string;
  type: 'anthropic' | 'openai_compat';
  base_url: string | null;
  api_key_set: boolean;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
}

export interface AiModel {
  id: string;
  provider_id: string;
  model_id: string;
  display_name: string;
  description: string | null;
  context_window: number | null;
  created_at: string;
  ai_providers?: AiProvider;
}

export interface AiModelWithProvider extends AiModel {
  ai_providers: AiProvider;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface FlowCategory {
  id: string;
  name: string;
  color: string;
  applies_to: 'templates' | 'flows' | 'both';
  created_at: string;
}

export interface TemplatePlaceholder {
  key: string;
  label: string;
  description: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  content: string;
  placeholders: TemplatePlaceholder[];
  tags: string[];
  usage_count: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  flow_categories?: FlowCategory | null;
}

export interface FlowStep {
  id: string;
  order: number;
  title: string;
  description: string;
  responsible: string;
  duration: string;
  required: boolean;
}

export interface WorkflowFlow {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  status: 'draft' | 'active' | 'archived';
  steps: FlowStep[];
  tags: string[];
  usage_count: number;
  created_at: string;
  updated_at: string;
  flow_categories?: FlowCategory | null;
}

export type ComplianceStatus = 'compliant' | 'warning' | 'non_compliant';export type ComplianceCategory = 'LGTAIP' | 'LGPDPPSO' | 'NOM-151' | 'MAAGTIC' | 'INTERNA';

export interface PrivacySettings {
  id: string;
  ai_context_level: 'none' | 'summary' | 'full';
  data_retention_days: number;
  require_human_review: boolean;
  allow_external_ai: boolean;
  allow_doc_indexing: boolean;
  classification_default: 'public' | 'internal' | 'confidential' | 'reserved';
  audit_log_enabled: boolean;
  anonymize_queries: boolean;
  session_timeout_minutes: number;
  institutional_name: string;
  responsible_name: string | null;
  responsible_email: string | null;
  updated_at: string;
}

export interface ComplianceItem {
  id: string;
  category: ComplianceCategory;
  order_index: number;
  title: string;
  description: string;
  status: ComplianceStatus;
  is_checked: boolean;
  notes: string | null;
  updated_at: string;
}

export type EventType =
  | 'ai_query' | 'doc_added' | 'doc_archived' | 'doc_updated'
  | 'template_used' | 'template_created' | 'flow_started' | 'flow_created';

export interface ActivityEvent {
  id: string;
  event_type: EventType;
  label: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Document {
  id: string;
  name: string;
  ext: 'pdf' | 'docx' | 'xlsx' | 'txt';
  size_label: string;
  size_bytes: number;
  category_id: string | null;
  description: string | null;
  content: string | null;
  tags: string[];
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  document_categories?: Category | null;
}
