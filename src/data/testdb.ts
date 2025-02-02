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

const textSource = `Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium class ex felis id sit. Turpis magna fermentum duis varius id. Ornare class faucibus quam; pellentesque ultrices nunc. Nisi dapibus dolor ultrices rutrum morbi. Ac metus laoreet augue inceptos diam mauris. Sapien ligula non enim nostra pulvinar. Vulputate sapien sagittis habitant mollis euismod feugiat velit. Phasellus cubilia feugiat eu morbi nascetur est semper lectus. Magna volutpat ipsum dictum libero faucibus per. Habitant class lacinia fringilla accumsan vulputate nisl orci. Metus fusce hendrerit curae auctor finibus praesent consectetur vel. Sociosqu feugiat hac ullamcorper donec arcu venenatis suspendisse. Magna suscipit at varius non leo sem quisque faucibus scelerisque. Hac nibh curabitur quam mollis aenean ante conubia, commodo neque. Dictum laoreet sem velit volutpat praesent congue montes suspendisse. Quis porttitor quis phasellus nam; montes mi. Fringilla quam quam gravida porta enim vehicula. Placerat litora erat maecenas ligula neque dignissim morbi vehicula. Semper lectus senectus mauris duis maecenas; cubilia et. Turpis tortor sem diam volutpat habitasse aliquam! Mattis phasellus etiam nisl primis tellus etiam taciti? Feugiat ante lectus vivamus fringilla urna blandit imperdiet non. Accumsan iaculis viverra tincidunt ut fames mus diam. Justo fames proin iaculis mi litora quis. Ac orci euismod dis vestibulum metus amet justo. Nibh ornare ullamcorper dignissim pretium ridiculus tempus quis. Convallis torquent suscipit mattis vestibulum sem erat justo. Commodo curabitur vitae interdum sed vehicula lectus nibh aptent. Finibus elit bibendum ad dictum bibendum mattis diam. Elementum hac lectus luctus vitae nec gravida per. Sem nisl dictum aliquam maximus; rutrum maecenas ac sodales. Nam dui a; fringilla neque dis nullam primis odio? Sagittis accumsan arcu ullamcorper nulla eu duis, vestibulum maecenas. Parturient neque scelerisque consectetur dui consectetur purus mollis cubilia. Tristique odio elementum nostra venenatis mollis hac velit dui lorem. Quis posuere aliquet cras primis donec elit lacus morbi consequat? Tincidunt convallis metus vivamus nascetur justo molestie. Aliquam condimentum nisl mi dictum vehicula velit. Netus aptent elit eget mollis gravida luctus eget. Senectus enim ut netus pulvinar morbi tincidunt condimentum. Malesuada volutpat ipsum augue dapibus imperdiet adipiscing curabitur orci ornare. Dis libero maximus vehicula class diam. Ullamcorper auctor sociosqu habitant leo consequat accumsan. Dapibus sem nisl habitant vivamus pretium cursus. Tempus vel sit fusce quam suscipit varius. Ullamcorper scelerisque pulvinar cras integer magna porttitor maecenas phasellus. Accumsan eleifend sed sed efficitur sociosqu dictumst. Eget pulvinar nam risus; nec tempor rhoncus. Penatibus dapibus auctor etiam curae vestibulum vivamus. Nullam inceptos aptent cras nibh pellentesque ornare hac molestie himenaeos. Volutpat vulputate magnis cursus commodo aptent porta interdum. Consectetur nascetur urna blandit sed sapien malesuada. Adipiscing bibendum praesent auctor non hac et dis. Penatibus suspendisse lorem per; viverra sollicitudin fusce. Platea duis duis cubilia tempus porttitor conubia montes erat eget. Adapibus mi dolor habitant nisi hendrerit; ultricies a. Habitasse tellus vulputate litora tortor feugiat interdum duis est sapien. Curae luctus pretium et tempus auctor risus eu. Nisl nec curabitur vulputate felis interdum. Posuere maximus ut vulputate elementum justo mauris mattis urna. Cursus ligula amet cras augue faucibus ipsum netus ad?`.split(" ");

let index = 0;
export function loremIpsum(wordCount: number = 1): string {
    if (wordCount < 1) {
        wordCount = 1;
    }
    const result = textSource.slice(index, index + wordCount);
    index += wordCount;
    if (index >= textSource.length) {
        const overflow = index - textSource.length;
        result.push(... textSource.slice(0, overflow));
        index = overflow;
    }

    return result.join(" ");
}