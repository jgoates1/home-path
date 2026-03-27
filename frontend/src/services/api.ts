// In dev, prefer same-origin `/api` so Vite can proxy to the Express server (avoids "Failed to fetch"
// when the UI is opened via 127.0.0.1 or a LAN IP — `localhost:3001` would target the wrong host).
// Production on Vercel also serves `/api` via rewrites. Override with VITE_API_URL when needed.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    archetype: string | null;
    pushNotifications: boolean;
  };
  token: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  archetype?: string;
}

interface ApiError {
  error?: string;
  message?: string;
}

class ApiService {
  private clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('homeapp_surveyed');
  }

  private async fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 30000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch (e) {
      if (e instanceof TypeError) {
        throw new Error(
          'Cannot reach the API. For local dev, run `npm run dev` or `npm run dev:backend` from the project root, then reload.',
        );
      }
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new Error('Request timed out. Check your connection and try again.');
      }
      throw e;
    } finally {
      window.clearTimeout(timer);
    }
  }

  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.clearAuth();
      }
      let apiMessage: string | undefined;
      if (text) {
        try {
          const body = JSON.parse(text) as ApiError;
          apiMessage = body.error || body.message;
        } catch {
          /* body is HTML or plain text */
        }
      }
      if (apiMessage) {
        throw new Error(apiMessage);
      }
      if (response.status === 502 || response.status === 503) {
        throw new Error(
          `API unavailable (${response.status}). If developing locally, ensure the backend is running on port 3001.`,
        );
      }
      throw new Error(
        text
          ? `Request failed (${response.status}). The server returned a non-JSON response (often a proxy or HTML error page).`
          : `Request failed (${response.status} ${response.statusText || ''}).`.trim(),
      );
    }

    if (!text) {
      return undefined as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error('Invalid JSON from server.');
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }, 30000);
    return this.handleResponse<LoginResponse>(response);
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await this.fetchWithTimeout(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, 30000);
    return this.handleResponse<LoginResponse>(response);
  }

  // User
  async getProfile() {
    const response = await this.fetchWithTimeout(`${API_BASE}/users/me`, {
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  async updateProfile(data: Partial<{
    username: string;
    archetype: string;
    pushNotifications: boolean;
  }>) {
    const response = await this.fetchWithTimeout(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    }, 30000);
    return this.handleResponse(response);
  }

  // Savings (stored in user_financial_profile)
  async updateSavings(currentSavings: number) {
    const response = await this.fetchWithTimeout(`${API_BASE}/users/savings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({ currentSavings }),
    }, 30000);
    return this.handleResponse(response);
  }

  // Surveys
  async getSurveyQuestions() {
    const response = await this.fetchWithTimeout(`${API_BASE}/surveys/questions`, undefined, 30000);
    return this.handleResponse(response);
  }

  async getSurveyResponses() {
    const response = await this.fetchWithTimeout(`${API_BASE}/surveys/responses`, {
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  async submitSurveyResponse(questionId: number, responseText: string) {
    const response = await this.fetchWithTimeout(`${API_BASE}/surveys/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({ questionId, response: responseText })
    }, 30000);
    return this.handleResponse(response);
  }

  async submitSurveyResponsesBatch(responses: Array<{ questionId: number; response: string }>) {
    const response = await this.fetchWithTimeout(`${API_BASE}/surveys/responses/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({ responses })
    }, 30000);
    return this.handleResponse(response);
  }

  // Todos
  async getTodoItems() {
    const response = await this.fetchWithTimeout(`${API_BASE}/todos/items`, undefined, 30000);
    return this.handleResponse(response);
  }

  async getUserTodos() {
    const response = await this.fetchWithTimeout(`${API_BASE}/todos`, {
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  async addTodo(data: {
    todoId: number;
    stepId?: number;
    reminderDate?: string;
    dueDate?: string;
    status?: string;
  }) {
    const response = await this.fetchWithTimeout(`${API_BASE}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    }, 30000);
    return this.handleResponse(response);
  }

  async updateTodo(todoId: number, data: {
    status?: string;
    reminderDate?: string;
    dueDate?: string;
  }) {
    const response = await this.fetchWithTimeout(`${API_BASE}/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    }, 30000);
    return this.handleResponse(response);
  }

  async deleteTodo(todoId: number) {
    const response = await this.fetchWithTimeout(`${API_BASE}/todos/${todoId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  // Steps
  async getSteps() {
    const response = await this.fetchWithTimeout(`${API_BASE}/steps`, {
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  async getStep(stepId: number) {
    const response = await this.fetchWithTimeout(`${API_BASE}/steps/${stepId}`, {
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  async createStep(data: {
    stepOrder: number;
    stepName: string;
    dueDate?: string;
  }) {
    const response = await this.fetchWithTimeout(`${API_BASE}/steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    }, 30000);
    return this.handleResponse(response);
  }

  async updateStep(stepId: number, data: {
    stepOrder?: number;
    stepName?: string;
    dueDate?: string;
  }) {
    const response = await this.fetchWithTimeout(`${API_BASE}/steps/${stepId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    }, 30000);
    return this.handleResponse(response);
  }

  async deleteStep(stepId: number) {
    const response = await this.fetchWithTimeout(`${API_BASE}/steps/${stepId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  async getStepTodos(stepId: number) {
    const response = await this.fetchWithTimeout(`${API_BASE}/steps/${stepId}/todos`, {
      headers: this.getAuthHeader()
    }, 30000);
    return this.handleResponse(response);
  }

  // AI Plan
  async generatePlan(data: { financial: object; context: object }) {
    const response = await this.fetchWithTimeout(`${API_BASE}/surveys/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(data),
    }, 60000);
    return this.handleResponse(response);
  }

  async getPlan() {
    const response = await this.fetchWithTimeout(`${API_BASE}/surveys/plan`, {
      headers: this.getAuthHeader(),
    }, 30000);
    return this.handleResponse(response);
  }

  async toggleAiTodo(todoId: number, completed: boolean) {
    const response = await this.fetchWithTimeout(`${API_BASE}/todos/ai/${todoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ completed }),
    }, 30000);
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
