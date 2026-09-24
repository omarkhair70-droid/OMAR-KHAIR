export type ExhibitionRoom = {
  slug: string;
  number: string;
  work: string;
  exhibitionTitle: string;
};

export const exhibitionRooms: ExhibitionRoom[] = [
  {
    slug: "first-contact",
    number: "01",
    work: "FIRST CONTACT",
    exhibitionTitle: "A SIGNAL CAN EXIST WITHOUT ARRIVING"
  },
  {
    slug: "seraph",
    number: "02",
    work: "SERAPH",
    exhibitionTitle: "THE BODY"
  }
];

export function getRoom(slug: string) {
  return exhibitionRooms.find((room) => room.slug === slug);
}
