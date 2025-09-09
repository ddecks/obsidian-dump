const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

module.exports = {
  entry: start,
  settings: {
    name: "Bandcamp script",
    author: "dmdecke",
    options: {}
  },
};

let QuickAdd;

async function start(params) {
  QuickAdd = params;

  const url = await QuickAdd.quickAddApi.inputPrompt("Bandcamp URL:");
  
  if (!url || !url.includes('bandcamp.com')) {
    notice("Invalid Bandcamp URL");
    throw new Error("Invalid Bandcamp URL");
  }

  try {
    const isTrack = url.includes('/track/');
    const data = isTrack ? await scrapeTrack(url) : await scrapeAlbum(url);
    
    QuickAdd.variables = {
      ...data,
      fileName: replaceIllegalFileNameCharactersInString(data.title),
      url: url,
      type: isTrack ? 'track' : 'album'
    };
  } catch (error) {
    notice("Failed to scrape data");
    throw error;
  }
}

async function scrapeTrack(url) {
  const response = await request({ url, method: 'GET' });
  
  const titleMatch = response.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const descMatch = response.match(/<meta name="description" content="([^"]+)"/);
  const description = descMatch ? descMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'") : '';
  
  const coverMatch = response.match(/<meta property="og:image" content="([^"]+)"/);
  const thumbnail = coverMatch ? coverMatch[1] : '';
  
  let genre = '';
  const jsonLdMatch = response.match(/"genre":"([^"]+)"/);
  if (jsonLdMatch) {
    const genreUrl = jsonLdMatch[1];
    const genreMatch = genreUrl.match(/\/discover\/(.+)$/);
    genre = genreMatch ? genreMatch[1] : '';
  }
  
  const [track, artist] = title.split(' | ').map(s => s?.trim());
  
  return {
    title: track || title,
    artist: artist || '',
    genre,
    description,
    thumbnail
  };
}

async function scrapeAlbum(url) {
  const response = await request({ url, method: 'GET' });
  
  const titleMatch = response.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const descMatch = response.match(/<meta name="description" content="([^"]+)"/);
  const description = descMatch ? descMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'") : '';
  
  const coverMatch = response.match(/<meta property="og:image" content="([^"]+)"/);
  const thumbnail = coverMatch ? coverMatch[1] : '';
  
  let genre = '';
  const jsonLdMatch = response.match(/"genre":"([^"]+)"/);
  if (jsonLdMatch) {
    const genreUrl = jsonLdMatch[1];
    const genreMatch = genreUrl.match(/\/discover\/(.+)$/);
    genre = genreMatch ? genreMatch[1] : '';
  }
  
  const [album, artist] = title.split(' | ').map(s => s?.trim());
  
  const tracks = [];
  const lines = description.split('\n');
  for (const line of lines) {
    const trackMatch = line.match(/^\d+\.\s+(.+)$/);
    if (trackMatch) tracks.push(trackMatch[1].trim());
  }
  
  return {
    title: album || title,
    artist: artist || '',
    genre,
    description,
    tracks: tracks.map((track, i) => `${i+1}. ${track}`).join('\n'),
    trackCount: tracks.length,
    thumbnail
  };
}

function replaceIllegalFileNameCharactersInString(string) {
  return string.replace(/[\\,#%&\{\}\/*<>$\":@.]*/g, "");
}