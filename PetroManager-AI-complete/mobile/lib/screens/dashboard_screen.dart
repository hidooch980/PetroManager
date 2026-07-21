import 'package:flutter/material.dart';
import '../services/dashboard_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'sale_entry_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _dashboardService = DashboardService();
  final _authService = AuthService();

  Map<String, dynamic>? _dailySales;
  List<dynamic>? _tanks;
  Map<String, dynamic>? _profitLoss;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _dashboardService.dailySales(),
        _dashboardService.fuelInventory(),
        _dashboardService.profitAndLoss(),
      ]);
      setState(() {
        _dailySales = results[0] as Map<String, dynamic>;
        _tanks = results[1] as List<dynamic>;
        _profitLoss = results[2] as Map<String, dynamic>;
      });
    } catch (e) {
      setState(() => _error = 'خطا در دریافت اطلاعات داشبورد');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('داشبورد مدیریت'),
        actions: [
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SaleEntryScreen()),
          );
        },
        icon: const Icon(Icons.add),
        label: const Text('ثبت فروش'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text(_error!))
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _MetricCard(
                        title: 'فروش امروز',
                        value: '${_dailySales?['totalAmount'] ?? 0}',
                        subtitle: 'تعداد تراکنش: ${_dailySales?['count'] ?? 0}',
                        icon: Icons.point_of_sale,
                      ),
                      const SizedBox(height: 12),
                      _MetricCard(
                        title: 'سود خالص (از اول ماه)',
                        value: '${_profitLoss?['netProfit'] ?? 0}',
                        subtitle: 'درآمد: ${_profitLoss?['totalRevenue'] ?? 0}',
                        icon: Icons.trending_up,
                      ),
                      const SizedBox(height: 20),
                      const Text('موجودی مخازن', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      ...?_tanks?.map((tank) => Card(
                            child: ListTile(
                              leading: const Icon(Icons.propane_tank),
                              title: Text(tank['fuelType'] ?? ''),
                              subtitle: LinearProgressIndicator(
                                value: (tank['fillRatio'] as num?)?.toDouble() ?? 0,
                              ),
                              trailing: Text('${tank['currentLevel']} / ${tank['capacity']}'),
                            ),
                          )),
                    ],
                  ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, size: 36, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
                  Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
