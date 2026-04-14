import React from 'react';

const categories = [
  { label: 'Form Controls', count: '14' },
  { label: 'Form Controls V2', count: '5' },
  { label: 'Feedback', count: '5' },
  { label: 'Layout', count: '5' },
  { label: 'Navigation', count: '4' },
  { label: 'Data Display', count: '2' },
  { label: 'Misc', count: '2' },
  { label: 'Icons', count: 'gallery' },
  { label: 'Widgets', count: '1' },
];

const audiences = [
  {
    role: 'Developers',
    icon: '⌨',
    body: 'Find pre-built SC components, explore props and variants before implementing, and add stories when you ship new UI. Open a PR in storybook/ — no ceremony.',
  },
  {
    role: 'QA',
    icon: '✓',
    body: 'Isolate any component, stress-test edge cases — empty states, error states, disabled — and adjust props live with the Controls panel. No app login needed.',
  },
  {
    role: 'Designer',
    icon: '◈',
    body: 'Verify that built components match Figma. Spot visual drift across states. Use this as your reference when speccing new components.',
  },
  {
    role: 'Product & Leadership',
    icon: '◎',
    body: 'See what is already built before scoping new work. Understand the full UI capability without opening the codebase.',
  },
];

const reasons = [
  {
    title: 'One source of truth',
    body: 'ServCraft has known visual inconsistency across the product. This library defines the shared language that closes that gap — one place to find, verify, and build from.',
  },
  {
    title: 'Design–dev alignment',
    body: 'No formal design system yet. Storybook is the bridge that keeps what gets built true to what gets designed.',
  },
  {
    title: 'Component-driven quality',
    body: 'Test, inspect, and validate every component state in isolation — no backend login required. Catch regressions before they reach production.',
  },
];

const code: React.CSSProperties = {
  background: '#f4f5f7', padding: '1px 5px', borderRadius: 4, fontSize: 13,
  fontFamily: 'monospace',
};

export default function IntroductionPage() {
  return (
    <div style={{ fontFamily: "'Proxima Nova', system-ui, sans-serif", color: '#090A0D', maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

      {/* Hero */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#003ED0', letterSpacing: '-0.5px' }}>
            ServCraft UI
          </h1>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#FFD43E', color: '#090A0D',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 20,
          }}>
            Work in progress
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 18, color: '#525866', lineHeight: 1.5 }}>
          A living reference for the components that power ServCraft.
        </p>
      </div>

      {/* Why this exists */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#525866', marginBottom: 20, marginTop: 0 }}>
          Why this exists
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reasons.map(({ title, body }) => (
            <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                background: '#37B24D', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginTop: 2,
              }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <strong style={{ fontSize: 15 }}>{title}</strong>
                <span style={{ color: '#525866', fontSize: 15 }}> — {body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who is this for */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#525866', marginBottom: 20, marginTop: 0 }}>
          Who is this for
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {audiences.map(({ role, icon, body }) => (
            <div key={role} style={{ border: '1px solid #E9EDF4', borderRadius: 10, padding: '20px 20px 22px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, background: '#E9F1FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#003ED0',
                }}>
                  {icon}
                </span>
                <strong style={{ fontSize: 15, color: '#090A0D' }}>{role}</strong>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#525866', lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What's inside */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#525866', marginBottom: 20, marginTop: 0 }}>
          What's inside
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {categories.map(({ label, count }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #E9EDF4', borderRadius: 8, padding: '8px 14px',
              background: '#fff', fontSize: 14,
            }}>
              <span style={{ color: '#090A0D', fontWeight: 500 }}>{label}</span>
              <span style={{
                background: '#E9F1FF', color: '#003ED0', fontSize: 12, fontWeight: 700,
                padding: '2px 8px', borderRadius: 12,
              }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status & Contributing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        <div style={{ background: '#E9F1FF', border: '1px solid #c5d2f0', borderRadius: 10, padding: '20px 20px 22px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#003ED0' }}>Status</h3>
          <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 14, color: '#525866', lineHeight: 1.8 }}>
            <li>Not all components are fully documented yet — more being added.</li>
            <li>Kendo UI is being phased out. Avoid adding new Kendo-dependent components.</li>
            <li>Contributions are welcome via pull request.</li>
          </ul>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E9EDF4', borderRadius: 10, padding: '20px 20px 22px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#090A0D' }}>Contributing</h3>
          <ol style={{ margin: 0, padding: '0 0 0 18px', fontSize: 14, color: '#525866', lineHeight: 1.8 }}>
            <li>Add a <code style={code}>.stories.tsx</code> file to the relevant <code style={code}>storybook/</code> subfolder.</li>
            <li>Document props manually in <code style={code}>argTypes</code> — auto-extraction is disabled.</li>
            <li>Add <code style={code}>tags: ['autodocs']</code> to generate the Docs tab.</li>
            <li>Open a PR — no other ceremony required.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
