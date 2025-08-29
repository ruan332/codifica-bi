// Tipos de dados baseados no modelo da documentação

export interface User {
  id: string;
  email: string;
  role: 'client' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  power_bi_url: string;
  iframe_code: string;
  created_at: string;
  updated_at: string;
}

export interface ClientReport {
  id: string;
  client_id: string;
  report_id: string;
  created_at: string;
  client?: Client;
  report?: Report;
}

export interface AccessLog {
  id: string;
  user_id: string;
  report_id: string;
  accessed_at: string;
  ip_address: string;
  user?: User;
  report?: Report;
}

// Tipos para autenticação
export interface AuthUser {
  id: string;
  email: string;
  role: 'client' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Tipos para formulários
export interface ClientFormData {
  name: string;
  cnpj: string;
  email: string;
  password: string;
  is_active: boolean;
  report_ids: string[];
}

export interface ReportFormData {
  title: string;
  description: string;
  power_bi_url: string;
  iframe_code: string;
}

// Tipos para dashboard
export interface DashboardStats {
  total_clients: number;
  active_clients: number;
  total_reports: number;
  total_accesses: number;
  recent_accesses: AccessLog[];
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}

// Tipos para componentes
export interface ReportCardProps {
  report: Report;
  onClick: (report: Report) => void;
}

export interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onToggleStatus: (clientId: string, isActive: boolean) => void;
}

// Tipos para hooks
export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isClient: boolean;
}

export interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  createClient: (data: ClientFormData) => Promise<void>;
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  toggleClientStatus: (id: string, isActive: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  createReport: (data: ReportFormData) => Promise<void>;
  updateReport: (id: string, data: Partial<ReportFormData>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseClientReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  logAccess: (reportId: string) => Promise<void>;
  refetch: () => Promise<void>;
}