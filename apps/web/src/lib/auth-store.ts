"use client";

export const authStore = {
  get token() { return typeof window !== "undefined" ? localStorage.getItem("accessToken") : null; },
  set token(v: string | null) {
    if (typeof window === "undefined") return;
    if (v) localStorage.setItem("accessToken", v);
    else localStorage.removeItem("accessToken");
  },
  get user() { return typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null; },
  set user(v: any) {
    if (typeof window === "undefined") return;
    if (v) localStorage.setItem("user", JSON.stringify(v));
    else localStorage.removeItem("user");
  }
};
