import { getFirebaseAuth } from "@/lib/firebase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
};

async function getAuthToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, requireAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required but no user is signed in");
    }
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as {
      error?: string;
      errors?: string[];
    };
    const message =
      errorBody.error ??
      errorBody.errors?.join(", ") ??
      `API error: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
