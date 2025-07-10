
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { ArrowLeft, Save, Eye, EyeOff, FileText, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  createdAt: string;
  tags: string[];
  readingTime: number;
}

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      const savedPosts = localStorage.getItem('markblog-posts');
      if (savedPosts) {
        const posts: BlogPost[] = JSON.parse(savedPosts);
        const post = posts.find(p => p.id === id);
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          setAuthor(post.author);
          setTags(post.tags.join(', '));
          setIsEditing(true);
        }
      }
    }
  }, [id]);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const generateExcerpt = (text: string) => {
    const plainText = text.replace(/[#*`\[\]()]/g, '').trim();
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in title, content, and author fields.",
        variant: "destructive"
      });
      return;
    }

    const savedPosts = localStorage.getItem('markblog-posts');
    const posts: BlogPost[] = savedPosts ? JSON.parse(savedPosts) : [];
    
    const blogPost: BlogPost = {
      id: isEditing ? id! : Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      excerpt: generateExcerpt(content),
      author: author.trim(),
      createdAt: isEditing ? posts.find(p => p.id === id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      readingTime: calculateReadingTime(content)
    };

    if (isEditing) {
      const index = posts.findIndex(p => p.id === id);
      if (index !== -1) {
        posts[index] = blogPost;
      }
    } else {
      posts.unshift(blogPost);
    }

    localStorage.setItem('markblog-posts', JSON.stringify(posts));
    
    toast({
      title: isEditing ? "Post updated!" : "Post saved!",
      description: isEditing ? "Your changes have been saved." : "Your post has been published successfully."
    });

    navigate('/');
  };

  const markdownToHtml = (markdown: string) => {
    return marked(markdown);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Stories
                </Button>
              </Link>
              <div className="hidden sm:block text-sm text-gray-500">
                {isEditing ? 'Editing Story' : 'New Story'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Editor Panel */}
          <div className={`space-y-4 ${showPreview ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your story title..."
                  className="text-lg font-semibold"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Author
                  </Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tech, programming, web"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 flex-1">
              <Label htmlFor="content" className="block mb-2 font-medium">
                Content (Markdown)
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Your Story Title

Write your story here using **Markdown** syntax...

## Subheading

- List item 1
- List item 2

> This is a quote

```javascript
console.log('Hello, World!');
```

[Link text](https://example.com)"
                className="min-h-[500px] font-mono"
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`${showPreview ? '' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
              <div className="mb-6 pb-6 border-b">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title || 'Untitled Story'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {author || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{calculateReadingTime(content)} min read</span>
                  {tags && (
                    <>
                      <span>•</span>
                      <div className="flex gap-1">
                        {tags.split(',').map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-pink-600 prose-pre:bg-gray-100"
                dangerouslySetInnerHTML={{ 
                  __html: content ? markdownToHtml(content) : '<p class="text-gray-400 italic">Start writing to see the preview...</p>' 
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;
