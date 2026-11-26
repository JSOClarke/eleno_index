export type PopoverSize = "sm" | "md" | "lg";

export interface PopoverSizePreset {
  label: string;
  widthNum: number;
  maxHNum: number;
  containerClass: string;
  bodyClass: string;
  lemmaClass: string;
  ipaClass: string;
  surfaceClass: string;
  badgeRowClass: string;
  badgeIconClass: string;
  calloutClass: string;
  labelClass: string;
  defsListClass: string;
  sentenceClass: string;
  translationClass: string;
  actionBtnClass: string;
  bankTextClass: string;
  bankMetaClass: string;
  bankListClass: string;
  imageClass: string;
  statusBtnClass: string;
  tabBtnClass: string;
  tabIconClass: string;
}

export const POPOVER_SIZE_PRESETS: Record<PopoverSize, PopoverSizePreset> = {
  sm: {
    label: "S",
    widthNum: 376,
    maxHNum: 380,
    containerClass: "max-h-[82vh]",
    bodyClass: "px-[18px] py-3.5 space-y-3",
    lemmaClass: "text-[30px]",
    ipaClass: "text-[11.5px]",
    surfaceClass: "text-[11px]",
    badgeRowClass: "text-[10px]",
    badgeIconClass: "h-2.5 w-2.5",
    calloutClass: "text-[11px]",
    labelClass: "text-[10px]",
    defsListClass: "max-h-[155px] text-[13px]",
    sentenceClass: "text-[14px]",
    translationClass: "text-[12.5px]",
    actionBtnClass: "text-[11px] px-2.5 py-1.5",
    bankTextClass: "text-[12.5px]",
    bankMetaClass: "text-[10px]",
    bankListClass: "max-h-[155px]",
    imageClass: "h-24",
    statusBtnClass: "py-[7px] text-[11.5px]",
    tabBtnClass: "py-1.5 text-[10px]",
    tabIconClass: "h-3.5 w-3.5",
  },
  md: {
    label: "M",
    widthNum: 460,
    maxHNum: 480,
    containerClass: "max-h-[86vh]",
    bodyClass: "px-5 py-4 space-y-3.5",
    lemmaClass: "text-[35px]",
    ipaClass: "text-[13px]",
    surfaceClass: "text-[12.5px]",
    badgeRowClass: "text-[11.5px]",
    badgeIconClass: "h-3 w-3",
    calloutClass: "text-[12.5px]",
    labelClass: "text-[11px]",
    defsListClass: "max-h-[220px] text-[15px]",
    sentenceClass: "text-[16px]",
    translationClass: "text-[14px]",
    actionBtnClass: "text-[12.5px] px-3 py-1.5",
    bankTextClass: "text-[14.5px]",
    bankMetaClass: "text-[11.5px]",
    bankListClass: "max-h-[220px]",
    imageClass: "h-32",
    statusBtnClass: "py-2 text-[13px]",
    tabBtnClass: "py-2 text-[11.5px]",
    tabIconClass: "h-4 w-4",
  },
  lg: {
    label: "L",
    widthNum: 560,
    maxHNum: 580,
    containerClass: "max-h-[90vh]",
    bodyClass: "px-6 py-5 space-y-4",
    lemmaClass: "text-[42px]",
    ipaClass: "text-[15px]",
    surfaceClass: "text-[14px]",
    badgeRowClass: "text-[13px]",
    badgeIconClass: "h-3.5 w-3.5",
    calloutClass: "text-[14px]",
    labelClass: "text-[12px]",
    defsListClass: "max-h-[300px] text-[17px]",
    sentenceClass: "text-[18.5px]",
    translationClass: "text-[16px]",
    actionBtnClass: "text-[14px] px-3.5 py-2",
    bankTextClass: "text-[16.5px]",
    bankMetaClass: "text-[12.5px]",
    bankListClass: "max-h-[290px]",
    imageClass: "h-40",
    statusBtnClass: "py-2.5 text-[14.5px]",
    tabBtnClass: "py-2.5 text-[12.5px]",
    tabIconClass: "h-[18px] w-[18px]",
  },
};

const STORAGE_KEY = "threshold_popover_size";

export function loadPopoverSize(): PopoverSize {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "sm" || raw === "md" || raw === "lg") return raw;
  } catch {
    // Ignore storage access errors in restricted frames
  }
  return "sm";
}

export function savePopoverSize(size: PopoverSize): void {
  try {
    localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // Ignore storage access errors
  }
}
