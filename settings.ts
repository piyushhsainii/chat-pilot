export const waitlist_toggle = (() => {
  const raw =
    process.env.NEXT_PUBLIC_WAITLIST_TOGGLE ??
    process.env.WAITLIST_TOGGLE ??
    "";
  const v = String(raw).trim().toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
})();
