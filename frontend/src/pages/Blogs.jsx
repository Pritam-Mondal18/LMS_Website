import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import api from '../services/api';
import { Calendar, User, Tag, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import SEO from '../components/common/SEO';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/blogs');
      if (response.data.success) {
        setBlogs(response.data.blogs || []);
      }
    } catch {
      // fallback mock blogs
      setBlogs([
        {
          _id: 'mock_blog_1',
          title: "How to Master Organic Chemistry for JEE",
          content: "<p>Organic chemistry is one of the highest-scoring sections in JEE. To master it, start by visualizing the reaction mechanisms instead of blindly memorizing them. Focus on General Organic Chemistry (GOC) and Reaction Mechanisms thoroughly.</p><br/><p>Make summary charts for all name reactions, reagent actions, and order of acidic/basic strength. Practice daily to build speed and accuracy.</p>",
          excerpt: "Top preparation strategies to score 100% in JEE Organic Chemistry.",
          category: "jee",
          tags: ["Chemistry", "JEE Prep", "Study Tips"],
          createdAt: new Date().toISOString(),
          author: { name: "Sumit Chakraborty" }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      <SEO 
        title={selectedBlog ? selectedBlog.title : "Education Blog & Resources"} 
        description={selectedBlog ? selectedBlog.excerpt : "Stay updated with prep strategies, study notes, formula cheatsheets, and academic blogs from Sumit Chakraborty Academy HODs."}
        keywords={selectedBlog ? `${selectedBlog.title}, ${selectedBlog.category}` : "prep blogs, study resources, chemistry hacks, math shortcuts"}
      />
      {selectedBlog ? (
        /* Blog Detail Reader */
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
          <button
            onClick={() => setSelectedBlog(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </button>
          
          <div className="space-y-4">
            <span className="bg-brand-pink/15 text-brand-pink text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-brand-pink/20">
              {selectedBlog.category?.toUpperCase() || 'GENERAL'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{selectedBlog.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-xs text-brand-textMuted pt-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> By {selectedBlog.author?.name || 'Academy Editor'}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 5 min read</span>
            </div>
          </div>

          <div className="aspect-video bg-brand-surface border border-brand-purple/10 rounded-3xl flex items-center justify-center relative overflow-hidden">
            <BookOpen className="w-20 h-20 text-brand-purple/20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet/50 to-transparent"></div>
          </div>

          {/* Article Content */}
          <div
            className="prose prose-invert max-w-none text-brand-textMuted text-sm sm:text-base leading-relaxed space-y-4 pt-4 border-t border-white/5"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedBlog.content) }}
          ></div>

          {/* Tags */}
          {selectedBlog.tags && selectedBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
              {selectedBlog.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 bg-brand-violet/30 border border-brand-purple/20 text-xs text-brand-textMuted px-3 py-1 rounded-xl">
                  <Tag className="w-3.5 h-3.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Blog List */
        <div className="space-y-12">
          <div className="text-left space-y-4">
            <h1 className="text-3xl sm:text-4xl font-black text-white">Study Resources & Blogs</h1>
            <p className="text-brand-textMuted max-w-2xl text-sm">
              Read free guides, formulas sheets, preparation strategies and notifications published by our academy faculties.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="glass-card rounded-3xl border border-brand-purple/10 overflow-hidden flex flex-col justify-between h-full animate-pulse">
                  <div className="p-6 text-left space-y-4">
                    <div className="h-4 bg-brand-violet/20 rounded w-1/4"></div>
                    <div className="h-6 bg-brand-violet/20 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-brand-violet/20 rounded w-full"></div>
                      <div className="h-3 bg-brand-violet/20 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                    <div className="h-3 bg-brand-violet/20 rounded w-1/3"></div>
                    <div className="h-3 bg-brand-violet/20 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-brand-violet/10 rounded-3xl border border-brand-purple/10">
              <BookOpen className="w-16 h-16 text-brand-textMuted/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Articles Yet</h3>
              <p className="text-brand-textMuted text-sm">Our mentors are writing new resource lists. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => setSelectedBlog(blog)}
                  className="glass-card rounded-3xl border border-brand-purple/15 overflow-hidden flex flex-col justify-between cursor-pointer glass-card-hover h-full"
                >
                  <div className="p-6 text-left space-y-4">
                    <span className="bg-brand-pink/15 text-brand-pink text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-brand-pink/10">
                      {blog.category?.toUpperCase() || 'PREP'}
                    </span>
                    <h3 className="text-lg font-black text-white line-clamp-2 leading-snug hover:text-brand-pink transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-brand-textMuted line-clamp-3 leading-relaxed">
                      {blog.excerpt || "Click to read full preparation guide and download syllabus worksheets."}
                    </p>
                  </div>
                  <div className="p-6 pt-0 flex justify-between items-center text-xs text-brand-textMuted border-t border-white/5 mt-4 pt-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="text-brand-pink font-bold hover:underline">Read Article →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
