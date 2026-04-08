export const getUuid = () => {
  const len = 32;

  const _len = Number(len);

  const radix = 16; // 16 进制

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid: string[] = [];
  let i;

  if (_len) {
    for (i = 0; i < _len; i += 1) {
      uuid[i] = chars[0 | (Math.random() * radix)];
    }
  } else {
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    for (i = 0; i < 36; i += 1) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
};
