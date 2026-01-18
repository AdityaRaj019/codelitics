# 🧾 Product Requirements Document (PRD)
## Project: DSA Tracker
**Version:** 1.0  
**Date:** 2025-10-09  
**Author:** Aditya Raj (with ChatGPT guidance)  
**Team Members & Roles:**  
- **Frontend Developer:** Aditya Raj  
- **Backend Developer:** Aditya Raj  
- **UI/UX Designer:** Aditya Raj  
- **Mentor/Guide:** ChatGPT (AI Assistant)

---

## 🧭 1. Overview

### **Summary**
DSA Tracker is a web application designed to **track, analyze, and visualize a user’s problem-solving journey** across various coding platforms such as **LeetCode, Codeforces, CodeChef, and GeeksforGeeks**.  

The app provides insightful analytics, personalized stats cards, categorized question lists, achievements, and the ability to create personalized checklists — all in one clean, modern dashboard.

### **Problem Statement**
Developers and students solve hundreds of problems across platforms but lack a **unified view** of their progress and stats. Tracking becomes fragmented and inefficient.  
This tool bridges that gap by **aggregating performance metrics and insights** from all major platforms into one place.

### **Goal**
To build a visually rich, interactive, and intelligent analytics platform for tracking DSA progress efficiently and motivating users through gamified achievements.

### **Target Users / Audience**
- Students preparing for coding interviews or competitive programming.  
- Developers practicing DSA across platforms.  
- Educators and mentors tracking student performance.

### **Use Cases**
1. A student logs in to view total problems solved across platforms.  
2. A user checks topic-wise strengths (e.g., Arrays, Graphs).  
3. A mentor views summarized analytics for a user.  
4. A user creates a personalized checklist of unsolved questions.  
5. A user earns badges/achievements for milestones.

---

## 🎯 2. Objectives and Success Metrics

### **Objectives**
1. Provide cross-platform DSA tracking with visual analytics.  
2. Offer personalized and motivational dashboards.  
3. Enable users to organize, plan, and track problem-solving goals.  
4. Ensure seamless user experience with responsive and modern UI.

### **Success Metrics**
| Metric | Target |
|--------|---------|
| User login success rate | 100% |
| Dashboard load time | < 2 seconds |
| Data accuracy (problems count) | 95%+ |
| User satisfaction | 90%+ |
| Daily active users (after beta) | 200+ |

---

## 📦 3. Scope

### **In Scope**
- Frontend UI using Next.js + Tailwind CSS  
- Backend using Node.js + Express + MongoDB (Atlas)  
- User Authentication (Google/GitHub OAuth)  
- Problem analytics dashboard with graphs  
- Checklist system (CRUD operations)  
- Achievements & badges  
- Responsive design with dark/light mode

### **Out of Scope (for Phase 1)**
- Real-time platform scraping APIs  
- Mobile app version  
- Leaderboards or social features

---

## ⚙️ 4. Detailed Product Description

### **a. System Overview**
The system fetches and aggregates user data from multiple DSA platforms via APIs or manual input. The backend stores and processes this data, while the frontend visualizes it through graphs, cards, and checklists.

### **b. Key Features**
| Feature | Description | Priority |
|----------|--------------|----------|
| User Login | Secure login using OAuth (Google/GitHub) | High |
| Dashboard | View overall stats, graphs, and achievements | High |
| Problem List | Categorized problem list with checkboxes | High |
| Custom Lists | Create personalized problem collections | Medium |
| Achievements | Display milestones (problems solved, streaks) | Medium |
| Analytics | Generate performance graphs | High |
| Profile Card | Compact profile summary for sharing | Medium |

### **c. User Flow**
1. User visits the landing page → logs in.  
2. System fetches user data → populates dashboard.  
3. User explores analytics, updates checklists, and views achievements.  
4. Optional: exports data as a report (future scope).

### **d. UI/UX Requirements**
- **Design Language:** Modern, minimalistic, clean.  
- **Color Theme:** Indigo + Slate (light) / Emerald + Black (dark).  
- **Typography:** Poppins or Inter.  
- **Accessibility:** High contrast, keyboard navigation supported.  
- **Responsive Design:** Desktop-first, then mobile/tablet.

---

## 🧠 5. Technical Requirements

### **Tech Stack**
| Layer | Technology |
|--------|-------------|
| Frontend | Next.js, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ORM) |
| Auth | NextAuth.js (Google, GitHub providers) |
| Charts | Recharts or Chart.js |
| Hosting | Vercel (Frontend), Render or Railway (Backend) |

### **Architecture**
Client-Server Architecture with REST APIs connecting the frontend and backend.  

```
Frontend (Next.js) ⇄ API Routes (Next.js / Express) ⇄ MongoDB Atlas
```

### **APIs**
| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/users` | GET/POST | Fetch or create users |
| `/api/problems` | GET/POST | Retrieve or add problems |
| `/api/stats` | GET | Fetch analytics data |
| `/api/achievements` | GET | Fetch user achievements |

### **Database Schema Overview**
**User**
```
{ name, email, totalSolved, rating, achievements, createdAt }
```
**Problem**
```
{ title, category, platform, link, solved, userId }
```
**Achievement**
```
{ title, description, icon, achievedOn, userId }
```

### **Integrations**
- Google OAuth & GitHub OAuth (NextAuth)
- MongoDB Atlas (Cloud Database)
- Chart.js / Recharts for visualization

### **Deployment Plan**
- Frontend → Vercel  
- Backend → Render / Railway  
- Database → MongoDB Atlas Cluster

---

## ⚖️ 6. Non-Functional Requirements (NFRs)
| Type | Requirement |
|------|--------------|
| **Performance** | Load dashboard in under 2s |
| **Security** | JWT-based authentication |
| **Scalability** | Support up to 10,000 users |
| **Reliability** | 99% uptime target |
| **Accessibility** | WCAG 2.1 compliant |
| **Maintainability** | Modular and reusable codebase |

---

## 🔗 7. Assumptions & Dependencies
- MongoDB Atlas connection is stable and secured.  
- Users must have valid OAuth credentials.  
- No scraping — data is entered manually or fetched from APIs.  
- Internet connection required for full functionality.

---

## ⚠️ 8. Risks & Mitigation
| Risk | Impact | Mitigation Strategy |
|------|---------|----------------------|
| API failure | High | Cache last known data |
| Auth provider downtime | Medium | Provide backup login option |
| Data inconsistency | Medium | Validate schema and enforce structure |
| Feature overload | Low | Phase-wise feature rollout |

---

## ⏰ 9. Timeline / Milestones
| Milestone | Description | Deadline |
|------------|--------------|-----------|
| **Phase 1:** UI Foundation | Home, Login, Dashboard mock | Nov 5 |
| **Phase 2:** Backend Integration | MongoDB + API routes | Nov 20 |
| **Phase 3:** Analytics + Checklists | Graphs and CRUD lists | Dec 5 |
| **Phase 4:** Final QA & Demo | Polish + Deploy | Dec 15 |

---

## 🚀 10. Future Scope
- Leaderboards (Global & Friends-based)  
- Machine learning insights (strength/weakness detection)  
- Streak tracking & motivational notifications  
- Mobile App (React Native)  
- AI-based recommendations for next problems to solve

---

## 📎 11. Appendix
- System flow diagram  
- Example API response structures  
- Design wireframes (optional future addition)

---

✅ **End of Document**  
_This PRD serves as the blueprint for the DSA Tracker project, ensuring clarity, structure, and alignment throughout the development lifecycle._
