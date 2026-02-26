import { cn } from "@/lib/utils";
import { LabelHTMLAttributes } from "react";

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn("text-sm font-medium text-gray-800", className)}
    {...props}
  />
);
