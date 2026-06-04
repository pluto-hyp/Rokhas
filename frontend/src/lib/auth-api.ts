const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string | null;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name?: string | null;
  role?: string | null;
}

function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object" && "msg" in entry && typeof (entry as { msg: unknown }).msg === "string") {
          return (entry as { msg: string }).msg;
        }
        return JSON.stringify(entry);
      })
      .join("; ");
  }
  return "API request failed";
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(normalizeDetail(error.detail));
  }
  return response.json();
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        `Cannot reach the API at ${API_BASE_URL}. Start the backend (e.g. http://127.0.0.1:8000) or set NEXT_PUBLIC_API_BASE_URL.`
      );
    }
    throw error;
  }
}

export async function login(data: FormData): Promise<AuthResponse> {
  return fetchJson(apiUrl("/auth/login"), {
    method: "POST",
    body: data,
  });
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return fetchJson(apiUrl("/auth/google"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function register(data: RegisterInput): Promise<User> {
  return fetchJson(apiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function signup(data: RegisterInput): Promise<User> {
  return fetchJson(apiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function getMe(token: string): Promise<User> {
  return fetchJson(apiUrl("/users/me"), {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}

export async function updateMe(data: Partial<User> & { password?: string }, token: string): Promise<User> {
  return fetchJson(apiUrl("/users/me"), {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateRole(role: string, token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/me/role`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });
  return handleResponse(response);
}
