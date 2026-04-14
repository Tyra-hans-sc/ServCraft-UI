import React from 'react';

export function useRouter() {
  return {
    pathname: '/',
    query: {},
    push: () => Promise.resolve(true),
    replace: () => Promise.resolve(true),
    back: () => {},
    prefetch: () => Promise.resolve(),
    reload: () => {},
    events: { on: () => {}, off: () => {}, emit: () => {} },
    isReady: true,
    route: '/',
    asPath: '/',
    isFallback: false,
    basePath: '',
  };
}

export function withRouter(Component: React.ComponentType<any>) {
  return function WithRouter(props: any) {
    return <Component {...props} router={useRouter()} />;
  };
}

const Router = {
  push: () => Promise.resolve(true),
  replace: () => Promise.resolve(true),
  back: () => {},
  prefetch: () => Promise.resolve(),
  events: { on: () => {}, off: () => {}, emit: () => {} },
};
export default Router;
