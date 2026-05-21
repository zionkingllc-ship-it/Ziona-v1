import { Share, Linking } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import * as Haptics from "expo-haptics";
import { Post } from "@/types/post"; 
import { SharePayload } from "./adapter";
const DOMAIN = "https://dev.ziona.app";

export function buildPostUrl(postId: string) {
  return `${DOMAIN}/post/${postId}`;
}
 
export async function shareToApp(url: string, scheme: string) {
  try {
    await Linking.openURL(scheme);
  } catch {
    await Share.share({ message: url });
  }
}

export async function shareToWhatsApp(url: string) {
  const text = encodeURIComponent(url);
  await shareToApp(url, `whatsapp://send?text=${text}`);
}

export async function shareToMessages(url: string) {
  const text = encodeURIComponent(url);
  await shareToApp(url, `sms:&body=${text}`);
}

export async function shareToMail(url: string) {
  const text = encodeURIComponent(url);
  await shareToApp(url, `mailto:?subject=Shared from Ziona&body=${text}`);
}

export function copyLink(url: string) {
  Clipboard.setString(url);
}

export async function openNativeShare(post: SharePayload) {
  const message =
    post.text || post.mediaUrl || "Check this out";

  await Share.share({
    message,
  });
}

export async function withHaptic(action: () => Promise<void> | void) {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await action();
}