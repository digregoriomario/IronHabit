import type { ReactNode } from "react";

import { Card as PrimitiveCard } from "./ui/card";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <PrimitiveCard className={className}>{children}</PrimitiveCard>;
}
