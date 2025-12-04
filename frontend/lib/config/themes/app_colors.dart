import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF667EEA);
  static const Color primaryDark = Color(0xFF764BA2);
  static const Color primaryLight = Color(0xFF8B9BF5);
  
  // Secondary Colors
  static const Color secondary = Color(0xFF11998E);
  static const Color secondaryDark = Color(0xFF0D7A6F);
  static const Color secondaryLight = Color(0xFF38EF7D);
  
  // Status Colors
  static const Color success = Color(0xFF28A745);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFDC3545);
  static const Color info = Color(0xFF17A2B8);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF212529);
  static const Color textSecondary = Color(0xFF6C757D);
  static const Color textDisabled = Color(0xFFADB5BD);
  static const Color textWhite = Color(0xFFFFFFFF);
  
  // Background Colors
  static const Color background = Color(0xFFF8F9FA);
  static const Color backgroundWhite = Color(0xFFFFFFFF);
  static const Color backgroundCard = Color(0xFFFFFFFF);
  static const Color backgroundGray = Color(0xFFE9ECEF);
  
  // Border Colors
  static const Color border = Color(0xFFDEE2E6);
  static const Color borderLight = Color(0xFFE9ECEF);
  static const Color borderDark = Color(0xFFCED4DA);
  
  // Status Badge Colors
  static const Color moiNop = Color(0xFF007BFF);
  static const Color datSangLoc = Color(0xFF28A745);
  static const Color khongDatSangLoc = Color(0xFFDC3545);
  static const Color choPhongVan = Color(0xFFFFC107);
  static const Color dangPhongVan = Color(0xFF17A2B8);
  static const Color daTuyen = Color(0xFF28A745);
  static const Color khongTuyen = Color(0xFF6C757D);
  
  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF11998E), Color(0xFF38EF7D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Shadow
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];
  
  static List<BoxShadow> buttonShadow = [
    BoxShadow(
      color: primary.withOpacity(0.3),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];
}