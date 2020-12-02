import 'package:flutter/widgets.dart';

class MaterialModel extends ChangeNotifier {
  bool isLoading = false;

  void triggerLoading() {
    isLoading = !isLoading;
    notifyListeners();
  }
}
