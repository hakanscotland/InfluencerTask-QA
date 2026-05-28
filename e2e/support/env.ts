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
