import { X } from "lucide-react";

interface BlogPreviewModalProps {
  post: {
    title: string;
    excerpt: string;
    content: string;
    keywords?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  onClose: () => void;
}

export default function BlogPreviewModal({ post, onClose }: BlogPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Blog Post Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-8 space-y-6">
          {/* SEO Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-blue-900">SEO Preview</h3>
            <div className="text-sm">
              <p className="text-blue-600 font-semibold">
                {post.metaTitle || post.title}
              </p>
              <p className="text-green-600 text-xs">
                imidesign.in › blog › {post.title.toLowerCase().replace(/\s+/g, "-")}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {post.metaDescription || post.excerpt}
              </p>
            </div>
          </div>

          {/* Keywords */}
          {post.keywords && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-purple-900 mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {post.keywords.split(",").map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-semibold"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Article Preview */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
              <p className="text-lg text-muted-foreground">{post.excerpt}</p>
            </div>

            <hr className="border-border" />

            {/* Article Content */}
            <div className="prose prose-sm max-w-none">
              <div
                className="space-y-4 text-foreground"
                dangerouslySetInnerHTML={{
                  __html: post.content || "<p>No content yet</p>",
                }}
              />
            </div>
          </div>

          {/* Meta Information */}
          <div className="bg-gray-50 border border-border rounded-lg p-4 space-y-2 text-sm">
            <div>
              <span className="font-semibold">Meta Title:</span>
              <p className="text-muted-foreground">{post.metaTitle || "Not set"}</p>
            </div>
            <div>
              <span className="font-semibold">Meta Description:</span>
              <p className="text-muted-foreground">{post.metaDescription || "Not set"}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
