import { useParams, Link, Navigate } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <article className="max-w-3xl mx-auto px-6 md:px-12">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>{post.date}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-10">
            {post.title}
          </h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="font-display text-2xl md:text-3xl text-foreground mt-12 mb-4">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-2xl md:text-3xl text-foreground mt-12 mb-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-xl md:text-2xl text-foreground mt-8 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-6 text-foreground/80">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-6 text-foreground/80">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-accent pl-6 my-6 italic text-foreground/70">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block bg-secondary p-4 rounded overflow-x-auto text-sm font-mono mb-6">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-secondary p-4 rounded overflow-x-auto mb-6">
                    {children}
                  </pre>
                ),
                hr: () => <hr className="border-border my-10" />,
                em: ({ children }) => (
                  <em className="text-muted-foreground">{children}</em>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* CTA Section */}
          <div className="mt-16 pt-10 border-t border-border">
            <div className="bg-card border border-border p-8 text-center">
              <h3 className="font-display text-2xl text-foreground mb-3">
                Check your store's AI readiness
              </h3>
              <p className="text-muted-foreground mb-6">
                Get your AI Commerce Score and actionable recommendations in 60 seconds.
              </p>
              <Link to="/">
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  Check your store
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
