import { redirect } from "next/navigation";

export default function ProOnboardPage() {
  redirect("/login?role=PROFESSIONAL&next=/pro/business");
}
