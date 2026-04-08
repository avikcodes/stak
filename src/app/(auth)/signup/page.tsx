import { PlaceholderPage } from "@/components/shared";

export default function SignupPage() {
  return (
    <PlaceholderPage
      eyebrow="Authentication"
      title="Signup"
      description="Placeholder signup route for Stak."
      links={[
        { href: "/login", label: "Back to login" },
        { href: "/dashboard", label: "Dashboard" },
      ]}
    />
  );
}
