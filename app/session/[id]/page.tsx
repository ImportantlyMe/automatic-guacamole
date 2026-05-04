"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { MEASUREMENT_NUMBERS } from "@/lib/measurements";
import { getSession } from "@/lib/storage";

export default function SessionEntry() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  useEffect(() => {
    const s = getSession(params.id);
    if (!s) {
      router.replace("/");
      return;
    }
    router.replace(`/session/${params.id}/m/${MEASUREMENT_NUMBERS[0]}`);
  }, [params.id, router]);
  return null;
}
