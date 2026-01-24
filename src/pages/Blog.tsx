import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
          {/* Page Header */}
          <div className="max-w-2xl mb-16">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Insights on AI commerce and the future of e-commerce
            </p>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group block bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:border-accent/30"
              >
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{post.date}</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="font-display text-xl text-foreground mb-3 group-hover:text-accent transition-colors">
                  {post.title}
                </h2>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                <span className="inline-flex items-center text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                  Read article
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
