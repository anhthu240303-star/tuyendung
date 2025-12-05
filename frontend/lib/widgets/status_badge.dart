// frontend/lib/widgets/status_badge.dart
import 'package:flutter/material.dart';
import '../config/themes/app_colors.dart';
import '../config/themes/app_text_styles.dart';

class StatusBadge extends StatelessWidget {
  final String text;
  final Color? backgroundColor;
  final Color? textColor;
  final IconData? icon;
  final bool isSmall;

  const StatusBadge({
    Key? key,
    required this.text,
    this.backgroundColor,
    this.textColor,
    this.icon,
    this.isSmall = false,
  }) : super(key: key);

  // Factory constructors for common statuses
  factory StatusBadge.moiNop() {
    return const StatusBadge(
      text: 'Mới nộp',
      backgroundColor: AppColors.moiNop,
      icon: Icons.fiber_new,
    );
  }

  factory StatusBadge.datSangLoc() {
    return const StatusBadge(
      text: 'Đạt sàng lọc',
      backgroundColor: AppColors.datSangLoc,
      icon: Icons.check_circle,
    );
  }

  factory StatusBadge.khongDatSangLoc() {
    return const StatusBadge(
      text: 'Không đạt',
      backgroundColor: AppColors.khongDatSangLoc,
      icon: Icons.cancel,
    );
  }

  factory StatusBadge.choPhongVan() {
    return const StatusBadge(
      text: 'Chờ phỏng vấn',
      backgroundColor: AppColors.choPhongVan,
      icon: Icons.schedule,
    );
  }

  factory StatusBadge.dangPhongVan() {
    return const StatusBadge(
      text: 'Đang phỏng vấn',
      backgroundColor: AppColors.dangPhongVan,
      icon: Icons.people,
    );
  }

  factory StatusBadge.daTuyen() {
    return const StatusBadge(
      text: 'Đã tuyển',
      backgroundColor: AppColors.daTuyen,
      icon: Icons.verified,
    );
  }

  factory StatusBadge.khongTuyen() {
    return const StatusBadge(
      text: 'Không tuyển',
      backgroundColor: AppColors.khongTuyen,
      icon: Icons.block,
    );
  }

  // Factory for custom status from string
  factory StatusBadge.fromStatus(String status) {
    switch (status) {
      case 'Moi_nop':
        return StatusBadge.moiNop();
      case 'Dat_sang_loc':
        return StatusBadge.datSangLoc();
      case 'Khong_dat_sang_loc':
        return StatusBadge.khongDatSangLoc();
      case 'Cho_phong_van':
        return StatusBadge.choPhongVan();
      case 'Dang_phong_van':
        return StatusBadge.dangPhongVan();
      case 'Da_tuyen':
        return StatusBadge.daTuyen();
      case 'Khong_tuyen':
        return StatusBadge.khongTuyen();
      default:
        return StatusBadge(text: status);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = backgroundColor ?? AppColors.backgroundGray;
    final txtColor = textColor ?? AppColors.textWhite;
    final fontSize = isSmall ? 11.0 : 13.0;
    final padding = isSmall
        ? const EdgeInsets.symmetric(horizontal: 8, vertical: 4)
        : const EdgeInsets.symmetric(horizontal: 12, vertical: 6);

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: fontSize + 2,
              color: txtColor,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: txtColor,
            ),
          ),
        ],
      ),
    );
  }
}

// Chip badge variant
class ChipBadge extends StatelessWidget {
  final String text;
  final VoidCallback? onDelete;
  final Color? backgroundColor;
  final Color? textColor;

  const ChipBadge({
    Key? key,
    required this.text,
    this.onDelete,
    this.backgroundColor,
    this.textColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(text),
      labelStyle: AppTextStyles.bodySmall.copyWith(
        color: textColor ?? AppColors.textPrimary,
      ),
      backgroundColor: backgroundColor ?? AppColors.backgroundGray,
      deleteIcon: onDelete != null
          ? const Icon(Icons.close, size: 16)
          : null,
      onDeleted: onDelete,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    );
  }
}