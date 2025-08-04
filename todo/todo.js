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

// 🔐 Signup and send verification email
window.signup = async function () {
  clearError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await result.user.sendEmailVerification();

    authError.style.color = "#90caf9";
    authError.textContent = "Verification email sent. Please check your inbox.";
    await signOut(auth); // logout until verified
  } catch (error) {
    showError(error);
  }
};

// 🔐 Login (blocks unverified users)
window.login = async function () {
  clearError();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showError(error);
  }
};

// 🔐 Logout
window.logout = async function () {
  await signOut(auth);
};

// 📩 Resend email verification
window.resendVerification = async function () {
  clearError();
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    try {
      await user.sendEmailVerification();
      authError.style.color = "#90caf9";
      authError.textContent = "Verification email re-sent.";
    } catch (error) {
      showError(error);
    }
  } else {
    authError.style.color = "#f88";
    authError.textContent = "Please login first with an unverified account.";
  }
};

// 👁️ Auth state listener
onAuthStateChanged(auth, (user) => {
  clearError();
  if (user) {
    if (!user.emailVerified) {
      authError.style.color = "#f88";
      authError.textContent = "Please verify your email before continuing.";
      signOut(auth);
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

// ➕ Add a new to-do
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

// 📥 Load todos from Firestore
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
