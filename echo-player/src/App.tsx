
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import Layout from "./components/Layout";
import Library from "./pages/Library";
import SearchPage from "./pages/SearchPage";
import PlayerScreen from "./pages/PlayerScreen";
import Settings from "./pages/Settings";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <p className="text-white/60 mb-8">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/10 rounded-full"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/player" element={<PlayerScreen />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
