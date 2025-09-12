# WhatsX API Specification

## Overview

This document describes the REST API endpoints for the WhatsX messaging automation platform. All endpoints require authentication and follow RESTful conventions.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication using session-based authentication. Users must be logged in to access any API endpoints.

### Error Response Format
```json
{
  "error": "Error message describing the issue"
}
```

### Success Response Format
```json
{
  "data": "Response data"
}
```

## Endpoints

### Authentication

#### POST /auth/login
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "session_token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "END_USER",
    "status": "ACTIVE",
    "default_country_code": "+1"
  }
}
```

#### POST /auth/logout
Invalidate user session.

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### User Management (Admin Only)

#### GET /admin/users
Get all users (admin only).

**Response (200 OK):**
```json
[
  {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "default_country_code": "+1",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /admin/users
Create new user (admin only).

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "END_USER",
  "status": "ACTIVE",
  "default_country_code": "+1"
}
```

**Response (201 Created):**
```json
{
  "id": "new-user-id",
  "name": "New User",
  "email": "newuser@example.com",
  "role": "END_USER",
  "status": "ACTIVE",
  "default_country_code": "+1",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /admin/users/{id}
Update user (admin only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123",
  "role": "ADMIN",
  "status": "ACTIVE",
  "default_country_code": "+92"
}
```

**Response (200 OK):**
```json
{
  "id": "user-id",
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "ADMIN",
  "status": "ACTIVE",
  "default_country_code": "+92",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### DELETE /admin/users/{id}
Delete user (admin only).

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Template Management

#### GET /templates
Get all templates (all users).

**Response (200 OK):**
```json
[
  {
    "id": "template-id",
    "title": "Welcome Message",
    "content": "Hello {{name}}, welcome to our service!",
    "created_by": "admin-id",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "creator_name": "Admin User"
  }
]
```

#### GET /templates/{id}
Get specific template (all users).

**Response (200 OK):**
```json
{
  "id": "template-id",
  "title": "Welcome Message",
  "content": "Hello {{name}}, welcome to our service!",
  "created_by": "admin-id",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "creator_name": "Admin User"
}
```

#### POST /admin/templates
Create template (admin only).

**Request Body:**
```json
{
  "title": "New Template",
  "content": "Hello {{name}}, this is a new template!",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": "new-template-id",
  "title": "New Template",
  "content": "Hello {{name}}, this is a new template!",
  "created_by": "admin-id",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "creator_name": "Admin User"
}
```

#### PUT /admin/templates/{id}
Update template (admin only).

**Request Body:**
```json
{
  "title": "Updated Template",
  "content": "Hello {{name}}, this template has been updated!",
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "id": "template-id",
  "title": "Updated Template",
  "content": "Hello {{name}}, this template has been updated!",
  "created_by": "admin-id",
  "is_active": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "creator_name": "Admin User"
}
```

#### DELETE /admin/templates/{id}
Delete template (admin only).

**Response (200 OK):**
```json
{
  "message": "Template deleted successfully"
}
```

---

### Contact Management

#### GET /contacts
Get user's contacts.

**Response (200 OK):**
```json
[
  {
    "id": "contact-id",
    "name": "John Doe",
    "raw_phone": "+1234567890",
    "e164_phone": "+1234567890",
    "label": "Friend",
    "added_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /contacts
Create contact.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "raw_phone": "+1987654321",
  "label": "Colleague"
}
```

**Response (201 Created):**
```json
{
  "id": "new-contact-id",
  "name": "Jane Smith",
  "raw_phone": "+1987654321",
  "e164_phone": "+1987654321",
  "label": "Colleague",
  "added_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /contacts/{id}
Update contact.

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "raw_phone": "+1987654321",
  "label": "Work"
}
```

**Response (200 OK):**
```json
{
  "id": "contact-id",
  "name": "Jane Smith Updated",
  "raw_phone": "+1987654321",
  "e164_phone": "+1987654321",
  "label": "Work",
  "added_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### DELETE /contacts/{id}
Delete contact.

**Response (200 OK):**
```json
{
  "message": "Contact deleted successfully"
}
```

#### POST /contacts/upload-csv
Upload contacts from CSV file.

**Request Body (multipart/form-data):**
```
file: contacts.csv
```

**Response (200 OK):**
```json
{
  "imported_count": 25,
  "duplicate_count": 3,
  "errors": [],
  "imported_items": [
    {
      "row": 2,
      "name": "John Doe",
      "raw_phone": "+1234567890",
      "e164_phone": "+1234567890",
      "label": "Friend"
    }
  ]
}
```

---

### Prepare to Send

#### POST /prepare-to-send
Prepare message for sending with duplicate detection.

**Request Body:**
```json
{
  "template_id": "template-id",
  "message_override": "Custom message content",
  "recipients_raw": [
    "+1234567890",
    "+1987654321",
    "+1555555555"
  ],
  "default_country_code": "+1"
}
```

**Response (200 OK):**
```json
{
  "recipients_final": [
    "+1234567890",
    "+1987654321",
    "+1555555555"
  ],
  "duplicates": [
    {
      "raw": "+1111111111",
      "normalized": "+1111111111",
      "reason": "duplicate_existing_contact"
    }
  ],
  "message_preview": "Hello {{name}}, this is your message preview!"
}
```

---

## Data Models

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string (unique)",
  "password_hash": "string",
  "role": "ADMIN | END_USER",
  "status": "ACTIVE | SUSPENDED",
  "default_country_code": "string (optional)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Template
```json
{
  "id": "uuid",
  "title": "string",
  "content": "text",
  "created_by": "uuid (references User.id)",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Contact
```json
{
  "id": "uuid",
  "owner_id": "uuid (references User.id)",
  "name": "string (optional)",
  "raw_phone": "string",
  "e164_phone": "string (optional)",
  "label": "string (optional)",
  "added_at": "datetime",
  "updated_at": "datetime"
}
```

### PrepareToSendJob
```json
{
  "id": "uuid",
  "user_id": "uuid (references User.id)",
  "template_id": "uuid (optional, references Template.id)",
  "message_preview": "text",
  "recipients_raw": "string (JSON array)",
  "recipients_final": "string (JSON array)",
  "duplicates": "string (JSON array)",
  "created_at": "datetime"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error or invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## Phone Number Normalization

The API normalizes phone numbers using these rules:
1. Strip all non-digit and non-plus characters
2. Replace leading "00" with "+"
3. Keep numbers that start with "+"
4. For numbers starting with "0", add default country code
5. For local numbers, prepend default country code

## Duplicate Detection

The API detects duplicates with these reasons:
- `duplicate_in_upload`: Same number appears multiple times in upload
- `duplicate_existing_contact`: Number matches existing contact
- `unparseable`: Number cannot be normalized
- `same_as_another_normalized`: Number normalizes to same as another

## CSV Format for Contact Upload

Expected CSV format:
```csv
name,phone,label
John Doe,+1234567890,Friend
Jane Smith,+1987654321,Colleague
```

- `phone` column is required
- `name` and `label` columns are optional
- Phone numbers are automatically normalized
- Duplicates are detected and reported