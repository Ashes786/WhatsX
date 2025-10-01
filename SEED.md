# Database Seed Scripts

The following npm scripts are available for database management:

## Database Scripts

- `npm run db:seed` - Runs the seed script to populate the database with initial data
- `npm run db:setup` - Pushes the schema to the database and runs the seed script (one-time setup)
- `npm run db:push` - Pushes the Prisma schema to the database
- `npm run db:generate` - Generates Prisma client
- `npm run db:migrate` - Runs database migrations
- `npm run db:reset` - Resets the database

## Seed Data

The seed script creates the following data:

### Users
- **Admin User**: `admin@whatsx.com` / `admin123` (Role: ADMIN)
- **Regular User**: `user@whatsx.com` / `user123` (Role: END_USER)

### Templates
- Welcome Message (Admin)
- Promotional Offer (Admin)

### Contacts
- John Doe (Regular User)
- Jane Smith (Regular User)

## Usage

### First-time Setup
```bash
npm run db:setup
```

### Re-seed Database
```bash
npm run db:seed
```

### Reset Database
```bash
npm run db:reset
```

The seed script uses bcrypt with 10 rounds for password hashing to ensure compatibility and performance.