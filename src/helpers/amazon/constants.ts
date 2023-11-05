export const amazon_base_urls: { [key: string]: string } = {
  amazon_us: 'https://www.amazon.com/ap/oa',
  amazon_ca: 'https://www.amazon.com/ap/oa',
  amazon_uk: 'https://eu.account.amazon.com/ap/oa',
  amazon_ge: 'https://eu.account.amazon.com/ap/oa',
  amazon_fr: 'https://eu.account.amazon.com/ap/oa',
  amazon_it: 'https://eu.account.amazon.com/ap/oa',
};

export const amazon_access_token_base_urls: { [key: string]: string } = {
  amazon_us: 'https://api.amazon.com/auth/o2/token',
  amazon_ca: 'https://api.amazon.com/auth/o2/token',
  amazon_uk: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_ge: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_fr: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_it: 'https://api.amazon.co.uk/auth/o2/token',
};

export const amazon_marketplaces = [
  'amazon_us',
  'amazon_ca',
  'amazon_uk',
  'amazon_ge',
  'amazon_fr',
  'amazon_it',
];
