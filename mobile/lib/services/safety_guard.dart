class SafetyResult {
  final bool blocked;
  final String? reason;

  SafetyResult({required this.blocked, this.reason});
}

class SafetyGuard {
  // Common Nigerian phone patterns: 080..., 070..., 090..., 081..., +234..., 234...
  static final RegExp _phonePattern = RegExp(
    r'(?:\+?234|0)[789][01]\d{8}|(?:\+?234|0)\s*[789][01]\s*\d{4}\s*\d{4}',
    caseSensitive: false,
  );

  // Spaced out / disguised phone numbers: e.g. 0 8 0 1 2 3 4 5 6 7 8
  static final RegExp _spacedDigits = RegExp(r'\b(?:\d[\s\-\.\_]*){11}\b');

  // WhatsApp and external chat redirects
  static final RegExp _offAppRedirects = RegExp(
    r'(?:wa\.me|chat\.whatsapp\.com|whatsapp|telegram|t\.me|snapchat|snap\s*id|ig\s*handle|call\s*me\s*on|dm\s*me\s*on|hit\s*me\s*on\s*whatsapp)',
    caseSensitive: false,
  );

  // Financial / Transactional solicitation
  static final RegExp _transactionalPattern = RegExp(
    r'(?:send\s*urgent\s*2k|urgent\s*2k|drop\s*account|account\s*number|acct\s*no|opay|palmpay|kuda\s*bank|send\s*airtime)',
    caseSensitive: false,
  );

  static SafetyResult scanMessage(String content) {
    if (content.trim().isEmpty) {
      return SafetyResult(blocked: false);
    }

    if (_phonePattern.hasMatch(content) || _spacedDigits.hasMatch(content)) {
      return SafetyResult(
        blocked: true,
        reason: 'Sharing phone numbers or off-app digits in chat is blocked for student safety. Get to know each other through Cupiddle sparks first!',
      );
    }

    if (_offAppRedirects.hasMatch(content)) {
      return SafetyResult(
        blocked: true,
        reason: 'WhatsApp, Telegram, and external redirects are restricted. Keep the conversation inside Cupiddle to protect your privacy.',
      );
    }

    if (_transactionalPattern.hasMatch(content)) {
      return SafetyResult(
        blocked: true,
        reason: 'Account numbers and financial solicitations are strictly prohibited by campus safety guidelines.',
      );
    }

    return SafetyResult(blocked: false);
  }
}
