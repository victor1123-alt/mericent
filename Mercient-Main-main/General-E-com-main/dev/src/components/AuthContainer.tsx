import React, { useState } from "react";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";

const AuthContainer:React.FC = () => {
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSignupOpen(true)}
        className="bg-primary text-white p-2 rounded-lg"
      >
        Sign Up
      </button>

      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        openLogin={() => setLoginOpen(true)}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
};

export default AuthContainer;
