export interface ControlMapping {
  key: string;
  action: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  secondaryCategory?: string;
  thumbnail: string;
  banner?: string;
  mirrors?: string[];
  tags?: string[];
  rating: number;
  plays: number;
  author?: string;
  featured?: boolean;
  iframeSrc: string;
  iframeCode?: string;
  controls?: ControlMapping[];
  source?: string;
  customHtml?: string;
  sandbox?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  announcementText: string;
  announcementActive: boolean;
  announcementType: 'info' | 'warning' | 'success';
  starSpeed: number;
  starDensity: number;
  shootingStarsEnabled: boolean;
  themeColor: 'emerald' | 'cyan' | 'purple' | 'amber';
}

export interface CloakPreset {
  id: string;
  name: string;
  title: string;
  icon: string;
  faviconUrl: string;
}
