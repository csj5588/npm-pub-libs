import 'package:bwxt/service/dio-service/index.dart';
import './mock.dart';

Function get = DioService().get;

class Apis {
  var getInfo = get("https://www.inke.cn", mock: infoMock);
}