export const CONTINENTS = [
  { code: 'AS', name: 'Asia' },
  { code: 'EU', name: 'Europe' },
  { code: 'NA', name: 'N. America' },
  { code: 'SA', name: 'S. America' },
  { code: 'AF', name: 'Africa' },
  { code: 'OC', name: 'Oceania' },
] as const;

export type ContinentCode = typeof CONTINENTS[number]['code'];

// ISO 3166-1 alpha-2 → continent code
export const COUNTRY_CONTINENT: Record<string, ContinentCode> = {
  // Asia
  AF:'AS',AM:'AS',AZ:'AS',BH:'AS',BD:'AS',BT:'AS',BN:'AS',KH:'AS',CN:'AS',
  CY:'AS',GE:'AS',IN:'AS',ID:'AS',IR:'AS',IQ:'AS',IL:'AS',JP:'AS',JO:'AS',
  KZ:'AS',KW:'AS',KG:'AS',LA:'AS',LB:'AS',MY:'AS',MV:'AS',MN:'AS',MM:'AS',
  NP:'AS',KP:'AS',OM:'AS',PK:'AS',PS:'AS',PH:'AS',QA:'AS',SA:'AS',SG:'AS',
  KR:'AS',LK:'AS',SY:'AS',TW:'AS',TJ:'AS',TH:'AS',TL:'AS',TR:'AS',TM:'AS',
  AE:'AS',UZ:'AS',VN:'AS',YE:'AS',
  // Europe
  AL:'EU',AD:'EU',AT:'EU',BY:'EU',BE:'EU',BA:'EU',BG:'EU',HR:'EU',CZ:'EU',
  DK:'EU',EE:'EU',FI:'EU',FR:'EU',DE:'EU',GR:'EU',HU:'EU',IS:'EU',IE:'EU',
  IT:'EU',XK:'EU',LV:'EU',LI:'EU',LT:'EU',LU:'EU',MK:'EU',MT:'EU',MD:'EU',
  MC:'EU',ME:'EU',NL:'EU',NO:'EU',PL:'EU',PT:'EU',RO:'EU',RU:'EU',SM:'EU',
  RS:'EU',SK:'EU',SI:'EU',ES:'EU',SE:'EU',CH:'EU',UA:'EU',GB:'EU',VA:'EU',
  // North America
  AG:'NA',BS:'NA',BB:'NA',BZ:'NA',CA:'NA',CR:'NA',CU:'NA',DM:'NA',DO:'NA',
  SV:'NA',GD:'NA',GT:'NA',HT:'NA',HN:'NA',JM:'NA',MX:'NA',NI:'NA',PA:'NA',
  KN:'NA',LC:'NA',VC:'NA',TT:'NA',US:'NA',
  // South America
  AR:'SA',BO:'SA',BR:'SA',CL:'SA',CO:'SA',EC:'SA',GY:'SA',PY:'SA',PE:'SA',
  SR:'SA',UY:'SA',VE:'SA',
  // Africa
  DZ:'AF',AO:'AF',BJ:'AF',BW:'AF',BF:'AF',BI:'AF',CM:'AF',CV:'AF',CF:'AF',
  TD:'AF',KM:'AF',CG:'AF',CD:'AF',CI:'AF',DJ:'AF',EG:'AF',GQ:'AF',ER:'AF',
  ET:'AF',GA:'AF',GM:'AF',GH:'AF',GN:'AF',GW:'AF',KE:'AF',LS:'AF',LR:'AF',
  LY:'AF',MG:'AF',MW:'AF',ML:'AF',MR:'AF',MU:'AF',MA:'AF',MZ:'AF',NA:'AF',
  NE:'AF',NG:'AF',RW:'AF',ST:'AF',SN:'AF',SL:'AF',SO:'AF',ZA:'AF',SS:'AF',
  SD:'AF',SZ:'AF',TZ:'AF',TG:'AF',TN:'AF',UG:'AF',ZM:'AF',ZW:'AF',
  // Oceania
  AU:'OC',FJ:'OC',KI:'OC',MH:'OC',FM:'OC',NR:'OC',NZ:'OC',PW:'OC',PG:'OC',
  WS:'OC',SB:'OC',TO:'OC',TV:'OC',VU:'OC',
};

export function journeyMatchesContinent(countries: string[], continent: string): boolean {
  return countries.some((c) => COUNTRY_CONTINENT[c.toUpperCase()] === continent);
}

export function getCountriesForContinent(continent: string): { code: string; name: string }[] {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return Object.entries(COUNTRY_CONTINENT)
    .filter(([, c]) => c === continent)
    .map(([code]) => ({ code, name: displayNames.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAllCountries(): { code: string; name: string }[] {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return Object.keys(COUNTRY_CONTINENT)
    .map((code) => ({ code, name: displayNames.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
