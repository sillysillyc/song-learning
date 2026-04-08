import { useParams } from 'react-router-dom';
import { Affix, Button, Card, Space } from 'antd';
import MarkdownPreview from '@/components/MarkdownPreview';
import { useSelector } from 'react-redux';
import { selectCurrentFolder, selectCurrentSong } from '@/store';
import { LyricsEditor } from './components';
{
  /* <MarkdownPreview
  content={`# Song Detail

ID: ${id}

## Song Information

- Title: Song Title
- Artist: Artist Name
- Difficulty: Intermediate

## Practice Tips

1. Start with slow tempo
2. Focus on rhythm
3. Practice in sections

## Progress

- [ ] First section
- [ ] Second section
- [ ] Third section
- [ ] Full song`}
/> */
}
export const SongDetail = () => {
  const currentSong = useSelector(selectCurrentSong);
  const currentFolder = useSelector(selectCurrentFolder);

  return (
    <Card
      title={`Song ID: ${currentSong?.id}`}
      extra={
        <Affix offsetTop={60} target={() => document.querySelector<HTMLElement>('.ant-layout-content')}>
          <Space>
            <Button>编辑</Button>
            <Button danger>删除</Button>
          </Space>
        </Affix>
      }
    >
      <LyricsEditor lyrics={currentSong?.lyrics || []} />
    </Card>
  );
};
