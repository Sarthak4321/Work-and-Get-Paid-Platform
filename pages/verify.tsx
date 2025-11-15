import { useEffect } from "react";
import { auth } from "../utils/firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function Verify() {
  useEffect(() => {
    const run = async () => {
      try {
        const email = "sarthakroy902@gmail.com";
        const password = "admin123";

        console.log("Logging in...");
        const result = await signInWithEmailAndPassword(auth, email, password);

        console.log("Sending verification email...");
        await sendEmailVerification(result.user);

        alert("Verification email sent! Check your Gmail.");
      } catch (err: any) {
        console.error(err);
        alert("Error: " + err.message);
      }
    };

    run();
  }, []);

  return (
    <h1 style={{ padding: 40 }}>
      Sending verification email... check console for logs
    </h1>
  );
}