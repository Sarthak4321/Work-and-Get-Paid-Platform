import { useEffect } from "react";
import { auth } from "../utils/firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function SendVerify() {

  useEffect(() => {
    const run = async () => {
      try {
        // ENTER YOUR EMAIL + PASSWORD HERE
        const email = "sarthakroy902@gmail.com";
        const password = "admin123";

        // Login temporarily
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Send verification email
        await sendEmailVerification(result.user);

        alert("Verification email sent!");
      } catch (err) {
        console.error(err);
        alert("Error sending verification email");
      }
    };

    run();
  }, []);

  return <h1>Sending verification email...</h1>;
}