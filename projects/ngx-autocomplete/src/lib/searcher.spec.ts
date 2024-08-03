import {Searcher} from "./searcher";
import {NgxAutoCompleteDataItem} from "./ngx-auto-complete-data.item";
import {v4 as uuidv4} from 'uuid';

describe('Searcher', () => {
  let searcher: Searcher;

  const allItems: NgxAutoCompleteDataItem[] = [
    {value: 'Stockholm', id: uuidv4()},
    {value: 'Oslo', id: uuidv4()},
    {value: 'Copenhagen', id: uuidv4()},
    {value: 'Helsinki', id: uuidv4()},
    {value: 'Amsterdam', id: uuidv4()},
    {value: 'Figi', id: uuidv4()}
  ];

  beforeEach(() => {

    searcher = new Searcher(allItems);
  });

  it('should return all items if query is empty', () => {
    expect(searcher.search('')).toEqual(allItems);
  });

  it('should have stockholm as the first element when the query is partial', () => {
    const result = searcher.search('sto');
    expect(result[0].value).toEqual('Stockholm');
  });

  it('should have stockholm as the first element when the query is misspelled', () => {
    const result = searcher.search('stokhlm');
    expect(result[0].value).toEqual('Stockholm');
  });

  it('should have copenhagen as the first element when the query is misspelled', () => {
    const result = searcher.search('kkopenhgagen');
    expect(result[0].value).toEqual('Copenhagen');
  });

  it('should only return 2 matching items when maxCount is 2', () => {
    const result = searcher.search('sto', 2);
    expect(result.length).toEqual(2);
  });


  it('should have stockholm as first result', () => {
    const result = searcher.search('sto', 2);
    expect(result.length).toEqual(2);
    expect(result[0].value).toEqual('Stockholm');
  });

  it('should only return items that have matching characters', () => {
    const result = searcher.search('Figi');
    expect(result.length).toEqual(3);
  });

});
