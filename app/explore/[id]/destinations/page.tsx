import { fetchDestinationsByJourneyId, fetchJourneyById, fetchSectionsByJourneyId, fetchUserPreferences } from '@/app/lib/data';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ReadonlyDestinationsView } from './readonly-view';
import { ViewToggle } from './view-toggle';
import { SectionTabs } from './section-tabs';
import { DestinationsMapClient, type MapDest } from '@/app/ui/destinations-map-client';
import { DestinationsCalendarClient, type CalendarDest } from '@/app/ui/destinations-calendar-client';
import { AccommodationItem } from '@/app/journeys/[id]/destinations/accommodation-item';
import { DestinationCardMap } from '@/app/ui/destination-card-map';
import { MemoIcon } from '@/app/ui/memo-icon';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MovingIcon from '@mui/icons-material/Moving';
import FlightOutlinedIcon from '@mui/icons-material/FlightOutlined';
import TrainOutlinedIcon from '@mui/icons-material/TrainOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import DirectionsBoatOutlinedIcon from '@mui/icons-material/DirectionsBoatOutlined';
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
import { SvgIconProps } from '@mui/material';
import { ElementType } from 'react';

const transportIcons: Record<string, ElementType<SvgIconProps>> = {
  Flight: FlightOutlinedIcon,
  Train: TrainOutlinedIcon,
  Bus: DirectionsBusOutlinedIcon,
  Car: DirectionsCarOutlinedIcon,
  Ferry: DirectionsBoatOutlinedIcon,
  Combined: MovingIcon,
};

const eventIcons: Record<string, ElementType<SvgIconProps>> = {
  Site: LocationOnOutlinedIcon,
  Meal: RestaurantOutlinedIcon,
  Tour: TourOutlinedIcon,
  Activity: StarBorderOutlinedIcon,
  Transfer: MovingIcon,
};

const recordIcons: Record<string, ElementType<SvgIconProps>> = {
  Video: SmartDisplayOutlinedIcon,
  Blog: ArticleOutlinedIcon,
  Etc: NoteOutlinedIcon,
};

export default async function ExploreDestinationsPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; section?: string }>;
}) {
  const { id } = await props.params;
  const { view: viewParam, section: sectionParam } = await props.searchParams;
  const viewStr = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  const currentView = viewStr === 'map' ? 'map' : viewStr === 'calendar' ? 'calendar' : viewStr === 'cards' ? 'cards' : 'summary';
  const activeSection = Array.isArray(sectionParam) ? sectionParam[0] : sectionParam;

  const session = await getServerSession();
  if (!session?.user?.email) redirect('/');
  const signInType = (session.user as any)?.sign_in_type ?? 'Google';

  const journey = await fetchJourneyById(id);
  if (!journey) notFound();

  const [allDestinations, sections, prefs] = await Promise.all([
    fetchDestinationsByJourneyId(id),
    fetchSectionsByJourneyId(id),
    fetchUserPreferences(session.user.email, signInType),
  ]);
  const preferredCurrency = prefs?.currency ?? 'USD';

  let exchangeRates: Record<string, number> = { [preferredCurrency]: 1 };
  try {
    const ratesRes = await fetch(`https://api.frankfurter.app/latest?from=${preferredCurrency}`);
    if (ratesRes.ok) {
      const ratesData = await ratesRes.json();
      exchangeRates = { ...ratesData.rates, [preferredCurrency]: 1 };
    }
  } catch {}

  function convertAmount(amount: number | null | undefined, fromCurrency: string | null | undefined): number | null {
    if (amount == null) return null;
    const from = fromCurrency ?? preferredCurrency;
    if (from === preferredCurrency) return amount;
    const rate = exchangeRates[from];
    if (!rate) return amount;
    return amount / rate;
  }

  const destinations = (activeSection
    ? allDestinations.filter((d) => d.section_id === activeSection)
    : allDestinations
  ).map((d) => ({
    ...d,
    price: convertAmount(d.price, d.price_currency),
    price_currency: d.price != null ? preferredCurrency : d.price_currency,
  }));

  return (
    <main className={`w-full px-4 bg-zinc-100 dark:bg-zinc-900 ${currentView === 'map' ? 'h-[calc(100vh_-_57px)] flex flex-col pt-6 overflow-hidden' : 'pt-6 pb-12 min-h-[calc(100vh_-_57px)]'}`}>
      <div className="w-full mb-4">
        <div className="flex items-center justify-between mb-3">
          <a
            href="/explore"
            className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium leading-6 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            <ChevronLeftIcon fontSize="small" />
          </a>
          <Suspense>
            <ViewToggle journeyId={id} currentView={currentView} />
          </Suspense>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
        </div>
      </div>

      <Suspense>
        <SectionTabs sections={sections} currentSection={activeSection} />
      </Suspense>

      {currentView === 'summary' && (
        <Suspense>
          <ReadonlyDestinationsView destinations={destinations} preferredCurrency={preferredCurrency} />
        </Suspense>
      )}

      {currentView === 'map' && (() => {
        const mapDestinations: MapDest[] = destinations
          .filter((d) => d.latitude != null && d.longitude != null)
          .map((d) => ({
            id: d.id,
            name: d.name,
            lat: d.latitude!,
            lon: d.longitude!,
            journey_id: id,
            start_date: d.start_date,
            section_name: d.section_name,
            image_url: d.image_url,
            price: d.price ?? null,
            price_currency: d.price_currency ?? null,
            transport: d.transport,
            accommodation: d.accommodation,
            events: d.events,
            records: d.records,
          }));
        return (
          <div className="flex-1 min-h-0 pb-4">
            <DestinationsMapClient destinations={mapDestinations} className="h-full" preferredCurrency={preferredCurrency} />
          </div>
        );
      })()}

      {currentView === 'calendar' && (
        <DestinationsCalendarClient
          isReadonly
          preferredCurrency={preferredCurrency}
          destinations={destinations.map((d): CalendarDest => ({
            id: d.id,
            name: d.name,
            start_date: d.start_date,
            section_name: d.section_name,
            journey_id: id,
            lat: d.latitude ?? null,
            lon: d.longitude ?? null,
            price: d.price ?? null,
            price_currency: d.price_currency ?? null,
            transport: d.transport ? {
              type: d.transport.type,
              start_time: d.transport.start_time,
              end_time: d.transport.end_time,
              start_terminal: d.transport.start_terminal,
              end_terminal: d.transport.end_terminal,
              link: d.transport.link,
              start_latitude: d.transport.start_latitude,
              start_longitude: d.transport.start_longitude,
              end_latitude: d.transport.end_latitude,
              end_longitude: d.transport.end_longitude,
              memo: d.transport.memo,
              price: d.transport.price ?? null,
              price_currency: d.transport.price_currency ?? null,
            } : null,
            accommodation: d.accommodation ? {
              name: d.accommodation.name,
              check_in: d.accommodation.check_in,
              check_out: d.accommodation.check_out,
              link: d.accommodation.link,
              image_url: d.accommodation.image_url,
              memo: d.accommodation.memo,
              latitude: d.accommodation.latitude,
              longitude: d.accommodation.longitude,
              price: d.accommodation.price ?? null,
              price_currency: d.accommodation.price_currency ?? null,
            } : null,
            events: d.events.map((e) => ({
              id: e.id,
              name: e.name,
              type: e.type,
              start_time: e.start_time,
              end_time: e.end_time,
              link: e.link,
              image_url: e.image_url,
              memo: e.memo,
              latitude: e.latitude ?? null,
              longitude: e.longitude ?? null,
              price: e.price ?? null,
              price_currency: e.price_currency ?? null,
            })),
            records: d.records.map((r) => ({
              id: r.id,
              name: r.name,
              type: r.type,
              link: r.link,
              memo: r.memo,
            })),
            image_url: d.image_url,
          }))}
        />
      )}

      {currentView === 'cards' && (
        <div className="flex justify-center">
          <ul className="flex flex-row flex-wrap gap-4">
            {destinations.map((destination, index) => (
              <li key={destination.id} className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800 min-w-[350px] max-w-[350px]">
                <div className="flex flex-col">
                  {destination.start_date && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(destination.start_date).toLocaleDateString()}</span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{destination.name}</span>
                    {destination.section_name && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{destination.section_name}</span>
                    )}
                  </div>
                  {destination.price != null && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('en', { style: 'currency', currency: preferredCurrency ?? destination.price_currency ?? 'USD' }).format(destination.price)}
                    </span>
                  )}
                </div>
                {destination.image_url && (
                  <img src={destination.image_url} alt="" className="w-full rounded-lg object-cover max-h-48" />
                )}
                <div className="py-3 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Transport</span>
                  <div className="flex flex-col gap-1 mt-2">
                    {destination.transport?.type && (() => {
                      const Icon = transportIcons[destination.transport!.type!];
                      const label = destination.transport!.link
                        ? <a href={destination.transport!.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{destination.transport!.type}</a>
                        : <span className="font-medium text-zinc-700 dark:text-zinc-300">{destination.transport!.type}</span>;
                      return (
                        <div className="flex items-center gap-2">
                          {Icon && <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>}
                          {label}
                          {destination.transport!.memo && <MemoIcon memo={destination.transport!.memo} />}
                        </div>
                      );
                    })()}
                    <div className="flex gap-3 text-zinc-500 dark:text-zinc-400">
                      {destination.transport?.start_time && <span>{destination.transport.start_time.split('T')[1]?.slice(0, 5) ?? destination.transport.start_time.slice(0, 5)}</span>}
                      {destination.transport?.start_time && destination.transport?.end_time && <span>~</span>}
                      {destination.transport?.end_time && <span>{destination.transport.end_time.split('T')[1]?.slice(0, 5) ?? destination.transport.end_time.slice(0, 5)}</span>}
                      {destination.transport?.start_time && destination.transport?.end_time && (() => {
                        const start = new Date(destination.transport!.start_time!);
                        const end = new Date(destination.transport!.end_time!);
                        const diff = (end.getTime() - start.getTime()) / 60000;
                        const h = Math.floor(Math.abs(diff) / 60);
                        const m = Math.abs(diff) % 60;
                        return <span>· {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}</span>;
                      })()}
                    </div>
                    {(destination.transport?.start_terminal || destination.transport?.end_terminal) && (
                      <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {destination.transport!.start_terminal && <span>{destination.transport!.start_terminal}</span>}
                        {destination.transport!.start_terminal && destination.transport!.end_terminal && <span>→</span>}
                        {destination.transport!.end_terminal && <span>{destination.transport!.end_terminal}</span>}
                      </div>
                    )}
                    {destination.transport?.price != null && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat('en', { style: 'currency', currency: destination.transport.price_currency ?? 'USD' }).format(destination.transport.price)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="py-3 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Accommodation</span>
                  <div className="flex flex-col gap-1 mt-2">
                    {destination.accommodation && <AccommodationItem accommodation={destination.accommodation} />}
                  </div>
                </div>
                <div className="py-3 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Events</span>
                  <div className="flex flex-col mt-2 divide-y divide-zinc-200 dark:divide-zinc-700">
                    {destination.events.map((activity) => {
                      const Icon = (activity.type && eventIcons[activity.type]) || StarBorderOutlinedIcon;
                      return (
                        <div key={activity.id} className="flex items-center gap-2 py-1.5 flex-1 min-w-0">
                          {activity.image_url
                            ? <img src={activity.image_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                            : <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>
                          }
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-1">
                              {activity.link
                                ? <a href={activity.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{activity.name}</a>
                                : <span className="font-medium text-zinc-700 dark:text-zinc-300">{activity.name}</span>
                              }
                              {activity.memo && <MemoIcon memo={activity.memo} />}
                            </div>
                            {activity.price != null && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat('en', { style: 'currency', currency: activity.price_currency ?? 'USD' }).format(activity.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {destination.latitude != null && destination.longitude != null && (
                  <DestinationCardMap
                    lat={destination.latitude}
                    lon={destination.longitude}
                    eventMarkers={destination.events
                      .filter((e) => e.latitude != null && e.longitude != null)
                      .map((e) => ({ lat: e.latitude!, lon: e.longitude!, name: e.name, type: e.type, image_url: e.image_url }))}
                    accommodationMarker={
                      destination.accommodation?.latitude != null && destination.accommodation?.longitude != null
                        ? { lat: destination.accommodation.latitude, lon: destination.accommodation.longitude, name: destination.accommodation.name, image_url: destination.accommodation.image_url }
                        : null
                    }
                    transportEndMarker={
                      destination.transport?.end_latitude != null && destination.transport?.end_longitude != null
                        ? { lat: destination.transport.end_latitude, lon: destination.transport.end_longitude, name: destination.transport.end_terminal ?? null, type: destination.transport.type }
                        : null
                    }
                    transportStartMarker={(() => {
                      const next = destinations[index + 1];
                      return next?.transport?.start_latitude != null && next?.transport?.start_longitude != null
                        ? { lat: next.transport.start_latitude, lon: next.transport.start_longitude, name: next.transport.start_terminal ?? null, type: next.transport.type }
                        : null;
                    })()}
                  />
                )}
                <div className="py-3 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Records</span>
                  <div className="flex flex-col mt-2 divide-y divide-zinc-200 dark:divide-zinc-700">
                    {destination.records.map((record) => {
                      const Icon = (record.type && recordIcons[record.type]) || NoteOutlinedIcon;
                      return (
                        <div key={record.id} className="flex items-center gap-2 py-1.5">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 flex-shrink-0">
                            <Icon style={{ fontSize: 16 }} className="text-white" />
                          </div>
                          {record.link
                            ? <a href={record.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{record.name}</a>
                            : <span className="font-medium text-zinc-700 dark:text-zinc-300">{record.name}</span>
                          }
                          {record.memo && <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">{record.memo}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
