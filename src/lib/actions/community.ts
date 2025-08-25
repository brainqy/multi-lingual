'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { CommunityPost, CommunityComment } from '@/types';
import { checkAndAwardBadges } from './gamification';
import { createNotification } from './notifications';

/**
 * Fetches community posts visible to the current user (tenant-specific and platform-wide).
 * @param tenantId The current user's tenant ID. If null, it implies an admin viewing all posts.
 * @param currentUserId The current user's ID.
 * @returns A promise that resolves to an array of CommunityPost objects.
 */
export async function getCommunityPosts(tenantId: string | null, currentUserId: string): Promise<CommunityPost[]> {
  try {
    const whereClause: Prisma.CommunityPostWhereInput = tenantId
      ? {
          OR: [
            { tenantId: tenantId },
            { tenantId: 'platform' },
          ],
        }
      : {}; 

    const posts = await db.communityPost.findMany({
      where: whereClause,
      include: {
        comments: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
    });
    return posts as unknown as CommunityPost[];
  } catch (error) {
    console.error('[CommunityAction] Error fetching posts:', error);
    return [];
  }
}

/**
 * Creates a new community post.
 * @param postData The data for the new post.
 * @returns The newly created CommunityPost object or null if failed.
 */
export async function createCommunityPost(postData: Omit<CommunityPost, 'id' | 'timestamp' | 'comments' | 'bookmarkedBy' | 'likes' | 'votedBy' | 'registeredBy' | 'likedBy'>): Promise<CommunityPost | null> {
    console.log("[CommunityAction LOG] 1. createCommunityPost action initiated with data:", postData);
    try {
        console.log("[CommunityAction LOG] 2. Preparing data for database insertion.");
        const dataForDb: Prisma.CommunityPostCreateInput = {
            tenantId: postData.tenantId,
            userId: postData.userId,
            userName: postData.userName,
            userAvatar: postData.userAvatar,
            content: postData.content,
            type: postData.type,
            tags: postData.tags || [],
            moderationStatus: postData.moderationStatus,
            flagCount: postData.flagCount,
            flagReasons: [],
            timestamp: new Date(),
            
            // Type-specific fields are only added if they are relevant to the post type
            imageUrl: postData.type === 'text' && postData.imageUrl ? postData.imageUrl : undefined,
            pollOptions: postData.type === 'poll' && postData.pollOptions ? postData.pollOptions : Prisma.JsonNull,
            eventTitle: postData.type === 'event' ? postData.eventTitle : undefined,
            eventDate: postData.type === 'event' && postData.eventDate ? new Date(postData.eventDate) : undefined,
            eventLocation: postData.type === 'event' ? postData.eventLocation : undefined,
            attendees: postData.type === 'event' ? postData.attendees : undefined,
            capacity: postData.type === 'event' ? postData.capacity : undefined,
            assignedTo: postData.type === 'request' ? postData.assignedTo : undefined,
            status: postData.type === 'request' ? postData.status : undefined,
            votedBy: [],
            registeredBy: [],
            likedBy: [],
            likes: 0,
        };
        console.log("[CommunityAction LOG] 3. Data ready for database:", dataForDb);
        
        console.log("[CommunityAction LOG] 4. Calling db.communityPost.create...");
        const newPost = await db.communityPost.create({
            data: dataForDb,
        });
        console.log("[CommunityAction LOG] 5. Database create operation successful. Result:", newPost);

        console.log("[CommunityAction LOG] 6. Triggering badge check for user:", postData.userId);
        await checkAndAwardBadges(postData.userId);
        console.log("[CommunityAction LOG] 7. Badge check complete.");

        console.log("[CommunityAction LOG] 8. Returning new post from function.");
        return newPost as unknown as CommunityPost;
    } catch (error) {
        console.error('[CommunityAction LOG] 9. Error during post creation:', error);
        return null;
    }
}


/**
 * Adds a comment to a specific post (either community or blog).
 * @param commentData The data for the new comment. Must include either postId or blogPostId.
 * @returns The newly created CommunityComment object or null if failed.
 */
export async function addCommentToPost(commentData: Omit<CommunityComment, 'id' | 'timestamp' | 'replies'>): Promise<CommunityComment | null> {
  try {
    if (!commentData.postId && !commentData.blogPostId) {
      throw new Error("Comment must be associated with either a postId or a blogPostId.");
    }

    const newComment = await db.communityComment.create({
      data: {
        userId: commentData.userId,
        userName: commentData.userName,
        userAvatar: commentData.userAvatar,
        comment: commentData.comment,
        parentId: commentData.parentId,
        timestamp: new Date(),
        postId: commentData.postId,
        blogPostId: commentData.blogPostId,
      },
    });

    // Check for @mentions and create notifications
    if (commentData.comment && commentData.postId) {
        const mentionRegex = /@([\w\s]+)/g;
        const mentions = [...commentData.comment.matchAll(mentionRegex)].map(match => match[1].trim());

        if (mentions.length > 0) {
            const mentionedUsers = await db.user.findMany({
                where: {
                    name: {
                        in: mentions,
                        mode: 'insensitive',
                    },
                },
            });

            for (const mentionedUser of mentionedUsers) {
                // Don't notify the user who wrote the comment
                if (mentionedUser.id !== commentData.userId) {
                    await createNotification({
                        userId: mentionedUser.id,
                        type: 'mention',
                        content: `${commentData.userName} mentioned you in a comment.`,
                        link: `/community-feed#comment-${newComment.id}`, // Link to the new comment
                        isRead: false,
                    });
                }
            }
        }
    }

    await checkAndAwardBadges(commentData.userId);

    return newComment as unknown as CommunityComment;
  } catch (error) {
    console.error('[CommunityAction] Error adding comment:', error);
    return null;
  }
}

/**
 * Updates a community post (e.g., content, status, likes).
 * @param postId The ID of the post to update.
 * @param updateData The data to update.
 * @returns The updated CommunityPost object or null if failed.
 */
export async function updateCommunityPost(postId: string, updateData: Partial<Omit<CommunityPost, 'id'>>): Promise<CommunityPost | null> {
    try {
        const postToUpdate = await db.communityPost.findUnique({ where: { id: postId } });
        if (!postToUpdate) return null;

        const cleanUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== undefined)
        );

        const updatedPost = await db.communityPost.update({
            where: { id: postId },
            data: {
                ...cleanUpdateData,
                pollOptions: updateData.pollOptions ? updateData.pollOptions : (updateData.type !== 'poll' ? Prisma.JsonNull : undefined),
                tags: updateData.tags ? updateData.tags : undefined,
                votedBy: updateData.votedBy || undefined,
                registeredBy: updateData.registeredBy || undefined,
                flagReasons: updateData.flagReasons || undefined,
            },
            include: {
                comments: true,
            }
        });
        return updatedPost as unknown as CommunityPost;
    } catch (error) {
        console.error(`[CommunityAction] Error updating post ${postId}:`, error);
        return null;
    }
}

/**
 * Toggles a like on a community post for a user.
 * @param postId The ID of the post to like/unlike.
 * @param userId The ID of the user performing the action.
 * @returns The updated CommunityPost object or null on failure.
 */
export async function toggleLikePost(postId: string, userId: string): Promise<CommunityPost | null> {
    try {
        const post = await db.communityPost.findUnique({
            where: { id: postId },
            select: { likedBy: true }
        });

        if (!post) {
            throw new Error('Post not found');
        }

        const likedBy = (post.likedBy as string[]) || [];
        const isLiked = likedBy.includes(userId);
        
        let updateData;
        if (isLiked) {
            // User is unliking the post
            updateData = {
                likes: {
                    decrement: 1,
                },
                likedBy: {
                    set: likedBy.filter(id => id !== userId),
                },
            };
        } else {
            // User is liking the post
            updateData = {
                likes: {
                    increment: 1,
                },
                likedBy: {
                    push: userId,
                },
            };
        }

        const updatedPost = await db.communityPost.update({
            where: { id: postId },
            data: updateData,
            include: { comments: true }
        });

        return updatedPost as unknown as CommunityPost;

    } catch (error) {
        console.error(`[CommunityAction] Error toggling like for post ${postId}:`, error);
        return null;
    }
}


/**
 * Registers a vote for a poll or event for a user, ensuring only one vote/registration per user.
 * @param postId The ID of the post (poll/event).
 * @param userId The ID of the user voting/registering.
 * @param type 'vote' for poll, 'register' for event
 * @returns Success/failure message
 */
export async function registerUserAction(postId: string, userId: string, type: 'vote' | 'register'): Promise<{ success: boolean; message: string }> {
    const post = await db.communityPost.findUnique({ where: { id: postId } });
    if (!post) return { success: false, message: 'Post not found.' };
    if (type === 'vote') {
        const votedBy = (post.votedBy as string[]) || [];
        if (votedBy.includes(userId)) {
            return { success: false, message: 'You have already voted in this poll.' };
        }
        await db.communityPost.update({
            where: { id: postId },
            data: { votedBy: [...votedBy, userId] }
        });
        return { success: true, message: 'Vote registered.' };
    } else if (type === 'register') {
        const registeredBy = (post.registeredBy as string[]) || [];
        if (registeredBy.includes(userId)) {
            return { success: false, message: 'You have already registered for this event.' };
        }
        await db.communityPost.update({
            where: { id: postId },
            data: { registeredBy: [...registeredBy, userId] }
        });
        return { success: true, message: 'Registration successful.' };
    }
    return { success: false, message: 'Invalid action.' };
}
