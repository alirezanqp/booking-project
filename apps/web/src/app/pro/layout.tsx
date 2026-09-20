import { ProShell } from "@/components/ProShell";

export default function ProLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ProShell>{children}</ProShell>;
}
