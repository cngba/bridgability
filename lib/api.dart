import 'package:http/http.dart' as http;
import 'dart:convert';

class Api {
  static const String baseUrl = 'http://192.168.1.16:3000/';  // URL of your backend

  Future<String> fetchMessage() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));

      if (response.statusCode == 200) {
        // Parse the JSON response
        final Map<String, dynamic> data = json.decode(response.body);
        return data['message'];
      } else {
        throw Exception('Failed to load message');
      }
    } catch (e) {
      return 'Error: $e';
    }
  }
}