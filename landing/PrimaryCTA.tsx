"use client";

import React from "react";
import Link from "next/link";

import { waitlist_toggle } from "@/settings";
import WaitlistDialog from "@/landing/WaitlistDialog";

type Props = {
  className: string;
  textBuild?: string;
  textWaitlist?: string;
  href?: string;
  buildChildren?: React.ReactNode;
  waitlistChildren?: React.ReactNode;
};

export default function PrimaryCTA({
  className,
  textBuild = "Build your agent",
  textWaitlist = "Join waitlist",
  href = "/dashboard",
  buildChildren,
  waitlistChildren,
}: Props) {
  if (waitlist_toggle) {
    return (
      <WaitlistDialog
        triggerClassName={className}
        triggerText={textWaitlist}
      >
        {waitlistChildren ?? textWaitlist}
      </WaitlistDialog>
    );
  }

  return (
    <Link href={href} className={className}>
      {buildChildren ?? textBuild}
    </Link>
  );
}
