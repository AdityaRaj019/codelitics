# 🏗️ Backend Integration Plan: NextAuth + MongoDB + Zustand

## 1. The Architecture (Flow of Data)

Currently, your app works like this (Client-Side Only):
`UI Components` <--> `Zustand Store` <--> `LocalStorage`

**The New Full-Stack Architecture:**
`UI Components` <--> `Zustand Store` <--> `Next.js API Routes` <--> `MongoDB Atlas`

### Key Concept: Who Owns the Data?
- **Before:** Zustand "owned" the data (it created ids, saved to localStorage).
- **After:** The **Database** owns the data. Zustand becomes a **Synchronization Manager**. It fetches the latest data when the app loads and sends updates to the server when the user does something.

---

## 2. Authentication (NextAuth.js)

You **don't** need `authStore.ts` to manage passwords anymore. NextAuth handles sessions securely.

### Step-by-Step Implementation:
1.  **Install:** `npm install next-auth @auth/mongodb-adapter`
2.  **Setup:** Create `src/app/api/auth/[...nextauth]/route.ts`.
3.  **Client Usage:**
    - Use `<SessionProvider>` in `layout.tsx`.
    - In components, use `useSession()` to get the current user.
    - You can still use a simplified `userStore` to hold extra user details (like "Streak" or "Level") if they aren't in the default session object, syncing it inside a `useEffect`.

---

## 3. Database Schema (MongoDB)

We will use **Mongoose** for type-safe database schemas.

### User Schema
- `name`, `email`, `image` (Handled by NextAuth)
- `role`: "admin" | "user"
- `solvedProblems`: Array of Problem IDs
- `streak`: Number
- `rating`: Number

### Problem Schema
- `title`, `link`, `difficulty`, `category`
- `platform`: "LeetCode", etc.
- `createdBy`: User ID (for admin tracking)

---

## 4. Refactoring Zustand Stores

Instead of saving to LocalStorage, your stores will now make API calls.

### Example: The New `problemStore.ts`

```typescript
// ❌ OLD: Synchronous LocalStorage
addProblem: (problem) => {
  const newProblem = { ...problem, id: Date.now() };
  set((state) => ({ problems: [...state.problems, newProblem] }));
}

// ✅ NEW: Asynchronous API Calls
fetchProblems: async () => {
  const res = await fetch('/api/problems');
  const data = await res.json();
  set({ problems: data }); // Update UI with DB data
},

addProblem: async (problemData) => {
  // 1. Optimistic Update (Update UI immediately)
  const tempId = Date.now();
  set((state) => ({ 
    problems: [...state.problems, { ...problemData, id: tempId, isTemp: true }] 
  }));

  // 2. Call API
  const res = await fetch('/api/problems', {
    method: 'POST',
    body: JSON.stringify(problemData)
  });

  // 3. Re-sync with real data from Server
  if (res.ok) {
    const savedProblem = await res.json();
    set((state) => ({
      problems: state.problems.map(p => p.id === tempId ? savedProblem : p)
    }));
  }
}
```

## 5. Implementation Roadmap

1.  **Setup MongoDB:** Connect your app to MongoDB Atlas using Mongoose.
2.  **Setup NextAuth:** Implement Google/GitHub login and the MongoDB adapter.
3.  **Create API Routes:**
    - `GET /api/problems`: Get all problems for the logged-in user.
    - `POST /api/problems`: Create a new problem.
    - `PATCH/DELETE`: Update status or remove problems.
4.  **Update Stores:** Modify `problemStore` to fetch from these APIs.
5.  **Cleanup:** Remove `localStorage` logic and the dummy `authStore`.

---

**Does this clarify the relationship?** 
Basically, the API is the "door" to the database. Zustand is the "courier" that knocks on the door, gets the package (data), and brings it to the "house" (UI components).
