import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class CupiddleLogo extends StatelessWidget {
  final double size;
  final Color? color;
  final bool showText;
  final String? subtitle;

  const CupiddleLogo({
    super.key,
    this.size = 28,
    this.color,
    this.showText = false,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    Widget icon = SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        size: Size(size, size),
        painter: _MadCupiddleIconPainter(overrideColor: color),
      ),
    );

    if (!showText) return icon;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        icon,
        const SizedBox(width: 10),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Cupiddle',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: size * 0.72,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.6,
                    shadows: [
                      Shadow(
                        color: AppColors.rose.withOpacity(0.5),
                        blurRadius: 16,
                      ),
                    ],
                  ),
                ),
                Container(
                  margin: const EdgeInsets.only(left: 3, top: 4),
                  width: 5,
                  height: 5,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppColors.rose, AppColors.gold],
                    ),
                  ),
                ),
              ],
            ),
            if (subtitle != null)
              Text(
                subtitle!.toUpperCase(),
                style: GoogleFonts.plusJakartaSans(
                  fontSize: size * 0.24,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.0,
                  color: AppColors.gold,
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _MadCupiddleIconPainter extends CustomPainter {
  final Color? overrideColor;

  _MadCupiddleIconPainter({this.overrideColor});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Outer Ambient Glow Aura
    final glowPaint = Paint()
      ..color = (overrideColor ?? AppColors.rose).withOpacity(0.3)
      ..maskFilter = MaskFilter.blur(BlurStyle.normal, size.width * 0.2);
    canvas.drawCircle(Offset(w * 0.5, h * 0.52), w * 0.4, glowPaint);

    // 1. Primary Cupid Heart-Flame Silhouette
    final mainFlamePath = Path();
    mainFlamePath.moveTo(w * 0.50, h * 0.94); // Bottom tip of the heart

    // Left heart bulb up to left flame tip
    mainFlamePath.cubicTo(w * 0.22, h * 0.82, w * 0.04, h * 0.58, w * 0.08, h * 0.36);
    mainFlamePath.cubicTo(w * 0.11, h * 0.18, w * 0.30, h * 0.08, w * 0.44, h * 0.18);
    // Center heart notch dipping down slightly
    mainFlamePath.cubicTo(w * 0.48, h * 0.22, w * 0.50, h * 0.28, w * 0.50, h * 0.32);
    // Center notch rising into right flame crown
    mainFlamePath.cubicTo(w * 0.50, h * 0.28, w * 0.52, h * 0.22, w * 0.56, h * 0.18);
    // Right heart bulb up to right flame tip
    mainFlamePath.cubicTo(w * 0.70, h * 0.08, w * 0.89, h * 0.18, w * 0.92, h * 0.36);
    mainFlamePath.cubicTo(w * 0.96, h * 0.58, w * 0.78, h * 0.82, w * 0.50, h * 0.94);
    mainFlamePath.close();

    // Luxurious Gradient Shader for Main Heart-Flame
    final mainGradient = LinearGradient(
      begin: Alignment.topRight,
      end: Alignment.bottomLeft,
      colors: overrideColor != null
          ? [overrideColor!, overrideColor!.withOpacity(0.8)]
          : const [
              Color(0xFFFF3366), // Electric Hot Rose
              Color(0xFFFF0844), // Intense Crimson Flame
              Color(0xFFFF9900), // Molten Gold Ember
            ],
      stops: const [0.0, 0.55, 1.0],
    );

    final mainPaint = Paint()
      ..shader = mainGradient.createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    canvas.drawPath(mainFlamePath, mainPaint);

    // 2. Inner Secondary Dynamic Flame Tongue (Adds depth & motion)
    final innerFlamePath = Path();
    innerFlamePath.moveTo(w * 0.50, h * 0.84);
    innerFlamePath.cubicTo(w * 0.34, h * 0.72, w * 0.22, h * 0.52, w * 0.28, h * 0.38);
    innerFlamePath.cubicTo(w * 0.32, h * 0.26, w * 0.44, h * 0.26, w * 0.48, h * 0.38);
    innerFlamePath.cubicTo(w * 0.50, h * 0.42, w * 0.51, h * 0.46, w * 0.52, h * 0.42);
    innerFlamePath.cubicTo(w * 0.56, h * 0.26, w * 0.68, h * 0.26, w * 0.72, h * 0.38);
    innerFlamePath.cubicTo(w * 0.78, h * 0.52, w * 0.66, h * 0.72, w * 0.50, h * 0.84);
    innerFlamePath.close();

    final innerGradient = LinearGradient(
      begin: Alignment.bottomCenter,
      end: Alignment.topCenter,
      colors: [
        Colors.white.withOpacity(0.0),
        const Color(0xFFFFB703).withOpacity(0.75), // Sunlit Gold
        Colors.white.withOpacity(0.95), // Pure White Core
      ],
      stops: const [0.0, 0.6, 1.0],
    );

    final innerPaint = Paint()
      ..shader = innerGradient.createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    canvas.drawPath(innerFlamePath, innerPaint);

    // 3. Central Electric Lightning Spark / Cupid Arrow Notch (The "Cupiddle" Cleft)
    final sparkPath = Path();
    // 4-point razor spark cutting through the heart core
    sparkPath.moveTo(w * 0.50, h * 0.36); // Top point
    sparkPath.lineTo(w * 0.54, h * 0.48);
    sparkPath.lineTo(w * 0.66, h * 0.50); // Right point
    sparkPath.lineTo(w * 0.54, h * 0.56);
    sparkPath.lineTo(w * 0.50, h * 0.68); // Bottom point
    sparkPath.lineTo(w * 0.46, h * 0.56);
    sparkPath.lineTo(w * 0.34, h * 0.50); // Left point
    sparkPath.lineTo(w * 0.46, h * 0.48);
    sparkPath.close();

    final sparkPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill
      ..maskFilter = MaskFilter.blur(BlurStyle.solid, size.width * 0.02);

    canvas.drawPath(sparkPath, sparkPaint);

    // 4. Specular Curved Rim Highlight (Gives 3D glassmorphic gloss)
    final specularPath = Path();
    specularPath.moveTo(w * 0.16, h * 0.40);
    specularPath.cubicTo(w * 0.14, h * 0.28, w * 0.24, h * 0.18, w * 0.36, h * 0.16);
    final specularPaint = Paint()
      ..color = Colors.white.withOpacity(0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = math.max(1.5, size.width * 0.045)
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(specularPath, specularPaint);
  }

  @override
  bool shouldRepaint(covariant _MadCupiddleIconPainter oldDelegate) =>
      oldDelegate.overrideColor != overrideColor;
}
