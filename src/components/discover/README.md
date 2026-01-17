# Discover Components Directory

Complete component library for the Discover feature (Reddit-like community platform).

## 📁 Directory Structure

```
src/components/discover/
├── index.ts                    # Export all components
├── PostCard.tsx                # Display post with voting and actions
├── VoteButtons.tsx             # Reusable voting UI
├── CommentSection.tsx          # Comments with nested replies
├── CommunityCard.tsx           # Community preview card
├── CreatePostForm.tsx          # Form to create posts
├── CreateCommunityForm.tsx     # Form to create communities
├── SortMenu.tsx                # Sort posts (hot, new, top, trending)
├── SearchBar.tsx               # Search with debounce
└── Sidebar.tsx                 # Navigation sidebar

src/app/discover/
├── page.tsx                    # Main feed page
├── create-post/page.tsx        # Create post page
├── create-community/page.tsx   # Create community page
├── communities/page.tsx        # Browse communities
├── post/[id]/page.tsx         # Post detail page
└── saved/page.tsx             # Saved posts page
```

## 🎨 Components

### PostCard
Display a post with all interactive features.

```tsx
import { PostCard } from '@/components/discover';

<PostCard 
  post={post} 
  onPostUpdate={refresh}
  showCommunity={true}
/>
```

**Props:**
- `post`: Post object
- `onPostUpdate?`: Callback after vote/save
- `showCommunity?`: Show community name (default: true)

**Features:**
- Upvote/downvote with score display
- Save/unsave functionality
- Media display (images, videos, audio)
- Comment count
- Share button
- Author and community info
- Link to post details

---

### VoteButtons
Reusable voting UI for posts and comments.

```tsx
import { VoteButtons } from '@/components/discover';

<VoteButtons
  voteType={userVote}
  score={voteScore}
  onUpvote={handleUpvote}
  onDownvote={handleDownvote}
  orientation="vertical"
/>
```

**Props:**
- `voteType?`: Current vote ('UPVOTE' | 'DOWNVOTE')
- `score`: Vote score number
- `onUpvote`: Upvote handler
- `onDownvote`: Downvote handler
- `orientation?`: 'vertical' | 'horizontal' (default: vertical)

---

### CommentSection
Full comment system with nested replies.

```tsx
import { CommentSection } from '@/components/discover';

<CommentSection postId={postId} />
```

**Props:**
- `postId`: Post ID to load comments for

**Features:**
- Create top-level comments
- Reply to comments (nested)
- Vote on comments
- Delete comments
- Real-time updates
- Collapsible comment trees

---

### CommunityCard
Preview card for communities.

```tsx
import { CommunityCard } from '@/components/discover';

<CommunityCard 
  community={community}
  onUpdate={refresh}
/>
```

**Props:**
- `community`: Community object
- `onUpdate?`: Callback after join/leave

**Features:**
- Join/leave button
- Member count
- Avatar/banner display
- User role badge
- Description preview
- Link to community page

---

### CreatePostForm
Form for creating new posts.

```tsx
import { CreatePostForm } from '@/components/discover';

<CreatePostForm
  communityId={communityId}
  onSuccess={() => router.push('/discover')}
  onCancel={() => router.back()}
/>
```

**Props:**
- `communityId?`: Pre-select community
- `onSuccess?`: Success callback
- `onCancel?`: Cancel callback

**Features:**
- Title and description fields
- Community selector
- Multi-file upload (images, videos, audio)
- File preview with remove
- Character counter
- Validation

---

### CreateCommunityForm
Form for creating new communities.

```tsx
import { CreateCommunityForm } from '@/components/discover';

<CreateCommunityForm
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

**Props:**
- `onSuccess?`: Success callback
- `onCancel?`: Cancel callback

**Features:**
- Name validation (alphanumeric only)
- Description and rules
- Visibility settings (Public, Private, Members-only)
- Member posting permissions
- Post approval requirement
- Full customization

---

### SortMenu
Sort options for posts.

```tsx
import { SortMenu } from '@/components/discover';

<SortMenu 
  sortBy={sortBy}
  onSortChange={setSortBy}
/>
```

**Props:**
- `sortBy`: Current sort ('hot' | 'new' | 'top' | 'trending')
- `onSortChange`: Sort change handler

**Options:**
- 🔥 Hot - Rising posts
- ✨ New - Most recent
- ⭐ Top - Highest voted
- 📈 Trending - Gaining traction

---

### SearchBar
Search input with debounce.

```tsx
import { SearchBar } from '@/components/discover';

<SearchBar
  onSearch={setSearch}
  placeholder="Search posts..."
  debounceMs={500}
/>
```

**Props:**
- `onSearch`: Search handler
- `placeholder?`: Input placeholder
- `debounceMs?`: Debounce delay (default: 500ms)

**Features:**
- Auto-debounce
- Clear button
- Search icon
- Smooth UX

---

### Sidebar
Navigation and information sidebar.

```tsx
import { Sidebar } from '@/components/discover';

<Sidebar />
```

**Features:**
- Create post/community buttons
- Popular communities list
- Quick links (saved, communities, guidelines)
- About section
- Sticky positioning

---

## 📄 Pages

### Main Feed (`/discover`)
- Sort by hot, new, top, trending
- Search posts
- Infinite scroll
- Sidebar with popular communities

### Create Post (`/discover/create-post`)
- Full-screen form
- Media upload
- Community selection

### Create Community (`/discover/create-community`)
- Community setup wizard
- Visibility and permissions

### Communities (`/discover/communities`)
- Grid layout
- Search and sort
- Join/leave actions

### Post Detail (`/discover/post/[id]`)
- Full post view
- Comment section
- Share and actions

### Saved Posts (`/discover/saved`)
- Bookmarked posts
- Quick unsave

---

## 🎯 Usage Examples

### Simple Feed
```tsx
import { PostCard, SortMenu } from '@/components/discover';
import { usePosts } from '@/hooks/useDiscover';

function Feed() {
  const [sortBy, setSortBy] = useState('hot');
  const { posts } = usePosts({ sortBy });

  return (
    <>
      <SortMenu sortBy={sortBy} onSortChange={setSortBy} />
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </>
  );
}
```

### Community Feed
```tsx
function CommunityFeed({ communityId }) {
  const { posts } = usePosts({ communityId });
  return posts.map(post => <PostCard key={post.id} post={post} />);
}
```

### Create Post Modal
```tsx
function CreatePostModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen}>
      <CreatePostForm onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}
```

---

## 🎨 Styling

All components use Tailwind CSS with:
- Responsive design (mobile-first)
- Hover states and transitions
- Loading states
- Error states
- Empty states
- Consistent spacing and colors

### Color Scheme
- Primary: Blue (600-700)
- Upvote: Orange (500-50)
- Downvote: Blue (500-50)
- Success: Green
- Error: Red
- Gray scale for text and backgrounds

---

## 🔌 Integration

### Import Components
```tsx
// Individual imports
import PostCard from '@/components/discover/PostCard';
import VoteButtons from '@/components/discover/VoteButtons';

// Batch import
import { PostCard, VoteButtons, CommentSection } from '@/components/discover';
```

### Use with Hooks
```tsx
import { usePosts, useVoting, useComments } from '@/hooks/useDiscover';
import { PostCard, CommentSection } from '@/components/discover';

function PostPage({ postId }) {
  const { post } = usePost(postId);
  return (
    <>
      <PostCard post={post} />
      <CommentSection postId={postId} />
    </>
  );
}
```

---

## 📱 Responsive Design

All components are fully responsive:

- **Mobile (< 768px)**: Single column, stacked layout
- **Tablet (768px - 1024px)**: 2-column grid for cards
- **Desktop (> 1024px)**: 3-column grid, sidebar visible

---

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Screen reader support
- Alt text for images

---

## 🚀 Performance

- Lazy loading for images
- Debounced search
- Optimistic UI updates
- Pagination support
- Memoized components
- Code splitting

---

## 📦 Dependencies

Required packages:
- `next` - Next.js framework
- `react` - React library
- `@/hooks/useDiscover` - Custom hooks
- `@/lib/discoverApi` - API client
- `@/types/discover` - TypeScript types

---

## 🎉 Features Included

✅ Post creation with media upload
✅ Upvote/downvote system
✅ Nested comment threads
✅ Community management
✅ Search and filters
✅ Sorting algorithms
✅ Save/bookmark posts
✅ Responsive design
✅ Loading and error states
✅ Empty states with CTAs
✅ Real-time updates
✅ Optimistic UI

---

## 📝 Notes

- All forms include validation
- Images/videos are processed on upload
- Comments support up to 10 levels of nesting
- Vote counts update optimistically
- All API calls include error handling
- Components are fully typed with TypeScript

## 🔧 Troubleshooting

### "No authorization header provided" error

If you get this error when viewing posts (GET requests):

1. **Check Backend Routes**: Ensure GET endpoints don't require auth:
   ```typescript
   // ✅ Correct - no auth for public viewing
   router.get('/posts', discoverController.getPosts.bind(discoverController));
   
   // ❌ Wrong - requires auth for viewing
   router.get('/posts', authenticateToken, discoverController.getPosts.bind(discoverController));
   ```

2. **Verify API Base URL**: Check `NEXT_PUBLIC_API_URL` in `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Check Token Handling**: The API client only adds Authorization header if token exists.
   This is correct behavior - anonymous users can view public content.

### Public vs Protected Routes

**Public (No Auth Required):**
- GET /posts - List posts
- GET /posts/:id - View post
- GET /communities - List communities
- GET /communities/:id - View community
- GET /posts/:id/comments - View comments
- GET /communities/:id/members - View members

**Protected (Auth Required):**
- POST /posts - Create post
- POST /communities - Create community
- POST/DELETE votes - Vote/unvote
- POST/PUT/DELETE comments - Manage comments
- POST/DELETE saved - Save/unsave posts
- POST reports - Report content
