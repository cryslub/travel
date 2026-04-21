import { fetchDestinationsByJourneyId, fetchJourneys, fetchSectionsByJourneyId } from '@/app/lib/data';
import { SectionFilter } from './section-filter';
import { MoreOptionsDestinationButton, EditTransportButton, EditAccommodationButton, CreateEventButton, MoreOptionsEventButton, CreateRecordButton, MoreOptionsRecordButton } from './destination-buttons';
import { BackToJourneysButton, CreateDestinationForJourneyButton } from './journey-destination-buttons';
import HotelIcon from '@mui/icons-material/Hotel';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TourIcon from '@mui/icons-material/Tour';
import MovingIcon from '@mui/icons-material/Moving';
import FlightIcon from '@mui/icons-material/Flight';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import ArticleIcon from '@mui/icons-material/Article';
import NoteIcon from '@mui/icons-material/Note';
import { SvgIconProps } from '@mui/material';
import { ElementType } from 'react';
import { notFound } from 'next/navigation';

const eventIcons: Record<string, ElementType<SvgIconProps>> = {
  Site: LocationOnIcon,
  Meal: RestaurantIcon,
  Tour: TourIcon,
  Activity: LocalActivityIcon,
  Transfer: MovingIcon,
};

const recordIcons: Record<string, ElementType<SvgIconProps>> = {
  Video: SmartDisplayIcon,
  Blog: ArticleIcon,
  Etc: NoteIcon,
};

const transportIcons: Record<string, ElementType<SvgIconProps>> = {
  Flight: FlightIcon,
  Train: TrainIcon,
  Bus: DirectionsBusIcon,
  Car: DirectionsCarIcon,
  Ferry: DirectionsBoatIcon,
};

export default async function JourneyDestinationsPage(props: PageProps<'/journeys/[id]/destinations'>) {
  const { id } = await props.params;
  const { section: sectionFilter } = await props.searchParams;
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
    <main className="w-full px-4 py-12 min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{journey.name}</span>
          <h1 className="text-3xl font-semibold">Destinations</h1>
        </div>
        <div className="flex gap-2">
          <BackToJourneysButton />
          <CreateDestinationForJourneyButton journeyId={id} />
        </div>
      </div>
      <SectionFilter sections={sections} journeyId={id} />
      <div className="flex justify-center">
      <ul className="flex flex-row flex-wrap gap-4">
        {destinations.map((destination) => (
          <li key={destination.id} className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800 min-w-[350px] max-w-[350px]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {(destination.start_date || destination.section_name) && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {destination.start_date && <span>{new Date(destination.start_date).toLocaleDateString()}</span>}
                    {destination.section_name && <span>{destination.section_name}</span>}
                  </div>
                )}
                <span className="text-lg font-medium">{destination.name}</span>
              </div>
              <div className="flex gap-2">
                <MoreOptionsDestinationButton journeyId={id} id={destination.id} />
              </div>
            </div>
            <div className="rounded-md bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800">
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
                    <div className="flex items-center gap-1">
                      {Icon && <Icon fontSize="small" className="text-zinc-500 dark:text-zinc-400" />}
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
            <div className="rounded-md bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Accommodation</span>
                <EditAccommodationButton journeyId={id} destinationId={destination.id} />
              </div>
              <div className="flex flex-col gap-1 mt-2">
                {destination.accommodation?.name && (
                  <div className="flex items-center gap-1">
                    <HotelIcon fontSize="small" className="text-zinc-500 dark:text-zinc-400" />
                    {destination.accommodation.link
                      ? <a href={destination.accommodation.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{destination.accommodation.name}</a>
                      : <span className="font-medium text-zinc-700 dark:text-zinc-300">{destination.accommodation.name}</span>
                    }
                  </div>
                )}
                <div className="flex gap-4 text-zinc-500 dark:text-zinc-400">
                  {destination.accommodation?.check_in && <span>Check-in: {new Date(`1970-01-01T${destination.accommodation.check_in}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                  {destination.accommodation?.check_out && <span>Check-out: {new Date(`1970-01-01T${destination.accommodation.check_out}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                </div>
              </div>
            </div>
            <div className="rounded-md bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Events</span>
                <CreateEventButton journeyId={id} destinationId={destination.id} />
              </div>
              <div className="flex flex-col mt-2 divide-y divide-zinc-200 dark:divide-zinc-700">
                {destination.events.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between gap-1 py-1.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        {(() => { const Icon = (activity.type && eventIcons[activity.type]) || LocalActivityIcon; return <Icon fontSize="small" className="text-zinc-500 dark:text-zinc-400" />; })()}
                        {activity.link
                          ? <a href={activity.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">{activity.name}</a>
                          : <span className="font-medium text-zinc-700 dark:text-zinc-300">{activity.name}</span>
                        }
                      </div>
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
                    </div>
                    <MoreOptionsEventButton journeyId={id} destinationId={destination.id} eventId={activity.id} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Records</span>
                <CreateRecordButton journeyId={id} destinationId={destination.id} />
              </div>
              <div className="flex flex-col mt-2 divide-y divide-zinc-200 dark:divide-zinc-700">
                {destination.records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-1 py-1.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {(() => { const Icon = (record.type && recordIcons[record.type]) || NoteIcon; return <Icon fontSize="small" className="text-zinc-500 dark:text-zinc-400" />; })()}
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
