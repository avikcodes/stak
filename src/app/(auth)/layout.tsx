export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full">{children}</div>
    </div>
  );
}
