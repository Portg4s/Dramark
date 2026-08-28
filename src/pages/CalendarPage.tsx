import { CalendarDays, Tv } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { MediaPoster } from '@/components/ui/MediaPoster';
import { type CalendarTimelineItem, useCalendarTimeline } from '@/features/calendar/hooks';
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

function CalendarItemCard({ item }: { item: CalendarTimelineItem }) {
  return (
    <NavLink
      to={createMediaDetailPath(item.mediaType, item.tmdbId)}
      className="focus-ring grid grid-cols-[5rem_1fr] gap-4 rounded-[1.3rem] bg-surface/72 p-2.5 shadow-panel"
    >
      <MediaPoster
        title={item.title}
        posterPath={item.posterPath}
        size="w185"
        className="rounded-[1rem]"
      />
      <div className="flex min-w-0 flex-col justify-center py-1 pr-2">
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
        {item.providerLabel ? (
          <p className="mt-2 text-xs font-semibold text-subtle">{item.providerLabel}</p>
        ) : null}
      </div>
    </NavLink>
  );
}

export function CalendarPage() {
  const timeline = useCalendarTimeline();
  const groups = groupTimelineItems(timeline.items);

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
              <CalendarItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
