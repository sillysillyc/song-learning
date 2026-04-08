import type { IFolder, ISong, ILyric, ILyricMark } from '@/store';

/**
 * 生成唯一 ID
 */
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 生成随机时间戳（过去 30 天内）
 */
const randomTimestamp = (daysAgo = 30): string => {
  const now = Date.now();
  const randomOffset = Math.floor(Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return (now - randomOffset).toString();
};

/**
 * 预设的文件夹名称
 */
const FOLDER_NAMES = [
  '华语流行',
  '欧美金曲',
  '粤语经典',
  '日系音乐',
  '韩流 KPOP',
  '民谣精选',
  '摇滚乐章',
  '说唱 hip-hop',
  '电子音乐',
  '古风歌曲',
  '影视 OST',
  '动漫音乐',
  '轻音乐',
  '爵士乐',
  '古典音乐',
  'R&B 节奏',
  '乡村音乐',
  '金属乐',
  '朋克摇滚',
  '独立音乐',
];

/**
 * 预设的歌曲名称
 */
const SONG_NAMES = [
  '稻香',
  '青花瓷',
  '告白气球',
  '七里香',
  '晴天',
  '简单爱',
  '夜曲',
  '以父之名',
  '千里之外',
  '菊花台',
  '不能说的秘密',
  '最长的电影',
  '安静',
  '开不了口',
  '爱在西元前',
  '反方向的钟',
  '龙卷风',
  '搁浅',
  '枫',
  '珊瑚海',
  '海阔天空',
  '光辉岁月',
  '真的爱你',
  '吻别',
  '一千个伤心的理由',
  '吻得太逼真',
  '浮夸',
  '十年',
  '爱情转移',
  '富士山下',
  '红豆',
  '传奇',
  '因为爱情',
  '匆匆那年',
  '容易受伤的女人',
  '月亮代表我的心',
  '甜蜜蜜',
  '小城故事',
  '我只在乎你',
  '千千阙歌',
];

/**
 * 预设的歌手名称
 */
const SINGERS = [
  '周杰伦',
  '陈奕迅',
  '林俊杰',
  '张学友',
  '王菲',
  '刘德华',
  '郭富城',
  '黎明',
  'Beyond',
  '孙燕姿',
  '蔡依林',
  '邓紫棋',
  '李荣浩',
  '薛之谦',
  '毛不易',
  '华晨宇',
  '张杰',
  '林宥嘉',
  '杨丞琳',
  '梁静茹',
];

/**
 * 预设的专辑名称
 */
const ALBUMS = [
  'Jay',
  '范特西',
  '叶惠美',
  '七里香',
  '十一月的肖邦',
  '依然范特西',
  '跨时代',
  '最伟大的作品',
  'U-87',
  'Stranger Under My Skin',
  '她说',
  '学不会',
  '伟大的渺小',
  'Smile',
  '醒着做梦',
];

/**
 * 预设的歌词内容
 */
const LYRICS_TEMPLATES = [
  ['对这个世界如果你有太多的抱怨', '跌倒了就不敢继续往前走', '为什么人要这么的脆弱堕落', '请你打开电视看看', '多少人为生命在努力勇敢的走下去', '我们是不是该知足'],
  ['素胚勾勒出青花笔锋浓转淡', '瓶身描绘的牡丹一如你初妆', '冉冉檀香透过窗心事我了然', '宣纸上走笔至此搁一半'],
  ['亲爱的爱上你从那天起', '甜蜜的很轻易', '亲爱的别任性你的眼睛', '在说我愿意'],
  ['窗外的麻雀在电线杆上多嘴', '你说这一句很有夏天的感觉', '手中的铅笔在纸上来来回回', '我用几行字形容你是我的谁'],
  ['故事的小黄花从出生那年就飘着', '童年的荡秋千随记忆一直晃到现在', 'Re So So Si Do Si La', 'So La Si Si Si Si La Si La So'],
  ['海阔天空依旧仍是少年', '狂笑过后眼泪在眼前', '我命由我不由天', '逆风的方向更适合飞翔'],
  ['今天我寒夜里看雪飘过', '怀着冷却了的心窝漂远方', '风雨里追赶雾里分不清影踪', '天空海阔你与我可会变'],
  ['十年之前我不认识你你不属于我', '我们还是一样陪在一个陌生人左右', '走过渐渐熟悉的街头', '十年之后我们是朋友还可以问候'],
  ['有时候有时候我会相信一切有尽头', '相聚离开都有时候没有什么会永垂不朽', '可是我有时候宁愿选择留恋不放手', '等到风景都看透也许你会陪我看细水长流'],
  ['你存在我深深的脑海里', '我的梦里我的心里我的歌声里', '你存在我深深的脑海里', '我的梦里我的心里我的歌声里'],
];

/**
 * 预设的标记备注
 */
const MARK_NOTES = [
  '这里需要加强气息',
  '注意转音',
  '高音部分',
  '情感爆发点',
  '轻声处理',
  '颤音',
  '假音转换',
  '节奏变化',
];

/**
 * 生成随机歌词
 */
const generateLyrics = (): ILyric[] => {
  const template = LYRICS_TEMPLATES[Math.floor(Math.random() * LYRICS_TEMPLATES.length)];
  return template.map((line, index) => ({
    content: line,
    timeTag: index * 3 + Math.floor(Math.random() * 3),
  }));
};

/**
 * 生成随机标记
 */
const generateMarks = (lyrics: ILyric[]): ILyricMark[] => {
  const marks: ILyricMark[] = [];
  const markCount = Math.floor(Math.random() * 5); // 0-4 个标记

  for (let i = 0; i < markCount; i++) {
    const lyricIndex = Math.floor(Math.random() * lyrics.length);
    const lyric = lyrics[lyricIndex];
    const length = Math.floor(Math.random() * Math.min(4, lyric.content.length)) + 1;
    const startOffset = Math.floor(Math.random() * (lyric.content.length - length));

    marks.push({
      id: generateId('mark'),
      lyricIndex,
      startOffset,
      length,
      color: Math.random() > 0.5 ? { type: 'preset', value: ['blue', 'red', 'green', 'orange', 'purple'][Math.floor(Math.random() * 5)] } : { type: 'custom', value: '#ff6b6b' },
      shape: ['default', 'square', 'circle', 'underline'][Math.floor(Math.random() * 4)] as 'default' | 'square' | 'circle' | 'underline',
      symbol: Math.random() > 0.5 ? { type: 'emoji', value: ['🎵', '⭐', '❤️', '🔥', '✅'][Math.floor(Math.random() * 5)] } : { type: 'none', value: '' },
      note: MARK_NOTES[Math.floor(Math.random() * MARK_NOTES.length)],
      createTime: randomTimestamp(),
      updateTime: randomTimestamp(),
    });
  }

  return marks;
};

/**
 * 生成随机歌曲
 */
const generateSong = (): ISong => {
  const lyrics = generateLyrics();
  const marks = generateMarks(lyrics);

  return {
    id: generateId('song'),
    name: SONG_NAMES[Math.floor(Math.random() * SONG_NAMES.length)],
    singer: SINGERS[Math.floor(Math.random() * SINGERS.length)],
    album: ALBUMS[Math.floor(Math.random() * ALBUMS.length)],
    duration: `${Math.floor(Math.random() * 3) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    createTime: randomTimestamp(60),
    updateTime: randomTimestamp(30),
    lyrics,
    marks,
  };
};

/**
 * 生成随机歌曲数量（每文件夹 3-8 首）
 */
const generateSongs = (count?: number): ISong[] => {
  const songCount = count ?? Math.floor(Math.random() * 6) + 3;
  return Array.from({ length: songCount }, generateSong);
};

/**
 * 生成 50 条文件夹数据
 */
export const generateMockFolders = (count = 50): IFolder[] => {
  return Array.from({ length: count }, (_, index) => {
    const songs = generateSongs();
    const now = Date.now().toString();

    return {
      id: generateId('folder'),
      name: FOLDER_NAMES[index % FOLDER_NAMES.length] + (index >= FOLDER_NAMES.length ? ` ${Math.floor(index / FOLDER_NAMES.length) + 1}` : ''),
      songCount: songs.length,
      createTime: randomTimestamp(90),
      updateTime: randomTimestamp(30),
      songs,
    };
  });
};

/**
 * 生成单条文件夹数据（用于测试）
 */
export const generateMockFolder = (): IFolder => {
  const songs = generateSongs();
  return {
    id: generateId('folder'),
    name: FOLDER_NAMES[Math.floor(Math.random() * FOLDER_NAMES.length)],
    songCount: songs.length,
    createTime: randomTimestamp(90),
    updateTime: randomTimestamp(30),
    songs,
  };
};

/**
 * 导入 mock 数据到 localStorage
 */
export const importMockDataToStorage = (count = 50): void => {
  const folders = generateMockFolders(count);
  const data = {
    folders: {
      folders,
      currentFolder: null,
      currentSong: null,
      isFolderDrawerOpen: false,
    },
  };
  localStorage.setItem('root', JSON.stringify(data));
  console.log(`已导入 ${count} 条文件夹数据到 localStorage`);
};

/**
 * 导出数据为 JSON 文件
 */
export const exportDataToJSON = (): void => {
  const root = localStorage.getItem('root');
  if (!root) {
    console.warn('没有找到可导出的数据');
    return;
  }

  const data = JSON.parse(root);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `song-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('数据导出成功');
};

/**
 * 从 JSON 文件导入数据
 * @param jsonString - JSON 字符串
 * @returns 是否导入成功
 */
export const importDataFromJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.folders && Array.isArray(data.folders.folders)) {
      localStorage.setItem('root', JSON.stringify(data));
      console.log('数据导入成功');
      return true;
    }
    console.error('JSON 格式不正确');
    return false;
  } catch (error) {
    console.error('JSON 解析失败:', error);
    return false;
  }
};
