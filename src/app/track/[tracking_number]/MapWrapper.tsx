"use client";

import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('./TrackingMap'), { ssr: false });

export default function MapWrapper(props: any) {
  return <TrackingMap {...props} />;
}
