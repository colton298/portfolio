<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCde4UcG0xkdPTP2SmGiqUib2jRodUbEMk",
    authDomain: "to-do-list-50f68.firebaseapp.com",
    projectId: "to-do-list-50f68",
    storageBucket: "to-do-list-50f68.firebasestorage.app",
    messagingSenderId: "405945979828",
    appId: "1:405945979828:web:34f10b1d39612e925bd8e1",
    measurementId: "G-04JTG08FEX"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Full functionality coming next...
