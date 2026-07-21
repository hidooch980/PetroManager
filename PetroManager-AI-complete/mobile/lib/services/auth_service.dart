import 'api_client.dart';

class AuthService {
  final ApiClient _client = ApiClient();

  Future<void> login(String username, String password) async {
    final result = await _client.post('/auth/login', {
      'username': username,
      'password': password,
    });
    await _client.saveToken(result['accessToken']);
  }

  Future<void> logout() async {
    await _client.clearToken();
  }

  Future<bool> isLoggedIn() => _client.isLoggedIn();
}
