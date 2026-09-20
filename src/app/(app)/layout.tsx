import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MobileNav, Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="relative flex min-h-screen">
      <div
        className="glow"
        style={{ top: "-180px", left: "12%", width: "520px", height: "320px", background: "rgba(200,163,90,0.20)" }}
      />
      <div
        className="glow"
        style={{ bottom: "-220px", right: "6%", width: "480px", height: "320px", background: "rgba(90,130,200,0.14)" }}
      />
      <Sidebar name={user.name} email={user.email} />
      <div className="relative z-10 min-w-0 flex-1">
        <MobileNav />
        <main className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
