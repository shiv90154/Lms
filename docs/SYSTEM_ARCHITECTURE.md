# System Architecture - Premium LMS System

## Overview

The Premium LMS + Coaching Management System is a full-stack web application built with modern technologies to provide a comprehensive learning management and coaching platform.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS v4 (CSS-first configuration)
- **Component Library**: Shadcn/ui (Radix UI primitives)
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Payment Gateway**: Razorpay

### Infrastructure
- **Hosting**: Vercel (recommended) or VPS
- **Database Hosting**: MongoDB Atlas
- **File Storage**: Cloudinary (optional)
- **Email Service**: SMTP (Gmail, SendGrid, etc.)

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │    Admin     │  │   Public     │      │
│  │  Dashboard   │  │    Panel     │  │    Pages     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js App Router                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Pages    │  │    API     │  │ Middleware │    │   │
│  │  │ Components │  │   Routes   │  │    Auth    │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Course  │  │   User   │  │ Payment  │  │   Test   │   │
│  │ Management│  │Management│  │Processing│  │  Engine  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Book   │  │   Cart   │  │  Email   │  │  Content │   │
│  │   Store  │  │  System  │  │  Service │  │Management│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    MongoDB                           │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │ Users  │  │Courses │  │ Books  │  │ Orders │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │ Tests  │  │  Cart  │  │Attempts│  │Materials│   │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Razorpay │  │  Email   │  │ YouTube  │  │Cloudinary│   │
│  │   API    │  │  SMTP    │  │   API    │  │   CDN    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Authentication System

**Purpose**: Secure user authentication and authorization

**Components**:
- User registration and login
- JWT token generation and validation
- Refresh token mechanism
- Role-based access control (Student/Admin)
- Session management
- Password reset functionality

**Security Features**:
- bcrypt password hashing
- HTTP-only cookies for token storage
- Token expiration and refresh
- Device tracking
- Rate limiting

### 2. Course Management System

**Purpose**: Comprehensive course delivery and progress tracking

**Components**:
- Course creation and management
- Hierarchical content structure (Modules → Chapters → Lessons)
- Video embedding (YouTube privacy mode)
- PDF and text content support
- Progress tracking
- Certificate generation
- Enrollment management

**Features**:
- Content locking for non-enrolled students
- Lesson completion tracking
- Course completion certificates
- Time tracking

### 3. E-commerce System

**Purpose**: Book store with complete purchase flow

**Components**:
- Book catalog with categories
- Shopping cart
- Order management
- Payment processing
- Inventory management

**Features**:
- Dynamic filtering and search
- Cart persistence
- Order history
- Stock management
- Discount support

### 4. Payment Integration

**Purpose**: Secure payment processing

**Components**:
- Razorpay integration
- Order creation
- Payment verification
- Webhook handling
- Receipt generation

**Security**:
- Signature verification
- Secure API key management
- Payment status tracking
- Refund support

### 5. Assessment System

**Purpose**: Mock tests and performance evaluation

**Components**:
- Test creation and management
- Question bank
- Test taking interface
- Scoring engine
- Ranking system
- Result analysis

**Features**:
- Timed tests with auto-submission
- Negative marking support
- Section-wise organization
- Detailed explanations
- Scorecard generation
- Attempt history

### 6. Study Materials System

**Purpose**: Organized educational resources

**Components**:
- Material upload and management
- Categorization system
- Access control (free/paid)
- Download tracking
- Search and filtering

### 7. Current Affairs System

**Purpose**: Daily and monthly news content

**Components**:
- Content publishing
- Scheduling system
- Access control
- SEO optimization
- View tracking

### 8. Administrative System

**Purpose**: Complete platform management

**Components**:
- Dashboard with analytics
- User management
- Content management (CRUD operations)
- Bulk operations
- Notification system
- Reporting

## Data Models

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (student/admin),
  profile: {
    avatar: String,
    dateOfBirth: Date,
    address: Object,
    education: String,
    parentDetails: Object
  },
  enrolledCourses: [ObjectId],
  purchasedBooks: [ObjectId],
  refreshTokens: [Object],
  isActive: Boolean,
  emailVerified: Boolean
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  category: String,
  thumbnail: String,
  level: String,
  tags: [String],
  modules: [{
    title: String,
    order: Number,
    chapters: [{
      title: String,
      order: Number,
      lessons: [{
        title: String,
        type: String,
        content: String,
        duration: Number,
        order: Number,
        isLocked: Boolean
      }]
    }]
  }],
  isActive: Boolean
}
```

### Order Model
```javascript
{
  userId: ObjectId,
  items: [{
    bookId: ObjectId,
    title: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  shippingAddress: Object,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentStatus: String,
  orderStatus: String
}
```

## API Structure

### Authentication APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Course APIs
- `GET /api/courses` - List all courses
- `GET /api/courses/[id]` - Get course details
- `POST /api/courses/[id]/enroll` - Enroll in course
- `GET /api/courses/[id]/access` - Check course access
- `PUT /api/courses/[id]/progress` - Update progress

### Book APIs
- `GET /api/books` - List all books
- `GET /api/books/[id]` - Get book details
- `GET /api/books/search` - Search books
- `GET /api/books/categories` - Get categories

### Cart APIs
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[bookId]` - Update cart item
- `DELETE /api/cart/[bookId]` - Remove from cart

### Payment APIs
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Handle webhooks

### Test APIs
- `GET /api/tests` - List all tests
- `GET /api/tests/[id]` - Get test details
- `POST /api/tests/[id]/start` - Start test attempt
- `POST /api/tests/[id]/submit` - Submit test
- `GET /api/tests/attempts` - Get attempt history

## Security Measures

### Authentication Security
- JWT with short expiration (15 minutes)
- Refresh tokens with longer expiration (7 days)
- HTTP-only cookies
- Secure token storage
- Device tracking

### API Security
- Rate limiting
- Input validation
- SQL injection prevention (NoSQL)
- XSS protection
- CSRF protection
- CORS configuration

### Data Security
- Password hashing with bcrypt
- Encrypted database connections
- Secure environment variables
- No sensitive data in logs
- Regular security audits

## Performance Optimizations

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Static generation (SSG)
- Incremental Static Regeneration (ISR)
- Client-side caching

### Backend
- Database indexing
- Connection pooling
- Query optimization
- Caching strategies
- CDN for static assets

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Replica sets for high availability

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancing
- Database replication
- CDN for static content

### Vertical Scaling
- Resource optimization
- Efficient algorithms
- Memory management
- Database optimization

## Monitoring and Logging

### Application Monitoring
- Error tracking
- Performance monitoring
- User analytics
- API metrics

### Infrastructure Monitoring
- Server health
- Database performance
- Network latency
- Resource utilization

### Logging
- Application logs
- Error logs
- Access logs
- Audit logs

## Backup and Recovery

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Backup retention policy
- Regular restore testing

### Application Backups
- Code repository (Git)
- Configuration backups
- Environment variable backups

## Deployment Strategy

### Continuous Integration/Deployment
- Automated testing
- Build automation
- Deployment automation
- Rollback procedures

### Environments
- Development
- Staging
- Production

## Future Enhancements

### Planned Features
- Real-time notifications
- Live classes integration
- Mobile applications
- Advanced analytics
- AI-powered recommendations
- Multi-language support
- Social learning features
- Gamification

### Technical Improvements
- Microservices architecture
- GraphQL API
- Redis caching
- Elasticsearch for search
- WebSocket for real-time features
- Progressive Web App (PWA)

## Conclusion

The Premium LMS System is built with modern technologies and best practices to provide a scalable, secure, and performant learning management platform. The architecture supports future growth and enhancements while maintaining code quality and system reliability.
