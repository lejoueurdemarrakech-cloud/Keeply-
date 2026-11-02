import "server-only";
import { read } from "@/lib/store";

/** Inscrits « Keeply arrive sur Android » (formulaire public keeplyfidelity.app/android). */
export interface AndroidSignup {
  email: string;
  type: string;
  city: string;
  at: string;
}

export const ANDROID_KEY = "android:waitlist";
export const androidWaitlist = () => read<AndroidSignup[]>(ANDROID_KEY, []);
