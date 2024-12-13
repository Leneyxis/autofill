document.addEventListener("DOMContentLoaded", async () => {
  // Firebase Imports
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
  const { getAuth, GoogleAuthProvider, sendPasswordResetEmail, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js");
  const { getFirestore, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDyIZIJr1uoGlIgauMTqLGiYDWXKzdu1L4",
    authDomain: "autofill-4da48.firebaseapp.com",
    projectId: "autofill-4da48",
    storageBucket: "autofill-4da48.firebasestorage.app",
    messagingSenderId: "206724954770",
    appId: "1:206724954770:web:45e0249242cfac6e49844b",
    measurementId: "G-7CQTP9NR81",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();
  const db = getFirestore(app);

  // Selecting elements
  const modal = document.querySelector(".modal");
  const modalContent = document.querySelector(".modal-content");
  const signupBtn = document.querySelector("label.signup");
  const loginBtn = document.querySelector("label.login");
  const signupLinkForm = document.querySelector("form .signup-link a");
  const getStartedBtn = document.querySelector(".hero-content button");
  const signupModalBtn = document.querySelector(".navbar nav .signup-btn");
  const loginForm = document.querySelector("form.login");
  const signupForm = document.querySelector("form.signup");
  const sliderTab = document.querySelector(".slider-tab");
  const googleLoginBtns = document.querySelectorAll(".google-btn");
  const forgotPasswordLink = document.querySelector("form.login .pass-link a");

  // Email/password form fields
  const emailInput = {
    signup: document.querySelector("form.signup input[placeholder='Email Address']"),
    login: document.querySelector("form.login input[placeholder='Email Address']"),
  };
  const passwordInput = {
    signup: document.querySelector("form.signup input[placeholder='Password']"),
    login: document.querySelector("form.login input[placeholder='Password']"),
  };
  const confirmPasswordInput = document.querySelector("form.signup input[placeholder='Confirm password']");
  const emailAuthBtns = {
    signup: document.querySelector("form.signup .btn input[type='submit']"),
    login: document.querySelector("form.login .btn input[type='submit']"),
  };

  // Show/hide modal
  const showModal = () => { modal.classList.remove("hidden"); };
  const hideModal = () => { modal.classList.add("hidden"); };

  // Fetch and display user data after login/signup
  const fetchAndDisplayUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "profiles", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        sessionStorage.setItem("resumeData", JSON.stringify(userData));
        window.location.href = "long_form.html"; 
      } else {
        // No data yet; redirect to profile.html so user can fill their info
        window.location.href = "profile.html";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      window.location.href = "profile.html"; 
    }
  };

  // Check if user is already signed in from previous session
  const checkExistingSession = () => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (currentUser?.uid) {
      // User already signed in, fetch data
      fetchAndDisplayUserData(currentUser.uid);
    }
  };

  // Google SSO login handler
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      alert(`Welcome ${user.displayName}`);
      // Store user session info
      sessionStorage.setItem("currentUser", JSON.stringify({ uid: user.uid, email: user.email }));
      await fetchAndDisplayUserData(user.uid);
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Failed to sign in with Google.");
    }
  };

  // Email/password signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    const email = emailInput.signup.value.trim();
    const password = passwordInput.signup.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful! Redirecting...");
      sessionStorage.setItem("currentUser", JSON.stringify({ uid: userCredential.user.uid, email: userCredential.user.email }));
      // No data yet, direct to profile to fill it
      window.location.href = "profile.html";
    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.message);
    }
  };

  // Email/password login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailInput.login.value.trim();
    const password = passwordInput.login.value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("Welcome back! Redirecting...");
      sessionStorage.setItem("currentUser", JSON.stringify({ uid: userCredential.user.uid, email: userCredential.user.email }));
      await fetchAndDisplayUserData(userCredential.user.uid);
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message);
    }
  };

  // Password reset handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const email = emailInput.login.value.trim();

    if (!email) {
      alert("Please enter your email address to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Password Reset Error:", error);
      alert(error.message);
    }
  };

  // Event listeners
  getStartedBtn.addEventListener("click", () => {
    checkExistingSession();
    showModal();
    signupBtn.click();
  });

  signupModalBtn.addEventListener("click", () => {
    checkExistingSession();
    showModal();
    signupBtn.click();
  });

  signupBtn.addEventListener("click", () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    sliderTab.style.left = "50%";
  });

  loginBtn.addEventListener("click", () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
    sliderTab.style.left = "0%";
  });

  signupLinkForm.addEventListener("click", (e) => {
    e.preventDefault();
    signupBtn.click();
  });

  modal.addEventListener("click", (e) => {
    if (!modalContent.contains(e.target)) {
      hideModal();
    }
  });

  googleLoginBtns.forEach((btn) => btn.addEventListener("click", handleGoogleLogin));
  emailAuthBtns.signup.addEventListener("click", handleSignup);
  emailAuthBtns.login.addEventListener("click", handleLogin);
  forgotPasswordLink.addEventListener("click", handlePasswordReset);

  // Check if user is already signed in
  checkExistingSession();
});
