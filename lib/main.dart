import 'package:flutter/material.dart';

void main() {
  runApp(const MSMEApp());
}

class MSMEApp extends StatelessWidget {
  const MSMEApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'MSME ERP Assistant',
      // routerConfig: AppRouter.router,
    );
  }
}
