import { Share, Linking } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import * as Haptics from "expo-haptics";
import { Post } from "@/types/post"; 
import { SharePayload } from "./adapter";
const DOMAIN = process.env.EXPO_PUBLIC_SHARE_DOMAIN || "https://ziona.app";
const DEEP_LINK_SCHEME = process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME || "ziona";

export function buildPostUrl(postId: string) {
  return `${DOMAIN}/post/${postId}`;
}

export function buildDeepLink(postId: string) {
  return `${DEEP_LINK_SCHEME}://viewer/${postId}`;
}
 
export async function shareToApp(url: string, scheme: string) {
  try {
    await Linking.openURL(scheme);
  } catch {
    try {
      await Share.share({ message: url });
    } catch { console.warn("[share] shareToApp fallback failed"); }
  }
}

export async function shareToWhatsApp(url: string) {
  try {
    const text = encodeURIComponent(`Shared from Ziona\n${url}`);
    await shareToApp(url, `whatsapp://send?text=${text}`);
  } catch { console.warn("[share] shareToWhatsApp failed"); }
}

export async function shareToMessages(url: string) {
  try {
    const text = encodeURIComponent(`Shared from Ziona\n${url}`);
    await shareToApp(url, `sms:&body=${text}`);
  } catch { console.warn("[share] shareToMessages failed"); }
}

export async function shareToMail(url: string) {
  try {
    const text = encodeURIComponent(`Shared from Ziona\n${url}`);
    await shareToApp(url, `mailto:?subject=Shared from Ziona&body=${text}`);
  } catch { console.warn("[share] shareToMail failed"); }
}

export function copyLink(url: string) {
  try {
    Clipboard.setString(url);
  } catch { console.warn("[share] copyLink failed"); }
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
  } catch { console.warn("[share] openNativeShare failed"); }
}

export async function withHaptic(action: () => Promise<void> | void) {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch { console.warn("[share] haptic feedback failed"); }
  await action();
}