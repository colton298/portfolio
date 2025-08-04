// todo.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

//API key is just to identify, not to login
const firebaseConfig = 
{
    apiKey: "AIzaSyCde4UcG0xkdPTP2SmGiqUib2jRodUbEMk",
    authDomain: "to-do-list-50f68.firebaseapp.com",
    projectId: "to-do-list-50f68",
    storageBucket: "to-do-list-50f68.firebasestorage.app",
    messagingSenderId: "405945979828",
    appId: "1:405945979828:web:34f10b1d39612e925bd8e1",
    measurementId: "G-04JTG08FEX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authSection = document.getElementById("auth-section");
const todoSection = document.getElementById("todo-section");
const todoList = document.getElementById("todo-list");
const authError = document.getElementById("auth-error");

// 🔐 Signup: create user, send email verification, log them out
window.signup = async function () {
  clearError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await result.user.sendEmailVerification();

    authError.style.color = "#90caf9";
    authError.innerHTML = `
      Verification email sent. Please check your inbox.<br>
      <button onclick="resendVerification()">Resend Verification Email</button>
    `;

    await signOut(auth);
  } catch (error) {
    showError(error);
  }
};

// 🔐 Login: signs in, then state listener handles verification check
window.login = async function () {
  clearError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle what to do next
  } catch (error) {
    showError(error);
  }
};

// 🔐 Logout
window.logout = async function () {
  await signOut(auth);
};

// 📩 Resend verification email
window.resendVerification = async function () {
  clearError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await result.user.sendEmailVerification();
      authError.style.color = "#90caf9";
      authError.textContent = "Verification email re-sent.";
    } else {
      authError.style.color = "#90caf9";
      authError.textContent = "Your email is already verified.";
    }

    await signOut(auth);
  } catch (error) {
    showError(error);
  }
};

// 🔄 Auth state change: show todo only if verified
onAuthStateChanged(auth, async (user) => {
  clearError();

  if (user) {
    // ✅ Refresh user info in case it's stale
    await user.reload();

    if (!user.emailVerified) {
      authError.style.color = "#f88";
      authError.innerHTML = `
        Please verify your email before continuing.<br>
        <button onclick="resendVerification()">Resend Verification Email</button>
      `;
      await signOut(auth);
      return;
    }

    authSection.style.display = "none";
    todoSection.style.display = "block";
    loadTodos(user);
  } else {
    authSection.style.display = "block";
    todoSection.style.display = "none";
    todoList.innerHTML = "";
  }
});

// ➕ Add new to-do
window.addTodo = async function (event) {
  event.preventDefault();
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;

  try {
    await addDoc(collection(db, "todos"), {
      text,
      userId: auth.currentUser.uid,
      createdAt: Date.now()
    });
    input.value = "";
    loadTodos(auth.currentUser);
  } catch (err) {
    authError.style.color = "#f88";
    authError.textContent = "Error adding todo: " + err.message;
  }
};

// 📥 Load todos
async function loadTodos(user) {
  const q = query(collection(db, "todos"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  todoList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const li = document.createElement("li");
    li.textContent = docSnap.data().text;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "todos", docSnap.id));
      loadTodos(user);
    };

    li.appendChild(delBtn);
    todoList.appendChild(li);
  });
}

// 🔎 Error helpers
function showError(error) {
  authError.style.color = "#f88";
  authError.textContent = mapAuthError(error);
}

function clearError() {
  authError.textContent = "";
}

function mapAuthError(error) {
  if (!error || !error.code) return "An unknown error occurred.";
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    default:
      return error.message;
  }
}
