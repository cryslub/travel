'use client'

import { useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

// Source: https://flagcdn.com/en/codes.json (2-letter ISO codes only)
const COUNTRIES: { code: string; name: string }[] = [
  { code: 'AD', name: 'Andorra' }, { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' }, { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AI', name: 'Anguilla' }, { code: 'AL', name: 'Albania' },
  { code: 'AM', name: 'Armenia' }, { code: 'AO', name: 'Angola' },
  { code: 'AQ', name: 'Antarctica' }, { code: 'AR', name: 'Argentina' },
  { code: 'AS', name: 'American Samoa' }, { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' }, { code: 'AW', name: 'Aruba' },
  { code: 'AX', name: 'Åland Islands' }, { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BB', name: 'Barbados' },
  { code: 'BD', name: 'Bangladesh' }, { code: 'BE', name: 'Belgium' },
  { code: 'BF', name: 'Burkina Faso' }, { code: 'BG', name: 'Bulgaria' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BI', name: 'Burundi' },
  { code: 'BJ', name: 'Benin' }, { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'BM', name: 'Bermuda' }, { code: 'BN', name: 'Brunei' },
  { code: 'BO', name: 'Bolivia' }, { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'BR', name: 'Brazil' }, { code: 'BS', name: 'Bahamas' },
  { code: 'BT', name: 'Bhutan' }, { code: 'BV', name: 'Bouvet Island' },
  { code: 'BW', name: 'Botswana' }, { code: 'BY', name: 'Belarus' },
  { code: 'BZ', name: 'Belize' }, { code: 'CA', name: 'Canada' },
  { code: 'CC', name: 'Cocos (Keeling) Islands' }, { code: 'CD', name: 'DR Congo' },
  { code: 'CF', name: 'Central African Republic' }, { code: 'CG', name: 'Republic of the Congo' },
  { code: 'CH', name: 'Switzerland' }, { code: 'CI', name: "Côte d'Ivoire (Ivory Coast)" },
  { code: 'CK', name: 'Cook Islands' }, { code: 'CL', name: 'Chile' },
  { code: 'CM', name: 'Cameroon' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' }, { code: 'CV', name: 'Cape Verde' },
  { code: 'CW', name: 'Curaçao' }, { code: 'CX', name: 'Christmas Island' },
  { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czechia' },
  { code: 'DE', name: 'Germany' }, { code: 'DJ', name: 'Djibouti' },
  { code: 'DK', name: 'Denmark' }, { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' }, { code: 'DZ', name: 'Algeria' },
  { code: 'EC', name: 'Ecuador' }, { code: 'EE', name: 'Estonia' },
  { code: 'EG', name: 'Egypt' }, { code: 'EH', name: 'Western Sahara' },
  { code: 'ER', name: 'Eritrea' }, { code: 'ES', name: 'Spain' },
  { code: 'ET', name: 'Ethiopia' }, { code: 'EU', name: 'European Union' },
  { code: 'FI', name: 'Finland' }, { code: 'FJ', name: 'Fiji' },
  { code: 'FK', name: 'Falkland Islands' }, { code: 'FM', name: 'Micronesia' },
  { code: 'FO', name: 'Faroe Islands' }, { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'GD', name: 'Grenada' }, { code: 'GE', name: 'Georgia' },
  { code: 'GF', name: 'French Guiana' }, { code: 'GG', name: 'Guernsey' },
  { code: 'GH', name: 'Ghana' }, { code: 'GI', name: 'Gibraltar' },
  { code: 'GL', name: 'Greenland' }, { code: 'GM', name: 'Gambia' },
  { code: 'GN', name: 'Guinea' }, { code: 'GP', name: 'Guadeloupe' },
  { code: 'GQ', name: 'Equatorial Guinea' }, { code: 'GR', name: 'Greece' },
  { code: 'GS', name: 'South Georgia' }, { code: 'GT', name: 'Guatemala' },
  { code: 'GU', name: 'Guam' }, { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' }, { code: 'HK', name: 'Hong Kong' },
  { code: 'HM', name: 'Heard Island and McDonald Islands' }, { code: 'HN', name: 'Honduras' },
  { code: 'HR', name: 'Croatia' }, { code: 'HT', name: 'Haiti' },
  { code: 'HU', name: 'Hungary' }, { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' }, { code: 'IL', name: 'Israel' },
  { code: 'IM', name: 'Isle of Man' }, { code: 'IN', name: 'India' },
  { code: 'IO', name: 'British Indian Ocean Territory' }, { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' }, { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' }, { code: 'JE', name: 'Jersey' },
  { code: 'JM', name: 'Jamaica' }, { code: 'JO', name: 'Jordan' },
  { code: 'JP', name: 'Japan' }, { code: 'KE', name: 'Kenya' },
  { code: 'KG', name: 'Kyrgyzstan' }, { code: 'KH', name: 'Cambodia' },
  { code: 'KI', name: 'Kiribati' }, { code: 'KM', name: 'Comoros' },
  { code: 'KN', name: 'Saint Kitts and Nevis' }, { code: 'KP', name: 'North Korea' },
  { code: 'KR', name: 'South Korea' }, { code: 'KW', name: 'Kuwait' },
  { code: 'KY', name: 'Cayman Islands' }, { code: 'KZ', name: 'Kazakhstan' },
  { code: 'LA', name: 'Laos' }, { code: 'LB', name: 'Lebanon' },
  { code: 'LC', name: 'Saint Lucia' }, { code: 'LI', name: 'Liechtenstein' },
  { code: 'LK', name: 'Sri Lanka' }, { code: 'LR', name: 'Liberia' },
  { code: 'LS', name: 'Lesotho' }, { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' }, { code: 'LV', name: 'Latvia' },
  { code: 'LY', name: 'Libya' }, { code: 'MA', name: 'Morocco' },
  { code: 'MC', name: 'Monaco' }, { code: 'MD', name: 'Moldova' },
  { code: 'ME', name: 'Montenegro' }, { code: 'MF', name: 'Saint Martin' },
  { code: 'MG', name: 'Madagascar' }, { code: 'MH', name: 'Marshall Islands' },
  { code: 'MK', name: 'North Macedonia' }, { code: 'ML', name: 'Mali' },
  { code: 'MM', name: 'Myanmar' }, { code: 'MN', name: 'Mongolia' },
  { code: 'MO', name: 'Macau' }, { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'MQ', name: 'Martinique' }, { code: 'MR', name: 'Mauritania' },
  { code: 'MS', name: 'Montserrat' }, { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Mauritius' }, { code: 'MV', name: 'Maldives' },
  { code: 'MW', name: 'Malawi' }, { code: 'MX', name: 'Mexico' },
  { code: 'MY', name: 'Malaysia' }, { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' }, { code: 'NC', name: 'New Caledonia' },
  { code: 'NE', name: 'Niger' }, { code: 'NF', name: 'Norfolk Island' },
  { code: 'NG', name: 'Nigeria' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NO', name: 'Norway' },
  { code: 'NP', name: 'Nepal' }, { code: 'NR', name: 'Nauru' },
  { code: 'NU', name: 'Niue' }, { code: 'NZ', name: 'New Zealand' },
  { code: 'OM', name: 'Oman' }, { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' }, { code: 'PF', name: 'French Polynesia' },
  { code: 'PG', name: 'Papua New Guinea' }, { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' }, { code: 'PL', name: 'Poland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' }, { code: 'PN', name: 'Pitcairn Islands' },
  { code: 'PR', name: 'Puerto Rico' }, { code: 'PS', name: 'Palestine' },
  { code: 'PT', name: 'Portugal' }, { code: 'PW', name: 'Palau' },
  { code: 'PY', name: 'Paraguay' }, { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' }, { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' }, { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' }, { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SB', name: 'Solomon Islands' }, { code: 'SC', name: 'Seychelles' },
  { code: 'SD', name: 'Sudan' }, { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' }, { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
  { code: 'SI', name: 'Slovenia' }, { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SK', name: 'Slovakia' }, { code: 'SL', name: 'Sierra Leone' },
  { code: 'SM', name: 'San Marino' }, { code: 'SN', name: 'Senegal' },
  { code: 'SO', name: 'Somalia' }, { code: 'SR', name: 'Suriname' },
  { code: 'SS', name: 'South Sudan' }, { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SV', name: 'El Salvador' }, { code: 'SX', name: 'Sint Maarten' },
  { code: 'SY', name: 'Syria' }, { code: 'SZ', name: 'Eswatini' },
  { code: 'TC', name: 'Turks and Caicos Islands' }, { code: 'TD', name: 'Chad' },
  { code: 'TF', name: 'French Southern and Antarctic Lands' }, { code: 'TG', name: 'Togo' },
  { code: 'TH', name: 'Thailand' }, { code: 'TJ', name: 'Tajikistan' },
  { code: 'TK', name: 'Tokelau' }, { code: 'TL', name: 'Timor-Leste' },
  { code: 'TM', name: 'Turkmenistan' }, { code: 'TN', name: 'Tunisia' },
  { code: 'TO', name: 'Tonga' }, { code: 'TR', name: 'Turkey' },
  { code: 'TT', name: 'Trinidad and Tobago' }, { code: 'TV', name: 'Tuvalu' },
  { code: 'TW', name: 'Taiwan' }, { code: 'TZ', name: 'Tanzania' },
  { code: 'UA', name: 'Ukraine' }, { code: 'UG', name: 'Uganda' },
  { code: 'UM', name: 'United States Minor Outlying Islands' }, { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VA', name: 'Vatican City' }, { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'VE', name: 'Venezuela' }, { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'United States Virgin Islands' }, { code: 'VN', name: 'Vietnam' },
  { code: 'VU', name: 'Vanuatu' }, { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'WS', name: 'Samoa' }, { code: 'XK', name: 'Kosovo' },
  { code: 'YE', name: 'Yemen' }, { code: 'YT', name: 'Mayotte' },
  { code: 'ZA', name: 'South Africa' }, { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

function FlagImg({ code }: { code: string }) {
  const lower = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w20/${lower}.png`}
      srcSet={`https://flagcdn.com/w40/${lower}.png 2x`}
      width={20}
      height={15}
      alt={code}
      className="flex-shrink-0"
    />
  );
}

export function CountrySelector({ name, defaultValue, onAutoGenerate }: {
  name: string;
  defaultValue?: string[] | null;
  onAutoGenerate?: () => Promise<string[]>;
}) {
  const [selected, setSelected] = useState<string[]>(defaultValue ?? []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.toLowerCase();
  const filtered = COUNTRIES.filter(
    (c) => !selected.includes(c.code) &&
      (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)),
  ).slice(0, 10);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function add(code: string) {
    setSelected((prev) => [...prev, code]);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(code: string) {
    setSelected((prev) => prev.filter((c) => c !== code));
  }

  async function handleAutoGenerate() {
    if (!onAutoGenerate) return;
    setGenerating(true);
    try {
      const codes = await onAutoGenerate();
      setSelected(codes);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Countries</label>
        {onAutoGenerate && (
          <button
            type="button"
            onClick={handleAutoGenerate}
            disabled={generating}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {generating ? 'Generating…' : 'Auto Generate'}
          </button>
        )}
      </div>
      {selected.map((code) => (
        <input key={code} type="hidden" name={name} value={code} />
      ))}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((code) => (
            <span
              key={code}
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-700 dark:text-zinc-200"
            >
              <FlagImg code={code} />
              <span className="font-mono text-xs font-semibold">{code}</span>
              <button
                type="button"
                onClick={() => remove(code)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by country name or code…"
          value={query}
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
        />
        {open && filtered.length > 0 && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(c.code); }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <FlagImg code={c.code} />
                <span>{c.name}</span>
                <span className="ml-auto font-mono text-xs text-zinc-400">{c.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
