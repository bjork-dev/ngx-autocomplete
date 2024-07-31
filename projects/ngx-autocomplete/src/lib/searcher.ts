class Rater {
  item: string;
  penalty = 0;
  foundChars = 0;

  constructor(item: string) {
    this.item = item;
  }
}

export class Searcher {
  constructor(private allItems: string[]) {
  }

  public search(query: string, maxCount: number = 0): string[] {
    if (query === '') {
      return this.allItems;
    }

    if (maxCount <= 0) {
      maxCount = this.allItems.length;
    }

    const pres = this.rate(query.toLowerCase());

    pres.sort((a, b) => {
      if (a.foundChars > b.foundChars) return -1;
      if (a.foundChars < b.foundChars) return 1;
      if (a.penalty < b.penalty) return -1;
      if (a.penalty > b.penalty) return 1;
      return 0;
    });

    return pres.slice(0, maxCount).map(p => p.item);
  }

  private rate(query: string) {
    const ratingResult: Rater[] = new Array(this.allItems.length)
    for (let i = 0; i < ratingResult.length; i++) {
      ratingResult[i] = this.rateItem(query, new Rater(this.allItems[i]));

    }

    return ratingResult.filter(r => r.foundChars > 0);
  }

  private rateItem(query: string, rater: Rater): Rater {
    let destination = rater.item.toLowerCase();
    let firstMatch = true;

    for (let i = 0; i < query.length; i++) {
      const char = query.charAt(i);
      const index = destination.indexOf(char);

      if (index == -1) continue;
      rater.foundChars++;

      if (firstMatch) {
        rater.penalty += index;
        firstMatch = false;
      } else {
        rater.penalty += index * 1000;
      }

      if (index + 1 < destination.length) {
        destination = rater.item.substring(index + 1);
      } else {
        destination = '';
      }
    }
    return rater;
  }
}
