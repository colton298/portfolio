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
  const firebaseConfig = {
    apiKey: "AIzaSyCde4UcG0xkdPTP2SmGiqUib2jRodUbEMk",
    authDomain: "to-do-list-50f68.firebaseapp.com",
    projectId: "to-do-list-50f68",
    storageBucket: "to-do-list-50f68.firebasestorage.app",
    messagingSenderId: "405945979828",
    appId: "1:405945979828:web:34f10b1d39612e925bd8e1",
    measurementId: "G-04JTG08FEX"
  };

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// HTML elements
const authSection = document.getElementById("auth-section");
const todoSection = document.getElementById("todo-section");
const todoList = document.getElementById("todo-list");

// 🔐 Signup
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");
  } catch (error) {
    alert("Signup error: " + error.message);
  }
};

// 🔐 Login
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
  } catch (error) {
    alert("Login error: " + error.message);
  }
};

// 🔐 Logout
window.logout = async function () {
  await signOut(auth);
  alert("Logged out");
};

// 🔄 Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
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
    alert("Error adding todo: " + err.message);
  }
};

// 📥 Load todos for user
async function loadTodos(user) {
  const q = query(collection(db, "todos"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  todoList.innerHTML = ""; // clear list
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
