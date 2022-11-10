require('dotenv').config();
export const TEZOS_COLLECT_NETWORK =
  process.env.NODE_ENV === 'development' ? 'ghostnet' : 'mainnet';

export const MORE_COLLECTION_ID = '633b3c74965d76ae5e3a1d83';
export const TEZOS_COLLECT_SECRET = 'TEZOS_COLLECT_SECRET';

export const MS_PER_DAY = 1000 * 3600 * 24;
export const DEFAULT_PAGE_SIZE = 40;

export const TEZOS_COLLECTION_IDS = {
  COUNTRIES: '633b3796965d76ae5e2b615b',
  HYPEN: '633b37d1965d76ae5e2c105c',
  '3LD': '633b373e965d76ae5e2a587e',
  '4LD': '633b3741965d76ae5e2a5fdb',
  '5LD': '633b3742965d76ae5e2a62f0',
};
