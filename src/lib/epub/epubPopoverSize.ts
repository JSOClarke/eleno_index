export type PopoverSize = "sm" | "md" | "lg";

export interface PopoverSizePreset {
  label: string;
  widthNum: number;
  maxHNum: number;
  containerClass: string;
  lemmaClass: string;
  sentenceClass: string;
  defsListClass: string;
  imageClass: string;
}

export const POPOVER_SIZE_PRESETS: Record<PopoverSize, PopoverSizePreset> = {
  sm: {
    label: "S",
    widthNum: 376,
    maxHNum: 380,
    containerClass: "md:w-[376px] max-h-[82vh]",
    lemmaClass: "text-[30px]",
    sentenceClass: "text-[14px]",
    defsListClass: "max-h-[155px] text-[13px]",
    imageClass: "h-24",
  },
  md: {
    label: "M",
    widthNum: 460,
    maxHNum: 460,
    containerClass: "md:w-[460px] max-h-[86vh]",
    lemmaClass: "text-[33px]",
    sentenceClass: "text-[15.5px]",
    defsListClass: "max-h-[220px] text-[14px]",
    imageClass: "h-32",
  },
  lg: {
    label: "L",
    widthNum: 560,
    maxHNum: 540,
    containerClass: "md:w-[560px] max-h-[90vh]",
    lemmaClass: "text-[36px]",
    sentenceClass: "text-[17px]",
    defsListClass: "max-h-[300px] text-[15px]",
    imageClass: "h-40",
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
