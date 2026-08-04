import { create } from 'zustand';
import { getString, setString } from '../storage/LocalStore';
import { StorageKeys } from '../storage/StorageKeys';

type SDUIStore = {
  selectedChipId: string;
  activeSheetId: string | null;
  setSelectedChip: (id: string) => void;
  openSheet: (id: string) => void;
  closeSheet: () => void;
};

export const useSDUIStoreBase = create<SDUIStore>(set => ({
  selectedChipId: getString(StorageKeys.SELECTED_CATEGORY) ?? 'buy',
  activeSheetId: null,
  setSelectedChip: id => {
    setString(StorageKeys.SELECTED_CATEGORY, id);
    set({ selectedChipId: id });
  },
  openSheet: id => set({ activeSheetId: id }),
  closeSheet: () => set({ activeSheetId: null }),
}));
