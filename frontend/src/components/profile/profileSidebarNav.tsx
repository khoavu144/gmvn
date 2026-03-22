import type { ReactNode } from 'react';
import {
  User,
  BookOpen,
  Image,
  Layers,
  Package,
  Star,
  Mail,
  Award,
  TrendingUp,
} from 'lucide-react';

const navIc = 'w-[15px] h-[15px] shrink-0';

export type ProfileNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

const iconAbout = <User className={navIc} strokeWidth={2} aria-hidden />;
const iconServices = <BookOpen className={navIc} strokeWidth={2} aria-hidden />;
const iconGallery = <Image className={navIc} strokeWidth={2} aria-hidden />;
const iconExperience = <Layers className={navIc} strokeWidth={2} aria-hidden />;
const iconPackages = <Package className={navIc} strokeWidth={2} aria-hidden />;
const iconTestimonials = <Star className={navIc} strokeWidth={2} aria-hidden />;
const iconContact = <Mail className={navIc} strokeWidth={2} aria-hidden />;
const iconAchievements = <Award className={navIc} strokeWidth={2} aria-hidden />;
const iconProgress = <TrendingUp className={navIc} strokeWidth={2} aria-hidden />;

const NAV_ICON_BY_ID: Record<string, ReactNode> = {
  about: iconAbout,
  services: iconServices,
  gallery: iconGallery,
  experience: iconExperience,
  packages: iconPackages,
  testimonials: iconTestimonials,
  contact: iconContact,
  achievements: iconAchievements,
  progress: iconProgress,
};

/** Default coach sidebar navigation (section ids: about, services, …) */
export const COACH_PROFILE_NAV_ITEMS: ProfileNavItem[] = [
  { id: 'about', label: 'Giới thiệu', icon: iconAbout },
  { id: 'services', label: 'Chuyên môn', icon: iconServices },
  { id: 'gallery', label: 'Hình ảnh', icon: iconGallery },
  { id: 'experience', label: 'Kinh nghiệm', icon: iconExperience },
  { id: 'packages', label: 'Gói dịch vụ', icon: iconPackages },
  { id: 'testimonials', label: 'Đánh giá', icon: iconTestimonials },
  { id: 'contact', label: 'Liên hệ', icon: iconContact },
];

export function profileNavItemsFromLabels(items: { id: string; label: string }[]): ProfileNavItem[] {
  return items.map(({ id, label }) => ({
    id,
    label,
    icon: NAV_ICON_BY_ID[id] ?? iconAbout,
  }));
}
