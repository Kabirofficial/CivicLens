# 🏙️ CivicLens - AI-Powered Smart City Infrastructure Platform

![Status](https://img.shields.io/badge/Status-MVP_Complete-success?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![AI](https://img.shields.io/badge/AI-YOLOv8-blueviolet?style=for-the-badge)

**CivicLens** is a next-generation civic reporting platform enabling citizens to report infrastructure issues directly to municipal authorities. By leveraging **Computer Vision (YOLOv8)**, CivicLens validates reports instantly, ensuring accuracy, actionability, and precise geo-tagging.

---

## 📸 Project Screenshots

### 📱 Citizen App (Mobile)
| Home Screen | Report Management | Side Bar | User Management |
|:---:|:---:|:---:|:---:|
| <img src="screenshots/mobile%201.jpg" width="200" /> | <img src="screenshots/mobile%202.jpg" width="200" /> | <img src="screenshots/mobile%203.jpg" width="200" /> | <img src="screenshots/mobile%204.jpg" width="200" /> |

### 💻 Admin Dashboard (Desktop)
| Dashboard Overview | Homepage |
|:---:|:---:|
| <img src="screenshots/window%201.png" width="100%" /> | <img src="screenshots/window%202.png" width="100%" /> |
| *Visual Map & Stats* | *Report Management* |

---

## 🚀 Key Features

### For Citizens 🤳
-   **AI Auto-Validation:** Real-time validation using a custom **YOLOv8** model to detect issues (e.g., potholes) and reject invalid images instantly.
-   **Smart Geolocation:** Precise Latitude/Longitude tagging to pin issues on the city map.
-   **Duplicate Prevention:** Checks a **100m radius** for existing reports within the last 7 days to prevent duplicates.
-   **Nearby Alerts:** View active infrastructure issues reported by others in the vicinity.

### For Municipal Authorities 🏛️
-   **Role-Based Access Control (RBAC):**
    -   **Super Admin:** Manage the entire system and create department users.
    -   **Department Admin:** View restricted to specific teams (e.g., "Roads", "Sanitation").
-   **Interactive Map Dashboard:** Visualize problem hotspots with Google Maps integration.
-   **Lifecycle Management:** Track status: `Submitted` ➝ `Fixing` ➝ `Fixed` ➝ `False Alarm`.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework:** React.js (Vite)
-   **Styling:** Tailwind CSS + Lucide React Icons
-   **Animations:** Framer Motion
-   **HTTP Client:** Axios

### Backend
-   **Framework:** FastAPI (Python)
-   **Database:** SQLAlchemy ORM (SQLite for Dev / PostgreSQL for Prod)
-   **Authentication:** OAuth2 with JWT
-   **Geo-Spatial:** Haversine formula for distance calculations

### AI & Machine Learning
-   **Model:** YOLOv8 (Ultralytics)
-   **Training:** Custom dataset for road damage detection

---

## 💻 Installation Guide

### Prerequisites
-   Node.js (v16+)
-   Python (v3.10+)

### 1. Clone the Repository
```bash
git clone https://github.com/Kabirofficial/CivicLens.git
cd CivicLens
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Server
uvicorn main:app --reload
```
_The API will be available at `http://127.0.0.1:8000`_

### 3. Frontend Setup
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the Development Server
npm run dev
```
_The App will be available at `http://localhost:5173`_

---

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the `backend/` directory with the following variables:

```env
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
SUPER_ADMIN_USER=admin
SUPER_ADMIN_PASS=admin123
```

### Mobile Testing (Local Network)
If testing on a mobile device connected to the same WiFi:
1.  Find your laptop's local IP (e.g., `192.168.1.5`).
2.  Update `frontend/src/pages/CitizenHome.jsx` (and other API locations):
    ```javascript
    const API_URL = "http://192.168.1.5:8000";
    ```
3.  Run the backend on `0.0.0.0`:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

---

## 🔮 Future Roadmap
-   **Water Logging Detection:** Warn users about flooded routes.
-   **Garbage Overflow:** Detect overflowing dumpsters.
-   **Open Manhole Alerts:** Critical safety feature for pedestrians.
-   **Public Voting System:** Prioritize critical issues via upvotes.

---

## 🤝 Contributing
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 👨‍💻 Author
**Kabir Thayani (Jingg)**
[GitHub Profile](https://github.com/Kabirofficial)