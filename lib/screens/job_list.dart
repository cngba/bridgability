// ignore_for_file: avoid_print

import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';


class Job {
  final String id;
  final String name;
  final String description;
  final String requirement;
  final String openingDate;
  final String closingDate;

  Job({
    required this.id,
    required this.name,
    required this.description,
    required this.requirement,
    required this.openingDate,
    required this.closingDate,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['_id'],
      name: json['name'],
      description: json['description'],
      requirement: json['requirement'],
      openingDate: json['opening_date'],
      closingDate: json['closing_date'],
    );
  }
}

Future<String?> getToken() async {
  final prefs = SharedPreferencesAsync();
  return prefs.getString('token');
}

class JobListScreen extends StatefulWidget {
  const JobListScreen({super.key});

  @override
  JobListScreenState createState() => JobListScreenState();
}

class JobListScreenState extends State<JobListScreen> {
  late Future<List<Job>> jobs;

  Future<List<Job>> fetchJobs() async {
    print('Token loading');
    final token = await getToken();
    print('Token:  $token');
    
    final url = Uri.parse('http://192.168.1.16:3000/jobs'); // Replace with your API endpoint
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token'
      }, // Replace with your JWT token
    );

    print('Response body: ${response.body}');
    print('Response status: ${response.statusCode}');
    print('Response headers: ${response.headers}');
    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body)['jobs'];
      return data.map((job) => Job.fromJson(job)).toList();
    } else {
      throw Exception('Failed to load jobs');
    }
  }

  @override
  void initState() {
    super.initState();
    jobs = fetchJobs();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs'),
      ),
      body: FutureBuilder<List<Job>>(
        future: jobs,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No jobs available'));
          } else {
            return ListView.builder(
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final job = snapshot.data![index];
                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  child: ListTile(
                    title: Text(job.name),
                    subtitle: Text(job.description),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => JobDetailScreen(job: job),
                        ),
                      );
                    },
                  ),
                );
              },
            );
          }
        },
      ),
    );
  }
}

class JobDetailScreen extends StatelessWidget {
  final Job job;

  const JobDetailScreen({super.key, required this.job});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(job.name),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Description:', style: Theme.of(context).textTheme.titleLarge),
            Text(job.description),
            const SizedBox(height: 16),
            Text('Requirement:', style: Theme.of(context).textTheme.titleLarge),
            Text(job.requirement),
            const SizedBox(height: 16),
            Text('Opening Date:', style: Theme.of(context).textTheme.titleLarge),
            Text(job.openingDate),
            const SizedBox(height: 16),
            Text('Closing Date:', style: Theme.of(context).textTheme.titleLarge),
            Text(job.closingDate),
          ],
        ),
      ),
    );
  }
}
