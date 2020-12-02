import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import './model.dart';

class MaterialDemo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<MaterialModel>(
      create: (_) => MaterialModel(),
      child: MaterialMain()
    );
  }
}

class MaterialMain extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return MaterialMainState();
  }
}

class MaterialMainState extends State<MaterialMain> {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text('Materila'),
    );
  }
}
