import * as Icons from "lucide-react";
import React from "react";

type IconName = keyof typeof Icons;

export const Icon = ({ name, ...props }: { name: IconName } & React.ComponentProps<"svg">) => {
  const Component = Icons[name] as any;
  return <Component {...props} />;
};
