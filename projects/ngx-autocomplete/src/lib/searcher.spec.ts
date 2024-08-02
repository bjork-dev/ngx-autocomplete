import {Searcher} from "./searcher";

describe('Searcher', () => {
  let searcher: Searcher;

  beforeEach(() => {
    const allItems = ['Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Amsterdam', 'Figi'];
    searcher = new Searcher(allItems);
  });

  it('should return all items if query is empty', () => {
    expect(searcher.search('')).toEqual(['Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Amsterdam', 'Figi']);
  });

  it('should have stockholm as the first element when the query is partial', () => {
    const result = searcher.search('sto');
    expect(result[0]).toEqual('Stockholm');
  });

  it('should have stockholm as the first element when the query is misspelled', () => {
    const result = searcher.search('stokhlm');
    expect(result[0]).toEqual('Stockholm');
  });

  it('should have copenhagen as the first element when the query is misspelled', () => {
    const result = searcher.search('kkopenhgagen');
    expect(result[0]).toEqual('Copenhagen');
  });

  it('should only return 2 matching items when maxCount is 2', () => {
    const result = searcher.search('sto', 2);
    expect(result.length).toEqual(2);
  });


  it('should have stockholm as first result', () => {
    const result = searcher.search('sto', 2);
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual('Stockholm');
  });

  it('should only return items that have matching characters', () => {
    const result = searcher.search('Figi');
    expect(result.length).toEqual(3);
  });

});
