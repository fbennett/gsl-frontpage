# NewsWriter

NewsWriter is a weblog-like tool for maintaining front page news on a
companion website.

Announcements and events are managed through a single Ajax-driven
page. Information is published as an integrated set of resources that
leverage news reader and calendaring standards.  The aim is to avoid
reliance on email and hopeful uploads to the Web as the primary means
of disseminating institutional information.

Publication out of NewsWriter generates the following resources:

1. A top page containing an index of Event and Announcement items;
2. Individual pages for each Event or Announcement;
3. Document links for materials associated with each Event or Announcement item;
4. An icalendar object for each published Event item;
5. A combined icalendar object of all past Events;
6. A pair of news feeds (one each for Events and Announcements); and
7. A dynamic news feed, on the NewsWriter site itself, of unpublished items
   awaiting final review and editing.

The resources above are integrated with one another for administrative
convenience:

* The individual pages contain a link to the icalendar object
  for the sessions of an event;
* Individual pages also contain links to associated materials;
* The main news feeds on the target site offer a subscription link
  to the full institutional calendar;
* Items in the dynamic feed on the NewsWriter site link to the
  maintenance page, populated with the target item.

NewsWriter is a young project, cast to fill a local need. The user
interface is currently available in Japanese only. Event times are
properly stored in UTC, but an offset to Japan Standard Time is
currently hard-coded into the client-side UI. The code also contains a
few strings (URLs and some other details) that are specific to our
environment. Generalization of the code on all these fronts is
planned.

The user interface is reasonably efficient, with search-as-you-type entry
on fields with reusable content. The templating engine is homebrew
but extremely flexible, thanks to JavaScript callbacks against item
content.

That's the general rundown. Screenshots and setup instructions will
be put up here as time permits.

Frank Bennett, Nagoya University, Japan
