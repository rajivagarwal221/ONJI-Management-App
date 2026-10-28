import { redirect } from "next/navigation";

export default function Home() {
  // Auth-aware routing happens client-side on /login once a session is known.
  redirect("/login");
}
