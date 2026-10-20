import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "hq_session";

function secretBytes() {
  const s =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV === "production" ? "" : "keeply-hq-dev-secret");
  return new TextEncoder().encode("hq-session:" + s);
}

export async function createSession(days = 30) {
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secretBytes());
}

export async function verifySession(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, secretBytes());
    return true;
  } catch {
    return false;
  }
}

/** Sans mot de passe défini, l'accès reste ouvert en local uniquement. */
export const authDisabled = () => !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
