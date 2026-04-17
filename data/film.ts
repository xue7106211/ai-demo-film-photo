export type ToolCategory = {
  label: string;
  tools: string[];
};

export type FilmPhoto = {
  id: string;
  title: string;
  month: string;
  year: number;
  aspectRatio: number;
  note: string;
};

export const FILM_PROJECT = {
  title: "Film Diary",
  year: "2026",
  description:
    "A digital photo timeline featuring scenes from Sundays in LA. This reconstruction preserves the original layout and motion while using a curated set of moody reference photography in place of the original site media.",
  toolCategories: [
    { label: "Design", tools: ["Figma"] },
    { label: "Frontend", tools: ["TypeScript", "React", "Next.js", "CSS"] },
    { label: "Motion", tools: ["Scroll mapping", "Pointer drag", "Reveal timing"] },
    { label: "Media", tools: ["Unsplash stills", "Responsive ratios"] },
  ] satisfies ToolCategory[],
};

export const LOADING_MESSAGES = [
  "film reel loading",
  "developing photos",
  "rolling the negatives",
  "dusting off the enlarger",
  "mixing the chemicals",
  "checking the light meter",
  "hanging prints to dry",
];

export const FILM_PHOTOS: FilmPhoto[] = [
  { id: "film-01", title: "1", month: "June", year: 2025, aspectRatio: 1.5091, note: "sundays season kickoff" },
  { id: "film-02", title: "2", month: "June", year: 2025, aspectRatio: 0.6632, note: "UCLA Gayley Patio" },
  { id: "film-03", title: "IMG_9243 2", month: "June", year: 2025, aspectRatio: 1.5078, note: "matcha break" },
  { id: "film-04", title: "IMG_9245 2", month: "June", year: 2025, aspectRatio: 0.6632, note: "favorite creative coworking session" },
  { id: "film-05", title: "IMG_9247 2", month: "June", year: 2025, aspectRatio: 1.5078, note: "matcha break" },
  { id: "film-06", title: "000008010021", month: "September", year: 2025, aspectRatio: 1.5078, note: "demos!" },
  { id: "film-07", title: "000009290016 2", month: "September", year: 2025, aspectRatio: 1.5078, note: "coworking at Gayley Heights" },
  { id: "film-08", title: "000009290018 2", month: "September", year: 2025, aspectRatio: 1.5078, note: "locked in" },
  { id: "film-09", title: "000009290019 2", month: "September", year: 2025, aspectRatio: 1.5078, note: "new friends (& old)" },
  { id: "film-10", title: "000009300016", month: "September", year: 2025, aspectRatio: 1.5078, note: "sundays season 5 kickoff" },
  { id: "film-11", title: "000009300018 2", month: "September", year: 2025, aspectRatio: 1.5078, note: "USC Watt Hall" },
  { id: "film-12", title: "000009300019", month: "September", year: 2025, aspectRatio: 1.5078, note: "favorite Sundays tradition: Polaroids" },
  { id: "film-13", title: "000009300022 3", month: "September", year: 2025, aspectRatio: 1.5078, note: "sundays season 5" },
  { id: "film-14", title: "000009300023 2", month: "September", year: 2025, aspectRatio: 1.5078, note: ":)" },
  { id: "film-15", title: "000008010016", month: "October", year: 2025, aspectRatio: 1.5078, note: "matcha break" },
  { id: "film-16", title: "000008010017", month: "October", year: 2025, aspectRatio: 0.6631, note: "sundays season 5" },
  { id: "film-17", title: "000008010019 2", month: "October", year: 2025, aspectRatio: 0.6628, note: "matcha break" },
  { id: "film-18", title: "000008010020", month: "October", year: 2025, aspectRatio: 1.5078, note: "sundays season 5" },
  { id: "film-19", title: "000008010022", month: "October", year: 2025, aspectRatio: 0.6631, note: "Sundays demos" },
  { id: "film-20", title: "000008010023", month: "October", year: 2025, aspectRatio: 1.5078, note: "UCLA saxon suites" },
  { id: "film-21", title: "000008010024", month: "October", year: 2025, aspectRatio: 1.5078, note: "the Sundays crew" },
  { id: "film-22", title: "000009290013", month: "October", year: 2025, aspectRatio: 1.5078, note: "locked in" },
  { id: "film-23", title: "000009290020", month: "October", year: 2025, aspectRatio: 1.5078, note: "Sundays demos" },
  { id: "film-24", title: "000009290021", month: "October", year: 2025, aspectRatio: 1.5078, note: "film crew" },
  { id: "film-25", title: "000009290022 2", month: "October", year: 2025, aspectRatio: 1.5078, note: "coworking & collabs" },
  { id: "film-26", title: "000009300012", month: "October", year: 2025, aspectRatio: 1.5078, note: "USC Watt Hall" },
  { id: "film-27", title: "000009300013 3", month: "October", year: 2025, aspectRatio: 1.5078, note: "sundays are better with snacks" },
  { id: "film-28", title: "IMG_2391 2", month: "October", year: 2025, aspectRatio: 1.5078, note: "frolicking" },
  { id: "film-29", title: "IMG_2392", month: "October", year: 2025, aspectRatio: 1.5078, note: "flibbertigibbeting" },
  { id: "film-30", title: "IMG_2393", month: "October", year: 2025, aspectRatio: 1.5078, note: "locked in" },
  { id: "film-31", title: "IMG_2399 2", month: "October", year: 2025, aspectRatio: 0.6631, note: ":)" },
  { id: "film-32", title: "1", month: "November", year: 2025, aspectRatio: 1.5078, note: "Claude collab merch!" },
  { id: "film-33", title: "2", month: "November", year: 2025, aspectRatio: 1.5078, note: "Claude collab demos" },
  { id: "film-34", title: "3", month: "November", year: 2025, aspectRatio: 1.5078, note: "Sundays x Claude" },
  { id: "film-35", title: "4", month: "November", year: 2025, aspectRatio: 0.6631, note: "Figma Cafe open for business" },
  { id: "film-36", title: "5", month: "November", year: 2025, aspectRatio: 1.5078, note: "Sundays x Figma collab" },
  { id: "film-37", title: "6", month: "November", year: 2025, aspectRatio: 0.6631, note: "coworking is better with pastries" },
  { id: "film-38", title: "7", month: "November", year: 2025, aspectRatio: 0.6631, note: "UCLA saxon suites" },
  { id: "film-39", title: "IMG_1282 2", month: "November", year: 2025, aspectRatio: 1.5078, note: "coworking at Saxon Patio" },
  { id: "film-40", title: "IMG_1283 2", month: "November", year: 2025, aspectRatio: 1.5078, note: "Figma Cafe open for business" },
  { id: "film-41", title: "IMG_1284", month: "November", year: 2025, aspectRatio: 1.5078, note: "Saxon at dusk" },
  { id: "film-42", title: "IMG_1286 2", month: "November", year: 2025, aspectRatio: 1.5078, note: "locked in" },
  { id: "film-43", title: "IMG_1288", month: "November", year: 2025, aspectRatio: 1.5078, note: "Sundays demos" },
  { id: "film-44", title: "IMG_2402 2", month: "December", year: 2025, aspectRatio: 1.5078, note: "the sundays team" },
];
