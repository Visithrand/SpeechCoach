# Speech Therapy Frontend - React Application

A modern, professional speech therapy application built with React that provides AI-powered speech analysis, personalized exercises, and comprehensive progress tracking.

## 🚀 Features

### Core Functionality
- **Real-time Speech Analysis**: AI-powered pronunciation, fluency, and intonation feedback
- **Personalized Exercises**: Dynamic exercise generation based on user performance
- **Progress Tracking**: Comprehensive analytics and progress visualization
- **Gamification**: Achievement system, streaks, and motivational features
- **Multi-modal Feedback**: Text and audio feedback for speech improvement

### User Experience
- **Modern UI/UX**: Clean, ChatGPT-style interface with smooth animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: High contrast ratios and keyboard navigation support
- **Real-time Updates**: Live data synchronization with backend

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful, customizable icons
- **Recharts**: Professional charting library for analytics
- **Axios**: HTTP client for API communication

### State Management
- **React Hooks**: useState, useEffect for local state management
- **Context API**: Global state for authentication and user data
- **Local Storage**: Persistent user preferences and session data

## 📱 Pages & Components

### Core Pages
1. **Dashboard** (`/dashboard`) - Overview, stats, and quick actions
2. **Profile** (`/profile`) - User information, achievements, and progress
3. **Analytics** (`/analytics`) - Detailed performance charts and insights
4. **Feedback** (`/feedback`) - Session analysis and AI recommendations
5. **Exercises** (`/exercises`) - Exercise categories and practice sessions
6. **Speech Exercises** (`/speech-exercises`) - AI-powered speech practice
7. **Settings** (`/settings`) - User preferences and customization

### Reusable Components
- **Navbar**: Responsive navigation with user menu
- **Loading States**: Consistent loading indicators
- **Error Boundaries**: Graceful error handling
- **Charts**: Reusable chart components for analytics
- **Forms**: Standardized form inputs and validation

## 🔌 Backend API Integration

### Authentication Endpoints
```
POST /api/auth/login          - User login
POST /api/auth/signup        - User registration
POST /api/auth/logout        - User logout
GET  /api/auth/verify        - Token verification
```

### User Management
```
GET  /api/users/{userId}                    - Get user profile
PUT  /api/users/{userId}                    - Update user profile
GET  /api/users/{userId}/achievements       - Get user achievements
GET  /api/users/{userId}/recent-activity    - Get recent activity
```

### Dashboard & Analytics
```
GET  /api/dashboard/{userId}                - Get dashboard data
GET  /api/analytics/{userId}                - Get analytics data
GET  /api/streak/{userId}                   - Get streak information
GET  /api/feedback/{userId}                 - Get feedback data
```

### Exercises & Practice
```
GET  /api/exercises/{category}/{level}/{userId}  - Get exercises
POST /api/exercises/submit                    - Submit exercise result
GET  /api/exercises/recommendations/{userId}  - Get AI recommendations
```

### Speech Analysis
```
POST /api/speech/analyze                     - Analyze speech recording
GET  /api/speech/feedback/{sessionId}        - Get session feedback
POST /api/speech/record                      - Record speech session
```

## 🎨 Design System

### Color Palette
- **Primary**: `#3B82F6` (Blue)
- **Success**: `#10B981` (Green)
- **Warning**: `#FBBF24` (Yellow)
- **Error**: `#EF4444` (Red)
- **Background**: `#F8F9FA` (Light Gray)
- **Surface**: `#FFFFFF` (White)

### Typography
- **Font Family**: Inter (with system fallbacks)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Height**: 1.6 for optimal readability

### Spacing & Layout
- **Border Radius**: 8px-12px for cards and components
- **Shadows**: Subtle shadows with hover effects
- **Grid System**: Responsive grid layouts using Tailwind CSS
- **Padding**: Consistent 1rem-2rem spacing

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running (Spring Boot)
- Modern web browser

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd SpeechCoach/frontend

# Install dependencies
   npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start development server
   npm start
   ```

### Environment Variables
```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws
REACT_APP_ENVIRONMENT=development
```

### Build for Production
   ```bash
   npm run build
   ```

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API service functions
├── styles/             # CSS and styling
└── App.js             # Main application component
```

### Code Style
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Functional Components**: Use hooks instead of class components
- **TypeScript**: Consider migrating to TypeScript for better type safety

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Data Flow

### API Communication
1. **Component Mount**: useEffect triggers API calls
2. **Loading State**: Show loading indicators while fetching
3. **Data Processing**: Transform API response for UI consumption
4. **State Update**: Update component state with processed data
5. **Error Handling**: Graceful error handling with retry options

### State Management
- **Local State**: Component-specific data using useState
- **Global State**: User authentication and preferences
- **Persistent State**: User settings and session data in localStorage

## 🔒 Security

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Token Storage**: Secure token storage in localStorage
- **Route Protection**: Protected routes for authenticated users
- **Token Refresh**: Automatic token refresh before expiration

### Data Validation
- **Input Sanitization**: Sanitize user inputs
- **API Validation**: Validate API responses
- **Error Boundaries**: Catch and handle runtime errors

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Start with mobile layout
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized for mobile performance

## 🚀 Performance

### Optimization Techniques
- **Code Splitting**: Lazy loading of routes and components
- **Memoization**: React.memo and useMemo for expensive operations
- **Bundle Analysis**: Regular bundle size monitoring
- **Image Optimization**: Optimized images and lazy loading

### Loading Strategies
- **Skeleton Loading**: Placeholder content while loading
- **Progressive Loading**: Load critical content first
- **Caching**: Cache frequently accessed data
- **Prefetching**: Preload anticipated user actions

## 🧪 Testing Strategy

### Testing Levels
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user journey testing
- **Accessibility Tests**: Screen reader and keyboard navigation

### Testing Tools
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **Cypress**: End-to-end testing
- **MSW**: API mocking for tests

## 📈 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Error Tracking**: Capture and report runtime errors
- **User Analytics**: Track user behavior and engagement
- **Performance Metrics**: Monitor app performance over time

## 🔄 Deployment

### Build Process
1. **Code Quality**: Run linting and tests
2. **Build**: Create optimized production build
3. **Testing**: Test production build locally
4. **Deploy**: Deploy to hosting platform

### Hosting Options
- **Vercel**: Recommended for React apps
- **Netlify**: Alternative hosting platform
- **AWS S3**: Static hosting with CloudFront
- **GitHub Pages**: Free hosting for open source

## 🤝 Contributing

### Development Workflow
1. **Fork**: Fork the repository
2. **Branch**: Create feature branch
3. **Develop**: Implement changes with tests
4. **Test**: Ensure all tests pass
5. **Submit**: Create pull request

### Code Review
- **Automated Checks**: CI/CD pipeline validation
- **Code Review**: Peer review process
- **Testing**: Ensure test coverage
- **Documentation**: Update relevant documentation

## 📚 Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [Axios Documentation](https://axios-http.com/)

### Learning Resources
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
- [Modern JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Grid & Flexbox](https://css-tricks.com/snippets/css/complete-guide-grid/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share ideas
- **Documentation**: Comprehensive guides and examples
- **Community**: Join our community channels

### Contact
- **Email**: support@speechtherapy.com
- **Discord**: Join our community server
- **GitHub**: Open issues and discussions

---

**Built with ❤️ by the Speech Therapy Team**
