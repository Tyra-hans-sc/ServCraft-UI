import React from 'react';

const Noop: React.FC<any> = () => null;

export default function dynamic(
  loader: () => Promise<any>,
  options?: { loading?: React.ComponentType<any> }
) {
  const normalizedLoader = () =>
    loader().then((mod) => {
      if (typeof mod === 'function') return { default: mod };
      if (mod && typeof mod.default === 'function') return mod;
      return { default: Noop };
    });
  const DynamicComponent = React.lazy(normalizedLoader);
  return function DynamicWrapper(props: any) {
    return (
      <React.Suspense fallback={options?.loading ? React.createElement(options.loading) : null}>
        <DynamicComponent {...props} />
      </React.Suspense>
    );
  };
}
