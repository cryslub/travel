'use client'

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import CloseIcon from '@mui/icons-material/Close';
import { DestinationCardMap } from './destination-card-map';
import {
  MoreOptionsDestinationButton,
  EditTransportButton,
  EditAccommodationButton,
  CreateEventButton,
  CreateRecordButton,
  MoreOptionsRecordButton,
} from '@/app/journeys/[id]/destinations/destination-buttons';
import { EventItem } from '@/app/journeys/[id]/destinations/event-item';
import { AccommodationItem } from '@/app/journeys/[id]/destinations/accommodation-item';
import MovingIcon from '@mui/icons-material/Moving';
import FlightOutlinedIcon from '@mui/icons-material/FlightOutlined';
import TrainOutlinedIcon from '@mui/icons-material/TrainOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import DirectionsBoatOutlinedIcon from '@mui/icons-material/DirectionsBoatOutlined';
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import { SvgIconProps } from '@mui/material';
import { ElementType } from 'react';
import { MemoIcon } from '@/app/ui/memo-icon';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const destinationIconPath = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

function createDestinationIcon() {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50%;background:#6366f1;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="${destinationIconPath}"/></svg></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}


const recordIcons: Record<string, ElementType<SvgIconProps>> = {
  Video: SmartDisplayOutlinedIcon,
  Blog: ArticleOutlinedIcon,
  Etc: NoteOutlinedIcon,
};

const transportIcons: Record<string, ElementType<SvgIconProps>> = {
  Flight: FlightOutlinedIcon,
  Train: TrainOutlinedIcon,
  Bus: DirectionsBusOutlinedIcon,
  Car: DirectionsCarOutlinedIcon,
  Ferry: DirectionsBoatOutlinedIcon,
  Combined: MovingIcon,
};

export type ModalDest = {
  id: string;
  name: string;
  lat: number | null;
  lon: number | null;
  journey_id: string;
  start_date: string | null;
  section_name: string | null;
  image_url: string | null;
  price?: number | null;
  price_currency?: string | null;
  transport: {
    type: string | null;
    start_time: string | null;
    end_time: string | null;
    start_terminal: string | null;
    end_terminal: string | null;
    link: string | null;
    memo: string | null;
    start_latitude: number | null;
    start_longitude: number | null;
    end_latitude: number | null;
    end_longitude: number | null;
    price: number | null;
    price_currency: string | null;
  } | null;
  accommodation: {
    name: string | null;
    check_in: string | null;
    check_out: string | null;
    link: string | null;
    image_url: string | null;
    memo: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  events: { id: string; name: string | null; type: string | null; start_time: string | null; end_time: string | null; link: string | null; image_url: string | null; memo: string | null; latitude: number | null; longitude: number | null }[];
  records: { id: string; name: string; type: string | null; link: string | null; memo: string | null }[];
};

export type MapDest = ModalDest & { lat: number; lon: number };

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjI3NmM3NzYyNTY4YTQzM2JhNGE0ODU0OWQxNmUxNmRhIiwiaCI6Im11cm11cjY0In0=';
const ORS_ROUTED_TYPES = new Set(['Car', 'Bus', 'Train', 'Combined']);
const TRANSPORT_LINE_COLORS: Record<string, string> = {
  Flight: '#8b5cf6',
  Train: '#ef4444',
  Bus: '#22c55e',
  Car: '#3b82f6',
  Ferry: '#06b6d4',
  Combined: '#f59e0b',
};

function TransportLines({ destinations, onSelect }: { destinations: MapDest[]; onSelect: (d: MapDest, prevName: string | null) => void }) {
  const map = useMap();
  useEffect(() => {
    let cancelled = false;
    const layers: L.Layer[] = [];
    const controllers: AbortController[] = [];

    function addLine(coords: [number, number][], dashed: boolean, color: string, dest: MapDest, prevName: string | null) {
      if (cancelled) return;
      const line = L.polyline(coords, { color, weight: 6, opacity: 0.5, dashArray: dashed ? '8 6' : undefined });
      line.on('click', () => onSelect(dest, prevName));
      line.addTo(map);
      layers.push(line);
    }

    async function drawTransport(dest: MapDest, prevName: string | null, controller: AbortController) {
      const t = dest.transport!;
      const { start_latitude: sLat, start_longitude: sLon, end_latitude: eLat, end_longitude: eLon, type } = t;
      if (sLat == null || sLon == null || eLat == null || eLon == null) return;
      const color = (type && TRANSPORT_LINE_COLORS[type]) || '#f97316';
      const straight: [number, number][] = [[sLat, sLon], [eLat, eLon]];

      if (type && ORS_ROUTED_TYPES.has(type)) {
        try {
          const res = await fetch(
            `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${sLon},${sLat}&end=${eLon},${eLat}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error('ors');
          const data = await res.json();
          const coords: [number, number][] = data.features[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
          addLine(coords, false, color, dest, prevName);
        } catch (e) {
          if ((e as Error).name !== 'AbortError') addLine(straight, true, color, dest, prevName);
        }
      } else {
        addLine(straight, true, color, dest, prevName);
      }
    }

    destinations.forEach((d, i) => {
      if (!d.transport) return;
      const prevName = i > 0 ? destinations[i - 1].name : null;
      const controller = new AbortController();
      controllers.push(controller);
      drawTransport(d, prevName, controller);
    });

    return () => {
      cancelled = true;
      layers.forEach((l) => map.removeLayer(l));
      controllers.forEach((c) => c.abort());
    };
  }, [map, destinations]);
  return null;
}

function ClusteredMarkers({ destinations, onSelect }: { destinations: MapDest[]; onSelect: (d: MapDest, next: MapDest | null) => void }) {
  const map = useMap();
  useEffect(() => {
    const cluster = (L as any).markerClusterGroup({ maxClusterRadius: 20 });
    destinations.forEach((d, i) => {
      const next = destinations[i + 1] ?? null;
      L.marker([d.lat, d.lon], { icon: createDestinationIcon() }).on('click', () => onSelect(d, next)).addTo(cluster);
    });
    map.addLayer(cluster);
    return () => { map.removeLayer(cluster); };
  }, [map, destinations, onSelect]);
  return null;
}

function ZoomControls() {
  const map = useMap();
  const btnCls = 'flex items-center justify-center rounded bg-white p-2 shadow hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700';
  return (
    <div className="absolute top-2 left-2 z-[1000] flex flex-col gap-1">
      <button type="button" title="Zoom in" className={btnCls} onClick={() => map.zoomIn()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
      <button type="button" title="Zoom out" className={btnCls} onClick={() => map.zoomOut()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
      </button>
    </div>
  );
}

function InvalidateSize({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) { map.setView(points[0], 10); return; }
    map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
  }, [map, points]);
  return null;
}

export function DestinationModal({ dest, nextDest, onClose }: { dest: ModalDest; nextDest: ModalDest | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 mx-4 flex w-full max-w-sm flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800 max-h-[80vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-700">
          <div className="flex flex-col">
            {dest.start_date && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(dest.start_date).toLocaleDateString()}</span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{dest.name}</span>
              {dest.section_name && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{dest.section_name}</span>
              )}
            </div>
            {dest.price != null && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat('en', { style: 'currency', currency: dest.price_currency ?? 'USD' }).format(dest.price)}
              </span>
            )}
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-1">
            <MoreOptionsDestinationButton journeyId={dest.journey_id} id={dest.id} />
            <button
              type="button"
              onMouseDown={onClose}
              className="rounded-full p-1.5 text-sm text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-700"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          {dest.image_url && (
            <img src={dest.image_url} alt="" className="w-full rounded-lg object-cover max-h-48" />
          )}
          <div className="py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Transport</span>
              <EditTransportButton journeyId={dest.journey_id} destinationId={dest.id} />
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {dest.transport?.type && (() => {
                const Icon = transportIcons[dest.transport!.type!];
                const label = dest.transport!.link
                  ? <a href={dest.transport!.link} target="_blank" rel="noopener noreferrer" title="External link" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{dest.transport!.type}</a>
                  : <span className="font-medium text-zinc-700 dark:text-zinc-300">{dest.transport!.type}</span>;
                return <div className="flex items-center gap-2">{Icon && <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>}{label}{dest.transport!.memo && <MemoIcon memo={dest.transport!.memo} />}</div>;
              })()}
              <div className="flex gap-3 text-zinc-500 dark:text-zinc-400">
                {dest.transport?.start_time && <span>{dest.transport.start_time.split('T')[1]?.slice(0, 5) ?? dest.transport.start_time.slice(0, 5)}</span>}
                {dest.transport?.start_time && dest.transport?.end_time && <span>~</span>}
                {dest.transport?.end_time && <span>{dest.transport.end_time.split('T')[1]?.slice(0, 5) ?? dest.transport.end_time.slice(0, 5)}</span>}
                {dest.transport?.start_time && dest.transport?.end_time && (() => {
                  const diff = (new Date(dest.transport!.end_time!).getTime() - new Date(dest.transport!.start_time!).getTime()) / 60000;
                  const h = Math.floor(Math.abs(diff) / 60);
                  const m = Math.abs(diff) % 60;
                  return <span>· {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}</span>;
                })()}
              </div>
              {(dest.transport?.start_terminal || dest.transport?.end_terminal) && (
                <div className="mt-1 flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {dest.transport!.start_terminal && <span>{dest.transport!.start_terminal}</span>}
                  {dest.transport!.start_terminal && dest.transport!.end_terminal && <span>→</span>}
                  {dest.transport!.end_terminal && <span>{dest.transport!.end_terminal}</span>}
                </div>
              )}
              {dest.transport?.price != null && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('en', { style: 'currency', currency: dest.transport.price_currency ?? 'USD' }).format(dest.transport.price)}
                </span>
              )}
            </div>
          </div>

          <div className="py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Accommodation</span>
              <EditAccommodationButton journeyId={dest.journey_id} destinationId={dest.id} />
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {dest.accommodation && <AccommodationItem accommodation={dest.accommodation} />}
            </div>
          </div>

          <div className="py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Events</span>
              <CreateEventButton journeyId={dest.journey_id} destinationId={dest.id} />
            </div>
            <div className="mt-2 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700">
              {dest.events.map((activity) => (
                <EventItem key={activity.id} activity={activity} journeyId={dest.journey_id} destinationId={dest.id} />
              ))}
            </div>
          </div>

          {dest.lat != null && dest.lon != null && (
            <DestinationCardMap
              lat={dest.lat}
              lon={dest.lon}
              eventMarkers={dest.events.filter((e) => e.latitude != null && e.longitude != null).map((e) => ({ lat: e.latitude!, lon: e.longitude!, name: e.name, type: e.type, image_url: e.image_url }))}
              accommodationMarker={dest.accommodation?.latitude != null && dest.accommodation?.longitude != null ? { lat: dest.accommodation.latitude, lon: dest.accommodation.longitude, name: dest.accommodation.name, image_url: dest.accommodation.image_url } : null}
              transportEndMarker={dest.transport?.end_latitude != null && dest.transport?.end_longitude != null ? { lat: dest.transport.end_latitude, lon: dest.transport.end_longitude, name: dest.transport.end_terminal ?? null, type: dest.transport.type } : null}
              transportStartMarker={nextDest?.transport?.start_latitude != null && nextDest?.transport?.start_longitude != null ? { lat: nextDest.transport.start_latitude, lon: nextDest.transport.start_longitude, name: nextDest.transport.start_terminal ?? null, type: nextDest.transport.type } : null}
            />
          )}

          <div className="py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Records</span>
              <CreateRecordButton journeyId={dest.journey_id} destinationId={dest.id} />
            </div>
            <div className="mt-2 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700">
              {dest.records.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-1 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      {(() => { const Icon = (record.type && recordIcons[record.type]) || NoteOutlinedIcon; return <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>; })()}
                      {record.link
                        ? <a href={record.link} target="_blank" rel="noopener noreferrer" title="External link" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{record.name}</a>
                        : <span className="font-medium text-zinc-700 dark:text-zinc-300">{record.name}</span>}
                    </div>
                    {record.memo && <span className="text-xs text-zinc-500 dark:text-zinc-400">{record.memo}</span>}
                  </div>
                  <MoreOptionsRecordButton journeyId={dest.journey_id} destinationId={dest.id} recordId={record.id} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransportModal({ dest, prevDestName, onClose }: { dest: MapDest; prevDestName: string | null; onClose: () => void }) {
  const t = dest.transport!;
  const Icon = t.type ? transportIcons[t.type] : null;
  const color = (t.type && TRANSPORT_LINE_COLORS[t.type]) || '#f97316';
  const title = prevDestName ? `${prevDestName} → ${dest.name}` : dest.name;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 mx-4 mb-4 sm:mb-0 w-full max-w-sm rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: color }}>
                <Icon style={{ fontSize: 16 }} className="text-white" />
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.type ?? 'Transport'}
                {dest.start_date && <span className="ml-1.5">· {new Date(dest.start_date).toLocaleDateString()}</span>}
              </p>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <EditTransportButton journeyId={dest.journey_id} destinationId={dest.id} />
            <button
              type="button"
              onMouseDown={onClose}
              className="rounded-full p-1.5 text-sm text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-700"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 py-3 text-sm">
          {(t.start_time || t.end_time) && (
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              {t.start_time && <span>{t.start_time.split('T')[1]?.slice(0, 5) ?? t.start_time.slice(0, 5)}</span>}
              {t.start_time && t.end_time && <span>→</span>}
              {t.end_time && <span>{t.end_time.split('T')[1]?.slice(0, 5) ?? t.end_time.slice(0, 5)}</span>}
              {t.start_time && t.end_time && (() => {
                const diff = (new Date(t.end_time!).getTime() - new Date(t.start_time!).getTime()) / 60000;
                const h = Math.floor(Math.abs(diff) / 60);
                const m = Math.abs(diff) % 60;
                return <span className="text-zinc-400">· {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}</span>;
              })()}
            </div>
          )}
          {(t.start_terminal || t.end_terminal) && (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
              {t.start_terminal && <span>{t.start_terminal}</span>}
              {t.start_terminal && t.end_terminal && <span>→</span>}
              {t.end_terminal && <span>{t.end_terminal}</span>}
            </div>
          )}
          {t.link && (
            <a href={t.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline dark:text-blue-400 truncate">
              {t.link}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function DestinationsMap({ destinations, className }: { destinations: MapDest[]; className?: string }) {
  const [selected, setSelected] = useState<{ dest: MapDest; nextDest: MapDest | null } | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<{ dest: MapDest; prevDestName: string | null } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  if (destinations.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 ${className ?? 'h-64'}`}>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">No destinations with location data.</span>
      </div>
    );
  }

  const points = useMemo<[number, number][]>(() => destinations.map((d) => [d.lat, d.lon]), [destinations]);

  return (
    <>
      <div
        className="relative"
        style={isFullscreen ? { position: 'fixed', inset: 0, zIndex: 9998, overflow: 'hidden' } : { height: '100%' }}
      >
        <MapContainer
          center={points[0]}
          zoom={5}
          zoomControl={false}
          style={{ height: '100%' }}
          className={`rounded-lg border border-zinc-200 dark:border-zinc-700 ${isFullscreen ? '' : (className ?? 'h-[500px]')}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <TransportLines destinations={destinations} onSelect={(d, prevName) => setSelectedTransport({ dest: d, prevDestName: prevName })} />
          <ClusteredMarkers destinations={destinations} onSelect={(d, next) => setSelected({ dest: d, nextDest: next })} />
          <FitBounds points={points} />
          <InvalidateSize trigger={isFullscreen} />
          <ZoomControls />
        </MapContainer>
        <button
          type="button"
          onClick={() => setIsFullscreen(v => !v)}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="absolute top-2 right-2 z-[1000] rounded bg-white p-2 shadow hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          )}
        </button>
      </div>
      {selected && <DestinationModal dest={selected.dest} nextDest={selected.nextDest} onClose={() => setSelected(null)} />}
      {selectedTransport?.dest.transport && <TransportModal dest={selectedTransport.dest} prevDestName={selectedTransport.prevDestName} onClose={() => setSelectedTransport(null)} />}
    </>
  );
}
