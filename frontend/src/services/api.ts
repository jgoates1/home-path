const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    archetype: string | null;
    currentSavings: number;
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
  error: string;
}

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Something went wrong');
    }
    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse<LoginResponse>(response);
  }

  // User
  async getProfile() {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async updateProfile(data: Partial<{
    username: string;
    archetype: string;
    currentSavings: number;
    pushNotifications: boolean;
  }>) {
    const response = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  // Surveys
  async getSurveyQuestions() {
    const response = await fetch(`${API_BASE}/surveys/questions`);
    return this.handleResponse(response);
  }

  async getSurveyResponses() {
    const response = await fetch(`${API_BASE}/surveys/responses`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async submitSurveyResponse(questionId: number, responseText: string) {
    const response = await fetch(`${API_BASE}/surveys/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({ questionId, response: responseText })
    });
    return this.handleResponse(response);
  }

  async submitSurveyResponsesBatch(responses: Array<{ questionId: number; response: string }>) {
    const response = await fetch(`${API_BASE}/surveys/responses/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({ responses })
    });
    return this.handleResponse(response);
  }

  // Todos
  async getTodoItems() {
    const response = await fetch(`${API_BASE}/todos/items`);
    return this.handleResponse(response);
  }

  async getUserTodos() {
    const response = await fetch(`${API_BASE}/todos`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async addTodo(data: {
    todoId: number;
    stepId?: number;
    reminderDate?: string;
    dueDate?: string;
    status?: string;
  }) {
    const response = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async updateTodo(todoId: number, data: {
    status?: string;
    reminderDate?: string;
    dueDate?: string;
  }) {
    const response = await fetch(`${API_BASE}/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async deleteTodo(todoId: number) {
    const response = await fetch(`${API_BASE}/todos/${todoId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  // Steps
  async getSteps() {
    const response = await fetch(`${API_BASE}/steps`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getStep(stepId: number) {
    const response = await fetch(`${API_BASE}/steps/${stepId}`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async createStep(data: {
    stepOrder: number;
    stepName: string;
    dueDate?: string;
  }) {
    const response = await fetch(`${API_BASE}/steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async updateStep(stepId: number, data: {
    stepOrder?: number;
    stepName?: string;
    dueDate?: string;
  }) {
    const response = await fetch(`${API_BASE}/steps/${stepId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async deleteStep(stepId: number) {
    const response = await fetch(`${API_BASE}/steps/${stepId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }

  async getStepTodos(stepId: number) {
    const response = await fetch(`${API_BASE}/steps/${stepId}/todos`, {
      headers: this.getAuthHeader()
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
