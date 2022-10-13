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

export type { I_DOMAIN_ACTIVITY, T_DOMAIN_ACTIVITY_TYPE };
