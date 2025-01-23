// ignore_for_file: avoid_print

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import './modify_profile.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  ProfileScreenState createState() => ProfileScreenState();
}

Future<String?> getToken() async {
  final prefs = SharedPreferencesAsync();
  return prefs.getString('token');
}
class ProfileScreenState extends State<ProfileScreen> {
  // Profile data variables
  String name = '';
  int age = 0;
  String location = '';
  String bio = '';
  bool isLoading = true;

  // Fetch profile data from the server
  Future<void> fetchProfileData() async {
  final token = await getToken();

  if (token == null) {
    return; // Optionally, handle the case when there's no token
  }

  final url = Uri.parse('http://192.168.189.60:3000/profiles');

  try {
    final startTime = DateTime.now();
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
    final endTime = DateTime.now();
    final duration = endTime.difference(startTime);
    print('Request took: ${duration.inMilliseconds}ms');
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      setState(() {
        name = data['profile']['name'];
        age = data['profile']['age'];
        location = data['profile']['location'];
        bio = data['profile']['bio'];
        isLoading = false;
      });
    } else {
      throw Exception('Failed to load profile data');
    }
  } catch (e) {
    print('Error: $e');
    setState(() {
      isLoading = false;
    });
    // Handle the error (show a message to the user or retry the request)
  }
}


  @override
  void initState() {
    super.initState();
    fetchProfileData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Name: $name',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Age: $age',
                    style: TextStyle(
                      fontSize: 18,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Location: $location',
                    style: TextStyle(
                      fontSize: 18,
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Bio: $bio',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 32),
                  Center(
                    child: ElevatedButton(
                      onPressed: () {
                        // Navigate to Modify Profile page
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ModifyProfileScreen(
                              name: name,
                              age: age,
                              location: location,
                              bio: bio,
                            ),
                          ),
                        );
                      },
                      child: Text('Modify Profile'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
