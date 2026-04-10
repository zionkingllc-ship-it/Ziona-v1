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
  const supported = await Linking.canOpenURL(scheme);

  if (supported) {
    await Linking.openURL(scheme);
  }
}

export async function shareToWhatsApp(url: string) {
  await shareToApp(
    url,
    `whatsapp://send?text=${encodeURIComponent(url)}`
  );
}

export async function shareToMessages(url: string) {
  await shareToApp(
    url,
    `sms:&body=${encodeURIComponent(url)}`
  );
}

export async function shareToMail(url: string) {
  await shareToApp(
    url,
    `mailto:?subject=Shared from Ziona&body=${encodeURIComponent(url)}`
  );
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