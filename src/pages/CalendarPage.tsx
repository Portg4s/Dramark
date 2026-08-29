import { CalendarDays, CheckCircle2, Clock3, Tv } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { MediaPoster } from '@/components/ui/MediaPoster';
import { type CalendarTimelineItem, useCalendarTimeline } from '@/features/calendar/hooks';
import { useLibraryMediaActions } from '@/features/library/hooks';
import { createEpisodeKey } from '@/features/media/tvProgress';
import { createMediaDetailPath } from '@/features/media/route';

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

function parseIsoDate(date: string) {
  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  const month = Number(monthText ?? 1);
  const day = Number(dayText ?? 1);

  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getCalendarDayLabel(airDate: string, now = new Date()) {
  const today = formatIsoDate(now);
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrow = formatIsoDate(tomorrowDate);

  if (airDate === today) {
    return "Aujourd'hui";
  }

  if (airDate === tomorrow) {
    return 'Demain';
  }

  return capitalize(dayFormatter.format(parseIsoDate(airDate)));
}

function groupTimelineItems(items: CalendarTimelineItem[]) {
  return items.reduce<Array<{ label: string; items: CalendarTimelineItem[] }>>((groups, item) => {
    const label = getCalendarDayLabel(item.airDate);
    const existingGroup = groups.find((group) => group.label === label);

    if (existingGroup) {
      existingGroup.items.push(item);
      return groups;
    }

    return [...groups, { label, items: [item] }];
  }, []);
}

function isEpisodeAvailable(airDate: string, now = new Date()) {
  return airDate <= formatIsoDate(now);
}

function CalendarItemCard({
  item,
  isBusy,
  onMarkWatched
}: {
  item: CalendarTimelineItem;
  isBusy: boolean;
  onMarkWatched: (item: CalendarTimelineItem) => void;
}) {
  const episodeKey = createEpisodeKey(item.seasonNumber, item.episodeNumber);
  const canMarkWatched = isEpisodeAvailable(item.airDate);
  const isAlreadyWatched = item.watchedEpisodes.includes(episodeKey);

  return (
    <article className="grid grid-cols-[5rem_1fr] gap-4 rounded-[1.3rem] bg-surface/72 p-2.5 shadow-panel">
      <NavLink
        to={createMediaDetailPath(item.mediaType, item.tmdbId)}
        className="focus-ring rounded-[1rem]"
        aria-label={`Ouvrir ${item.title}`}
      >
        <MediaPoster
          title={item.title}
          posterPath={item.posterPath}
          size="w185"
          className="rounded-[1rem]"
        />
      </NavLink>
      <div className="flex min-w-0 flex-col justify-center py-1 pr-1">
        <NavLink
          to={createMediaDetailPath(item.mediaType, item.tmdbId)}
          className="focus-ring min-w-0 rounded-lg"
        >
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-normal text-brand-soft">
            <Tv aria-hidden="true" className="size-3.5" />
            {item.episodeCode}
          </div>
          <h3 className="line-clamp-2 text-base font-black leading-5 text-white">{item.title}</h3>
          {item.episodeName ? (
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-muted">
              {item.episodeName}
            </p>
          ) : null}
        </NavLink>
        <div className="mt-3 flex items-center justify-between gap-2">
          {item.providerLabel ? (
            <p className="min-w-0 truncate text-xs font-semibold text-subtle">
              {item.providerLabel}
            </p>
          ) : (
            <span />
          )}
          {isAlreadyWatched ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/8 px-3 py-2 text-xs font-bold text-brand-soft">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Vu
            </span>
          ) : canMarkWatched ? (
            <button
              type="button"
              aria-label={`Marquer ${item.title} ${item.episodeCode} vu`}
              disabled={isBusy}
              onClick={() => onMarkWatched(item)}
              className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 py-2 text-xs font-black text-[var(--color-night)] shadow-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Marquer vu
            </button>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/8 px-3 py-2 text-xs font-bold text-subtle">
              <Clock3 aria-hidden="true" className="size-3.5" />A venir
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function CalendarPage() {
  const timeline = useCalendarTimeline();
  const libraryActions = useLibraryMediaActions();
  const groups = groupTimelineItems(timeline.items);

  function markTimelineItemWatched(item: CalendarTimelineItem) {
    const episodeKey = createEpisodeKey(item.seasonNumber, item.episodeNumber);
    const watchedEpisodes = Array.from(new Set([...item.watchedEpisodes, episodeKey]));

    libraryActions.setTvProgressForMedia(item.media, item.seasons, watchedEpisodes);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-brand-soft">Planning</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-white">Calendrier</h1>
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-surface/72 text-brand-soft"
          >
            <CalendarDays className="size-5" />
          </span>
        </div>
      </header>

      {timeline.isLoading ? (
        <div role="status" className="rounded-[1.35rem] bg-surface/64 px-5 py-6 text-sm text-muted">
          Chargement du calendrier...
        </div>
      ) : null}

      {!timeline.isLoading && groups.length === 0 ? (
        <div className="rounded-[1.35rem] bg-surface/64 px-5 py-8 text-center">
          <p className="text-sm font-medium text-muted">
            Les prochaines diffusions connues de vos séries apparaîtront ici.
          </p>
        </div>
      ) : null}

      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <h2 className="text-2xl font-black text-white">{group.label}</h2>
          <div className="space-y-3">
            {group.items.map((item) => (
              <CalendarItemCard
                key={item.id}
                item={item}
                isBusy={libraryActions.isMutating}
                onMarkWatched={markTimelineItemWatched}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
