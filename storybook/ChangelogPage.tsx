import React from 'react';

type ChangeEntry = {
  version: string;
  date: string;
  label?: string;
  changes: { type: 'added' | 'improved' | 'fixed'; text: string }[];
};

const entries: ChangeEntry[] = [
  {
    version: '0.3.0',
    date: '10 April 2026',
    label: 'Latest',
    changes: [
      { type: 'added', text: 'Changelog page — version history now visible in Storybook' },
      { type: 'added', text: 'Date range picker story (DatePickerInput type="range", two-column calendar)' },
      { type: 'added', text: 'Mantine theme reference page — scBlue colour scale, spacing, font sizes' },
      { type: 'added', text: 'Tabler icon usage guide with import examples, size and stroke props, and external link to tabler.io/icons' },
      { type: 'added', text: 'Stacked avatar group stories with +N overflow indicator' },
      { type: 'added', text: 'Top header (AppHeader) story — title, search, timer, settings, profile variants' },
      { type: 'added', text: 'Side navigation story — expanded and collapsed states with all nav items' },
    ],
  },
  {
    version: '0.2.0',
    date: '25 March 2026',
    changes: [
      { type: 'added', text: 'Form Controls V2: ScDateControl, ScMobileNumber, ScNumber, ScPassword, ScTextarea, ScTime' },
      { type: 'added', text: 'Data Display: ScDrawer, SimpleTable' },
      { type: 'added', text: 'Widgets: SCWidgetCard' },
      { type: 'improved', text: 'Preview decorator updated to apply full ServCraft Mantine theme across all stories' },
    ],
  },
  {
    version: '0.1.0',
    date: '12 March 2026',
    label: 'Initial release',
    changes: [
      { type: 'added', text: 'Storybook initialised with Vite + React framework' },
      { type: 'added', text: 'Introduction page with team audience guide and component inventory' },
      { type: 'added', text: 'Form Controls: SCCheckbox, SCChip, SCChipList, SCComboBox, SCDatePicker, SCDropdownList, SCInlineDropdownList, SCInlineInput, SCInlineTextarea, SCInput, SCMaskedInput, SCMultiSelect, SCNativeSelect, SCNumericInput, SCPasswordInput, SCPill, SCRadioButton, SCSearchBox, SCSplitButton, SCSwitch, SCTextarea, SCTimepicker, SCUploadDropzone' },
      { type: 'added', text: 'Feedback: BusyIndicator, NewBadge, SCMessageBar, SCSpinner, SCWatermark, StatusBadge' },
      { type: 'added', text: 'Layout: AccordionSection, SCAvatar, SCCard, SCCarousel, SCListCard, SCModal' },
      { type: 'added', text: 'Navigation: Breadcrumbs, PageTabs, Pagination, Tabs' },
      { type: 'added', text: 'Icons: Brand icon gallery (AlertIcon, ContactIcon, CustomerIcon, DiamondIcon, LocationIcon)' },
      { type: 'added', text: 'Misc: SCIcon, SCPopover' },
      { type: 'added', text: 'Next.js module mocks (next/link, next/router, next/dynamic, next/image) and Kendo no-op mock' },
    ],
  },
];

const typeConfig = {
  added: { bg: '#EBFBEE', color: '#2F9E44', label: 'Added' },
  improved: { bg: '#E9F1FF', color: '#003ED0', label: 'Improved' },
  fixed: { bg: '#FFF3BF', color: '#E67700', label: 'Fixed' },
};

export default function ChangelogPage() {
  return (
    <div
      style={{
        fontFamily: "'Proxima Nova', system-ui, sans-serif",
        color: '#090A0D',
        maxWidth: 860,
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 36,
            fontWeight: 700,
            color: '#003ED0',
            letterSpacing: '-0.5px',
          }}
        >
          Changelog
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: '#525866', lineHeight: 1.5 }}>
          A record of what has been added, improved, or fixed in this Storybook.
        </p>
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {entries.map((entry) => (
          <div
            key={entry.version}
            style={{
              borderLeft: '3px solid #003ED0',
              paddingLeft: 24,
            }}
          >
            {/* Version header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#090A0D',
                }}
              >
                v{entry.version}
              </span>
              {entry.label && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#FFD43E',
                    color: '#090A0D',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '3px 9px',
                    borderRadius: 20,
                  }}
                >
                  {entry.label}
                </span>
              )}
              <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 'auto' }}>
                {entry.date}
              </span>
            </div>

            {/* Change list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entry.changes.map((change, i) => {
                const cfg = typeConfig[change.type];
                return (
                  <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        background: cfg.bg,
                        color: cfg.color,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 4,
                        marginTop: 2,
                        minWidth: 64,
                        textAlign: 'center',
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                      {change.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 48,
          padding: '16px 20px',
          background: '#F9FAFB',
          border: '1px solid #E9EDF4',
          borderRadius: 8,
          fontSize: 13,
          color: '#525866',
        }}
      >
        This changelog is maintained manually. When you add or update stories, add an entry to{' '}
        <code
          style={{
            background: '#F4F5F7',
            padding: '1px 5px',
            borderRadius: 4,
            fontFamily: 'monospace',
          }}
        >
          storybook/ChangelogPage.tsx
        </code>
        .
      </div>
    </div>
  );
}
