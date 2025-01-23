import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

Future<String?> getToken() async {
  final prefs = SharedPreferencesAsync(); // Corrected to use SharedPreferences.getInstance()
  return prefs.getString('token'); // Assuming the token is saved with the key 'token'
}

class ModifyProfileScreen extends StatefulWidget {
  final String name;
  final int age;
  final String location;
  final String bio;

  const ModifyProfileScreen({
    super.key,
    required this.name,
    required this.age,
    required this.location,
    required this.bio,
  });

  @override
  State<ModifyProfileScreen> createState() => _ModifyProfileScreenState();
}

class _ModifyProfileScreenState extends State<ModifyProfileScreen> {
  late TextEditingController nameController;
  late TextEditingController ageController;
  late TextEditingController locationController;
  late TextEditingController bioController;

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController(text: widget.name);
    ageController = TextEditingController(text: widget.age.toString());
    locationController = TextEditingController(text: widget.location);
    bioController = TextEditingController(text: widget.bio);
  }

  Future<void> saveProfile() async {
    final token = await getToken();

    if (token == null) {
      return;
    }

    final url = Uri.parse('http://192.168.189.60:3000/profiles');
    final body = json.encode({
      'name': nameController.text,
      'age': int.parse(ageController.text),
      'location': locationController.text,
      'bio': bioController.text,
    });

    final response = await http.put(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: body,
    );

    if (response.statusCode == 200) {
      Navigator.pop(context, true); // Return to the profile screen
    } else {
      throw Exception('Failed to save profile data');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Modify Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(labelText: 'Name'),
            ),
            TextField(
              controller: ageController,
              decoration: InputDecoration(labelText: 'Age'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: locationController,
              decoration: InputDecoration(labelText: 'Location'),
            ),
            TextField(
              controller: bioController,
              decoration: InputDecoration(labelText: 'Bio'),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: saveProfile,
              child: Text('Save'),
            ),
          ],
        ),
      ),
    );
  }
}
