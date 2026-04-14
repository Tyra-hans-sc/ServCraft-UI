import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic(() => import('./RlMap'), {
    ssr: false,
    loading: () => <div>Loading map...</div>
});

const RlMapDynamic = () => {
    return <DynamicMap />;
}

export default RlMapDynamic;
