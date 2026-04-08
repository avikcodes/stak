import { PlaceholderPage } from "@/components/shared";

export default function QueuePage() {
  return (
    <PlaceholderPage
      eyebrow="Dashboard"
      title="Queue"
      description="Placeholder queue route for Stak."
      links={[
        { href: "/dashboard", label: "Overview" },
        { href: "/history", label: "History" },
        { href: "/settings", label: "Settings" },
      ]}
    />
  );
}
