# API Endpoints Documentation - Frontend Reference

This document provides a comprehensive description of all API endpoints that your frontend application will consume.

**Base URL**: `http://localhost:3000` (or your production URL)

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Habit Endpoints](#habit-endpoints)
4. [Utility Endpoints](#utility-endpoints)
5. [Error Handling](#error-handling)
6. [Authentication Flow](#authentication-flow)

---

## Authentication Endpoints

### 1. POST /api/register

**Description**: Register a new user account.

**Authentication**: Not required (public endpoint)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "string (required, 3-50 characters)",
  "email": "string (required, valid email format)",
  "password": "string (required, minimum 6 characters)"
}
```

**Example Request**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Success Response** (201 Created):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "message": "Usuário criado com sucesso"
}
```

**Error Responses**:

- **400 Bad Request** - Validation error:
```json
{
  "error": "Nome deve ter pelo menos 3 caracteres"
}
```

- **409 Conflict** - Email already exists:
```json
{
  "error": "E-mail já cadastrado"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Erro interno do servidor"
}
```

**Validation Rules**:
- `name`: Required, 3-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

---

### 2. POST /api/login

**Description**: Authenticate user and receive JWT token.

**Authentication**: Not required (public endpoint)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Example Request**:
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Login realizado com sucesso"
}
```

**Important**: Store the `token` from this response. It expires in **1 hour** and must be sent in subsequent authenticated requests.

**Error Responses**:

- **400 Bad Request** - Validation error:
```json
{
  "error": "Email e senha são obrigatórios"
}
```

- **401 Unauthorized** - Invalid credentials:
```json
{
  "error": "Credenciais inválidas"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Erro interno do servidor"
}
```

---

## User Endpoints

### 3. GET /api/protected

**Description**: Test endpoint to verify authentication is working. Returns user information from JWT token.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "message": "Acesso autorizado!",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "joao@example.com"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:

- **401 Unauthorized** - No token provided:
```json
{
  "error": "Token de acesso não fornecido",
  "message": "É necessário fornecer um token JWT no header Authorization"
}
```

- **401 Unauthorized** - Token expired:
```json
{
  "error": "Token expirado",
  "message": "O token JWT expirou. Faça login novamente."
}
```

- **403 Forbidden** - Invalid token:
```json
{
  "error": "Token inválido",
  "message": "O token JWT fornecido é inválido."
}
```

---

### 4. GET /api/profile

**Description**: Get authenticated user's profile information.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "message": "Perfil do usuário",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "joao@example.com"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**: Same as `/api/protected` endpoint.

---

## Habit Endpoints

All habit endpoints require authentication. The JWT token must be included in the `Authorization` header.

**Base Path**: `/api/habits`

---

### 5. POST /api/habits

**Description**: Create a new habit for the authenticated user.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "string (required, 2-100 characters)",
  "description": "string (optional, max 500 characters)",
  "frequency": "string (required, one of: 'Diário', 'Semanal', 'Quinzenal', 'Mensal')",
  "isActive": "boolean (optional, default: true)"
}
```

**Example Request**:
```json
{
  "name": "Academia",
  "description": "Treino de musculação 3x por semana",
  "frequency": "Semanal",
  "isActive": true
}
```

**Success Response** (201 Created):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Academia",
  "description": "Treino de musculação 3x por semana",
  "frequency": "Semanal",
  "isActive": true,
  "userId": "507f191e810c19729de860ea",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "message": "Hábito criado com sucesso"
}
```

**Error Responses**:

- **400 Bad Request** - Validation error:
```json
{
  "error": "Nome deve ter pelo menos 2 caracteres"
}
```

- **401 Unauthorized** - Not authenticated:
```json
{
  "error": "Usuário não autenticado"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Erro ao criar hábito"
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters
- `description`: Optional, max 500 characters
- `frequency`: Required, must be one of: `"Diário"`, `"Semanal"`, `"Quinzenal"`, `"Mensal"`
- `isActive`: Optional boolean, defaults to `true`

---

### 6. GET /api/habits

**Description**: List all habits for the authenticated user. Supports optional filtering.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters** (all optional):
- `isActive` (string: "true" or "false") - Filter by active status
- `frequency` (string) - Filter by frequency: "Diário", "Semanal", "Quinzenal", or "Mensal"
- `name` (string) - Filter by name (partial match, case-insensitive)

**Example Requests**:
```
GET /api/habits
GET /api/habits?isActive=true
GET /api/habits?frequency=Semanal
GET /api/habits?name=Academia
GET /api/habits?isActive=true&frequency=Diário
```

**Success Response** (200 OK):
```json
{
  "habits": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Academia",
      "description": "Treino de musculação 3x por semana",
      "frequency": "Semanal",
      "isActive": true,
      "userId": "507f191e810c19729de860ea",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Meditação",
      "description": "Praticar meditação diariamente",
      "frequency": "Diário",
      "isActive": true,
      "userId": "507f191e810c19729de860ea",
      "createdAt": "2024-01-14T08:00:00.000Z",
      "updatedAt": "2024-01-14T08:00:00.000Z"
    }
  ],
  "count": 2,
  "message": "Hábitos listados com sucesso"
}
```

**Note**: Habits are sorted by creation date (newest first).

**Error Responses**:

- **401 Unauthorized** - Not authenticated:
```json
{
  "error": "Usuário não autenticado"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Erro ao listar hábitos"
}
```

---

### 7. GET /api/habits/:id

**Description**: Get a single habit by ID. Only returns the habit if it belongs to the authenticated user.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string) - The habit ID (MongoDB ObjectId)

**Example Request**:
```
GET /api/habits/507f1f77bcf86cd799439011
```

**Success Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Academia",
  "description": "Treino de musculação 3x por semana",
  "frequency": "Semanal",
  "isActive": true,
  "userId": "507f191e810c19729de860ea",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:

- **401 Unauthorized** - Not authenticated:
```json
{
  "error": "Usuário não autenticado"
}
```

- **403 Forbidden** - Habit belongs to another user:
```json
{
  "error": "Você não tem permissão para acessar este recurso"
}
```

- **404 Not Found** - Habit not found:
```json
{
  "error": "Hábito não encontrado"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Erro ao buscar hábito"
}
```

---

### 8. PUT /api/habits/:id

**Description**: Update all fields of a habit (full update). All fields must be provided.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string) - The habit ID (MongoDB ObjectId)

**Request Body** (all fields required):
```json
{
  "name": "string (required, 2-100 characters)",
  "description": "string (optional, max 500 characters)",
  "frequency": "string (required, one of: 'Diário', 'Semanal', 'Quinzenal', 'Mensal')",
  "isActive": "boolean (optional)"
}
```

**Example Request**:
```json
{
  "name": "Academia - Atualizado",
  "description": "Treino de musculação atualizado",
  "frequency": "Semanal",
  "isActive": true
}
```

**Success Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Academia - Atualizado",
  "description": "Treino de musculação atualizado",
  "frequency": "Semanal",
  "isActive": true,
  "userId": "507f191e810c19729de860ea",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z",
  "message": "Hábito atualizado com sucesso"
}
```

**Error Responses**:

- **400 Bad Request** - Validation error:
```json
{
  "error": "Nome deve ter pelo menos 2 caracteres"
}
```

- **401 Unauthorized** - Not authenticated:
```json
{
  "error": "Usuário não autenticado"
}
```

- **403 Forbidden** - Habit belongs to another user:
```json
{
  "error": "Você não tem permissão para acessar este recurso"
}
```

- **404 Not Found** - Habit not found:
```json
{
  "error": "Hábito não encontrado"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Erro ao atualizar hábito"
}
```

---

### 9. PATCH /api/habits/:id

**Description**: Partially update a habit. Only provided fields will be updated.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string) - The habit ID (MongoDB ObjectId)

**Request Body** (all fields optional, only include fields to update):
```json
{
  "name": "string (optional, 2-100 characters if provided)",
  "description": "string (optional, max 500 characters)",
  "frequency": "string (optional, one of: 'Diário', 'Semanal', 'Quinzenal', 'Mensal')",
  "isActive": "boolean (optional)"
}
```

**Example Request** (update only description and status):
```json
{
  "description": "Descrição atualizada",
  "isActive": false
}
```

**Success Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Academia",
  "description": "Descrição atualizada",
  "frequency": "Semanal",
  "isActive": false,
  "userId": "507f191e810c19729de860ea",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z",
  "message": "Hábito atualizado com sucesso"
}
```

**Error Responses**: Same as PUT endpoint.

**Use Cases**:
- Toggle habit active status: `{ "isActive": false }`
- Update only description: `{ "description": "New description" }`
- Update multiple fields: `{ "name": "New Name", "frequency": "Diário" }`

---

### 10. DELETE /api/habits/:id

**Description**: Delete a habit. Only the owner can delete their own habits.

**Authentication**: Required (Bearer Token)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string) - The habit ID (MongoDB ObjectId)

**Example Request**:
```
DELETE /api/habits/507f1f77bcf86cd799439011
```

**Success Response** (200 OK):
```json
{
  "message": "Hábito deletado com sucesso",
  "id": "507f1f77bcf86cd799439011"
}
```

**Error Responses**:

- **401 Unauthorized** - Not authenticated:
```json
{
  "error": "Usuário não autenticado"
}
```

- **403 Forbidden** - Habit belongs to another user:
```json
{
  "error": "Você não tem permissão para acessar este recurso"
}
```

- **404 Not Found** - Habit not found:
```json
{
  "error": "Hábito não encontrado"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Erro ao deletar hábito"
}
```

---

## Utility Endpoints

### 11. GET /health

**Description**: Health check endpoint to verify server status.

**Authentication**: Not required

**Success Response** (200 OK):
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345.67,
  "environment": "development"
}
```

---

### 12. GET /test

**Description**: Simple test endpoint to verify server is running.

**Authentication**: Not required

**Success Response** (200 OK):
```json
{
  "message": "Server is working!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:
```json
{
  "error": "Error message in Portuguese",
  "message": "Additional details (optional)"
}
```

### HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Validation error or invalid input
- **401 Unauthorized** - Authentication required or invalid
- **403 Forbidden** - Access denied (resource belongs to another user)
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (e.g., duplicate email)
- **500 Internal Server Error** - Server error

### Common Error Scenarios

1. **Missing Authentication Token**:
   - Status: 401
   - Error: "Token de acesso não fornecido"

2. **Expired Token**:
   - Status: 401
   - Error: "Token expirado"
   - Action: User must login again

3. **Invalid Token**:
   - Status: 403
   - Error: "Token inválido"

4. **Accessing Another User's Habit**:
   - Status: 403
   - Error: "Você não tem permissão para acessar este recurso"

5. **Resource Not Found**:
   - Status: 404
   - Error: "Hábito não encontrado" or "Usuário não encontrado"

6. **Validation Error**:
   - Status: 400
   - Error: Specific validation message (e.g., "Nome deve ter pelo menos 2 caracteres")

---

## Authentication Flow

### Step-by-Step Integration Guide

1. **User Registration**:
   ```
   POST /api/register
   Body: { name, email, password }
   Response: { id, name, email, createdAt, message }
   ```

2. **User Login**:
   ```
   POST /api/login
   Body: { email, password }
   Response: { token, user, message }
   ```

3. **Store Token**:
   - Save the `token` from login response
   - Token expires in 1 hour
   - Store in localStorage, sessionStorage, or secure cookie

4. **Make Authenticated Requests**:
   ```
   Headers: {
     Authorization: Bearer <token>,
     Content-Type: application/json
   }
   ```

5. **Handle Token Expiration**:
   - If you receive 401 "Token expirado", redirect to login
   - Implement token refresh logic if needed (currently not supported)

### Frontend Implementation Example

```javascript
// Store token after login
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Use token in requests
const token = localStorage.getItem('authToken');
fetch('/api/habits', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Handle token expiration
if (response.status === 401) {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Redirect to login
}
```

---

## Data Models

### User Model
```typescript
{
  id: string;              // MongoDB ObjectId
  name: string;            // 3-50 characters
  email: string;           // Valid email, unique
  createdAt: Date;         // ISO 8601 timestamp
  updatedAt: Date;         // ISO 8601 timestamp (not exposed in responses)
}
```

### Habit Model
```typescript
{
  id: string;              // MongoDB ObjectId
  name: string;            // 2-100 characters
  description: string;     // Optional, max 500 characters
  frequency: "Diário" | "Semanal" | "Quinzenal" | "Mensal";
  isActive: boolean;       // Default: true
  userId: string;          // MongoDB ObjectId (owner)
  createdAt: Date;         // ISO 8601 timestamp
  updatedAt: Date;         // ISO 8601 timestamp
}
```

---

## CORS Configuration

The API supports CORS with the following configuration:
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization
- **Credentials**: true (cookies allowed)

Make sure your frontend origin is configured in the backend's `CORS_ORIGIN` environment variable.

---

## Notes for Frontend Developers

1. **Token Management**: 
   - Tokens expire after 1 hour
   - Implement automatic logout on token expiration
   - Consider implementing token refresh mechanism

2. **Error Handling**:
   - Always check response status codes
   - Display user-friendly error messages
   - Handle network errors gracefully

3. **Data Validation**:
   - Validate data on frontend before sending requests
   - Backend will also validate, but frontend validation improves UX

4. **Loading States**:
   - Show loading indicators during API calls
   - Handle async operations properly

5. **Security**:
   - Never expose tokens in URLs or logs
   - Use HTTPS in production
   - Implement proper session management

6. **Habit Filtering**:
   - Query parameters are strings, convert boolean values appropriately
   - Example: `?isActive=true` (string "true", not boolean)

---

## Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Register new user |
| POST | `/api/login` | No | Login and get token |
| GET | `/api/protected` | Yes | Test authentication |
| GET | `/api/profile` | Yes | Get user profile |
| POST | `/api/habits` | Yes | Create habit |
| GET | `/api/habits` | Yes | List habits (with filters) |
| GET | `/api/habits/:id` | Yes | Get habit by ID |
| PUT | `/api/habits/:id` | Yes | Update habit (full) |
| PATCH | `/api/habits/:id` | Yes | Update habit (partial) |
| DELETE | `/api/habits/:id` | Yes | Delete habit |
| GET | `/health` | No | Health check |
| GET | `/test` | No | Test endpoint |

---

**Last Updated**: Based on current codebase structure
**API Version**: 1.0

