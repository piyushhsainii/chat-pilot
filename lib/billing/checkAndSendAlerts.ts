// // lib/billing/checkAndSendAlerts.ts
// import { createClient } from "@/lib/supabase/server";

// export async function checkAndSendAlerts(userId: string) {
//   const supabase = await createClient();

//   const { data } = await supabase
//     .from("user_credits")
//     .select("balance, alert_20_sent, alert_5_sent")
//     .eq("user_id", userId)
//     .single();

//   if (!data) return;

//   if (data.balance <= 5 && !data.alert_5_sent) {
//     await sendEmail({
//       template: "low_credits_5",
//       userId,
//     });

//     await supabase
//       .from("user_credits")
//       .update({ alert_5_sent: true })
//       .eq("user_id", userId);
//   }

//   if (data.balance <= 20 && !data.alert_20_sent) {
//     await sendEmail({
//       template: "low_credits_20",
//       userId,
//     });

//     await supabase
//       .from("user_credits")
//       .update({ alert_20_sent: true })
//       .eq("user_id", userId);
//   }
// }
