const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

module.exports = {
  entry: start,
  settings: {
    name: "Web Book script",
    author: "deadfast",
    options: {}
  },
};

let QuickAdd;

async function start(params) {
  QuickAdd = params;

  const url = await QuickAdd.quickAddApi.inputPrompt("Book URL:");
  
  if (!url) {
    notice("No URL entered");
    throw new Error("No URL entered");
  }

  try {
    const bookData = await scrapeBook(url);
    
    const isRead = await QuickAdd.quickAddApi.yesNoPrompt("Read ?");
    let myRating = "/10";
    let myRecommender = " ";
    let comment = " ";

    if(isRead){
      myRating = await QuickAdd.quickAddApi.inputPrompt("Rating", null, "/10");
    }

    myRecommender = await QuickAdd.quickAddApi.inputPrompt("Recommender", null, " ");
    comment = await QuickAdd.quickAddApi.inputPrompt("Comment", null, " ");
    
    QuickAdd.variables = {
      fileName: replaceIllegalFileNameCharactersInString(bookData.title),
      title: bookData.title,
      authors: bookData.authors || " ",
      thumbnail: bookData.thumbnail || " ",
      release: bookData.release || " ",
      rating: myRating,
      recommender: myRecommender,
      comment: comment,
      status: " ",
      goodreadsURL: url,
      Keys: " ",
      tags: " " 
    };
  } catch (error) {
    notice("Failed to scrape book data");
    throw error;
  }
}

async function scrapeBook(url) {
  const response = await request({ url, method: 'GET' });
  
  if (url.includes('royalroad.com')) {
    return scrapeRoyalRoad(response);
  } else if (url.includes('novelbin.me')) {
    return scrapeNovelBin(response);
  } else {
    return scrapeGeneric(response);
  }
}

function scrapeRoyalRoad(html) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const authorMatch = html.match(/<meta property="books:author" content="([^"]+)"/) ||
                     html.match(/<meta name="twitter:creator" content="([^"]+)"/) ||
                     html.match(/by <a[^>]*href="[^"]*"[^>]*>([^<]+)<\/a>/) || 
                     html.match(/by <span[^>]*>([^<]+)<\/span>/);
  const authors = authorMatch ? authorMatch[1].trim() : '';
  
  const coverMatch = html.match(/<img[^>]*class="[^"]*thumbnail[^"]*"[^>]*src="([^"]+)"/) ||
                    html.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*thumbnail/);
  const thumbnail = coverMatch ? coverMatch[1] : '';
  
  const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
                   html.match(/<div[^>]*class="[^"]*fiction-info[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  let comment = '';
  if (descMatch) {
    comment = descMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 200);
  }
  
  const releaseMatch = html.match(/Published:\s*<time[^>]*>([^<]+)<\/time>/) ||
                      html.match(/Created:\s*<time[^>]*>([^<]+)<\/time>/);
  const release = releaseMatch ? new Date(releaseMatch[1]).getFullYear() : '';
  
  return { title, authors, thumbnail, comment, release };
}

function scrapeNovelBin(html) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/) || html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(' - NovelBin', '').trim() : '';
  
  const authorMatch = html.match(/Author[^>]*>([^<]+)</) || html.match(/by ([^<\n]+)/);
  const authors = authorMatch ? authorMatch[1].trim() : '';
  
  const coverMatch = html.match(/<img[^>]*src="([^"]+)"[^>]*alt="[^"]*cover/i);
  const thumbnail = coverMatch ? coverMatch[1] : '';
  
  const descMatch = html.match(/<div[^>]*class="[^"]*summary[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
                   html.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  let comment = '';
  if (descMatch) {
    comment = descMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200);
  }
  
  return { title, authors, thumbnail, comment, release: '' };
}

function scrapeGeneric(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/) || html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const authorMatch = html.match(/author[^>]*>([^<]+)</i) || html.match(/by ([^<\n]+)/i);
  const authors = authorMatch ? authorMatch[1].trim() : '';
  
  const coverMatch = html.match(/<meta property="og:image" content="([^"]+)"/) ||
                    html.match(/<img[^>]*src="([^"]+)"[^>]*cover/i);
  const thumbnail = coverMatch ? coverMatch[1] : '';
  
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/) ||
                   html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  let comment = '';
  if (descMatch) {
    comment = descMatch[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim().substring(0, 200);
  }
  
  return { title, authors, thumbnail, comment, release: '' };
}

function replaceIllegalFileNameCharactersInString(string) {
  return string.replace(/[\\,#%&\{\}\/*<>$\":@.]*/g, "");
}