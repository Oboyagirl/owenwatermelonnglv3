export interface GameControl {
  key: string;
  action: string;
}

export interface Game {
  id: string;
  title: string;
  category: string;
  secondaryCategory?: string;
  description: string;
  thumbnail: string;
  banner?: string;
  tags: string[];
  rating?: number;
  plays?: number;
  author?: string;
  source?: string;
  featured?: boolean;
  iframeSrc: string;
  iframeCode?: string;
  mirrors?: string[];
  controls?: GameControl[];
  customHtml?: string;
  sandbox?: string;
}

export interface CloakPreset {
  id: string;
  name: string;
  title: string;
  icon: string;
  faviconUrl: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  announcementText: string;
  announcementActive: boolean;
  announcementType: string;
  starSpeed: number;
  starDensity: number;
  shootingStarsEnabled: boolean;
  themeColor: string;
}
