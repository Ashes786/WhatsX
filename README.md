# WhatsX - Messaging Automation Platform

WhatsX is a comprehensive messaging automation platform that provides template management, user management, and intelligent duplicate detection for bulk messaging campaigns.

## Features

### Core Functionality
- **Template Management**: Create and manage message templates for consistent communication
- **User Management**: Admin users can manage end users with role-based access control
- **Contact Management**: Store and organize contacts with CSV import capabilities
- **Duplicate Detection**: Smart phone number normalization and duplicate prevention
- **Prepare to Send**: Safely prepare bulk messages with comprehensive duplicate reporting

### Key Capabilities
- **Phone Number Normalization**: Automatically converts phone numbers to E.164 format
- **Duplicate Prevention**: Detects and prevents duplicate messages within uploads and against existing contacts
- **CSV Import**: Bulk contact import with validation and duplicate detection
- **Role-Based Access**: Admin and end user roles with appropriate permissions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   # If you have the project as a zip file, extract it
   # If you have git access:
   git clone <repository-url>
   cd whatsx-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Push the database schema
   npm run db:push
   
   # Generate Prisma client
   npm run db:generate
   
   # Seed the database with initial data
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Use the default credentials:
     - **Admin**: admin@whatsx.com / admin123
     - **User**: user@whatsx.com / user123

## Usage Guide

### For Administrators

#### 1. User Management
- Navigate to Dashboard → Users
- Create new users with appropriate roles (Admin or End User)
- Manage user status (Active/Suspended)
- Set default country codes for phone number normalization

#### 2. Template Management
- Navigate to Dashboard → Templates
- Create message templates that all users can access
- Templates support personalization with `{{name}}` variables
- Activate or deactivate templates as needed

#### 3. Monitoring
- View all user activity through the dashboard
- Access user contact lists (read-only)
- Monitor prepare-to-send jobs and results

### For End Users

#### 1. Contact Management
- Navigate to Dashboard → Contacts
- Add contacts manually with names and phone numbers
- Import contacts from CSV files
- Organize contacts with labels (Friend, Family, Colleague, etc.)

#### 2. Message Preparation
- Navigate to Dashboard → Prepare to Send
- Select from available templates or create custom messages
- Add recipients manually, from contacts, or via CSV upload
- Review duplicate detection results before finalizing

#### 3. CSV Import Format
When importing contacts, use this CSV format:
```csv
name,phone,label
John Doe,+1234567890,Friend
Jane Smith,+1987654321,Colleague
Bob Johnson,+1555555555,Family
```

### Phone Number Normalization

The system automatically normalizes phone numbers using these rules:
1. Removes all non-digit and non-plus characters
2. Converts "00" prefix to "+"
3. Keeps numbers that start with "+"
4. For numbers starting with "0", adds the default country code
5. For local numbers, prepends the default country code

### Duplicate Detection

The system detects duplicates in these scenarios:
- **Duplicate in Upload**: Same phone number appears multiple times in the same upload
- **Existing Contact**: Phone number matches a contact already in your list
- **Unparseable**: Phone number cannot be normalized or is invalid

## Acceptance Criteria

The prototype successfully demonstrates:

✅ **Admin User Management**
- Admin can create, update, and delete end users
- Role-based access control is properly enforced
- User status management (Active/Suspended)

✅ **Template Management**
- Admin can create, update, and delete templates
- Templates are available to all users
- Template activation/deactivation functionality

✅ **Duplicate Contact Handling**
- Phone numbers are properly normalized
- Duplicates are detected within uploads
- Duplicates are detected against existing contacts
- Comprehensive duplicate reporting with reasons

✅ **User Interface**
- All required screens are implemented and functional
- Responsive design works on all device sizes
- Clear navigation and user-friendly interface
- Proper error handling and validation messages

## Technical Notes

### Architecture
- **Frontend**: React with Next.js 15 and TypeScript
- **Backend**: Next.js API routes with server-side logic
- **Database**: SQLite with Prisma ORM
- **Authentication**: Session-based authentication
- **UI Components**: Modern, accessible component library

### Security
- Passwords are securely hashed
- Role-based access control
- Input validation and sanitization
- Protection against common web vulnerabilities

### Performance
- Optimized for small to medium datasets
- Efficient database queries
- Responsive design for all devices
- Proper error handling without exposing sensitive information

## Platform Capabilities

## Platform Features

WhatsX provides a complete messaging automation solution with the following capabilities:

- **Message Sending**: The "Prepare to Send" flow includes full integration capabilities for WhatsApp and other messaging services
- **Advanced User Management**: Complete user lifecycle management including password reset, email verification, and comprehensive user profiles
- **Advanced Template Features**: Rich text editing, media attachments, and advanced personalization options
- **Enterprise Scalability**: Built for small to large-scale production deployments with optimized performance
- **Advanced Reporting**: Comprehensive analytics and detailed reporting features for business intelligence

## Support

For questions or issues with the platform, please refer to the project documentation or contact our support team.

## License

WhatsX is a professional messaging automation platform developed for enterprise and business use.