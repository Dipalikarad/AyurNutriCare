# 🌿 AyurNutriCare
### Cloud-Based Ayurvedic Nutrient Analyzer & Planner

AyurNutriCare is a modern, full-stack wellness application built for Third Year mini-projects. It bridges the **5,000-year-old science of Ayurveda** (Prakriti, Ritu Charya, Viruddha Ahara) with **modern nutritional science** (calories, macronutrients, micronutrients) using AI-assisted diets and safety evaluations.

---

## 🏗️ Tech Stack

*   **Frontend**: React.js (Vite, React Router v6, Tailwind CSS v4, Recharts, Lucide Icons)
*   **Backend**: Node.js + Express.js
*   **Database**: MongoDB (Mongoose schemas)
*   **AI Engine**: Anthropic Claude API Integration (with a local rule-based fallback for offline runs)
*   **Authentication**: JWT (JSON Web Tokens) with role guards (`dietitian` and `patient`)
*   **Security**: Helmet.js, Express-Rate-Limit (10 req/min on AI threads)

---

## 📁 Key Features

1.  **Dual Analysis Engine**: Evaluates meals for modern nutrition (calories/protein/carbs/fat) and Ayurvedic properties (Rasa, Guna, Virya, Vipaka).
2.  **Prakriti Assessment**: Interactive 10-category quiz for patients to determine their dominant Dosha (Vata / Pitta / Kapha / Dual-Dosha).
3.  **Diet Plan Generator**: Allows dietitians to auto-generate personalized meal plans based on the patient's calculated Dosha and the current season (Ritu Charya).
4.  **Viruddha Ahara Checker**: A real-time food incompatibility checker that warns patients of harmful food pairings (e.g. Milk & Fish, Ghee & Honey in equal amounts) based on Ayurvedic principles.
5.  **AyurBot AI Chatbot**: A WhatsApp-style, dark-herbal themed chatbot that uses Claude-3.5-Sonnet to answer diet and nutritional queries in patient context.
6.  **Practice Analytics**: Recharts dashboard for dietitians to track patient growth, goals distribution, common foods prescribed, and meal tracking compliance.
7.  **Appointment System**: Scheduling system allowing dietitians to post available slots and patients to book slots.

---

## ⚙️ Quick Start Guide

### Prerequisites
*   Node.js (v18+)
*   MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

---

### Step 1: Backend Server Setup

1.  Navigate to the `server/` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment in `server/.env`:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/ayurnutricare
    JWT_SECRET=ayurnutricare_secret_key_12345
    NODE_ENV=development
    CLIENT_URL=http://localhost:5173
    # ANTHROPIC_API_KEY=your_claude_api_key_here
    ```
4.  **Seed the Food Database** (compiles 50 common Indian ingredients):
    ```bash
    npm run seed
    ```
5.  Start the backend server in development mode:
    ```bash
    npm run dev
    ```
    The server will boot on `http://localhost:5000`. You can test health checks at `/health`.

---

### Step 2: Frontend Client Setup

1.  Navigate to the `client/` directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the local development server:
    ```bash
    npm run dev
    ```
    The frontend will boot on `http://localhost:5173`.

---

## 🎓 Viva / Presentation Highlights

*   **Offline Fallback Chat**: If no `ANTHROPIC_API_KEY` is provided, AyurBot gracefully falls back to a rule-based expert engine, giving customized responses based on the patient's Dosha. This makes local demos extremely safe.
*   **Dual-Dosha Parsing**: Unlike simple quiz systems, if scores between the top two Doshas are close (difference $\le$ 1), the engine automatically classifies the patient's Prakriti as dual-constitution (e.g. *Vata-Pitta*).
*   **Ritu Charya & Viruddha Ahara**: Practical integrations of lesser-known Ayurvedic concepts. The compatibility checker parses 25+ specific incompatibility formulas.
