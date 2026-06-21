import { colors } from '@theme';
import { Dimensions } from 'react-native';

const behavior = 'padding';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const itemWidth = Dimensions.get('window').width / 2 - 16;
const timeFormat = 'hh:mm A';
const dateFormate = 'DD/MM/YYYY';
const bottomTabIconWidth = 25;

const timerTime = (e: number) => {
  const h = Math.floor(e / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((e % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(e % 60)
    .toString()
    .padStart(2, '0');

  if (h == '00') {
    return `${m}:${s}`;
  } else {
    return `${h}:${m}:${s}`;
  }
};

function abbreviatePairs(text: any) {
  return text
    .split(/\r?\n/)
    .map((line: any) => {
      const [first = '', last = ''] = line
        .split('/')
        .map((s: string) => s.trim());
      return `${first.slice(0, 2)}/${last.slice(0, 2)}`;
    })
    .join('\n');
}

const maskMobile = (mobile: string) => {
  if (!mobile) return '';
  return mobile.slice(0, 3) + '*****' + mobile.slice(-2);
};

const abbrNum = (
  num: number,
  decPlaces: number = 2,
  minValue = 100000,
): string => {
  const abbrev = ['k', 'm', 'b', 't', 'aa', 'ab', 'ac'];
  const factor = Math.pow(10, decPlaces);
  if (num < minValue) return num.toString();
  for (let i = abbrev.length - 1; i >= 0; i--) {
    const size = Math.pow(10, (i + 1) * 3);
    if (num >= size) {
      const newNum = Math.floor((num * factor) / size) / factor;
      return newNum.toString() + abbrev[i];
    }
  }
  return num.toString();
};

const crypt = (salt: string, text: string): string => {
  const textToChars = (text: string) =>
    text.split('').map(c => c.charCodeAt(0));
  const byteHex = (n: number) => ('0' + n.toString(16)).slice(-2);
  const applySaltToChar = (code: number) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split('')
    .map(c => c.charCodeAt(0))
    .map(applySaltToChar)
    .map(byteHex)
    .join('');
};

const decrypt = (salt: string, encoded: string): string => {
  const textToChars = (text: string) =>
    text.split('').map(c => c.charCodeAt(0));
  const applySaltToChar = (code: number) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)!
    .map(hex => parseInt(hex, 16))
    .map(applySaltToChar)
    .map(code => String.fromCharCode(code))
    .join('');
};

const indianFormatePrice = ({
  price,
  isCrypto = false,
  currencySymbol = '$',
}: {
  price: number;
  isCrypto?: boolean;
  currencySymbol?: string;
}) => {
  const formatedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  if (isCrypto) {
    return `${currencySymbol}${formatedNumber}`;
  }

  return `₹${formatedNumber}`;
};

const getAssetColor = (asset: string) => {
  let hash = 0;
  for (let i = 0; i < asset.length; i++) {
    hash = asset.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
};

export const getAvatarColors = (value: string) => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  // Keep saturation and lightness in a readable range
  const saturation = 60 + (Math.abs(hash) % 20); // 60-79%
  const lightness = 40 + (Math.abs(hash >> 8) % 15); // 40-54%

  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // Convert HSL to RGB for contrast calculation
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  const brightness = r * 299 + g * 587 + b * 114;

  return {
    backgroundColor,
    textColor: brightness > 140 ? '#000000' : '#FFFFFF',
  };
};

const isPositiveNumber = (value: number) => {
  return value > 0;
};

type SignedChangeColorOptions = {
  positiveColor?: string;
  negativeColor?: string;
};



const formatUsdtPrice = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatBtcAmount = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  });


const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getArrayFromPayload = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const isArrayEmpty = (value: any): boolean => {
  return Array.isArray(value) && value.length === 0;
};

export {
  abbreviatePairs,
  abbrNum,
  behavior,
  bottomTabIconWidth,
  crypt,
  dateFormate,
  decrypt,
  deviceHeight,
  deviceWidth,
  getAssetColor,
  formatBtcAmount,
  formatUsdtPrice,
  indianFormatePrice,
  isPositiveNumber,
  itemWidth,
  maskMobile,
  timeFormat,
  timerTime,
  toNumber,
  getArrayFromPayload,
  isArrayEmpty,
};
