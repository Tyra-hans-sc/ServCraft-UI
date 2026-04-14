import React from 'react';

export default function Image({ src, alt, width, height, ...props }: any) {
  return <img src={src as string} alt={alt} width={width} height={height} {...props} />;
}
