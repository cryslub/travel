import { fetchDestinationsByJourneyId, fetchJourneys, fetchSectionsByJourneyId } from '@/app/lib/data';
import { SectionFilter } from './section-filter';
import { MoreOptionsDestinationButton, EditTransportButton, EditAccommodationButton, CreateEventButton, MoreOptionsEventButton, CreateRecordButton, MoreOptionsRecordButton } from './destination-buttons';
import { BackToJourneysButton, CreateDestinationForJourneyButton, ViewToggle } from './journey-destination-buttons';
import { DestinationsMapClient, type MapDest } from '@/app/ui/destinations-map-client';
import { SummaryList } from './summary-list';
import { DestinationsCalendarClient, type CalendarDest } from '@/app/ui/destinations-calendar-client';
import { DestinationCardMap } from '@/app/ui/destination-card-map';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import TourOutlinedIcon from '@mui/icons-material/TourOutlined';
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
import { notFound } from 'next/navigation';

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

const transportIcons: Record<string, ElementType<SvgIconProps>> = {
  Flight: FlightOutlinedIcon,
  Train: TrainOutlinedIcon,
  Bus: DirectionsBusOutlinedIcon,
  Car: DirectionsCarOutlinedIcon,
  Ferry: DirectionsBoatOutlinedIcon,
  Combined: MovingIcon,
};

export default async function JourneyDestinationsPage(props: PageProps<'/journeys/[id]/destinations'>) {
  const { id } = await props.params;
  const { section: sectionFilter, view: viewParam } = await props.searchParams;
  const viewStr = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  const currentView = viewStr === 'map' ? 'map' : viewStr === 'calendar' ? 'calendar' : viewStr === 'cards' ? 'cards' : 'summary';
  const journeys = await fetchJourneys();
  const journey = journeys.find((j) => j.id === id);

  if (!journey) notFound();

  const [allDestinations, sections] = await Promise.all([
    fetchDestinationsByJourneyId(id),
    fetchSectionsByJourneyId(id),
  ]);

  const destinations = sectionFilter
    ? allDestinations.filter((d) => d.section_id === sectionFilter)
    : allDestinations;

  return (
    <main className={`w-full px-4 bg-zinc-100 dark:bg-zinc-900 ${currentView === 'map' ? 'h-screen flex flex-col pt-6' : 'pt-6 pb-12 min-h-screen'}`}>
      <div className="w-full mb-4">
        <div className="flex items-center justify-between mb-3">
          <BackToJourneysButton />
          <div className="flex gap-2">
            <ViewToggle journeyId={id} currentView={currentView} currentSection={Array.isArray(sectionFilter) ? sectionFilter[0] : sectionFilter} />
            <CreateDestinationForJourneyButton journeyId={id} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
        </div>
      </div>
      <SectionFilter sections={sections} journeyId={id} />
      {currentView === 'calendar' && (
        <DestinationsCalendarClient
          destinations={destinations.map((d): CalendarDest => ({
            id: d.id,
            name: d.name,
            start_date: d.start_date,
            section_name: d.section_name,
            journey_id: id,
            lat: d.latitude ?? null,
            lon: d.longitude ?? null,
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
            } : null,
            accommodation: d.accommodation ? {
              name: d.accommodation.name,
              check_in: d.accommodation.check_in,
              check_out: d.accommodation.check_out,
              link: d.accommodation.link,
              image_url: d.accommodation.image_url,
              latitude: d.accommodation.latitude,
              longitude: d.accommodation.longitude,
            } : null,
            events: d.events.map((e) => ({
              id: e.id,
              name: e.name,
              type: e.type,
              start_time: e.start_time,
              end_time: e.end_time,
              link: e.link,
              image_url: e.image_url,
              latitude: e.latitude ?? null,
              longitude: e.longitude ?? null,
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
            transport: d.transport,
            accommodation: d.accommodation,
            events: d.events,
            records: d.records,
          }));
        return (
          <div className="flex-1 min-h-0 pb-4">
            <DestinationsMapClient destinations={mapDestinations} className="h-full" />
          </div>
        );
      })()}
      {currentView === 'summary' && (
        <SummaryList
          journeyId={id}
          destinations={destinations.map((d) => ({
            id: d.id,
            name: d.name,
            lat: d.latitude ?? null,
            lon: d.longitude ?? null,
            journey_id: id,
            start_date: d.start_date,
            section_name: d.section_name,
            image_url: d.image_url,
            transport: d.transport,
            accommodation: d.accommodation,
            events: d.events,
            records: d.records,
          }))}
        />
      )}
      <div className={`flex justify-center ${currentView !== 'cards' ? 'hidden' : ''}`}>
      <ul className="flex flex-row flex-wrap gap-4">
        {destinations.map((destination, index) => (
          <li key={destination.id} className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800 min-w-[350px] max-w-[350px]">
            <div className="flex items-start justify-between">
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
              </div>
              <MoreOptionsDestinationButton journeyId={id} id={destination.id} />
            </div>
            {destination.image_url && (
              <img src={destination.image_url} alt="" className="w-full rounded-lg object-cover max-h-48" />
            )}
            <div className="rounded-md bg-zinc-50 py-3 text-sm dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Transport</span>
                <EditTransportButton journeyId={id} destinationId={destination.id} />
              </div>
              <div className="flex flex-col gap-1 mt-2">
                {destination.transport?.type && (() => {
                  const Icon = transportIcons[destination.transport!.type!];
                  const label = destination.transport!.link
                    ? <a href={destination.transport!.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{destination.transport!.type}</a>
                    : <span className="font-medium text-zinc-700 dark:text-zinc-300">{destination.transport!.type}</span>;
                  return (
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 flex-shrink-0">
                          <Icon style={{ fontSize: 16 }} className="text-white" />
                        </div>
                      )}
                      {label}
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
                    {destination.transport.start_terminal && <span>{destination.transport.start_terminal}</span>}
                    {destination.transport.start_terminal && destination.transport.end_terminal && <span>→</span>}
                    {destination.transport.end_terminal && <span>{destination.transport.end_terminal}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-md bg-zinc-50 py-3 text-sm dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Accommodation</span>
                <EditAccommodationButton journeyId={id} destinationId={destination.id} />
              </div>
              <div className="flex flex-col gap-1 mt-2">
                {destination.accommodation?.name && (
                  <div className="flex items-center gap-2">
                    {destination.accommodation!.image_url
                      ? <img src={destination.accommodation!.image_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                      : <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 flex-shrink-0"><HotelOutlinedIcon style={{ fontSize: 16 }} className="text-white" /></div>}
                    <div className="flex flex-col gap-0.5">
                      {destination.accommodation.link
                        ? <a href={destination.accommodation.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{destination.accommodation.name}</a>
                        : <span className="font-medium text-zinc-700 dark:text-zinc-300">{destination.accommodation.name}</span>}
                      {(destination.accommodation.check_in || destination.accommodation.check_out) && (
                        <div className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                          {destination.accommodation.check_in && <span>Check-in: {new Date(`1970-01-01T${destination.accommodation.check_in}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                          {destination.accommodation.check_out && <span>Check-out: {new Date(`1970-01-01T${destination.accommodation.check_out}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-md bg-zinc-50 py-3 text-sm dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Events</span>
                <CreateEventButton journeyId={id} destinationId={destination.id} />
              </div>
              <div className="flex flex-col mt-2 divide-y divide-zinc-200 dark:divide-zinc-700">
                {destination.events.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between gap-1 py-1.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {activity.image_url
                          ? <img src={activity.image_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                          : (() => { const Icon = (activity.type && eventIcons[activity.type]) || StarBorderOutlinedIcon; return <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>; })()}
                        <div className="flex flex-col gap-0.5">
                          {activity.link
                            ? <a href={activity.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{activity.name}</a>
                            : <span className="font-medium text-zinc-700 dark:text-zinc-300">{activity.name}</span>
                          }
                          {(activity.start_time || activity.end_time) && (
                            <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                              {activity.start_time && <span>{(() => { const d = new Date(activity.start_time!); return `${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })()}</span>}
                              {activity.start_time && activity.end_time && <span>~</span>}
                              {activity.end_time && <span>{(() => { const d = new Date(activity.end_time!); return `${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })()}</span>}
                              {activity.start_time && activity.end_time && (() => {
                                const diff = (new Date(activity.end_time!).getTime() - new Date(activity.start_time!).getTime()) / 60000;
                                const h = Math.floor(Math.abs(diff) / 60);
                                const m = Math.abs(diff) % 60;
                                return <span>· {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}</span>;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <MoreOptionsEventButton journeyId={id} destinationId={destination.id} eventId={activity.id} />
                  </div>
                ))}
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
            <div className="rounded-md bg-zinc-50 py-3 text-sm dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Records</span>
                <CreateRecordButton journeyId={id} destinationId={destination.id} />
              </div>
              <div className="flex flex-col mt-2 divide-y divide-zinc-200 dark:divide-zinc-700">
                {destination.records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-1 py-1.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {(() => { const Icon = (record.type && recordIcons[record.type]) || NoteOutlinedIcon; return <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 flex-shrink-0"><Icon style={{ fontSize: 16 }} className="text-white" /></div>; })()}
                        {record.link
                          ? <a href={record.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{record.name}</a>
                          : <span className="font-medium text-zinc-700 dark:text-zinc-300">{record.name}</span>
                        }
                      </div>
                      {record.memo && <span className="text-xs text-zinc-500 dark:text-zinc-400">{record.memo}</span>}
                    </div>
                    <MoreOptionsRecordButton journeyId={id} destinationId={destination.id} recordId={record.id} />
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </main>
  );
}
