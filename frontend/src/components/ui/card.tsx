import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("rounded-xl border border-gray-200 bg-white p-6 shadow-sm", className)}
    {...props}
  />
);
