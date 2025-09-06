
'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { CommunityPost, CommunityComment } from '@/types';
import { checkAndAwardBadges } from './gamification';
import { createNotification } from './notifications';
import { AppError } from '../exceptions';
import { logAction, logError } from '@/lib/logger';
import { headers } from 'next/headers';

/**
 * Fetches community posts visible to the current user (tenant-specific and platform-wide).
 * The tenant is determined from the request headers.
 * @param currentUserId The current user's ID.
 * @returns A promise that resolves to an array of CommunityPost objects.
 */
export async function getCommunityPosts(currentUserId: string): Promise<CommunityPost[]> {
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id');
  logAction('Fetching community posts', { tenantId, currentUserId });
  try {
    const whereClause: Prisma.CommunityPostWhereInput = tenantId && tenantId !== 'platform'
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
      orderBy: [
        { isPinned: 'desc' },
        { timestamp: 'desc' }
      ],
      take: 50,
    });
    return posts as unknown as CommunityPost[];
  } catch (error) {
    logError('[CommunityAction] Error fetching posts', error, { tenantId });
    return [];
  }
}

/**
 * Creates a new community post within the tenant context from the request headers.
 * @param postData The data for the new post.
 * @returns The newly created CommunityPost object or null if failed.
 */
export async function createCommunityPost(postData: Omit<CommunityPost, 'id' | 'timestamp' | 'comments' | 'bookmarkedBy' | 'votedBy' | 'registeredBy' | 'flaggedBy' | 'likes' | 'likedBy' | 'isPinned' | 'tenantId'>): Promise<CommunityPost | null> {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id') || 'platform';
    logAction('Creating community post', { userId: postData.userId, type: postData.type, tenantId });
    try {
        const dataForDb: Prisma.CommunityPostCreateInput = {
            user: { connect: { id: postData.userId } },
            tenant: { connect: { id: tenantId } },
            userName: postData.userName,
            userAvatar: postData.userAvatar,
            content: postData.content,
            type: postData.type,
            tags: postData.tags || [],
            moderationStatus: postData.moderationStatus,
            flagCount: 0,
            flagReasons: [],
            timestamp: new Date(),
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
            likes: 0,
            isPinned: false,
        };
        
        const newPost = await db.communityPost.create({
            data: dataForDb,
        });

        await checkAndAwardBadges(postData.userId);

        return newPost as unknown as CommunityPost;
    } catch (error) {
        logError('[CommunityAction] Error during post creation', error, { userId: postData.userId });
        return null;
    }
}


/**
 * Adds a comment to a specific post (either community or blog).
 * @param commentData The data for the new comment. Must include either postId or blogPostId.
 * @returns The newly created CommunityComment object or null if failed.
 */
export async function addCommentToPost(commentData: Omit<CommunityComment, 'id' | 'timestamp' | 'replies'>): Promise<CommunityComment | null> {
  logAction('Adding comment', { userId: commentData.userId, postId: commentData.postId, blogPostId: commentData.blogPostId });
  try {
    if (!commentData.postId && !commentData.blogPostId) {
      throw new AppError("Comment must be associated with either a postId or a blogPostId.");
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

    const notifiedUserIds = new Set<string>([commentData.userId]);

    // 1. Notify author of parent comment if this is a reply
    if (commentData.parentId) {
      const parentComment = await db.communityComment.findUnique({ where: { id: commentData.parentId } });
      if (parentComment && !notifiedUserIds.has(parentComment.userId)) {
        await createNotification({
          userId: parentComment.userId,
          type: 'mention',
          content: `${commentData.userName} replied to your comment.`,
          link: `/community-feed#comment-${newComment.id}`,
          isRead: false,
        });
        notifiedUserIds.add(parentComment.userId);
      }
    }

    // 2. Notify author of the main post
    if (commentData.postId) {
        const originalPost = await db.communityPost.findUnique({ where: { id: commentData.postId } });
        if (originalPost && !notifiedUserIds.has(originalPost.userId)) {
            await createNotification({
                userId: originalPost.userId,
                type: 'system',
                content: `${commentData.userName} commented on your post: "${originalPost.content?.substring(0, 30)}..."`,
                link: `/community-feed#post-${originalPost.id}`,
                isRead: false,
            });
            notifiedUserIds.add(originalPost.userId);
        }
    }
    
    // 3. Handle @mentions in the comment text
    const mentionRegex = /@(\w+)/g;
    const mentions = [...commentData.comment.matchAll(mentionRegex)].map(match => match[1]);

    if (mentions.length > 0) {
        const mentionedUsers = await db.user.findMany({
            where: { name: { in: mentions, mode: 'insensitive' } },
        });

        for (const mentionedUser of mentionedUsers) {
            if (!notifiedUserIds.has(mentionedUser.id)) {
                await createNotification({
                    userId: mentionedUser.id,
                    type: 'mention',
                    content: `${commentData.userName} mentioned you in a comment.`,
                    link: `/community-feed#comment-${newComment.id}`,
                    isRead: false,
                });
                notifiedUserIds.add(mentionedUser.id);
            }
        }
    }


    await checkAndAwardBadges(commentData.userId);

    return newComment as unknown as CommunityComment;
  } catch (error) {
    logError('[CommunityAction] Error adding comment', error, { userId: commentData.userId });
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
    logAction('Updating community post', { postId, updateData: Object.keys(updateData) });
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
                flagReasons: updateData.flagReasons ? { set: updateData.flagReasons } : undefined,
            },
            include: {
                comments: true,
            }
        });

        // Notify user if their flagged post was approved
        if (postToUpdate.moderationStatus === 'flagged' && updatedPost.moderationStatus === 'visible') {
            await createNotification({
                userId: postToUpdate.userId,
                type: 'system',
                content: `Your post "${postToUpdate.content?.substring(0, 30)}..." has been approved by a moderator and is now visible.`,
                link: `/community-feed#post-${postId}`,
                isRead: false
            });
        }

        return updatedPost as unknown as CommunityPost;
    } catch (error) {
        logError(`[CommunityAction] Error updating post ${postId}`, error, { postId });
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
    logAction('Toggling like on post', { postId, userId });
    try {
        const post = await db.communityPost.findUnique({
            where: { id: postId },
            select: { likedBy: true, likes: true, userId: true, content: true }
        });

        if (!post) throw new AppError('Post not found');

        const likedBy = (post.likedBy as string[]) || [];
        const isLiked = likedBy.includes(userId);
        
        const newLikedBy = isLiked
            ? likedBy.filter(id => id !== userId)
            : [...likedBy, userId];
        
        const newLikesCount = newLikedBy.length;

        const updatedPost = await db.communityPost.update({
            where: { id: postId },
            data: { 
                likedBy: { set: newLikedBy },
                likes: newLikesCount
            },
            include: { comments: true }
        });
        
        // Notify on reaching 10 likes, but only on the like action, not unlike
        if (!isLiked && newLikesCount === 10 && post.userId !== userId) {
            await createNotification({
                userId: post.userId,
                type: 'system',
                content: `Your post "${post.content?.substring(0, 30)}..." is popular! It has reached 10 likes.`,
                link: `/community-feed#post-${postId}`,
                isRead: false
            });
        }

        return updatedPost as unknown as CommunityPost;

    } catch (error) {
        logError(`[CommunityAction] Error toggling like for post ${postId}`, error, { postId, userId });
        return null;
    }
}

/**
 * Toggles a user's vote on a specific poll option.
 * @param postId The ID of the poll post.
 * @param optionIndex The index of the option being voted for/unvoted.
 * @param userId The ID of the user.
 * @returns The updated post or a message on failure.
 */
export async function togglePollVote(postId: string, optionIndex: number, userId: string): Promise<CommunityPost & { message: string } | null> {
    logAction('Toggling poll vote', { postId, userId, optionIndex });
    try {
        const post = await db.communityPost.findUnique({ where: { id: postId } });
        if (!post || post.type !== 'poll' || !post.pollOptions || !Array.isArray(post.pollOptions)) {
            return null;
        }

        const pollOptions = post.pollOptions as { option: string; votes: number }[];
        const userVoteKey = `${userId}-${optionIndex}`;
        const votedBy = (post.votedBy as string[]) || [];
        const alreadyVotedForThisOption = votedBy.includes(userVoteKey);
        
        const previousVote = votedBy.find(vote => vote.startsWith(`${userId}-`));

        if (alreadyVotedForThisOption) {
            // User is retracting their vote from this option
            pollOptions[optionIndex].votes = Math.max(0, (pollOptions[optionIndex].votes || 0) - 1);
            const newVotedBy = votedBy.filter(v => v !== userVoteKey);
            const updatedPost = await updateCommunityPost(postId, { pollOptions, votedBy: newVotedBy });
            return { ...updatedPost!, message: "Vote retracted." };
        } else {
            // User is casting a new vote
            if (previousVote) {
                // User is changing their vote
                const previousVoteIndex = parseInt(previousVote.split('-')[1], 10);
                if (!isNaN(previousVoteIndex) && pollOptions[previousVoteIndex]) {
                    pollOptions[previousVoteIndex].votes = Math.max(0, (pollOptions[previousVoteIndex].votes || 0) - 1);
                }
            }
            
            // Add the new vote
            pollOptions[optionIndex].votes = (pollOptions[optionIndex].votes || 0) + 1;
            
            // Remove any previous vote and add the new one
            const newVotedBy = [...votedBy.filter(v => !v.startsWith(`${userId}-`)), userVoteKey];

            const updatedPost = await updateCommunityPost(postId, { pollOptions, votedBy: newVotedBy });
            return { ...updatedPost!, message: "Vote cast successfully." };
        }
    } catch (error) {
        logError(`[CommunityAction] Error toggling poll vote for post ${postId}`, error, { postId, userId });
        return null;
    }
}


/**
 * Toggles a user's registration for an event.
 * @param postId The ID of the event post.
 * @param userId The ID of the user.
 * @returns The updated post or a message on failure.
 */
export async function toggleEventRegistration(postId: string, userId: string): Promise<CommunityPost & { message: string } | null> {
    logAction('Toggling event registration', { postId, userId });
    try {
        const post = await db.communityPost.findUnique({ where: { id: postId } });
        if (!post || post.type !== 'event') return null;

        const registeredBy = (post.registeredBy as string[]) || [];
        const isRegistered = registeredBy.includes(userId);

        if (isRegistered) {
            // Unregister
            const newRegisteredBy = registeredBy.filter(id => id !== userId);
            const newAttendees = Math.max(0, (post.attendees || 0) - 1);
            const updatedPost = await updateCommunityPost(postId, { registeredBy: newRegisteredBy, attendees: newAttendees });
            return { ...updatedPost!, message: "You have been unregistered from the event." };
        } else {
            // Register
            if (post.capacity && (post.attendees || 0) >= post.capacity) {
                return { ...post, message: "Registration failed: Event is full." } as any;
            }
            const newRegisteredBy = [...registeredBy, userId];
            const newAttendees = (post.attendees || 0) + 1;
            const updatedPost = await updateCommunityPost(postId, { registeredBy: newRegisteredBy, attendees: newAttendees });
            return { ...updatedPost!, message: "Successfully registered for the event!" };
        }
    } catch (error) {
        logError(`[CommunityAction] Error toggling event registration for post ${postId}`, error, { postId, userId });
        return null;
    }
}


/**
 * Toggles a flag on a post by a user.
 * @param postId The ID of the post.
 * @param userId The ID of the user flagging/unflagging.
 * @param reason The reason for flagging.
 * @returns The updated post or a message on failure.
 */
export async function toggleFlagPost(postId: string, userId: string, reason: string): Promise<CommunityPost & { message: string } | null> {
    logAction('Toggling flag on post', { postId, userId, reason });
    try {
        const post = await db.communityPost.findUnique({ where: { id: postId } });
        if (!post) return null;

        const flaggedBy = (post.flaggedBy as string[]) || [];
        if (flaggedBy.includes(userId)) {
            return { ...post, message: "You have already flagged this post." } as any;
        }

        const newFlaggedBy = [...flaggedBy, userId];
        const newFlagCount = (post.flagCount || 0) + 1;
        const newFlagReasons = [...((post.flagReasons as string[]) || []), reason];
        
        const updatedPost = await updateCommunityPost(postId, { 
            flaggedBy: newFlaggedBy,
            flagCount: newFlagCount, 
            flagReasons: newFlagReasons,
            moderationStatus: 'flagged' 
        });
        
        return { ...updatedPost!, message: "Post flagged for review." };

    } catch (error) {
        logError(`[CommunityAction] Error toggling flag for post ${postId}`, error, { postId, userId });
        return null;
    }
}

    