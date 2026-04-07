import React from "react";
import { 
  LucideProps, 
  Sparkles, 
  Play, 
  ArrowRight, 
  Star, 
  Compass, 
  ChevronRight, 
  MonitorPlay, 
  DownloadCloud, 
  Repeat, 
  Monitor, 
  Ticket, 
  Crown, 
  Check, 
  Search, 
  User, 
  Mail, 
  Lock, 
  EyeOff, 
  Eye, 
  UserPlus, 
  Film,
  Menu,
  X,
  LogOut
} from "lucide-react";

const ICON_MAP = {
  sparkles: Sparkles,
  play: Play,
  "arrow-right": ArrowRight,
  star: Star,
  compass: Compass,
  "chevron-right": ChevronRight,
  "monitor-play": MonitorPlay,
  "download-cloud": DownloadCloud,
  repeat: Repeat,
  monitor: Monitor,
  ticket: Ticket,
  crown: Crown,
  check: Check,
  search: Search,
  user: User,
  mail: Mail,
  lock: Lock,
  "eye-off": EyeOff,
  eye: Eye,
  "user-plus": UserPlus,
  film: Film,
  menu: Menu,
  x: X,
  logout: LogOut,
};

interface IconProps extends LucideProps {
  name: keyof typeof ICON_MAP;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = ICON_MAP[name] as any;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in ICON_MAP`);
    return null;
  }

  return <LucideIcon {...props} />;
};
