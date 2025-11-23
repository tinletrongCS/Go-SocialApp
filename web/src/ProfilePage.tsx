import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetcher } from "./api";

export const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

  const currentUserId = localStorage.getItem("user_id");
  const isMe = currentUserId === id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song các API để lấy dữ liệu
        const [userData, postsData, followersData, followingData] = await Promise.all([
          fetcher(`/users/${id}`),
          fetcher(`/users/${id}/posts`),
          fetcher(`/users/${id}/followers`),
          fetcher(`/users/${id}/followings`),
        ]);

        setUser(userData.data);
        setPosts(postsData.data || []);
        setStats({
          followers: followersData.data ? followersData.data.length : 0,
          following: followingData.data ? followingData.data.length : 0,
        });
      } catch (error) {
        console.error(error);
        alert("Lỗi tải trang cá nhân");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="container" style={{marginTop: "20px"}}>Đang tải...</div>;
  if (!user) return <div className="container">Không tìm thấy người dùng</div>;

  return (
    <div className="container">
      <button onClick={() => navigate("/")} className="btn" style={{width: "auto", marginBottom: "20px", background: "transparent", border: "1px solid #333", color: "white"}}>
        ← Quay lại Feed
      </button>

      {/* Header Profile */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>{user.username}</h1>
          <p style={{ color: "#777", marginTop: "5px" }}>{user.email}</p>
          {isMe && <span style={{background: "#333", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem"}}>Chính chủ</span>}
        </div>
        <div style={{ display: "flex", gap: "20px", textAlign: "center" }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{stats.followers}</div>
            <div style={{ color: "#777", fontSize: "0.9rem" }}>Followers</div>
          </div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{stats.following}</div>
            <div style={{ color: "#777", fontSize: "0.9rem" }}>Following</div>
          </div>
        </div>
      </div>

      <hr style={{ borderColor: "#333", marginBottom: "20px" }} />

      {/* Danh sách bài viết */}
      <h3>Bài viết ({posts.length})</h3>
      {posts.length === 0 ? (
        <p style={{ color: "#777" }}>Chưa có bài viết nào.</p>
      ) : (
        posts.map((post: any) => (
          <div key={post.id} className="card" style={{ marginBottom: "15px", backgroundColor: "#161616", borderRadius: "12px", padding: "20px", border: "1px solid #2a2a2a" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
               <div style={{ fontWeight: "bold", color: "#fff" }}>@{user.username}</div>
               <div style={{ color: "#666", fontSize: "0.8rem" }}>{new Date(post.created_at).toLocaleDateString()}</div>
            </div>
            <h3 style={{ fontSize: "1.2rem", margin: "10px 0", color: "#f3f5f7" }}>{post.title}</h3>
            <p style={{ color: "#ccc", fontSize: "1rem", whiteSpace: "pre-wrap" }}>{post.content}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                {post.tags && post.tags.map((tag: string) => (
                  <span key={tag} style={{ color: "#1d9bf0", fontSize: "0.85rem", backgroundColor: "#1d9bf01a", padding: "2px 8px", borderRadius: "4px" }}>#{tag}</span>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};