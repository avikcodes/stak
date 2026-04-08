import { PlaceholderPage } from "@/components/shared";

export default function HistoryPage() {
  return (
    <PlaceholderPage
      eyebrow="Dashboard"
      title="History"
      description="Placeholder history route for Stak."
      links={[
        { href: "/dashboard", label: "Overview" },
        { href: "/queue", label: "Queue" },
        { href: "/settings", label: "Settings" },
      ]}
    />
  );
}
