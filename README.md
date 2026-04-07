<div align="center">
  <img src="./client/src/assets/logo2.jpeg" alt="FreshScan Logo" width="120" />
  <h1>FreshScan</h1>
  <p><strong>AI-Powered Crop Vitality & Freshness Tracker</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white" alt="Arduino" />
  </p>
</div>

<br />

## 🌿 About FreshScan

FreshScan is a comprehensive, full-stack IoT and AI platform designed to determine the freshness, ripeness, and estimated shelf life of produce. By combining multi-spectral hardware sensor data (temperature, humidity, and ethylene gas) with advanced visual analysis powered by Google's Gemini AI, FreshScan gives users highly accurate insights into crop vitality before spoilage becomes visible to the human eye.

---

## ✨ Key Features

- **📸 AI Image Analysis**: Capture or upload photos of produce to receive instant AI-powered health summaries, color/texture scores, and defect detection using the Gemini Vision API.
- **⚡ Real-Time Sensor Integration**: Connects with an Arduino-based hardware node to stream real-time environmental data (Temperature, Humidity, MQ-2 Gas/Ethylene levels) via WebSockets.
- **📈 FreshScore™ Algorithm**: Fuses local hardware sensor telemetry with AI visual insights to calculate a proprietary freshness score and estimated shelf life.
- **🔒 Secure Authentication**: Robust JWT-based authentication system, fully integrated with Google OAuth for seamless single sign-on (SSO) and isolated user data handling.
- **🌗 Premium UI/UX**: A modern, mobile-responsive dashboard featuring glassmorphism, fluid micro-animations, customizable dark/light themes, and real-time toast notifications.
- **📊 History & Tracking**: Maintain a private, paginated history of all past scans, filterable by freshness categories (*Fresh*, *Moderate*, *Spoiled*).

---

## 🏗️ Architecture & Tech Stack

### Frontend (`client/`)
- **Framework**: React 18 (Vite)
- **Styling**: Vanilla CSS with customized variable-based design systems and responsive media queries.
- **Routing**: React Router DOM (v6) with Protected Routes.
- **Authentication**: `@react-oauth/google` and native JWT handling.
- **Icons**: Lucide React.
- **State Management**: React Context API (`AuthContext`, `SensorContext`, `ThemeContext`).

### Backend (`server/`)
- **Server Environment**: Node.js & Express.js.
- **Database**: MongoDB with Mongoose ODM (includes TTL indexes for auto-expiring spoiled scans).
- **Security**: Hosted JWTs, Bcrypt password hashing, Helmet.js, Rate Limiting, and Mongo-Sanitize.
- **Real-Time Engine**: Socket.io for live hardware telemetry streaming.
- **File Uploads**: Multer config for image capture handling.
- **AI Integration**: `@google/generative-ai` SDK.

### Hardware (`arduino/`)
- **Microcontroller**: Compatible with C++ Arduino frameworks (ESP32/ESP8266 recommended for wireless).
- **Sensors**: DHT11/22 (Temp & Humidity), MQ-2 (Gas/Ethylene).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB locally installed or a MongoDB Atlas URI
- Google Cloud Console account (for OAuth and Gemini AI keys)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/freshscan.git
cd freshscan
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_ORIGIN=http://localhost:5173
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Hardware Setup (Optional but recommended)
Compile and upload the C++ sketch located in `arduino/freshscan_sensor.ino` to your microcontroller. Ensure it's configured to broadcast data to your Node.js server endpoint.

---

## 📱 Screenshots

*(Add screenshots of your Dashboard, Scan Page, Auth Screen, and Dark Mode here)*

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for a fresher, more sustainable supply chain.</sub>
</div>
