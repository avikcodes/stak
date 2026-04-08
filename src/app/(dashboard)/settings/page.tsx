import { PlaceholderPage } from "@/components/shared";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Dashboard"
      title="Settings"
      description="Placeholder settings route for Stak."
      links={[
        { href: "/dashboard", label: "Overview" },
        { href: "/queue", label: "Queue" },
        { href: "/history", label: "History" },
      ]}
    />
  );
}
