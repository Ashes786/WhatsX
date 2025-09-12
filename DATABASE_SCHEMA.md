# WhatsX Database Schema

## Overview

This document describes the database schema for the WhatsX messaging automation platform. The schema is implemented using SQLite with Prisma ORM.

## Entity Relationship Diagram

```
User (1) -----> (M) Contact
User (1) -----> (M) Template (created_by)
Template (M) <---- (1) User (creator)
PrepareToSendJob (M) -----> (1) User
PrepareToSendJob (M) -----> (0..1) Template
```

## Tables

### User

Stores user accounts with role-based access control.

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT(uuid()),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT('END_USER') CHECK(role IN ('ADMIN', 'END_USER')),
    status TEXT NOT NULL DEFAULT('ACTIVE') CHECK(status IN ('ACTIVE', 'SUSPENDED')),
    default_country_code TEXT,
    created_at DATETIME NOT NULL DEFAULT(current_timestamp),
    updated_at DATETIME NOT NULL DEFAULT(current_timestamp)
);
```

#### Fields
- **id**: Unique identifier (UUID)
- **name**: User's full name
- **email**: User's email address (unique)
- **password_hash**: Hashed password for authentication
- **role**: User role ('ADMIN' or 'END_USER')
- **status**: Account status ('ACTIVE' or 'SUSPENDED')
- **default_country_code**: Default country code for phone normalization (e.g., '+92')
- **created_at**: Timestamp when user was created
- **updated_at**: Timestamp when user was last updated

#### Relationships
- One-to-many with Contact (owner_id)
- One-to-many with Template (created_by)
- One-to-many with PrepareToSendJob (user_id)

#### Constraints
- Email must be unique
- Role must be either 'ADMIN' or 'END_USER'
- Status must be either 'ACTIVE' or 'SUSPENDED'

---

### Template

Stores message templates created by administrators.

```sql
CREATE TABLE templates (
    id TEXT PRIMARY KEY DEFAULT(uuid()),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT(true),
    created_at DATETIME NOT NULL DEFAULT(current_timestamp),
    updated_at DATETIME NOT NULL DEFAULT(current_timestamp),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Fields
- **id**: Unique identifier (UUID)
- **title**: Template title (unique per admin)
- **content**: Template content with support for variables like `{{name}}`
- **created_by**: ID of the admin who created the template
- **is_active**: Whether the template is active and available for use
- **created_at**: Timestamp when template was created
- **updated_at**: Timestamp when template was last updated

#### Relationships
- Many-to-one with User (creator)
- One-to-many with PrepareToSendJob (template_id)

#### Constraints
- Title must be unique per admin (composite unique constraint with created_by)
- Content cannot be empty
- created_by must reference a valid user

---

### Contact

Stores contact information for users.

```sql
CREATE TABLE contacts (
    id TEXT PRIMARY KEY DEFAULT(uuid()),
    owner_id TEXT NOT NULL,
    name TEXT,
    raw_phone TEXT NOT NULL,
    e164_phone TEXT,
    label TEXT,
    added_at DATETIME NOT NULL DEFAULT(current_timestamp),
    updated_at DATETIME NOT NULL DEFAULT(current_timestamp),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

#### Fields
- **id**: Unique identifier (UUID)
- **owner_id**: ID of the user who owns this contact
- **name**: Contact's name (optional)
- **raw_phone**: Original phone number as entered
- **e164_phone**: Normalized E.164 phone number (can be null if normalization fails)
- **label**: Contact label/category (optional)
- **added_at**: Timestamp when contact was added
- **updated_at**: Timestamp when contact was last updated

#### Relationships
- Many-to-one with User (owner)

#### Constraints
- Unique constraint on (owner_id, e164_phone) when e164_phone is not null
- raw_phone cannot be empty
- owner_id must reference a valid user

---

### PrepareToSendJob

Stores ephemeral jobs for preparing messages to send (not persisted background jobs).

```sql
CREATE TABLE prepare_to_send_jobs (
    id TEXT PRIMARY KEY DEFAULT(uuid()),
    user_id TEXT NOT NULL,
    template_id TEXT,
    message_preview TEXT NOT NULL,
    recipients_raw TEXT NOT NULL,
    recipients_final TEXT NOT NULL,
    duplicates TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT(current_timestamp),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);
```

#### Fields
- **id**: Unique identifier (UUID)
- **user_id**: ID of the user who created this job
- **template_id**: ID of the template used (optional)
- **message_preview**: Final message content after template processing
- **recipients_raw**: JSON array of raw phone numbers from input
- **recipients_final**: JSON array of deduplicated normalized phone numbers
- **duplicates**: JSON array of duplicate information objects
- **created_at**: Timestamp when job was created

#### Relationships
- Many-to-one with User (user)
- Many-to-one with Template (template, optional)

#### Constraints
- user_id must reference a valid user
- template_id must reference a valid template if provided
- JSON fields must contain valid JSON arrays

---

## Enums

### UserRole
```sql
-- Values: 'ADMIN', 'END_USER'
```
Defines user roles in the system.

### UserStatus
```sql
-- Values: 'ACTIVE', 'SUSPENDED'
```
Defines user account status.

---

## Indexes

The following indexes are automatically created by Prisma:

1. **Primary Keys**: All tables have primary key indexes on their `id` fields
2. **Unique Constraints**:
   - `users.email`: Unique index on email field
   - `templates.title + templates.created_by`: Composite unique index
   - `contacts.owner_id + contacts.e164_phone`: Composite unique index (when e164_phone is not null)
3. **Foreign Keys**: All foreign key relationships are indexed for performance

---

## Data Types and Constraints

### UUID Primary Keys
All tables use UUID primary keys generated by the database:
```sql
id TEXT PRIMARY KEY DEFAULT(uuid())
```

### Timestamps
All tables include automatic timestamp management:
```sql
created_at DATETIME NOT NULL DEFAULT(current_timestamp),
updated_at DATETIME NOT NULL DEFAULT(current_timestamp)
```

### String Lengths
- **name**: 100 characters maximum
- **email**: 255 characters maximum (standard email length)
- **password_hash**: 255 characters maximum (bcrypt hash)
- **template.title**: 100 characters maximum
- **template.content**: 5000 characters maximum
- **contact.raw_phone**: 50 characters maximum
- **contact.e164_phone**: 20 characters maximum (E.164 format)
- **contact.label**: 50 characters maximum

### JSON Fields
The `prepare_to_send_jobs` table stores JSON data in TEXT fields:
- **recipients_raw**: Array of phone number strings
- **recipients_final**: Array of normalized phone number strings  
- **duplicates**: Array of duplicate objects with structure:
  ```json
  {
    "raw": "string",
    "normalized": "string",
    "reason": "duplicate_in_upload | duplicate_existing_contact | unparseable | same_as_another_normalized"
  }
  ```

---

## Business Logic Implementation

### Phone Number Normalization
Phone numbers are normalized using the algorithm in `phone-utils.ts`:
1. Strip non-digit and non-plus characters
2. Replace "00" prefix with "+"
3. Keep "+" prefix
4. Handle local numbers with default country code
5. Return normalized E.164 format or null if unparseable

### Duplicate Detection
The system prevents duplicates by:
1. Normalizing all phone numbers before comparison
2. Checking against existing contacts in the same user's list
3. Detecting duplicates within the same upload
4. Flagging unparseable numbers

### Access Control
- **Admin users**: Can manage users, templates, and view all data
- **End users**: Can manage their own contacts and use templates
- All operations are validated against user roles and ownership

---

## Migration Notes

### Initial Setup
The database is set up using Prisma with the following commands:
```bash
npm run db:push    # Push schema to database
npm run db:generate # Generate Prisma client
npm run db:seed     # Seed initial data
```

### Seed Data
The initial seed includes:
- Admin user: admin@whatsx.com / admin123
- End user: user@whatsx.com / user123
- Sample template: "Welcome Message"
- Sample contacts for the end user

### Schema Evolution
For production use, consider:
1. Adding proper migration files instead of using `db:push`
2. Implementing data backup strategies
3. Adding database connection pooling
4. Implementing proper indexing for large datasets
5. Adding data retention policies for old jobs

---

## Performance Considerations

### Query Optimization
- Foreign key relationships are automatically indexed
- Consider adding composite indexes for common query patterns
- Use Prisma's query optimization features for complex joins

### Data Volume
- The prototype is optimized for small to medium datasets
- For large contact lists, consider pagination and batch processing
- JSON fields in prepare_to_send_jobs are suitable for audit purposes but may need archiving

### Concurrency
- SQLite handles concurrent reads well
- Write operations are serialized (SQLite limitation)
- Consider PostgreSQL for high-concurrency production use