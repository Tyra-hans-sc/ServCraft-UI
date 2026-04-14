import dynamic from 'next/dynamic';

const DynamicLocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});

export default DynamicLocationPickerMap;
