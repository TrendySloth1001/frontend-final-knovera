# Frontend Integration Guide - Discover Feature

## Overview
Complete integration guide for the Reddit-like discover feature with posts, voting, comments, and communities.

## Files Created

### 1. Type Definitions
**Location:** `/src/types/discover.ts`
- Post, Comment, Community types
- Enums: MediaType, VoteType, PostVisibility, CommunityRole, ReportReason
- Request/Response interfaces

### 2. API Client
**Location:** `/src/lib/discoverApi.ts`
- Complete API wrapper for all discover endpoints
- Functions for posts, voting, comments, communities
- File upload handling for media

### 3. React Hooks
**Location:** `/src/hooks/useDiscover.ts`
- `usePosts(query)` - Fetch posts with pagination
- `usePost(postId)` - Get single post
- `useVoting()` - Handle voting on posts/comments
- `useComments(postId)` - Manage comments
- `useCommunities(query)` - Fetch communities
- `useCommunity(communityId)` - Get single community
- `useSavedPosts()` - Manage saved posts

### 4. Components
**Location:** `/src/components/PostCard.tsx`
- Display post with voting, media, and actions
- Interactive voting buttons
- Save/unsave functionality
- Media display (images, videos, audio)

### 5. Pages
**Location:** `/src/app/discover/page.tsx`
- Main discover feed
- Sort by: hot, new, top, trending
- Infinite scroll with load more

**Location:** `/src/app/community/[id]/page.tsx`
- Community details page
- Join/leave functionality
- Community posts feed
- Member count and role display

---

## Quick Start Examples

### 1. Display Posts Feed

```tsx
'use client';

import { usePosts } from '@/hooks/useDiscover';
import PostCard from '@/components/PostCard';

export default function Feed() {
  const { posts, loading, hasMore, loadMore } = usePosts({ sortBy: 'hot' });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

### 2. Create a Post

```tsx
import { discoverApi } from '@/lib/discoverApi';

async function createPost() {
  const post = await discoverApi.createPost({
    title: 'My First Post',
    description: 'This is the content',
    communityId: 'optional-community-id'
  });
  
  // Upload media if needed
  if (file) {
    await discoverApi.uploadPostMedia(post.id, file);
  }
}
```

### 3. Voting System

```tsx
import { useVoting } from '@/hooks/useDiscover';
import { VoteType } from '@/types/discover';

function VoteButtons({ postId, currentVote }) {
  const { votePost, removePostVote } = useVoting();

  const handleVote = async (type: VoteType) => {
    if (currentVote === type) {
      await removePostVote(postId);
    } else {
      await votePost(postId, type);
    }
  };

  return (
    <>
      <button onClick={() => handleVote('UPVOTE')}>▲</button>
      <button onClick={() => handleVote('DOWNVOTE')}>▼</button>
    </>
  );
}
```

### 4. Comments Section

```tsx
import { useComments } from '@/hooks/useDiscover';

function CommentsSection({ postId }) {
  const { comments, addComment, deleteComment } = useComments(postId);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async () => {
    await addComment({ content: newComment });
    setNewComment('');
  };

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <button onClick={() => deleteComment(comment.id)}>Delete</button>
        </div>
      ))}
      
      <input 
        value={newComment} 
        onChange={(e) => setNewComment(e.target.value)} 
      />
      <button onClick={handleSubmit}>Post Comment</button>
    </div>
  );
}
```

### 5. Join/Leave Community

```tsx
import { useCommunity } from '@/hooks/useDiscover';

function CommunityHeader({ communityId }) {
  const { community, joinCommunity, leaveCommunity } = useCommunity(communityId);

  const handleToggle = async () => {
    if (community?.isMember) {
      await leaveCommunity();
    } else {
      await joinCommunity();
    }
  };

  return (
    <div>
      <h1>{community?.name}</h1>
      <p>{community?.memberCount} members</p>
      <button onClick={handleToggle}>
        {community?.isMember ? 'Leave' : 'Join'}
      </button>
    </div>
  );
}
```

### 6. Save Posts

```tsx
import { discoverApi } from '@/lib/discoverApi';

async function toggleSave(postId: string, isSaved: boolean) {
  if (isSaved) {
    await discoverApi.unsavePost(postId);
  } else {
    await discoverApi.savePost(postId);
  }
}

// View saved posts
import { useSavedPosts } from '@/hooks/useDiscover';

function SavedPostsPage() {
  const { posts, loading } = useSavedPosts();
  return <div>{posts.map(post => <PostCard key={post.id} post={post} />)}</div>;
}
```

### 7. Search and Filter

```tsx
function DiscoverWithFilters() {
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [search, setSearch] = useState('');
  
  const { posts } = usePosts({ sortBy, search });

  return (
    <>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="hot">Hot</option>
        <option value="new">New</option>
        <option value="top">Top</option>
        <option value="trending">Trending</option>
      </select>
      
      <input 
        placeholder="Search..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </>
  );
}
```

### 8. Create Community

```tsx
import { discoverApi } from '@/lib/discoverApi';
import { PostVisibility } from '@/types/discover';

async function createCommunity() {
  const community = await discoverApi.createCommunity({
    name: 'My Community',
    description: 'A place for...',
    visibility: PostVisibility.PUBLIC,
    allowMemberPosts: true,
    requireApproval: false
  });
  
  return community;
}
```

### 9. Report Content

```tsx
import { discoverApi } from '@/lib/discoverApi';
import { ReportReason } from '@/types/discover';

async function reportPost(postId: string) {
  await discoverApi.reportPost(postId, {
    reason: ReportReason.SPAM,
    details: 'This is spam content'
  });
}

async function reportComment(commentId: string) {
  await discoverApi.reportComment(commentId, {
    reason: ReportReason.HARASSMENT,
    details: 'Inappropriate language'
  });
}
```

---

## API Endpoints Reference

### Posts
- `GET /api/discover/posts` - List posts (with filters)
- `POST /api/discover/posts` - Create post
- `GET /api/discover/posts/:id` - Get post
- `PUT /api/discover/posts/:id` - Update post
- `DELETE /api/discover/posts/:id` - Delete post
- `POST /api/discover/posts/:id/media` - Upload media (FormData)
- `DELETE /api/discover/media/:mediaId` - Delete media

### Voting
- `POST /api/discover/posts/:id/vote` - Vote on post
- `DELETE /api/discover/posts/:id/vote` - Remove vote
- `POST /api/discover/comments/:id/vote` - Vote on comment
- `DELETE /api/discover/comments/:id/vote` - Remove comment vote

### Comments
- `GET /api/discover/posts/:id/comments` - Get comments
- `POST /api/discover/posts/:id/comments` - Create comment
- `PUT /api/discover/comments/:id` - Update comment
- `DELETE /api/discover/comments/:id` - Delete comment

### Saved Posts
- `POST /api/discover/posts/:id/save` - Save post
- `DELETE /api/discover/posts/:id/save` - Unsave post
- `GET /api/discover/saved` - Get saved posts

### Communities
- `GET /api/discover/communities` - List communities
- `POST /api/discover/communities` - Create community
- `GET /api/discover/communities/:id` - Get community
- `PUT /api/discover/communities/:id` - Update community
- `DELETE /api/discover/communities/:id` - Delete community
- `POST /api/discover/communities/:id/join` - Join community
- `DELETE /api/discover/communities/:id/leave` - Leave community
- `GET /api/discover/communities/:id/members` - Get members
- `PATCH /api/discover/communities/:id/members/:userId/role` - Update role
- `DELETE /api/discover/communities/:id/members/:userId` - Remove member

### Reporting
- `POST /api/discover/posts/:id/report` - Report post
- `POST /api/discover/comments/:id/report` - Report comment
- `GET /api/discover/reports` - Get reports (moderators)
- `PATCH /api/discover/reports/:id` - Update report status

---

## Authentication

All protected endpoints require JWT token in Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

The `apiClient` automatically includes the token from cookies.

---

## File Upload

For media uploads, use FormData:

```typescript
const formData = new FormData();
formData.append('media', file);

const response = await fetch(`${API_URL}/api/discover/posts/${postId}/media`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

Or use the helper:

```typescript
await discoverApi.uploadPostMedia(postId, file);
```

---

## Styling Examples

### Tailwind CSS for Vote Buttons

```tsx
<div className="flex items-center gap-2">
  <button
    className={`p-2 rounded ${
      userVote === 'UPVOTE' 
        ? 'text-orange-500 bg-orange-50' 
        : 'hover:bg-gray-100'
    }`}
  >
    ▲
  </button>
  <span className="font-semibold">{voteScore}</span>
  <button
    className={`p-2 rounded ${
      userVote === 'DOWNVOTE' 
        ? 'text-blue-500 bg-blue-50' 
        : 'hover:bg-gray-100'
    }`}
  >
    ▼
  </button>
</div>
```

---

## Best Practices

1. **Optimistic Updates**: Update UI immediately, revert on error
2. **Pagination**: Use `hasMore` and `loadMore` for infinite scroll
3. **Error Handling**: Display user-friendly error messages
4. **Loading States**: Show spinners during async operations
5. **Refresh**: Call `refresh()` after mutations to update data
6. **Debounce Search**: Use debounce for search inputs
7. **Image Optimization**: Use Next.js Image component for optimization
8. **Cache Management**: Consider using SWR or React Query for better caching

---

## Next Steps

1. **Navigation**: Add routing to discover feed, community pages
2. **Create Forms**: Build post creation and community creation forms
3. **Moderation UI**: Add admin panel for viewing reports
4. **Notifications**: Real-time updates for votes, comments
5. **Rich Text**: Add markdown editor for post content
6. **Image Gallery**: Implement image carousel for multiple media
7. **Infinite Scroll**: Replace "Load More" with intersection observer
8. **Share**: Add social sharing functionality
