import React from 'react';

const Noop: React.FC<any> = () => null;

export default Noop;

// Named React component exports used across kendo-react-* packages
export const Input = Noop;
export const Checkbox = Noop;
export const RadioButton = Noop;
export const MaskedTextBox: React.FC<any> = ({ label, mask, value, required, valid }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && (
      <label style={{ fontSize: 13, fontWeight: 500, color: '#343a40' }}>
        {label}{required ? ' *' : ''}
      </label>
    )}
    <input
      type="text"
      readOnly
      defaultValue={value ?? mask ?? ''}
      placeholder={mask ?? ''}
      style={{
        height: 36, padding: '0 8px', border: `1px solid ${valid === false ? '#e03131' : '#ced4da'}`,
        borderRadius: 4, fontSize: 14, color: '#495057', background: '#fff',
      }}
    />
  </div>
);
export const DropDownList = Noop;
export const MultiSelect = Noop;
export const ComboBox = Noop;
export const DropDownButton = Noop;
export const NumericTextBox = Noop;
export const Grid = Noop;
export const GridColumn = Noop;
export const Button = Noop;
export const FloatingActionButton = Noop;
export const Chip: React.FC<any> = ({ text, disabled }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
    borderRadius: 16, background: disabled ? '#f0f0f0' : '#e6ecfa',
    color: disabled ? '#999' : '#003ED0', fontSize: 13,
    border: '1px solid #c5d2f0', opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'default',
  }}>
    {text}
  </span>
);

export const ChipList: React.FC<any> = ({ data = [], textField = 'text' }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {data.map((item: any, i: number) => (
      <Chip key={i} text={typeof item === 'string' ? item : item[textField]} />
    ))}
  </div>
);
export const Popup = Noop;
export const Popover = Noop;
export const DatePicker = Noop;
export const DateRangePicker = Noop;
export const TimePicker = Noop;
export const Editor = Noop;
export const EditorTools = Noop;
export const EditorUtils = Noop;
export const Upload = Noop;
export const ExternalDropZone = Noop;
export const Tooltip = Noop;
export const Dialog = Noop;
export const Label = Noop;
// eslint-disable-next-line @typescript-eslint/no-shadow
export const Error = Noop;
export const Hint = Noop;
export const Avatar: React.FC<any> = ({ children, themeColor }) => {
  const bg: Record<string, string> = { red: '#c8393b', blue: '#003ED0', green: '#2b8a3e', dark: '#343a40' };
  return (
    <div style={{
      display: 'inline-flex', width: 32, height: 32, borderRadius: '50%',
      background: bg[themeColor] ?? '#003ED0', color: '#fff',
      alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
    }}>
      {children}
    </div>
  );
};
export const TileLayout = Noop;
export const Card: React.FC<any> = ({ children }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
    {children}
  </div>
);

export const CardBody: React.FC<any> = ({ children }) => (
  <div style={{ padding: 16 }}>{children}</div>
);
export const Pager = Noop;
export const ListBox = Noop;
export const ListBoxToolbar = Noop;
export const SchedulerSlot = Noop;
export const SchedulerEditItem = Noop;
export const SchedulerForm = Noop;
export const SchedulerItem = Noop;
export const Switch = Noop;
export const TextArea = Noop;
export const SchedulerViewSlot = Noop;
export const guid = () => '';
export type ListItemProps = any;
export type SchedulerSlotProps = any;
export type SchedulerResource = any;

// Scheduler / date-math hooks and constants
export const useSchedulerEditSlotFormItemContext = () => ({});
export const Day = 0;
export class ZonedDate {}

// ListBox utilities
export const processListBoxData = (data: any) => data;
export const processListBoxDragAndDrop = (data: any) => data;

// Data query functions (kendo-data-query) — return data unchanged
export const filterBy = (data: any[]) => (Array.isArray(data) ? data : []);
export const orderBy = (data: any[]) => (Array.isArray(data) ? data : []);
export const process = (data: any[]) => ({ data: Array.isArray(data) ? data : [], total: data?.length ?? 0 });
