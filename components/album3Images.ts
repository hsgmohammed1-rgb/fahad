/* ============================================================
   ALBUM3 — the one source of truth for the album frame list.
   The real files in /public/album3 mix .jpg and .png, and the
   extension is not derivable from the number alone (20 and 21
   are .png even though 14-19 are .jpg). Listing them explicitly
   keeps the deck, the filmstrip and the lightbox in sync and
   stops broken frames from ever being requested.
   ============================================================ */

export const ALBUM3_FILES: string[] = [
    '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg',
    '08.png', '09.png', '10.png', '11.png', '12.png', '13.png',
    '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg',
    '20.png', '21.png', '22.jpg', '23.jpg', '24.png', '25.png', '26.png', '27.png',
];

export const ALBUM3_COUNT = ALBUM3_FILES.length;

/** /album3/07.jpg */
export const album3Src = (n: number) => `/album3/${ALBUM3_FILES[n - 1] ?? ''}`;

/** /album3/07.jpg for a 1-based index, empty string when out of range */
export const album3SrcByIndex = (i: number) => album3Src(i + 1);
