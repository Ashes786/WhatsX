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
- WhatsApp Business API credentials

