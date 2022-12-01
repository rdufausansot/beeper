export function mergeBeepsAuthors(beeps, authors) {
    const authorsByIds = {};
    for (const author of authors) {
      authorsByIds[author.userId] = author;
    }
  
    for (const beep of beeps) {
      beep.author = authorsByIds[beep.authorId];
    }
  }