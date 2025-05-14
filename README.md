# LearnMeet - Online Learning & Video Conferencing Platform

LearnMeet is a modern, scalable online learning platform designed specifically for educational environments. It provides robust video conferencing capabilities, resource sharing, and classroom management tools to create an effective virtual learning experience.

## 🌟 Features

- **High-Quality Video Conferencing**: WebRTC-based HD video with optimized performance
- **Virtual Classroom Management**: Create and manage online classes with ease
- **Screen Sharing & Interactive Whiteboard**: Share content and collaborate in real-time
- **Resource Sharing**: Upload, organize and share learning materials
- **Recording & Playback**: Record sessions for later review
- **Real-time Chat**: Public and private messaging during sessions
- **Breakout Rooms**: Create smaller discussion groups
- **Role-based Permissions**: Different capabilities for teachers and students
- **Accessibility Features**: Screen reader support, keyboard navigation, closed captions

## 📚 Documentation

Detailed documentation is available in the `/docs` directory:

- [Requirements Specification](./docs/requirements.md)
- [System Architecture](./docs/architecture.md)
- [Object-Oriented Design](./docs/object-design.md)
- [Database Schema](./docs/database-schema.md)
- [UI/UX Design](./docs/ui-ux-design.md)
- [Development Roadmap](./docs/roadmap.md)
- [High Concurrency Strategy](./docs/high-concurrency-strategy.md)
- [Testing Strategy](./docs/testing-strategy.md)
- [WebRTC Architecture](./docs/webrtc-architecture.md)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 8.x or later
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Firebase account for authentication services

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Add a web application to your Firebase project
4. Enable Authentication in Firebase console:
   - Go to "Authentication" → "Sign-in method"
   - Enable "Email/Password" provider
5. Copy your Firebase config from Project settings
6. Create a `.env` file in the root directory based on the `.env.example` template
7. Fill in the Firebase configuration values in the `.env` file:
   ```
   PUBLIC_FIREBASE_API_KEY=your-api-key
   PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   PUBLIC_FIREBASE_APP_ID=your-app-id
   PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/learnmeet.git
cd learnmeet

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env
# (edit the .env file with your Firebase configuration)

# Start the development server
npm run dev

# Or start the server and open the app in a new browser tab
npm run dev -- --open

# Build for production
npm run build
```

## 🧪 Testing

```bash
# Run checks for TypeScript errors
npm run check

# Watch for changes and run checks
npm run check:watch
```

## 📦 Project Structure

```
learnmeet/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # Base UI elements
│   │   ├── services/       # Service integrations
│   │   └── stores/         # State management
│   ├── routes/             # SvelteKit routes & pages
│   │   ├── auth/           # Authentication pages
│   │   └── meeting/        # Meeting-related pages
│   ├── app.html            # HTML template
│   └── app.css             # Global styles
├── static/                 # Static assets
└── docs/                   # Documentation
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
