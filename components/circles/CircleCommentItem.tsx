import MentionText from "@/components/comments/MentionText";
import React, { useMemo, useState } from "react";
import { Image } from "expo-image";
import { TouchableOpacity, Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CircleComment, CircleCommentAuthor } from "@/services/graphQL/mutation/actions/circleComments";
import { reportCircleContent } from "@/services/graphQL/mutation/actions/reportCircleContent";
import { ReportReason } from "@/services/graphQL/mutation/actions/report";
import themeColors from "@/constants/colors";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/useAuthStore";
import OptionsModal from "@/components/ui/modals/OptionsModal";
import ConfirmReportModal from "@/components/ui/modals/ConfirmReportModal";
import ReportReasonsModal from "@/components/ui/modals/ReportReasonsModal";
import OtherReportModal from "@/components/ui/modals/OtherReportModal";
import SuccessModal from "@/components/ui/modals/successModal";
import DeleteConfirmationModal from "@/components/ui/modals/DeleteConfirmationModal";

type MenuTarget =
  | { type: "comment"; id: string; isOwner: boolean }
  | { type: "reply"; commentId: string; replyId: string; isOwner: boolean }
  | null;

type Props = {
  comment: CircleComment;
  circleId: string;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
  onReply: (commentId: string, username: string) => void;
  isPending: boolean;
};

type ReplyRowProps = {
  reply: CircleComment;
  mentionMap: Record<string, string>;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
  onViewProfile: (userId: string) => void;
  onOpenMenu: (replyId: string) => void;
};

function authorName(author?: CircleCommentAuthor | null): string {
  return author?.username || author?.name || "User";
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name?: string | null): string {
  if (!name) return "Ur";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name?: string | null): string {
  if (!name) return "#7A2E8A";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#7A2E8A", "#4A90A4", "#E58E26", "#2E8A6A", "#8A4A2E", "#4A2E8A"];
  return colors[Math.abs(hash) % colors.length];
}

function AvatarCircle({ uri, name, size }: { uri?: string | null; name?: string | null; size: number }) {
  const [failed, setFailed] = useState(false);

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <XStack
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor={getColorFromName(name)}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={size * 0.4} fontWeight="600" color="white">
        {getInitials(name)}
      </Text>
    </XStack>
  );
}

function ReplyRow({ reply, mentionMap, onLike, onDelete, isPending, onViewProfile, onOpenMenu }: ReplyRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <TouchableOpacity
      onLongPress={() => setShowDeleteModal(true)}
      activeOpacity={1}
    >
      <XStack gap="$2" paddingLeft="$4" paddingTop="$2" alignItems="flex-start">
        <Pressable onPress={() => reply.author?.id && onViewProfile(reply.author.id)}>
          <AvatarCircle uri={reply.author?.avatarUrl} name={reply.author?.username || reply.author?.name} size={24} />
        </Pressable>
        <YStack flex={1} gap={1}>
          <XStack gap="$2" alignItems="center">
            <Pressable onPress={() => reply.author?.id && onViewProfile(reply.author.id)}>
              <Text fontSize={12} fontWeight="600">
                {authorName(reply.author)}
              </Text>
            </Pressable>
            <Text fontSize={10} color="#999">
              {formatDate(reply.createdAt)}
            </Text>
            <Pressable
              onPress={() => onOpenMenu(reply.id)}
              hitSlop={10}
              style={{ padding: 2, marginLeft: "auto" }}
            >
              <Ionicons name="ellipsis-horizontal" size={15} color="#777" />
            </Pressable>
          </XStack>
          <MentionText text={reply.text} mentionMap={mentionMap} fontSize={12} lineHeight={16} />
          <XStack gap="$2" paddingTop="$1" alignItems="center">
            <TouchableOpacity
              onPress={() => onLike(reply.id, reply.viewerState?.liked ?? false)}
              disabled={isPending}
            >
              <XStack alignItems="center" gap={3}>
                <Ionicons
                  name={reply.viewerState?.liked ? "heart" : "heart-outline"}
                  size={12}
                  color={reply.viewerState?.liked ? themeColors.primary : "#999"}
                />
                <Text fontSize={10} color="#999">
                  {reply.likesCount}
                </Text>
              </XStack>
            </TouchableOpacity>
          </XStack>
        </YStack>
      </XStack>
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => { setShowDeleteModal(false); onDelete(reply.id); }}
        title="Delete comment"
        message="Are you sure?"
        confirmText="Delete"
      />
    </TouchableOpacity>
  );
}

export function CircleCommentItem({ comment, circleId, onLike, onDelete, onReply, isPending }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [menuTarget, setMenuTarget] = useState<MenuTarget>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [reasonsVisible, setReasonsVisible] = useState(false);
  const [otherVisible, setOtherVisible] = useState(false);
  const [reportSuccessVisible, setReportSuccessVisible] = useState(false);
  const [reportFailedVisible, setReportFailedVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuTarget>(null);
  const hasReplies = (comment.replies?.length || 0) > 0;
  const { requireAuth, AuthModal } = useRequireAuth();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isCommentOwner = comment.author?.id != null && comment.author.id === currentUserId;
  const goToProfile = useMemo(() => (userId: string) => {
    requireAuth(() => router.push(`/guest?userId=${userId}`));
  }, [requireAuth]);

  const openMenu = (target: MenuTarget) => {
    requireAuth(() => setMenuTarget(target));
  };

  const openReplyMenu = (replyId: string) => {
    const reply = comment.replies?.find((r) => r.id === replyId);
    const isOwner = reply?.author?.id != null && reply.author.id === currentUserId;
    requireAuth(() => setMenuTarget({ type: "reply", commentId: comment.id, replyId, isOwner }));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.type === "comment" ? deleteTarget.id : deleteTarget.replyId;
    onDelete(id);
    setDeleteTarget(null);
  };

  const submitReport = (reason: ReportReason, description?: string) => {
    const commentId =
      menuTarget?.type === "comment"
        ? menuTarget.id
        : menuTarget?.type === "reply"
          ? menuTarget.replyId
          : undefined;
    reportCircleContent(reason, circleId, commentId || "", "CIRCLE_COMMENT")
      .then(() => {
        setReportSuccessVisible(true);
      })
      .catch(() => {
        setReportFailedVisible(true);
      });
  };

  const mentionMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (comment.author?.id) map[comment.author.username || comment.author.name || ""] = comment.author.id;
    for (const r of comment.replies || []) {
      if (r.author?.id) map[r.author.username || r.author.name || ""] = r.author.id;
    }
    return map;
  }, [comment]);

  return (
    <TouchableOpacity
      onLongPress={() => setShowDeleteModal(true)}
      activeOpacity={1}
    >
      <YStack gap="$2" paddingBottom="$2" borderBottomWidth={1} borderBottomColor="#F0F0F0">
        <XStack alignItems="center" gap="$2">
          <Pressable onPress={() => comment.author?.id && goToProfile(comment.author.id)}>
            <AvatarCircle uri={comment.author?.avatarUrl} name={comment.author?.username || comment.author?.name} size={32} />
          </Pressable>
          <YStack gap={2} flex={1}>
            <Pressable onPress={() => comment.author?.id && goToProfile(comment.author.id)}>
              <Text fontSize={12} fontWeight="600">
                {authorName(comment.author)}
              </Text>
            </Pressable>
            <Text fontSize={11} color="#999">
              {formatDate(comment.createdAt)}
            </Text>
          </YStack>
          <Pressable
            onPress={() => openMenu({ type: "comment", id: comment.id, isOwner: isCommentOwner })}
            hitSlop={10}
            style={{ padding: 2 }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#777" />
          </Pressable>
        </XStack>

        <MentionText text={comment.text} mentionMap={mentionMap} fontSize={13} lineHeight={18} />

        <XStack gap="$3" paddingLeft="$4" alignItems="center">
          <TouchableOpacity
            onPress={() => onLike(comment.id, comment.viewerState?.liked ?? false)}
            disabled={isPending}
          >
            <XStack alignItems="center" gap="$1">
              <Ionicons
                name={comment.viewerState?.liked ? "heart" : "heart-outline"}
                size={14}
                color={comment.viewerState?.liked ? themeColors.primary : "#999"}
              />
              <Text fontSize={11} color="#999">
                {comment.likesCount}
              </Text>
            </XStack>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onReply(comment.id, authorName(comment.author))}>
            <XStack alignItems="center" gap="$1">
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#999" />
              <Text fontSize={11} color="#999">
                Reply
              </Text>
            </XStack>
          </TouchableOpacity>
        </XStack>

        {hasReplies && showReplies && (
          <YStack gap="$1" paddingTop="$1">
            {comment.replies?.map((reply) => (
              <ReplyRow
                key={reply.id}
                reply={reply}
                mentionMap={mentionMap}
                onLike={onLike}
                onDelete={onDelete}
                isPending={isPending}
                onViewProfile={goToProfile}
                onOpenMenu={openReplyMenu}
              />
            ))}
          </YStack>
        )}

        {(comment.replies?.length || 0) > 0 && (
          <TouchableOpacity onPress={() => setShowReplies((v) => !v)} style={{ paddingLeft: 36 }}>
            <Text fontSize={11} color={themeColors.primary}>
              {showReplies ? "Hide replies" : `View ${comment.replies?.length} ${comment.replies?.length === 1 ? "reply" : "replies"}`}
            </Text>
          </TouchableOpacity>
        )}
      </YStack>
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => { setShowDeleteModal(false); onDelete(comment.id); }}
        title="Delete comment"
        message="Are you sure?"
        confirmText="Delete"
      />
      <OptionsModal
        visible={!!menuTarget}
        onClose={() => setMenuTarget(null)}
        onReportPost={() => {
          setMenuTarget(null);
          setConfirmVisible(true);
        }}
        onReportComment={() => {
          setMenuTarget(null);
          setConfirmVisible(true);
        }}
        onDelete={() => {
          setDeleteTarget(menuTarget);
          setMenuTarget(null);
        }}
        isOwner={menuTarget?.type === "comment" ? menuTarget.isOwner : menuTarget?.isOwner}
      />

      <ConfirmReportModal
        visible={confirmVisible}
        contentType="comment"
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          setReasonsVisible(true);
        }}
      />

      <ReportReasonsModal
        visible={reasonsVisible}
        onClose={() => setReasonsVisible(false)}
        onSelectReason={(reason) => {
          setReasonsVisible(false);
          submitReport(reason as ReportReason);
        }}
        onSelectOther={() => {
          setReasonsVisible(false);
          setOtherVisible(true);
        }}
      />

      <OtherReportModal
        visible={otherVisible}
        onClose={() => setOtherVisible(false)}
        onSubmit={(description) => {
          setOtherVisible(false);
          submitReport("OTHER" as ReportReason, description);
        }}
      />

      <SuccessModal
        visible={reportSuccessVisible}
        onClose={() => setReportSuccessVisible(false)}
        title="Report Submitted"
        message="Thank you for your report. We'll review it shortly."
        autoClose
      />

      <SuccessModal
        visible={reportFailedVisible}
        onClose={() => setReportFailedVisible(false)}
        title="Something went wrong"
        message="Please try again later."
        type="failed"
        autoClose
      />

      <DeleteConfirmationModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete comment"
        message="Are you sure you want to delete this comment? This cannot be undone."
        confirmText="Delete"
      />
      {AuthModal}
    </TouchableOpacity>
  );
}
