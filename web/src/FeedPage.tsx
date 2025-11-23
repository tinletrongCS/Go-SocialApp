import { useEffect, useState } from "react";
import { fetcher } from "./api";
import { useNavigate } from "react-router-dom";

interface Post {
  id: number;
  user_id: number; // ID người đăng bài
  title: string;
  content: string;
  username: string;
  created_at: string;
  comments_count: number;
  tags: string[];
}

interface User {
  id: number;
  username: string;
  email: string;
  isFollowing: boolean;
}

export const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE CHO TÌM KIẾM ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  
  // --- STATE CHO TẠO BÀI VIẾT ---
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("user_id");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/auth");
  };

  // Load Feed
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await fetcher("/users/feed?limit=20&sort=desc");
        setPosts(data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [navigate]);

  // --- HÀM TÌM KIẾM ---
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await fetcher(`/users/search?q=${query}`);
      
      // Map dữ liệu từ Backend (snake_case) sang Frontend (camelCase)
      const mappedUsers = (data.data || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        isFollowing: u.is_following 
      }));
      
      setSearchResults(mappedUsers);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  // --- HÀM TOGGLE FOLLOW ---
  const handleToggleFollow = async (user: User) => {
    try {
      if (user.isFollowing) {
        await fetcher(`/users/${user.id}/unfollow`, { method: "PUT" });
      } else {
        await fetcher(`/users/${user.id}/follow`, { method: "PUT" });
      }

      setSearchResults(prev => prev.map(u => 
        u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
      ));
    } catch (error: any) {
      if (!user.isFollowing && error.message?.includes("conflict")) {
         setSearchResults(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFollowing: true } : u
        ));
      } else {
        alert("Thao tác thất bại: " + error.message);
      }
    }
  };

  // --- HÀM TẠO BÀI VIẾT ---
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }

    try {
      setIsCreating(true);
      
      const tagsArray = newPost.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title: newPost.title,
        content: newPost.content,
        tags: tagsArray
      };

      // Gọi API tạo bài viết
      await fetcher("/posts", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setNewPost({ title: "", content: "", tags: "" });
      
      // Reload lại feed để thấy bài mới
      const feedData = await fetcher("/users/feed?limit=20&sort=desc");
      setPosts(feedData.data || []);

    } catch (error: any) {
      alert("Đăng bài thất bại: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0" }}>
        <h2 style={{ margin: 0 }}>🐢 Tho-ret-Ci-ty 🏢🏢🏬🏬</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => navigate(`/profile/${currentUserId}`)} 
            style={{ background: "#333", border: "none", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}
          >
            Trang cá nhân
          </button>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #333", color: "white", padding: "8px 15px", borderRadius: "20px", cursor: "pointer" }}>Đăng xuất</button>
        </div>
      </header>

      {/* --- KHUNG TÌM KIẾM --- */}
      <div style={{ marginBottom: "20px", position: "relative" }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="🔍 Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        {/* Kết quả tìm kiếm */}
        {searchResults.length > 0 && (
          <div style={{ 
            position: "absolute", top: "100%", left: 0, right: 0, 
            background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px",
            zIndex: 100, maxHeight: "300px", overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
          }}>
            {searchResults.map(user => (
              <div key={user.id} style={{ padding: "12px 16px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ textAlign: 'left', cursor: "pointer" }} onClick={() => navigate(`/profile/${user.id}`)}>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{user.username}</div>
                  <div style={{ fontSize: "0.85rem", color: "#777", marginTop: "2px" }}>{user.email}</div>
                </div>
                <button 
                  onClick={() => handleToggleFollow(user)}
                  style={{ 
                    backgroundColor: user.isFollowing ? "#333" : "#00C853", 
                    color: user.isFollowing ? "#ccc" : "#000",
                    border: user.isFollowing ? "1px solid #555" : "none",
                    padding: "6px 16px", borderRadius: "8px", cursor: "pointer",
                    fontWeight: "600", fontSize: "0.85rem", minWidth: "120px", transition: "all 0.2s"
                  }}
                >
                  {user.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- KHUNG TẠO BÀI VIẾT --- */}
      <div className="card" style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "12px", border: "1px solid #333" }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem" }}>Tạo bài viết mới</h3>
        
        <input 
          className="input-field" 
          placeholder="Tiêu đề bài viết (Bắt buộc)" 
          value={newPost.title}
          onChange={e => setNewPost({...newPost, title: e.target.value})}
          style={{ fontWeight: "bold" }}
        />
        
        <textarea 
          className="input-field" 
          placeholder="Bạn đang nghĩ gì? (Nội dung bắt buộc)" 
          value={newPost.content}
          onChange={e => setNewPost({...newPost, content: e.target.value})}
          style={{ minHeight: "100px", resize: "vertical", fontFamily: "inherit" }}
        />
        
        <input 
          className="input-field" 
          placeholder="Thẻ tags (cách nhau bằng dấu phẩy, ví dụ: tech, life, music)" 
          value={newPost.tags}
          onChange={e => setNewPost({...newPost, tags: e.target.value})}
        />
        
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={handleCreatePost} 
            disabled={isCreating}
            className="btn"
            style={{ width: "auto", padding: "8px 24px", marginTop: "0", opacity: isCreating ? 0.7 : 1 }}
          >
            {isCreating ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </div>

      <h3 style={{marginBottom: "15px", borderBottom: "2px solid #333", paddingBottom: "10px", display: "inline-block"}}>News Feed</h3>

      {loading ? <p>Loading...</p> : (
        <div>
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", color: "#777", marginTop: "50px" }}>
              <p>Chưa có bài viết nào.</p>
              <p>Hãy nhập tên vào ô tìm kiếm và <b>Theo dõi</b> mọi người, hoặc tự đăng bài viết đầu tiên nhé!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="card" style={{ marginBottom: "15px", backgroundColor: "#161616", borderRadius: "12px", padding: "20px", border: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div 
                    style={{ fontWeight: "bold", color: "#fff", cursor: "pointer" }}
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  >
                    @{post.username}
                  </div>
                  <div style={{ color: "#666", fontSize: "0.8rem" }}>{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
                
                <h3 style={{ fontSize: "1.2rem", margin: "10px 0", color: "#f3f5f7" }}>{post.title}</h3>
                <p style={{ color: "#ccc", fontSize: "1rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{post.content}</p>
                
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {post.tags && post.tags.map(tag => (
                    <span key={tag} style={{ color: "#1d9bf0", fontSize: "0.85rem", backgroundColor: "#1d9bf01a", padding: "2px 8px", borderRadius: "4px" }}>#{tag}</span>
                  ))}
                </div>
                
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #333", color: "#777", fontSize: "0.9rem", display: "flex", gap: "15px" }}>
                  <span>💬 {post.comments_count} bình luận</span>
                  <span style={{ cursor: "pointer" }}>❤️ Like (Coming soon)</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};