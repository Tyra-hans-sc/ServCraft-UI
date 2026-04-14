export interface SCPillItem {
    label: string;
    selected: boolean;
}

export interface SCPillInputProps {
    onChange?: (val: SCPillItem[]) => void;
    items?: SCPillItem[];
    disabled?: boolean;
}