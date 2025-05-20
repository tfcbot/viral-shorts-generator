import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Viral Shorts Generator",
  description: "Create and manage your viral YouTube shorts",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

