"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    let user = null;

    try {
      const userString = localStorage.getItem("user");

      if (userString && userString !== "undefined") {
        user = JSON.parse(userString);
      }
    } catch (error) {
      console.error("Error parseando user:", error);
      user = null;
    }

    // 🔥 validación completa
    if (!user || !user.isActive || user.role !== "trainer") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  return <h1 className="text-white text-xl">Bienvenido</h1>;
}