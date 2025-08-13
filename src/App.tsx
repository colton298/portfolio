import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Resume from "./pages/Resume";
import Header from "./components/Header";
import Wordle from "./pages/Wordle";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import TodoPage from "./pages/Todo";
import ForgotPassword from "./pages/ForgotPassword";

import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/wordle" element={<Wordle />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot" element={<ForgotPassword />} /> {/* NEW */}

            <Route element={<ProtectedRoute requireVerified={true} redirectTo="/login" />}>
              <Route path="/todo" element={<TodoPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </main>
    </>
  );
}
