import 'api_client.dart';

class SalesService {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> createSale({
    required String shiftId,
    String? tankId,
    String? fuelType,
    double? quantity,
    required double unitPrice,
    String? description,
    String? paymentMethod,
  }) async {
    final result = await _client.post('/sales', {
      'shiftId': shiftId,
      if (tankId != null) 'tankId': tankId,
      if (fuelType != null) 'fuelType': fuelType,
      if (quantity != null) 'quantity': quantity,
      'unitPrice': unitPrice,
      if (description != null) 'description': description,
      if (paymentMethod != null) 'paymentMethod': paymentMethod,
    });
    return Map<String, dynamic>.from(result);
  }

  Future<List<dynamic>> findByShift(String shiftId) async {
    final result = await _client.get('/sales', query: {'shiftId': shiftId});
    return List<dynamic>.from(result);
  }
}
