import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../constants/config.dart';

class WebSocketEvent {
  final String type;
  final dynamic payload;

  WebSocketEvent({required this.type, required this.payload});
}

class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;
  WebSocketService._internal();

  WebSocketChannel? _channel;
  final StreamController<WebSocketEvent> _eventController = StreamController<WebSocketEvent>.broadcast();
  bool _isConnected = false;
  Timer? _reconnectTimer;

  Stream<WebSocketEvent> get events => _eventController.stream;
  bool get isConnected => _isConnected;

  void connect(String token) {
    if (_isConnected) return;

    try {
      final wsUri = Uri.parse('${AppConfig.defaultWsUrl}?token=$token');
      _channel = WebSocketChannel.connect(wsUri);
      _isConnected = true;

      _channel!.stream.listen(
        (data) {
          try {
            final parsed = jsonDecode(data.toString());
            final event = WebSocketEvent(
              type: parsed['type']?.toString() ?? 'unknown',
              payload: parsed['payload'],
            );
            _eventController.add(event);
          } catch (e) {
            // Non-json or ping frames
          }
        },
        onError: (error) {
          _handleDisconnect(token);
        },
        onDone: () {
          _handleDisconnect(token);
        },
      );
    } catch (e) {
      _handleDisconnect(token);
    }
  }

  void _handleDisconnect(String token) {
    _isConnected = false;
    _channel = null;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 4), () {
      connect(token);
    });
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
    _isConnected = false;
  }
}
