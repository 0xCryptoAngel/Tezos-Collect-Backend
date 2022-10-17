type T_DOMAIN_ACTIVITY_TYPE =
  | 'LIST_FOR_SALE'
  | 'DELIST_FOR_SALE'
  | 'BUY_FROM_SALE'
  | 'LIST_FOR_AUCTION'
  | 'PLACE_BID'
  | 'COMPLETE_AUCTION'
  | 'NEW_OFFER'
  | 'CANCEL_OFFER'
  | 'SELL_ON_OFFER';
interface I_DOMAIN_ACTIVITY {
  name: string;
  type: T_DOMAIN_ACTIVITY_TYPE;
  timestamp: Date;
  amount: number;
  txHash: string;
  from: string; // address
  to: string; // address
}

type TYPE_MARKET_SORT_VALUE =
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'LASTSOLDAMOUNT_ASC'
  | 'LASTSOLDAMOUNT_DESC'
  | 'TOKENID_ASC'
  | 'TOKENID_DESC'
  | 'EXPIRESAT_ASC'
  | 'EXPIRESAT_DESC';

interface I_DOMAIN_SEARCH_VALUE {
  domainListed?: boolean;
  showType?:
    | 'SHOW_ALL'
    | 'SHOW_REGISTERED'
    | 'SHOW_AVAILABLE'
    | 'SHOW_FEATURED';
  offset?: number;
  pageSize?: number;
  contains?: string;
  startWith?: string;
  endWith?: string;
  minLength?: number;
  maxLength?: number;
  minPrice?: number;
  maxPrice?: number;
}
type TYPE_MARKET_ADVANCED_FILTER_VALUE =
  | 'LETTERS_YES'
  | 'LETTERS_NO'
  | 'NUMBERS_YES'
  | 'NUMBERS_NO'
  | 'PALINDROMES_YES'
  | 'PALINDROMES_NO'
  | 'HYPEN_YES'
  | 'HYPEN_NO'
  | '';
export type {
  I_DOMAIN_ACTIVITY,
  T_DOMAIN_ACTIVITY_TYPE,
  TYPE_MARKET_SORT_VALUE,
  I_DOMAIN_SEARCH_VALUE,
  TYPE_MARKET_ADVANCED_FILTER_VALUE,
};
