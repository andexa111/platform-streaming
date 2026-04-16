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
  LogOut,
  Settings,
  Bell,
  Paintbrush,
  Accessibility,
  ChessPawn,
  ChessRook,
  ChessKnight,
  ChessQueen,
  LayoutDashboard,
  BarChart3,
  Tag,
  Image as ImageIcon,
  CreditCard,
  Megaphone,
  Users,
  ChevronDown,
  SlidersHorizontal,
  SearchX,
  Maximize,
  Volume2
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
  settings: Settings,
  bell: Bell,
  brush: Paintbrush,
  accessibility: Accessibility,
  "chess-pawn": ChessPawn,
  "chess-rook": ChessRook,
  "chess-knight": ChessKnight,
  "chess-queen": ChessQueen,
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  tag: Tag,
  image: ImageIcon,
  subscription: CreditCard,
  ads: Megaphone,
  users: Users,
  "chevron-down": ChevronDown,
  "sliders-horizontal": SlidersHorizontal,
  "search-x": SearchX,
  maximize: Maximize,
  "volume-2": Volume2,
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
