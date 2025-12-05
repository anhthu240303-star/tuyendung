// frontend/lib/widgets/loading_widget.dart
import 'package:flutter/material.dart';
import '../config/themes/app_colors.dart';
import '../config/themes/app_text_styles.dart';

class LoadingWidget extends StatelessWidget {
  final String? message;
  final double size;
  final Color? color;

  const LoadingWidget({
    Key? key,
    this.message,
    this.size = 40,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(
                color ?? AppColors.primary,
              ),
            ),
          ),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(
              message!,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

// Full screen overlay loading
class LoadingOverlay extends StatelessWidget {
  final Widget child;
  final bool isLoading;
  final String? message;

  const LoadingOverlay({
    Key? key,
    required this.child,
    this.isLoading = false,
    this.message,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            color: Colors.black54,
            child: LoadingWidget(message: message),
          ),
      ],
    );
  }
}

// Small loading indicator
class SmallLoadingIndicator extends StatelessWidget {
  final Color? color;

  const SmallLoadingIndicator({Key? key, this.color}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? AppColors.primary,
        ),
      ),
    );
  }
}

// Linear progress indicator
class CustomLinearProgress extends StatelessWidget {
  final double? value;
  final Color? backgroundColor;
  final Color? color;

  const CustomLinearProgress({
    Key? key,
    this.value,
    this.backgroundColor,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LinearProgressIndicator(
      value: value,
      backgroundColor: backgroundColor ?? AppColors.backgroundGray,
      valueColor: AlwaysStoppedAnimation<Color>(
        color ?? AppColors.primary,
      ),
    );
  }
}