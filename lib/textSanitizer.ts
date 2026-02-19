const MOJIBAKE_HINT = /(Ã.|Â.|â..|ï¿½)/;

const decodeLatin1AsUtf8 = (text: string) => {
  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 0xff));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return text;
  }
};

const scoreMojibake = (text: string) => (text.match(/Ã|Â|â|ï¿½/g) || []).length;

const fallbackMap: Array<[RegExp, string]> = [
  [/Ã¡/g, 'a'],
  [/Ã¢/g, 'a'],
  [/Ã£/g, 'a'],
  [/Ã¤/g, 'a'],
  [/Ã©/g, 'e'],
  [/Ãª/g, 'e'],
  [/Ã­/g, 'i'],
  [/Ã³/g, 'o'],
  [/Ã´/g, 'o'],
  [/Ãµ/g, 'o'],
  [/Ãº/g, 'u'],
  [/Ã§/g, 'c'],
  [/Ã/g, ''],
  [/Â/g, ''],
  [/â€¦/g, '...'],
  [/â€“|â€”/g, '-'],
  [/â€œ|â€/g, '"'],
  [/â€˜|â€™/g, "'"],
];

export const sanitizeText = (value: string) => {
  if (!value) return value;
  if (!MOJIBAKE_HINT.test(value)) return value;

  const decoded = decodeLatin1AsUtf8(value);
  if (decoded && scoreMojibake(decoded) < scoreMojibake(value)) {
    return decoded;
  }

  let sanitized = value;
  for (const [pattern, replacement] of fallbackMap) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
};
