import 'package:flutter/material.dart';

class AppColors {
  // Midnight Obsidian & Burgundy Desire Core
  static const Color canvas = Color(0xFF0D080A);
  static const Color card = Color(0xFF170E12);
  static const Color cardSecondary = Color(0xFF1E1116);
  static const Color cardTertiary = Color(0xFF24131B);

  // Accents & Gradients
  static const Color rose = Color(0xFFFF1F6A);
  static const Color roseGlow = Color(0xFFFF4D8D);
  static const Color burgundy = Color(0xFF5E081E);
  static const Color burgundyDeep = Color(0xFF380512);
  static const Color burgundyBright = Color(0xFF7B112C);
  static const Color gold = Color(0xFFF59E0B);
  static const Color goldSunlit = Color(0xFFFFB703);

  // Functional & Semantic
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFE11D48);

  // Typography
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFE0D4D8);
  static const Color textMuted = Color(0xFF8A7B82);
  static const Color textSubtle = Color(0xFF6B5E64);

  // Borders & Dividers
  static const Color border = Color(0x1AFFFFFF);
  static const Color borderRose = Color(0x40FF1F6A);
  static const Color borderGlow = Color(0x80FF1F6A);

  // Primary Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [rose, burgundyBright],
  );

  static const LinearGradient heroOverlayGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Colors.transparent,
      Color(0x990D080A),
      Color(0xFF0D080A),
    ],
  );
}
