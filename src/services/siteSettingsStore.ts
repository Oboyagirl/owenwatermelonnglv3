import { useState, useEffect } from 'react';
import { SiteSettings } from '../types/game';

export const CREATOR_PASSWORD = 'owenpanedit2244';
const CREATOR_MODE_KEY = 'owen_creator_mode_active';
const SITE_SETTINGS_KEY = 'owen_watermelon_site_settings_v1';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Owen Watermelon V3',
  siteSubtitle: 'Unblocked games, retro hits, and tab cloaker.',
  announcementText: '🍉 Welcome to Owen Watermelon V3! Try the new Theme Gallery to switch between Nebula, Sky, and 10+ more styles.',
  announcementActive: true,
  announcementType: 'info',
  starSpeed: 1,
  starDensity: 1.2,
  shootingStarsEnabled: true,
  themeColor: 'emerald'
};

export function getStoredSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load site settings', e);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save site settings', e);
  }
}

export function checkIsCreatorMode(): boolean {
  try {
    return localStorage.getItem(CREATOR_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setCreatorModeStorage(active: boolean) {
  try {
    if (active) {
      localStorage.setItem(CREATOR_MODE_KEY, 'true');
    } else {
      localStorage.removeItem(CREATOR_MODE_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

export function useSiteSettingsStore() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getStoredSiteSettings);
  const [isCreatorMode, setIsCreatorMode] = useState<boolean>(checkIsCreatorMode);

  useEffect(() => {
    saveSiteSettings(siteSettings);
  }, [siteSettings]);

  const unlockCreatorMode = (pass: string): boolean => {
    if (pass.trim().toLowerCase() === CREATOR_PASSWORD.toLowerCase()) {
      setIsCreatorMode(true);
      setCreatorModeStorage(true);
      return true;
    }
    return false;
  };

  const lockCreatorMode = () => {
    setIsCreatorMode(false);
    setCreatorModeStorage(false);
  };

  const updateSiteSettings = (updates: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      const next = { ...prev, ...updates };
      saveSiteSettings(next);
      return next;
    });
  };

  const resetSiteSettings = () => {
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    saveSiteSettings(DEFAULT_SITE_SETTINGS);
  };

  return {
    siteSettings,
    isCreatorMode,
    unlockCreatorMode,
    lockCreatorMode,
    updateSiteSettings,
    resetSiteSettings
  };
}
