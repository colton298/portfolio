import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";


//Import routes
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
import CardGame from "./game/CardGame";
import SignOut from "./auth/SignOut";

import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

//Routes
export default function App() {
  return (
    <HelmetProvider>
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
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/signout" element={<SignOut />} />

            <Route element={<ProtectedRoute requireVerified={true} redirectTo="/login" />}>
              <Route path="/todo" element={<TodoPage />} />
              <Route path="/game" element={<CardGame />} />
            </Route>
          </Routes>
        </AuthProvider>
      </main>
    </HelmetProvider>
  );
}
