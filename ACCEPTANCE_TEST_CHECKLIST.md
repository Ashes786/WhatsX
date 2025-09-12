# WhatsX Prototype - Acceptance Test Checklist

## Test Overview
This document provides a comprehensive checklist for testing the WhatsX messaging automation prototype. All tests should be performed to ensure the prototype meets the specified requirements.

## Test Environment Setup
- [ ] Database is properly seeded with initial data
- [ ] Development server is running on localhost:3000
- [ ] Test credentials are available:
  - Admin: admin@whatsx.com / admin123
  - User: user@whatsx.com / user123

---

## ✅ TEST 1: Admin User Management

### 1.1 Admin Login
- [ ] Navigate to http://localhost:3000
- [ ] Click "Sign Up / Login" button
- [ ] Enter admin credentials: admin@whatsx.com / admin123
- [ ] Verify successful login and redirect to dashboard
- [ ] Verify admin role is displayed in the sidebar

### 1.2 Create New User
- [ ] Navigate to Dashboard → Users
- [ ] Click "Add User" button
- [ ] Fill in user details:
  - Name: Test User
  - Email: testuser@example.com
  - Password: testpass123
  - Role: END_USER
  - Status: ACTIVE
  - Default Country Code: +1
- [ ] Click "Create User"
- [ ] Verify user appears in the users table
- [ ] Verify all user details are correct

### 1.3 Update Existing User
- [ ] In Users page, click Edit button on any user
- [ ] Modify user details:
  - Change name to "Updated User"
  - Change role to ADMIN
  - Change status to SUSPENDED
- [ ] Click "Update User"
- [ ] Verify changes are reflected in the table
- [ ] Verify user can no longer login (if suspended)

### 1.4 Delete User
- [ ] In Users page, click Delete button on a test user
- [ ] Confirm deletion in the dialog
- [ ] Verify user is removed from the table
- [ ] Verify user cannot login with deleted credentials

---

## ✅ TEST 2: Template Management

### 2.1 Create New Template
- [ ] Navigate to Dashboard → Templates
- [ ] Click "Create Template" button
- [ ] Fill in template details:
  - Title: Test Template
  - Content: Hello {{name}}, this is a test template!
  - Is Active: true
- [ ] Click "Create Template"
- [ ] Verify template appears in the templates table
- [ ] Verify template content is correct

### 2.2 Update Template
- [ ] In Templates page, click Edit button on any template
- [ ] Modify template details:
  - Change title to "Updated Template"
  - Change content to "Hello {{name}}, this template has been updated!"
  - Set Is Active to false
- [ ] Click "Update Template"
- [ ] Verify changes are reflected in the table
- [ ] Verify template is marked as inactive

### 2.3 Delete Template
- [ ] In Templates page, click Delete button on a test template
- [ ] Confirm deletion in the dialog
- [ ] Verify template is removed from the table
- [ ] Verify template is no longer available for message composition

### 2.4 Template Visibility for End Users
- [ ] Logout and login as end user (user@whatsx.com / user123)
- [ ] Navigate to Dashboard → Templates
- [ ] Verify templates created by admin are visible (read-only)
- [ ] Verify end user cannot edit or delete templates
- [ ] Verify inactive templates are not shown

---

## ✅ TEST 3: Contact Management

### 3.1 Create Single Contact
- [ ] Login as end user
- [ ] Navigate to Dashboard → Contacts
- [ ] Click "Add Contact" button
- [ ] Fill in contact details:
  - Name: John Doe
  - Phone: +1234567890
  - Label: Friend
- [ ] Click "Add Contact"
- [ ] Verify contact appears in the contacts table
- [ ] Verify phone number is normalized correctly

### 3.2 Update Contact
- [ ] In Contacts page, click Edit button on any contact
- [ ] Modify contact details:
  - Change name to "John Smith"
  - Change label to "Colleague"
- [ ] Click "Update Contact"
- [ ] Verify changes are reflected in the table

### 3.3 Delete Contact
- [ ] In Contacts page, click Delete button on a test contact
- [ ] Confirm deletion in the dialog
- [ ] Verify contact is removed from the table

### 3.4 CSV Import
- [ ] Create a test CSV file with the following content:
```csv
name,phone,label
Alice Johnson,+1987654321,Family
Bob Wilson,+1555555555,Work
Carol Brown,+1222333444,Friend
```
- [ ] Navigate to Dashboard → Contacts → Import CSV tab
- [ ] Upload the CSV file
- [ ] Verify import success message
- [ ] Verify imported contacts appear in the contacts table
- [ ] Verify phone numbers are normalized correctly

### 3.5 Duplicate Detection in CSV Import
- [ ] Create a CSV file with duplicate phone numbers:
```csv
name,phone,label
Dave Miller,+1234567890,Test1
Eve Davis,+1234567890,Test2
Frank Clark,+1987654321,Test3
```
- [ ] Upload the CSV file
- [ ] Verify duplicate detection works (only unique contacts are imported)
- [ ] Verify duplicate count is reported correctly

---

## ✅ TEST 4: Phone Normalization and Duplicate Detection

### 4.1 Phone Number Normalization Test Cases
- [ ] Create contacts with different phone number formats:
  - "+92-300-1234567" → should normalize to "+923001234567"
  - "03001234567" → should normalize to "+923001234567" (with default +92)
  - "3001234567" → should normalize to "+923001234567" (with default +92)
  - "00923001234567" → should normalize to "+923001234567"

### 4.2 Duplicate Detection - Same Number Different Formats
- [ ] Navigate to Dashboard → Prepare to Send
- [ ] Enter recipients with same number in different formats:
```
+92-300-1234567
03001234567
3001234567
```
- [ ] Click "Prepare to Send"
- [ ] Verify only one final recipient is shown
- [ ] Verify duplicates are reported with "duplicate_in_upload" reason

### 4.3 Duplicate Detection - Existing Contacts
- [ ] Create a contact with phone "+1234567890"
- [ ] Navigate to Prepare to Send
- [ ] Enter "+1234567890" as a recipient
- [ ] Click "Prepare to Send"
- [ ] Verify the number is flagged as duplicate
- [ ] Verify reason is "duplicate_existing_contact"

### 4.4 Unparseable Numbers
- [ ] Navigate to Prepare to Send
- [ ] Enter invalid phone numbers:
```
abcde
(not a number)
```
- [ ] Click "Prepare to Send"
- [ ] Verify unparseable numbers are flagged
- [ ] Verify reason is "unparseable"

---

## ✅ TEST 5: Message Composer and Prepare-to-Send Flow

### 5.1 Template Selection
- [ ] Navigate to Dashboard → Prepare to Send
- [ ] Select a template from the dropdown
- [ ] Verify message content is populated in the textarea
- [ ] Verify message is editable

### 5.2 Custom Message Override
- [ ] Type a custom message in the message textarea
- [ ] Verify custom message overrides template content
- [ ] Verify message preview updates accordingly

### 5.3 Multiple Recipient Entry Methods
- [ ] **Manual Entry**: Enter phone numbers manually in the textarea
- [ ] **Contact Selection**: Select contacts from the contact list
- [ ] **CSV Upload**: Upload a CSV file with recipients
- [ ] Verify all methods work and recipients are combined

### 5.4 Prepare-to-Send Results
- [ ] After preparing to send, verify results page shows:
  - Correct count of final recipients
  - Correct count of removed duplicates
  - Message preview
  - List of final recipients
  - Detailed duplicates report

### 5.5 Export Functionality
- [ ] Click "Download CSV" for final recipients
- [ ] Verify CSV file is downloaded with correct format
- [ ] Click "Download Report" for duplicates
- [ ] Verify CSV file contains duplicate information

### 5.6 Prototype Limitations
- [ ] Verify "Confirm & Queue" button is disabled
- [ ] Verify button shows "Prototype: sending not implemented"
- [ ] Verify no actual messages are sent

---

## ✅ TEST 6: UI and Responsiveness

### 6.1 Navigation
- [ ] Verify all navigation links work correctly
- [ ] Verify sidebar navigation is functional
- [ ] Verify breadcrumbs work (if implemented)

### 6.2 Responsive Design
- [ ] Test application on different screen sizes:
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)
- [ ] Verify layout adapts correctly
- [ ] Verify all elements are accessible and usable

### 6.3 Form Validation
- [ ] Test form validation on all forms:
  - Required field validation
  - Email format validation
  - Phone number validation
  - Password strength validation
- [ ] Verify error messages are clear and helpful

### 6.4 Error Handling
- [ ] Test error scenarios:
  - Invalid login credentials
  - Duplicate email/phone creation
  - Unauthorized access attempts
  - Network errors
- [ ] Verify error messages are user-friendly
- [ ] Verify application handles errors gracefully

---

## ✅ TEST 7: Security and Access Control

### 7.1 Role-Based Access
- [ ] Verify end users cannot access admin-only pages:
  - User management
  - Template creation/editing/deletion
- [ ] Verify admin users can access all functionality
- [ ] Verify users can only access their own data

### 7.2 Session Management
- [ ] Test login/logout functionality
- [ ] Verify sessions persist correctly
- [ ] Verify unauthorized users are redirected to login

### 7.3 Data Protection
- [ ] Verify passwords are hashed in database
- [ ] Verify sensitive data is not exposed in API responses
- [ ] Verify proper input sanitization

---

## ✅ TEST 8: Performance and Scalability

### 8.1 Load Testing
- [ ] Test with large contact lists (100+ contacts)
- [ ] Test with large recipient lists (1000+ recipients)
- [ ] Verify application remains responsive
- [ ] Verify duplicate detection performance

### 8.2 CSV Import Limits
- [ ] Test CSV import with 10,000 rows
- [ ] Verify system handles large files
- [ ] Verify memory usage remains reasonable

---

## Test Results Summary

### Passed Tests
- [ ] Admin User Management: All CRUD operations working
- [ ] Template Management: All CRUD operations working
- [ ] Contact Management: All CRUD operations working
- [ ] CSV Import: Working with duplicate detection
- [ ] Phone Normalization: All test cases passing
- [ ] Duplicate Detection: All scenarios working
- [ ] Prepare-to-Send Flow: Complete functionality working
- [ ] UI/UX: Responsive and user-friendly
- [ ] Security: Access control working properly

### Failed Tests
- [ ] List any failed tests with details

### Known Issues
- [ ] List any known issues or limitations

### Notes
- [ ] Additional observations or recommendations

---

## Test Environment Details
- **Browser**: [Browser name and version]
- **Operating System**: [OS name and version]
- **Test Date**: [Date of testing]
- **Tester**: [Name of tester]

## Sign-off

I certify that I have performed all the tests listed above and the results accurately reflect the current state of the WhatsX prototype.

_________________________
[Tester Signature]

Date: _______________