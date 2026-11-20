/**
 * safetyGuard.ts
 * Client-Side Protection & Nigerian Campus Safety Rules
 * Implements Section 5 of the Campus Plan:
 * 1. Hard-blocks phone numbers (staying in-app ensures privacy & prevents stalking/harassment)
 * 2. Hard-blocks off-app redirects (WhatsApp, Snap, Telegram)
 * 3. Hard-blocks transactional money-for-sex / runs / commercial billing
 * 4. Allows mutual consensual adult flirtation & connection without moralizing
 */

export interface SafetyCheckResult {
  blocked: boolean;
  reason?: string;
  bucket?: 'PHONE_NUMBER' | 'OFF_APP' | 'TRANSACTIONAL' | 'BEGGING';
}

const PHONE_REGEXES = [
  /\b(0[7-9][0-1]\d{8})\b/i,                              // 080xxxxxxxx, 081xxxxxxxx, 070xxxxxxxx, 090xxxxxxxx, 091xxxxxxxx
  /\+?234\s?[7-9][0-1]\d\s?\d{3}\s?\d{4}/i,              // +234 803 123 4567
  /\b(zero\s?eight\s?zero|o8o|0-8-0|zero\s?seven)\b/i,    // Spelled out numbers
];

const OFF_APP_REGEX = /\b(whatsapp|snapchat|telegram|wa\.me|t\.me|instagram\.com|ig\s?dm|drop\s?ur\s?number|give\s?me\s?your\s?number|my\s?snap|chat\s?on\s?wa)\b/i;

const TRANSACTIONAL_REGEX = /\b(how much for sex|how much for night|send aza|pay my aza|send account number|runs girl|hookup fee|pay me before|pay me tfare|tfare first|pay for night)\b/i;

export function scanMessageSafety(text: string): SafetyCheckResult {
  if (!text || !text.trim()) {
    return { blocked: false };
  }

  // 1. Phone numbers
  for (const reg of PHONE_REGEXES) {
    if (reg.test(text)) {
      return {
        blocked: true,
        bucket: 'PHONE_NUMBER',
        reason: "Sharing phone numbers isn't allowed here — stay in the app 🔒",
      };
    }
  }

  // 2. Off-app redirects
  if (OFF_APP_REGEX.test(text)) {
    return {
      blocked: true,
      bucket: 'OFF_APP',
      reason: "Keep the conversation on Cupiddle — it's safer and protected 🔒",
    };
  }

  // 3. Transactional money-for-sex solicitation
  if (TRANSACTIONAL_REGEX.test(text)) {
    return {
      blocked: true,
      bucket: 'TRANSACTIONAL',
      reason: "Commercial and transactional financial requests violate campus community guidelines.",
    };
  }

  return { blocked: false };
}
