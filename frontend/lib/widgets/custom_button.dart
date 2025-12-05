// frontend/lib/widgets/custom_button.dart
import 'package:flutter/material.dart';
import '../config/themes/app_colors.dart';
import '../config/themes/app_text_styles.dart';

enum ButtonType { primary, secondary, outline, text, danger }
enum ButtonSize { small, medium, large }

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonType type;
  final ButtonSize size;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double? height;

  const CustomButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.type = ButtonType.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.icon,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.height,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || isLoading;

    // Get button dimensions
    double buttonHeight;
    double buttonPaddingHorizontal;
    double fontSize;

    switch (size) {
      case ButtonSize.small:
        buttonHeight = height ?? 36;
        buttonPaddingHorizontal = 16;
        fontSize = 14;
        break;
      case ButtonSize.large:
        buttonHeight = height ?? 56;
        buttonPaddingHorizontal = 32;
        fontSize = 18;
        break;
      case ButtonSize.medium:
      default:
        buttonHeight = height ?? 48;
        buttonPaddingHorizontal = 24;
        fontSize = 16;
        break;
    }

    // Get colors based on type
    Color getBackgroundColor() {
      if (isDisabled) return AppColors.borderLight;
      if (backgroundColor != null) return backgroundColor!;

      switch (type) {
        case ButtonType.primary:
          return AppColors.primary;
        case ButtonType.secondary:
          return AppColors.secondary;
        case ButtonType.danger:
          return AppColors.error;
        case ButtonType.outline:
        case ButtonType.text:
          return Colors.transparent;
      }
    }

    Color getTextColor() {
      if (isDisabled) return AppColors.textDisabled;
      if (textColor != null) return textColor!;

      switch (type) {
        case ButtonType.outline:
          return AppColors.primary;
        case ButtonType.text:
          return AppColors.primary;
        case ButtonType.danger:
          return AppColors.textWhite;
        default:
          return AppColors.textWhite;
      }
    }

    Color? getBorderColor() {
      if (type == ButtonType.outline) {
        return isDisabled ? AppColors.borderLight : AppColors.primary;
      }
      return null;
    }

    Widget buttonChild = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading)
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(getTextColor()),
            ),
          )
        else ...[
          if (icon != null) ...[
            Icon(icon, size: fontSize + 2, color: getTextColor()),
            const SizedBox(width: 8),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: getTextColor(),
            ),
          ),
        ],
      ],
    );

    Widget button = Container(
      height: buttonHeight,
      width: isFullWidth ? double.infinity : width,
      decoration: BoxDecoration(
        color: getBackgroundColor(),
        borderRadius: BorderRadius.circular(8),
        border: getBorderColor() != null
            ? Border.all(color: getBorderColor()!, width: 1.5)
            : null,
        boxShadow: type == ButtonType.primary && !isDisabled
            ? AppColors.buttonShadow
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isDisabled ? null : onPressed,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: buttonPaddingHorizontal),
            child: Center(child: buttonChild),
          ),
        ),
      ),
    );

    return button;
  }
}

// Icon Button variant
class CustomIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? iconColor;
  final double size;
  final String? tooltip;

  const CustomIconButton({
    Key? key,
    required this.icon,
    this.onPressed,
    this.backgroundColor,
    this.iconColor,
    this.size = 40,
    this.tooltip,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final button = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.backgroundGray,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(8),
          child: Icon(
            icon,
            color: iconColor ?? AppColors.textPrimary,
            size: size * 0.5,
          ),
        ),
      ),
    );

    if (tooltip != null) {
      return Tooltip(message: tooltip!, child: button);
    }

    return button;
  }
}