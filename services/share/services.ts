import { Share, Linking } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import * as Haptics from "expo-haptics";
import { Post } from "@/types/post"; 
import { SharePayload } from "./adapter";
const DOMAIN = "https://ziona.app";

export function buildPostUrl(postId: string) {
  return `${DOMAIN}/post/${postId}`;
}

export function buildDeepLink(postId: string) {
  return `ziona://viewer/${postId}`;
}
 
export async function shareToApp(url: string, scheme: string) {
  try {
    await Linking.openURL(scheme);
  } catch {
    try {
      await Share.share({ message: url });
    } catch {}
  }
}

export async function shareToWhatsApp(url: string) {
  try {
    const text = encodeURIComponent(`Shared from Ziona\n${url}`);
    await shareToApp(url, `whatsapp://send?text=${text}`);
  } catch {}
}

export async function shareToMessages(url: string) {
  try {
    const text = encodeURIComponent(`Shared from Ziona\n${url}`);
    await shareToApp(url, `sms:&body=${text}`);
  } catch {}
}

export async function shareToMail(url: string) {
  try {
    const text = encodeURIComponent(`Shared from Ziona\n${url}`);
    await shareToApp(url, `mailto:?subject=Shared from Ziona&body=${text}`);
  } catch {}
}

export function copyLink(url: string) {
  try {
    Clipboard.setString(url);
  } catch {}
}

export async function openNativeShare(post: SharePayload) {
  try {
    const content = post.text || post.mediaUrl || "";
    const parts = [
      content,
      "",
      "Shared from Ziona",
      post.postUrl,
    ].filter(Boolean);

    await Share.share({
      message: parts.join("\n"),
    });
  } catch {}
}

export async function withHaptic(action: () => Promise<void> | void) {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
  await action();
}