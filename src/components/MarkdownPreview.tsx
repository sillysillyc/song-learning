import { useEffect, useState } from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
});

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    setHtmlContent(md.render(content));
  }, [content]);

  return <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default MarkdownPreview;
