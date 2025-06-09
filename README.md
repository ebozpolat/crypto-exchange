# Xosmox Frontend

Modern React TypeScript frontend for the Xosmox crypto exchange platform.

## 🚀 Features

- **Modern UI**: Built with React 19 + TypeScript + Tailwind CSS
- **Authentication**: JWT-based login/register system
- **Trading Interface**: Real-time trading with market/limit orders
- **Wallet Management**: View balances and manage funds
- **Responsive Design**: Works on desktop and mobile
- **Real-time Data**: Live market data and order updates

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Development

```bash
npm run dev
```

The frontend will start on `http://localhost:3001` and proxy API calls to the backend at `http://localhost:3000`.

## 🔧 Build

```bash
npm run build
```

## 📱 Pages

- **Login/Register**: User authentication
- **Dashboard**: Portfolio overview and quick stats
- **Trading**: Place buy/sell orders with real-time market data
- **Wallet**: View balances and manage funds

## 🔗 API Integration

The frontend connects to the Xosmox backend API with the following endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user/profile` - Get user profile
- `GET /api/wallet/balances` - Get wallet balances
- `POST /api/trading/order` - Place trading order
- `GET /api/market/tickers` - Get market data

## 🎨 Demo Credentials

For testing, use these demo credentials:
- **Email**: test@example.com
- **Password**: password123

## 🚀 Getting Started

1. Make sure the backend is running on port 3000
2. Start the frontend: `npm run dev`
3. Open `http://localhost:3001`
4. Login with demo credentials or register a new account
5. Explore the trading interface and wallet features

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── pages/              # Page components
├── services/           # API service functions
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```