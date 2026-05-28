import dotenv from 'dotenv';

let loaded = false;

export function loadEnv() {
  if (loaded) return;

  for (const path of ['.env.local', '.env']) {
    dotenv.config({ path });
  }

  loaded = true;
}

loadEnv();

export function optionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function requiredEnv(name: string) {
  const value = optionalEnv(name);
  if (!value) {
    throw new Error(`${name} must be configured in .env, .env.local, or GitHub Actions secrets/variables`);
  }
  return value;
}
