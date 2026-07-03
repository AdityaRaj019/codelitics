<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">🚀 CodeLitics</h1>

<p align="center">
  <strong>A modern, full-stack DSA problem tracking and analytics platform</strong>
</p>

<p align="center">
  Track your coding journey, sync LeetCode stats, and visualize your progress with beautiful analytics.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Features

### 🎯 Problem Tracking
- **Add & Organize Problems** - Track DSA problems with difficulty levels, topics, and custom notes
- **Progress Monitoring** - Mark problems as solved and track your completion rate
- **Category Filtering** - Filter problems by difficulty (Easy, Medium, Hard) and topics

### 📊 LeetCode Integration
- **Profile Sync** - Connect your LeetCode profile and auto-sync statistics
- **Real-time Stats** - View solved problems, acceptance rate, ranking, and streaks
- **Difficulty Breakdown** - Visualize your progress across Easy, Medium, and Hard problems
- **Submission History** - Track your recent submissions and activity

### 🔐 Authentication & Security
- **Secure Auth System** - Email/password authentication with bcrypt hashing
- **Role-based Access** - User and Admin roles with protected routes
- **Session Management** - Persistent sessions with secure localStorage handling

### 🎨 Modern UI/UX
- **Dark/Light Mode** - Beautiful theme toggle with system preference detection
- **Responsive Design** - Fully responsive across all device sizes
- **Smooth Animations** - Polished micro-interactions and transitions
- **Accessible Components** - Built with accessibility best practices

### 📈 Analytics Dashboard
- **User Dashboard** - Personal statistics, recent activity, and progress charts
- **Admin Dashboard** - User management and platform-wide analytics
- **Visual Charts** - Progress bars, stats cards, and achievement tracking

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1 | UI library |
| **JavaScript** | ES6+ | Programming language |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Zustand** | 5.x | State management |
| **Lucide React** | Latest | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js & Express** | - | RESTful API endpoints |
| **MongoDB Atlas** | 7.x | Cloud database |
| **Mongoose** | 9.x | MongoDB ODM |
| **bcryptjs** | 3.x | Password hashing |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **Vercel** | Deployment & Hosting |
| **ESLint** | Code linting |
| **Git** | Version control |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)
- **MongoDB Atlas** account ([Create free account](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdityaRaj019/codelitics.git
   cd codelitics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
    Update `.env.local` with your credentials:
    ```env
    # MongoDB Atlas Connection
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/codelitics
    
    # Auth Configuration
    PORT=3000
    JWT_SECRET=your-secret-key-here
    
    # LeetCode API
    LEETCODE_API_BASE=https://alfa-leetcode-api.onrender.com
    ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

---

## 📡 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login with credentials |
| `/api/auth/me` | GET | Get current user data |

### Problems

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/problems` | GET | Get all problems for user |
| `/api/problems` | POST | Add a new problem |
| `/api/problems/:id` | GET | Get problem by ID |
| `/api/problems/:id` | PATCH | Update problem |
| `/api/problems/:id` | DELETE | Delete problem |

### Platform Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/platforms/leetcode/connect` | POST | Connect LeetCode profile |
| `/api/platforms/leetcode/sync` | POST | Sync LeetCode statistics |
| `/api/platforms/leetcode/stats` | GET | Get LeetCode stats |

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Database connection status |
| `/api/test-db` | GET | Database collection stats |

---

## 📁 Project Structure

```
codelitics/
├── src/
│   ├── components/            # React Components
│   │   ├── ui/               # Base UI components
│   │   ├── Header.js         # Navigation header
│   │   ├── Footer.js         # Page footer
│   │   ├── LeetCodeStats.js  # LeetCode statistics display
│   │   ├── ProblemList.js    # Problem list component
│   │   ├── ConnectLeetCode.js
│   │   └── ...
│   │
│   ├── pages/                 # Page Components
│   │   ├── Dashboard.js       # Dashboard pages
│   │   ├── Login.js           # Login page
│   │   ├── Register.js        # Registration page
│   │   ├── Problems.js        # Problems page
│   │   ├── Profile.js         # Profile page
│   │   └── Home.js            # Home page
│   │
│   ├── stores/               # Zustand State Management
│   │   ├── authStore.js      # Authentication state
│   │   ├── problemStore.js   # Problems state
│   │   ├── profileStore.js   # User profile state
│   │   └── index.js          # Store exports
│   │
│   └── lib/                  # Utilities & Database
│       └── db/
│           ├── connect.js    # MongoDB connection
│           ├── models/       # Mongoose schemas
│           │   ├── User.js
│           │   ├── Problem.js
│           │   ├── PlatformStats.js
│           │   └── UserProblemProgress.js
│           └── index.js
│
├── public/                   # Static assets
├── .env.example             # Environment template
├── .env.local               # Local environment (git-ignored)
├── package.json
└── tailwind.config.js
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   
   Add these in Vercel's Settings → Environment Variables:
   
   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Generated secret key |
   | `LEETCODE_API_BASE` | `https://alfa-leetcode-api.onrender.com` |

4. **Deploy**
   - Vercel will automatically build and deploy your app

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist `0.0.0.0/0` in Network Access (for Vercel)
4. Get your connection string from Database → Connect → Drivers

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🔒 Security Features

- **Password Hashing** - All passwords hashed with bcrypt (12 rounds)
- **Input Validation** - Server-side validation on all endpoints
- **Environment Variables** - Sensitive data stored in environment variables
- **Unique Constraints** - Database-level uniqueness for emails
- **Error Handling** - Proper error responses without leaking sensitive info

---

## 🗺 Roadmap

- [ ] **OAuth Integration** - Google & GitHub login
- [ ] **Password Reset** - Email-based password recovery
- [ ] **Middleware Protection** - Route-level authentication
- [ ] **More Platforms** - Codeforces, HackerRank integration
- [ ] **Progress Charts** - Visual analytics with charts
- [ ] **Achievements System** - Gamification features
- [ ] **Export Data** - Download your progress data

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aditya Raj**

- GitHub: [@AdityaRaj019](https://github.com/AdityaRaj019)

---

<p align="center">
  <strong>⭐ Star this repository if you found it helpful!</strong>
</p>

<p align="center">
  Made with ❤️ using React and JavaScript
</p>
