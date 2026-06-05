/**
 * E2E Test Data Reset Module
 *
 * Directly connects to Supabase to reset test data without exposing
 * an HTTP endpoint. Safe to use in local/CI environments only.
 *
 * Usage:
 *   import { resetTestData, seedTestData } from './test-data';
 *   await resetTestData();
 *   await seedTestData();
 *
 * CLI:
 *   npx tsx e2e/utils/test-data.ts [--seed]
 */

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env.local
const envPaths = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "../.env.local"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "🔴 Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  );
  if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    process.exit(1);
  }
}

const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_SERVICE_KEY || "placeholder",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TEST_INFLUENCER_EMAIL = "qa_influencer@influencertask.com";
const TEST_BRAND_EMAIL = "qa_brand@influencertask.com";

export interface ResetResult {
  ok: boolean;
  message: string;
  submissionsDeleted: number;
  seeded: boolean;
  error?: string;
}

/**
 * Resets all test data for the E2E test influencer and brand users.
 * Deletes submissions, wallet transactions, payments, withdrawal requests,
 * and resets application statuses and wallet balances.
 */
export async function resetTestData(enableFeatures: string[] = []): Promise<ResetResult> {
  // 1. Look up test influencer
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", TEST_INFLUENCER_EMAIL)
    .single();

  if (userErr || !user) {
    return {
      ok: false,
      message: "Test influencer user not found",
      submissionsDeleted: 0,
      seeded: false,
      error: userErr?.message,
    };
  }

  const influencerId = user.id;

  // 2. Look up test brand
  const { data: brandUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", TEST_BRAND_EMAIL)
    .single();

  const brandId = brandUser?.id;

  // 3. Delete all submissions for this influencer
  const { error: delErr, count } = await supabase
    .from("campaign_submissions")
    .delete({ count: "exact" })
    .eq("influencer_id", influencerId);

  if (delErr) {
    return {
      ok: false,
      message: "Failed to delete submissions",
      submissionsDeleted: 0,
      seeded: false,
      error: delErr.message,
    };
  }

  // 4. Reset campaign_applications status to 'accepted'
  const { error: appErr } = await supabase
    .from("campaign_applications")
    .update({ status: "accepted" })
    .eq("influencer_id", influencerId)
    .in("status", ["submitted", "paid"]);

  if (appErr) {
    console.warn(
      "[E2E Reset] Could not reset application statuses:",
      appErr.message
    );
  }

  // 5. Wallet & financial cleanups
  const userIds = [influencerId, brandId].filter(Boolean) as string[];
  if (userIds.length > 0) {
    await supabase
      .from("withdrawal_requests")
      .delete()
      .in("user_id", userIds);

    await supabase
      .from("wallet_transactions")
      .delete()
      .in("user_id", userIds);

    await supabase.from("payments").delete().in("sender_id", userIds);

    await supabase.from("payments").delete().in("receiver_id", userIds);

    // Reset influencer wallet
    if (influencerId) {
      const { data: infWallet } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", influencerId)
        .maybeSingle();

      if (infWallet) {
        await supabase
          .from("wallets")
          .update({ balance: 1000 })
          .eq("user_id", influencerId);
      } else {
        await supabase
          .from("wallets")
          .insert({ user_id: influencerId, balance: 1000, currency: "TRY" });
      }
    }

    // Reset brand wallet
    if (brandId) {
      const { data: brandWallet } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", brandId)
        .maybeSingle();

      if (brandWallet) {
        await supabase
          .from("wallets")
          .update({ balance: 0 })
          .eq("user_id", brandId);
      } else {
        await supabase
          .from("wallets")
          .insert({ user_id: brandId, balance: 0, currency: "TRY" });
      }
    }

    // Ensure core features are set correctly (defaulting to false)
    const settingsToUpsert = [
      { key: "feature_web3_enabled", value: enableFeatures.includes("feature_web3_enabled") },
      { key: "feature_subscription_enabled", value: enableFeatures.includes("feature_subscription_enabled") },
      { key: "feature_trending_enabled", value: enableFeatures.includes("feature_trending_enabled") },
      { key: "feature_team_enabled", value: enableFeatures.includes("feature_team_enabled") },
    ];

    for (const setting of settingsToUpsert) {
      await supabase.from("system_settings").upsert({
        key: setting.key,
        value: setting.value,
        updated_at: new Date().toISOString(),
      });
    }

    // Seed pending financial requests for admin tests
    if (influencerId) {
      await supabase.from("withdrawal_requests").insert({
        user_id: influencerId,
        amount: 250,
        bank_name: "Akbank",
        iban: "TR123456789012345678901234",
        account_holder: "Reklam Influencer",
        status: "pending",
      });
    }

    if (brandId) {
      await supabase.from("payments").insert({
        sender_id: brandId,
        amount: 5000,
        status: "pending",
        description: "Bakiye Yukleme (Banka Havalesi)",
        currency: "TRY",
      });
    }
  }

  // 6. Ensure at least one active brand campaign exists
  if (brandId) {
    const { data: existingCampaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("brand_id", brandId)
      .limit(1)
      .maybeSingle();

    if (!existingCampaign) {
      console.log("[E2E Reset] Seeding E2E campaign for brand");
      const { data: newCampaign, error: campErr } = await supabase
        .from("campaigns")
        .insert({
          brand_id: brandId,
          title: "Summer Promo E2E Campaign",
          description: "An E2E seeded campaign description",
          goal: "E2E testing goal",
          type: "paid",
          status: "active",
          budget: "5000",
          budget_locked: 5000,
          budget_currency: "TRY",
          min_followers: 0,
          max_followers: 1000000,
          min_iqs: 0,
          target_categories: ["technology"],
          target_platforms: ["instagram"],
          target_languages: ["tr"],
          target_geolocations: ["Türkiye"],
          primary_categories: ["technology"],
          secondary_categories: [],
          interest_level: "any",
          tags: ["e2e", "test"],
          content_html: "<p>E2E test campaign brief HTML</p>",
          is_authorized: true,
          terms_accepted: true,
          reward_per_iqs_pct: 15,
          min_reward_per_iqs: 10,
          max_reward_per_iqs: 50,
          chain_fee_pct: 1,
          platform_fee_amount: 500,
          bundle_mode: true,
        })
        .select()
        .single();

      if (campErr) {
        console.error(
          "[E2E Reset] Failed to seed campaign:",
          campErr.message
        );
      } else if (newCampaign) {
        await supabase.from("campaign_tasks").insert({
          campaign_id: newCampaign.id,
          platform: "instagram",
          task_type: "STORY_SHARE",
          is_required: true,
          sort_order: 0,
          min_requirement: 1,
          reward: 100,
          reward_currency: "TRY",
          description: "E2E seeded task description",
        });

        if (influencerId) {
          await supabase.from("campaign_applications").insert({
            campaign_id: newCampaign.id,
            influencer_id: influencerId,
            status: "accepted",
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  return {
    ok: true,
    message: `E2E reset complete for ${TEST_INFLUENCER_EMAIL}`,
    submissionsDeleted: count ?? 0,
    seeded: false,
  };
}

/**
 * Seeds a manual_review submission for admin review tests.
 */
export async function seedTestData(enableFeatures: string[] = []): Promise<ResetResult> {
  // First reset
  const resetResult = await resetTestData(enableFeatures);

  // Look up influencer
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", TEST_INFLUENCER_EMAIL)
    .single();

  if (!user) {
    return { ...resetResult, seeded: false };
  }

  // Find accepted applications
  const { data: apps } = await supabase
    .from("campaign_applications")
    .select("id, campaign_id")
    .eq("influencer_id", user.id)
    .eq("status", "accepted")
    .limit(1);

  if (!apps || apps.length === 0) {
    console.warn("[E2E Seed] No accepted applications found.");
    return { ...resetResult, seeded: false };
  }

  const app = apps[0];

  // Find tasks
  const { data: tasks } = await supabase
    .from("campaign_tasks")
    .select("id")
    .eq("campaign_id", app.campaign_id)
    .limit(1);

  if (!tasks || tasks.length === 0) {
    console.warn("[E2E Seed] No tasks found.");
    return { ...resetResult, seeded: false };
  }

  const task = tasks[0];

  // Delete existing submission for this task
  await supabase
    .from("campaign_submissions")
    .delete()
    .eq("influencer_id", user.id)
    .eq("task_id", task.id);

  // Seed a manual_review submission
  const { error: insErr } = await supabase
    .from("campaign_submissions")
    .insert({
      influencer_id: user.id,
      task_id: task.id,
      application_id: app.id,
      content_url: "https://instagram.com/p/CtE2ETestSub",
      status: "manual_review",
      submitted_at: new Date().toISOString(),
      metadata: { e2e: true, seeded: true },
      validation_result: {
        score: 85,
        passed: true,
        checks: [
          {
            rule: "platform_url",
            passed: true,
            message: "Platform URL is valid.",
          },
          {
            rule: "content_ownership",
            passed: true,
            message: "Account ownership verified.",
          },
        ],
        ai_analysis: {
          overall_score: 85,
          feedback:
            "Harika bir paylasim! Marka hizalamasi ve gorsel kalitesi son derece basarili.",
          brand_alignment: "HIGH",
          creativity: "MEDIUM",
          compliance: "HIGH",
          flags: [],
        },
      },
    });

  if (insErr) {
    console.error("[E2E Seed] Failed to seed submission:", insErr.message);
    return { ...resetResult, seeded: false };
  }

  console.log("[E2E Seed] Seeded manual_review submission successfully.");
  return { ...resetResult, seeded: true };
}

// CLI entry point
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const shouldSeed = process.argv.includes("--seed");

  (async () => {
    console.log("🔄 E2E test data reset starting...");
    const result = shouldSeed ? await seedTestData() : await resetTestData();

    if (result.ok) {
      console.log(`✅ ${result.message}`);
      console.log(`   Submissions deleted: ${result.submissionsDeleted}`);
      if (shouldSeed) {
        console.log(`   Seeded: ${result.seeded}`);
      }
    } else {
      console.error(`❌ ${result.message}: ${result.error}`);
      process.exit(1);
    }
  })();
}
