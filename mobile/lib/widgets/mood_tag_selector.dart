import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/campuses.dart';

class MoodTagSelector extends StatelessWidget {
  final String? selectedTag;
  final ValueChanged<String> onSelectTag;

  const MoodTagSelector({
    super.key,
    required this.selectedTag,
    required this.onSelectTag,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 42,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: NigerianCampuses.moodTags.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final tag = NigerianCampuses.moodTags[index];
          final isSelected = selectedTag == tag;

          return GestureDetector(
            onTap: () => onSelectTag(tag),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: isSelected ? AppColors.rose.withOpacity(0.18) : AppColors.cardSecondary,
                border: Border.all(
                  color: isSelected ? AppColors.rose : AppColors.border,
                  width: isSelected ? 1.5 : 1.0,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.rose.withOpacity(0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Center(
                child: Text(
                  tag,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
