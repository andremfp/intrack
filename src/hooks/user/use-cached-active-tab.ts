import { useState, useCallback } from "react";
import type { TabType } from "@/constants";
import { TAB_CONSTANTS } from "@/constants";
import { userCache } from "@/utils/user-cache";

/**
 * Hook that provides active tab state synced with localStorage
 * Returns [cachedValue, setter] similar to useState
 */
export function useCachedActiveTab() {
  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    const cached = userCache.getActiveTab();
    const defaultTab = `${TAB_CONSTANTS.MAIN_TABS.METRICS}.${TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL}`;
    return cached || defaultTab;
  });

  const updateActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    userCache.setActiveTab(tab);
  }, []);

  return [activeTab, updateActiveTab] as const;
}
