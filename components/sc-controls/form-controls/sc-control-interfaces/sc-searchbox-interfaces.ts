export default interface ScSearchboxInputProps {
    value?: string | null;
    placeholder?: string;
    label?: string;
    leftIcon?: string;
    canClear?: boolean;
    clearIcon?: string;
    onChange?: (val: string | null) => void;
}