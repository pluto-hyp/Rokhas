const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

export interface Project {
  id: number;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  type?: string;
  hauteur?: number;
  recul?: number;
  emprise?: number;
  surface_terrain?: number;
  zone?: string;
  ai_analysis?: string;
  owner_name?: string;
  owner_cin?: string;
  land_reference?: string;
  municipal_fee_amount?: number;
  municipal_fee_receipt?: string;
  municipal_fee_paid?: boolean;
  permit_documents?: PermitDocument[];
  signed_by?: string;
  signature_hash?: string;
  signed_at?: string;
}

export type PermitDocument = {
  key: string;
  label: string;
  filename: string;
  size?: string;
  approved: boolean;
  required: boolean;
  notes: string[];
  url?: string;
};

export type ProjectCreate = {
  title: string;
  description?: string;
  type?: string;
  hauteur?: number;
  recul?: number;
  emprise?: number;
  surface_terrain?: number;
  zone?: string;
  owner_name?: string;
  owner_cin?: string;
  land_reference?: string;
  municipal_fee_amount?: number;
  municipal_fee_receipt?: string;
  municipal_fee_paid?: boolean;
  permit_documents?: PermitDocument[];
};

export type BusinessPermitDocument = {
  key: string;
  filename: string;
  url?: string;
  approved: boolean;
  required: boolean;
  notes: string[];
};

export type BusinessPermitCreate = {
  business_name: string;
  business_type: string;
  business_description?: string;
  address: string;
  zone?: string;
  surface_area?: number | null;
  applicant_name: string;
  applicant_cin: string;
  permit_documents?: BusinessPermitDocument[];
};

export interface BusinessPermit extends BusinessPermitCreate {
  id: number;
  owner_id: number;
  status: string;
  created_at: string;
  signed_by?: string | null;
  signature_hash?: string | null;
  signed_at?: string | null;
}

export type ReportSummary = {
  permits: {
    total: number;
    approved: number;
    pending: number;
    approval_rate: number;
  };
  entities: {
    citizens: number;
    businesses: number;
    evaluations: number;
  };
  categories: Record<string, number>;
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(error.detail || "API request failed", response.status);
  }
  return response.json();
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`${error.message}. Make sure the backend API is running at ${API_BASE_URL}`);
    }
    throw error;
  }
}

export async function getProjects(token: string): Promise<Project[]> {
  return fetchJson(apiUrl("/dossiers"), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function getProject(id: number, token: string): Promise<Project> {
  return fetchJson(apiUrl(`/dossiers/${id}`), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function createProject(project: ProjectCreate, token: string): Promise<Project> {
  return fetchJson(apiUrl("/dossiers"), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
}

export async function createBusinessPermit(
  permit: BusinessPermitCreate,
  token: string
): Promise<BusinessPermit> {
  return fetchJson(apiUrl("/business-permits"), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(permit),
  });
}

export async function askAgent(message: string, token: string): Promise<ChatMessage> {
  return fetchJson(apiUrl("/agent/chat"), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
}

export async function getReportSummary(token: string): Promise<ReportSummary> {
  return fetchJson(apiUrl("/reports/summary"), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  dossier_id?: number;
  business_permit_id?: number;
  read: boolean;
  created_at: string;
}

export async function getNotifications(token: string): Promise<Notification[]> {
  return fetchJson(apiUrl("/notifications"), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function markNotificationAsRead(id: number, token: string): Promise<Notification> {
  return fetchJson(apiUrl(`/notifications/${id}/read`), {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function markAllNotificationsAsRead(token: string): Promise<{ message: string }> {
  return fetchJson(apiUrl("/notifications/read-all"), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function updateProjectStatus(
  id: number,
  statusUpdate: { status?: string; permit_documents?: PermitDocument[] },
  token: string
): Promise<Project> {
  return fetchJson(apiUrl(`/dossiers/${id}/status`), {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(statusUpdate),
  });
}

export async function uploadDocumentFile(
  dossierId: number,
  file: File,
  token: string
): Promise<{ filename: string; url: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(apiUrl(`/dossiers/${dossierId}/upload-document`), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new ApiError(error.detail || "File upload failed", response.status);
  }

  return response.json();
}

export async function uploadTemporaryDocument(
  file: File,
  token: string
): Promise<{ filename: string; url: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(apiUrl("/dossiers/upload-temporary-document"), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new ApiError(error.detail || "File upload failed", response.status);
  }

  return response.json();
}
