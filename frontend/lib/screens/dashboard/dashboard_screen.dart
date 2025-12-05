// frontend/lib/screens/dashboard/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/themes/app_colors.dart';
import '../../config/themes/app_text_styles.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().getDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<DashboardProvider>().refresh();
            },
          ),
        ],
      ),
      body: Consumer<DashboardProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.dashboardData == null) {
            return const LoadingWidget(message: 'Đang tải dữ liệu...');
          }

          if (provider.error != null && provider.dashboardData == null) {
            return CustomErrorWidget(
              message: provider.error,
              onRetry: () => provider.getDashboard(),
            );
          }

          final data = provider.dashboardData;
          if (data == null) {
            return const EmptyWidget(message: 'Không có dữ liệu');
          }

          return RefreshIndicator(
            onRefresh: () async => await provider.refresh(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Welcome card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Xin chào, ${user?.hoTen ?? ""}!',
                          style: AppTextStyles.h4,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Chào mừng bạn quay trở lại',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Overview stats
                Text(
                  'Tổng quan',
                  style: AppTextStyles.h5,
                ),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    InfoCard(
                      title: 'Tin tuyển dụng',
                      value: '${data.tongQuan.tongTinTuyenDung}',
                      icon: Icons.work,
                      color: AppColors.primary,
                    ),
                    InfoCard(
                      title: 'Đang tuyển',
                      value: '${data.tongQuan.tinDangTuyen}',
                      icon: Icons.campaign,
                      color: AppColors.secondary,
                    ),
                    InfoCard(
                      title: 'Ứng viên',
                      value: '${data.tongQuan.tongUngVien}',
                      icon: Icons.people,
                      color: AppColors.info,
                    ),
                    InfoCard(
                      title: 'Đã tuyển',
                      value: '${data.tongQuan.ungVienDaTuyen}',
                      icon: Icons.verified,
                      color: AppColors.success,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Candidate stats
                Text(
                  'Trạng thái ứng viên',
                  style: AppTextStyles.h5,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildStatRow(
                          'Mới nộp',
                          data.ungVien.moiNop,
                          AppColors.moiNop,
                        ),
                        const Divider(),
                        _buildStatRow(
                          'Đạt sàng lọc',
                          data.ungVien.datSangLoc,
                          AppColors.datSangLoc,
                        ),
                        const Divider(),
                        _buildStatRow(
                          'Đang phỏng vấn',
                          data.ungVien.dangPhongVan,
                          AppColors.dangPhongVan,
                        ),
                        const Divider(),
                        _buildStatRow(
                          'Đã tuyển',
                          data.ungVien.daTuyen,
                          AppColors.daTuyen,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Performance indicators
                Text(
                  'Chỉ số hiệu suất',
                  style: AppTextStyles.h5,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildIndicator(
                          'Tỷ lệ chuyển đổi',
                          data.chiSo.tyLeChuyenDoi,
                          Icons.trending_up,
                        ),
                        const Divider(),
                        _buildIndicator(
                          'Tỷ lệ sàng lọc',
                          data.chiSo.tyLeSangLoc,
                          Icons.filter_list,
                        ),
                        const Divider(),
                        _buildIndicator(
                          'Thời gian TB',
                          data.chiSo.thoiGianTrungBinh,
                          Icons.timer,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Upcoming interviews
                if (data.sapToi.lichPhongVan > 0) ...[
                  Card(
                    color: AppColors.warning.withOpacity(0.1),
                    child: ListTile(
                      leading: const Icon(
                        Icons.event,
                        color: AppColors.warning,
                      ),
                      title: const Text('Lịch phỏng vấn sắp tới'),
                      subtitle: Text(
                        '${data.sapToi.lichPhongVan} buổi trong 7 ngày tới',
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // Navigate to interview schedule
                      },
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatRow(String label, int value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              Text(label),
            ],
          ),
          Text(
            '$value',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIndicator(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(child: Text(label)),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}