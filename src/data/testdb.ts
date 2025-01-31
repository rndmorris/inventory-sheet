import Dexie, { type EntityTable, } from "dexie";

interface Genre {
    id: number;
    name: string;
}

interface Album {
    id: number;
    name: string;
    year: number;
    tracks: number;
}

interface Band {
    id: number;
    name: string;
    albumIds: number[];
    genreId: number;

    genre?: Genre;
    albums?: Album[];
}

const db = new Dexie('music') as Dexie & {
    genres: EntityTable<Genre, 'id'>,
    albums: EntityTable<Album, 'id'>,
    bands: EntityTable<Band, 'id'>,
};

db.version(1).stores({
    genres: '++id,name',
    albums: '++id,name,year,*tracks',
    bands: '++id,name,*albumIds,genreId'
});

async function getBandsStartingWithA() {
    // Query
    const bands = await db.bands
        .where('name')
        .startsWith('A')
        .toArray();

    // Attach resolved properies "genre" and "albums" on each band
    // using parallel queries:
    await Promise.all(bands.map(async band => {
        [band.genre, band.albums] = await Promise.all([
            db.genres.get(band.genreId),
            db.albums.where('id').anyOf(band.albumIds).toArray()
        ]);
    }));

    return bands;
}
