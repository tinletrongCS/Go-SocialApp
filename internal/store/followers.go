package store

import (
	"context"
	"database/sql"
	"errors"

	"github.com/lib/pq"
)

type Follower struct {
	UserID     int64  `json:"user_id"`
	FollowerID int64  `json:"follower_id"`
	CreatedAt  string `json:"created_at"`
}

type FollowerStore struct {
	db *sql.DB
}

func (s *FollowerStore) Follow(ctx context.Context, followerID, userID int64) error {
	// 1 user thì không thể tự follow chính mình 
	if followerID == userID {
		return errors.New("a user cannot follow themselves")
	}
	query := `
		INSERT INTO followers (user_id, follower_id) VALUES ($1, $2)
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, userID, followerID)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrConflict
		}
	}

	return nil
}

func (s *FollowerStore) Unfollow(ctx context.Context, followerID, userID int64) error {
	// 1 user thì không thể tự unfollow họ 
	if followerID == userID {
		return errors.New("a user cannot unfollow themselves")
	}
	query := `
		DELETE FROM followers 
		WHERE user_id = $2 AND follower_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, userID, followerID)
	return err
}

// Thêm tính năng xem danh sách người đang theo dõi mình
func (s *FollowerStore) GetFollowers(ctx context.Context, userID int64) ([]User, error) {
	query := `
		SELECT u.id, u.username, u.is_active
		FROM users u
		JOIN followers f ON u.id = f.user_id
		WHERE f.follower_id = $1
		ORDER BY f.created_at DESC
	`
	ctx, cancel := context.WithTimeout(ctx,QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followers []User
	for rows.Next() {
		var user User 
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.IsActive,
		)
		if err != nil {
			return nil, err
		}
		followers = append(followers, user)
	}

	return followers, nil
}

// Thêm tính năng lấy ra danh sách người mà người dùng hiện tại đang theo dõi 
func (s *FollowerStore) GetFollowings(ctx context.Context, userID int64) ([]User, error) {
	query := `
		SELECT u1.id, u1.username, u1.is_active
		FROM users u
		JOIN followers f ON u.id = f.user_id
		JOIN users u1 ON u1.id = f.follower_id
		WHERE f.user_id = $1
		ORDER BY f.created_at DESC
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var followings []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.IsActive,
		)

		if err != nil {
			return nil, err
		}

		followings = append(followings, user)
	}

	return followings, nil 
} 