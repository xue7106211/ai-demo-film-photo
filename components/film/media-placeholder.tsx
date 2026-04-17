export type FilmMediaSource = {
  alt: string;
  position?: string;
  sourcePage: string;
  src: string;
};

const FILM_MEDIA_LIBRARY: FilmMediaSource[] = [
  {
    alt: "Sunlit cafe interior with wooden tables",
    position: "50% 56%",
    sourcePage: "https://unsplash.com/photos/interior-of-a-cafe-with-tables-and-chairs-XHjf8p3McV0",
    src: "https://images.unsplash.com/photo-1738678455002-12780e5f5a22?auto=format&fit=crop&w=1600&q=80",
  },
  {
    alt: "Warm wooden cafe chairs and tables in shallow focus",
    position: "50% 52%",
    sourcePage: "https://unsplash.com/photos/close-up-of-weathered-wooden-chairs-and-tables-in-a-cafe-0dArg7wjArU",
    src: "https://images.unsplash.com/photo-1769690177139-24deb2f0d515?auto=format&fit=crop&w=1600&q=80",
  },
  {
    alt: "Dark restaurant interior with amber window light",
    position: "50% 50%",
    sourcePage: "https://unsplash.com/photos/a-dimly-lit-restaurant-with-tables-and-chairs-EjHiN2KxTO4",
    src: "https://images.unsplash.com/photo-1709548145082-04d0cde481d4?auto=format&fit=crop&w=1600&q=80",
  },
  {
    alt: "Film-like cityscape with a glowing road at dusk",
    position: "50% 48%",
    sourcePage: "https://unsplash.com/photos/vast-cityscape-with-a-glowing-road-at-dusk-ApM1VYmlTqg",
    src: "https://images.unsplash.com/photo-1765873360430-5035e41e61d0?auto=format&fit=crop&w=1600&q=80",
  },
  {
    alt: "Cinematic portrait with red light and dark background",
    position: "50% 40%",
    sourcePage: "https://unsplash.com/photos/man-illuminated-in-red-light-looking-up-Up0rivLrLjk",
    src: "https://images.unsplash.com/photo-1753381297379-6c3e11d630f6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    alt: "Outdoor cafe table with white chairs in soft daylight",
    position: "50% 56%",
    sourcePage: "https://unsplash.com/photos/a-white-table-and-chairs-sitting-in-a-yard-r8mQgpg2zx8",
    src: "https://images.unsplash.com/photo-1674501679236-377b700e766f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    alt: "Minimal cafeteria with round tables and green chairs",
    position: "50% 50%",
    sourcePage: "https://unsplash.com/photos/a-cafeteria-with-tables-chairs-and-plants-GjFGaumWkjM",
    src: "https://images.unsplash.com/photo-1723532623416-89c7bdcce044?auto=format&fit=crop&w=1600&q=80",
  },
  {
    alt: "Cozy cafe tables with plants and soft morning light",
    position: "50% 52%",
    sourcePage: "https://unsplash.com/photos/table-and-chairs-with-plants-and-sunlight-abuGA-5dCbs",
    src: "https://images.unsplash.com/photo-1755008787435-c0dfd81696c0?auto=format&fit=crop&w=1600&q=80",
  },
];

export function getFilmMediaSource(index: number) {
  return FILM_MEDIA_LIBRARY[index % FILM_MEDIA_LIBRARY.length];
}

export function getFeatureMediaSource() {
  return FILM_MEDIA_LIBRARY[2];
}
