// frontend/lib/widgets/error_widget.dart
import 'package:flutter/material.dart';
import '../config/themes/app_colors.dart';
import '../config/themes/app_text_styles.dart';
import 'custom_button.dart';

class CustomErrorWidget extends StatelessWidget {
  final String? message;
  final VoidCallback? onRetry;
  final IconData? icon;

  const CustomErrorWidget({
    Key? key,
    this.message,
    this.onRetry,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              message ?? 'Có lỗi xảy ra',
              style: AppTextStyles.h5.copyWith(
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              CustomButton(
                text: 'Thử lại',
                onPressed: onRetry,
                icon: Icons.refresh,
                type: ButtonType.outline,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// Empty state widget
class EmptyWidget extends StatelessWidget {
  final String? message;
  final IconData? icon;
  final VoidCallback? onAction;
  final String? actionText;

  const EmptyWidget({
    Key? key,
    this.message,
    this.icon,
    this.onAction,
    this.actionText,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.inbox_outlined,
              size: 64,
              color: AppColors.textDisabled,
            ),
            const SizedBox(height: 16),
            Text(
              message ?? 'Không có dữ liệu',
              style: AppTextStyles.bodyLarge.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (onAction != null && actionText != null) ...[
              const SizedBox(height: 24),
              CustomButton(
                text: actionText!,
                onPressed: onAction,
                type: ButtonType.outline,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// Inline error message
class InlineErrorWidget extends StatelessWidget {
  final String message;

  const InlineErrorWidget({Key? key, required this.message}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: AppColors.error, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.error,
              ),
            ),
          ),
        ],
      ),
    );
  }
}