"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/features/auth/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await signUp(email, password);

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/paywall");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Create account
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 border rounded"
            required
          />

          {errorMessage ? (
            <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
          >
            Sign up
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?
          <Link href="/login" className="underline ml-1">Login</Link>
        </p>
      </div>
    </div>
  );
}