'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  height?: string;
  className?: string;
}

// Define a type for the Leaflet map with tap property
interface ExtendedMap extends L.Map {
  tap?: {
    disable: () => void;
  };
}

// Extend MapContainer props to include tap
interface ExtendedMapContainerProps extends L.MapOptions {
  tap?: boolean;
}

const ScrollZoomController = () => {
  const map = useMap() as ExtendedMap;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    // Disable dragging on mobile
    if (window.innerWidth < 768) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) {
        map.tap.disable();
      }
    }

    const handleScroll = () => {
      const mapElement = map.getContainer();
      const rect = mapElement.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter) / window.innerHeight;
      const newZoom = 14 + ((1 - distanceFromCenter) * 4);

      map.setZoom(Math.min(Math.max(newZoom, 14), 18), {
        animate: true,
        duration: 0.5
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [map, isMounted]);

  return null;
};

const Map: React.FC<MapProps> = ({ height = '150px', className = '' }) => {
  const targetLocation: [number, number] = [6.456559134970387, 3.3842979366622847];
  const [mapIcon, setMapIcon] = useState<L.Icon | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const icon = new L.Icon({
      iconUrl: '/icons/marker-icon.png',
      iconRetinaUrl: '/icons/marker-icon-2x.png',
      shadowUrl: '/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      shadowAnchor: [12, 41],
      className: 'marker-bounce'
    });

    setMapIcon(icon);
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ height, width: '100%', position: 'relative', zIndex: 0 }} className={className}>
      <MapContainer
        center={targetLocation}
        zoom={15}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '15px',
          zIndex: 0,
        }}
        zoomControl={!isMobile}
        scrollWheelZoom={!isMobile}
        dragging={!isMobile}
        touchZoom={!isMobile}
        doubleClickZoom={!isMobile}
        boxZoom={!isMobile}
        keyboard={!isMobile}
        {...({ tap: !isMobile } as ExtendedMapContainerProps)} // Type assertion for tap property
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
        />
        {mapIcon && <Marker position={targetLocation} icon={mapIcon} />}
        <ScrollZoomController />
      </MapContainer>
      <style jsx global>{`
        .leaflet-container {
          cursor: ${isMobile ? 'default' : 'grab'} !important;
        }
        .leaflet-container:active {
          cursor: ${isMobile ? 'default' : 'grabbing'} !important;
        }
      `}</style>
    </div>
  );
};


export default Map;

