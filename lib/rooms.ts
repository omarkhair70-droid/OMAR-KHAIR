export type ExhibitionRoom = {
  slug: string;
  number: string;
  work: string;
  exhibitionTitle: string;
};

export const exhibitionRooms: ExhibitionRoom[] = [
  { slug: "first-contact", number: "01", work: "FIRST CONTACT", exhibitionTitle: "A SIGNAL CAN EXIST WITHOUT ARRIVING" },
  { slug: "seraph", number: "02", work: "SERAPH", exhibitionTitle: "PRESENCE ROOM" },
  { slug: "fokhara", number: "03", work: "FOKHARA", exhibitionTitle: "THE FORM REMEMBERS" },
  { slug: "habba", number: "04", work: "HABBA", exhibitionTitle: "BEAD TABLE" },
  { slug: "wavezero", number: "05", work: "WAVEZERO", exhibitionTitle: "PORCELAIN LISTENING SURFACE" },
  { slug: "hiltech", number: "06", work: "HILTECH", exhibitionTitle: "PHYSICAL PATH" },
  { slug: "nova", number: "07", work: "NOVA", exhibitionTitle: "QUIET ORBIT / TONIGHT" },
  { slug: "afterimage", number: "08", work: "AFTERIMAGE", exhibitionTitle: "SOMETHING REMAINED" }
];

export function getRoom(slug: string) {
  return exhibitionRooms.find((room) => room.slug === slug);
}
