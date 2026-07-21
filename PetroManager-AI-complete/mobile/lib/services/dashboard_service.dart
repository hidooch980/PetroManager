import 'api_client.dart';

class DashboardService {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> dailySales() async {
    final result = await _client.get('/reports/sales/daily');
    return Map<String, dynamic>.from(result);
  }

  Future<List<dynamic>> fuelInventory() async {
    final result = await _client.get('/reports/fuel/inventory');
    return List<dynamic>.from(result);
  }

  Future<Map<String, dynamic>> profitAndLoss() async {
    final result = await _client.get('/reports/profit-loss');
    return Map<String, dynamic>.from(result);
  }
}
