# WhatsX - WhatsApp Bulk Messaging Platform

A powerful Next.js-based platform for managing WhatsApp bulk messaging campaigns with user management, template system, and comprehensive analytics.

## 🚀 Features

### Core Functionality
- **Bulk Messaging**: Send personalized WhatsApp messages to multiple contacts
- **Contact Management**: Organize and manage contact lists with CSV import
- **Template System**: Create and reuse message templates with variables
- **Message Scheduling**: Schedule messages for future delivery
- **Real-time Analytics**: Track message delivery and performance

### User Management
- **Role-based Access**: Admin and End User roles
- **User Administration**: Add, edit, and manage user accounts
- **Secure Authentication**: NextAuth.js integration for secure login

### Advanced Features
- **Message Logs**: Comprehensive delivery tracking and reporting
- **CSV Import**: Bulk contact upload from spreadsheets
- **Template Variables**: Personalize messages with dynamic content
- **Broadcast Lists**: Create and manage contact groups
- **Export Functionality**: Download logs and reports in CSV format

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **State Management**: Zustand + TanStack Query

### Backend
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js v4
- **API Routes**: Next.js API routes
- **Real-time**: Socket.io integration
- **File Upload**: Multer for CSV processing

### Development Tools
- **Code Quality**: ESLint configuration
- **Package Management**: npm
- **Development Server**: Hot reload with nodemon

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite3
- WhatsApp API credentials (WAWP API or WhatsApp Cloud API)

## 🔑 WhatsApp API Configuration

This project supports two WhatsApp API providers:

### Option 1: WAWP API (Recommended)
WAWP API is an easier-to-use alternative that doesn't require Meta Business verification.

**Required Environment Variables:**
```bash
WAWP_ACCESS_TOKEN=your_wawp_access_token_here
WAWP_INSTANCE_ID=your_wawp_instance_id_here
```

**Getting Started with WAWP:**
1. Visit [wawp.net](https://wawp.net) and sign up
2. Create a new WhatsApp instance
3. Get your Access Token and Instance ID from dashboard
4. Add credentials to your `.env` file
5. Make sure your WhatsApp session status is "WORKING" (not STOPPED or SCAN_QR_CODE)

### Option 2: WhatsApp Cloud API
The official Meta/WhatsApp Business API.

**Required Environment Variables:**
```bash
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
```

**Note:** If both WAWP API and WhatsApp Cloud API are configured, WAWP API will be used by default.

### Mock Mode
If no API credentials are configured, the system will operate in mock mode, simulating message sending for testing purposes.

## 🚀 Installation & Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your API credentials
   ```

4. Setup the database:
   ```bash
   npm run db:setup
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## 📱 Usage

### Sending Messages
1. Add contacts to your contact list
2. Create a message or use a template
3. Select recipients or use broadcast lists
4. Send immediately or schedule for later

### Managing Templates
1. Go to Templates page
2. Create new template with variables like `{{name}}`
3. Use templates when sending messages for personalization

### Importing Contacts
1. Prepare a CSV file with columns: name, phone, label
2. Go to Contacts page
3. Click "Import CSV" and upload your file

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with initial data
- `npm run db:setup` - Setup database (push + seed)

## 📄 License

This project is licensed under the MIT License.

