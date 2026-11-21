import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class CupiddleLogo extends StatelessWidget {
  final double size;
  final Color? color;
  final bool showText;

  const CupiddleLogo({
    super.key,
    this.size = 28,
    this.color,
    this.showText = false,
  });

  @override
  Widget build(BuildContext context) {
    final logoColor = color ?? AppColors.rose;

    Widget icon = CustomPaint(
      size: Size(size, size),
      painter: _CupiddleIconPainter(color: logoColor),
    );

    if (!showText) return icon;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        icon,
        const SizedBox(width: 8),
        Text(
          'Cupiddle',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: size * 0.8,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }
}

class _CupiddleIconPainter extends CustomPainter {
  final Color color;

  _CupiddleIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Glowing spark icon with dual flame/heart arcs
    final path = Path();
    final w = size.width;
    final h = size.height;

    path.moveTo(w * 0.5, h * 0.05);
    // Right spark flame
    path.cubicTo(w * 0.75, h * 0.25, w * 0.95, h * 0.55, w * 0.8, h * 0.82);
    path.cubicTo(w * 0.7, h * 0.96, w * 0.55, h * 0.98, w * 0.5, h * 0.88);
    // Left spark flame
    path.cubicTo(w * 0.45, h * 0.98, w * 0.3, h * 0.96, w * 0.2, h * 0.82);
    path.cubicTo(w * 0.05, h * 0.55, w * 0.25, h * 0.25, w * 0.5, h * 0.05);
    path.close();

    canvas.drawPath(path, paint);

    // Inner bright spark core
    final corePaint = Paint()
      ..color = Colors.white.withOpacity(0.85)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(w * 0.5, h * 0.5), size.width * 0.1, corePaint);
  }

  @override
  bool shouldRepaint(covariant _CupiddleIconPainter oldDelegate) => oldDelegate.color != color;
}
