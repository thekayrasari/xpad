using System;
using System.Threading;
using System.ComponentModel.Composition;
using RossCarlson.Vatsim.Vpilot.Plugins;
using WebSocketSharp;
using Newtonsoft.Json;

using Newtonsoft.Json.Linq;

namespace xPadPlugin
{
    [Export(typeof(IPlugin))]
    public class XPadBridge : IPlugin, IDisposable
    {
        public string Name { get { return "xPad Bridge"; } }
        private WebSocket _ws;
        private Timer _reconnectTimer;
        private IBroker _broker;

        private bool _isConnected = false;
        private string _connectedCallsign = null;
        private readonly System.Collections.Generic.Dictionary<string, string> _activeControllers = new System.Collections.Generic.Dictionary<string, string>();
        private readonly object _lock = new object();

        private string FormatFrequency(int f)
        {
            return "1" + (f / 1000).ToString() + "." + (f % 1000).ToString("000");
        }

        private void SafeSend(string data, IBroker broker)
        {
            try
            {
                if (_ws != null)
                {
                    if (_ws.ReadyState != WebSocketState.Open)
                    {
                        _ws.Connect();
                    }
                    if (_ws.ReadyState == WebSocketState.Open)
                    {
                        _ws.Send(data);
                    }
                }
            }
            catch (Exception ex)
            {
                broker.PostDebugMessage("xPadBridge Send Error: " + ex.Message);
            }
        }

        public void Initialize(IBroker broker)
        {
            _broker = broker;
            // Connect to xPad backend
            _ws = new WebSocket("ws://127.0.0.1:8080");
            _ws.OnMessage += (sender, e) =>
            {
                // Handle commands from xPad frontend
                try
                {
                    var msg = JObject.Parse(e.Data);
                    if ((string)msg["topic"] == "vpilot_send_message")
                    {
                        var payloadToken = msg["payload"];
                        bool isPrivate = false;
                        string text = null;
                        string recipient = null;
                        if (payloadToken != null)
                        {
                            var isPrivateToken = payloadToken["isPrivate"];
                            if (isPrivateToken != null)
                            {
                                isPrivate = (bool)isPrivateToken;
                            }
                            text = (string)payloadToken["content"];
                            recipient = (string)payloadToken["recipient"];
                        }

                        if (!string.IsNullOrEmpty(text))
                        {
                            if (isPrivate && !string.IsNullOrEmpty(recipient)) {
                                broker.SendPrivateMessage(recipient, text);
                            } else {
                                broker.SendRadioMessage(text);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    broker.PostDebugMessage("xPadBridge Error: " + ex.Message);
                }
            };
            
            _ws.OnClose += (sender, e) => ScheduleReconnect();
            _ws.OnError += (sender, e) => ScheduleReconnect();
            _ws.OnOpen += (sender, e) =>
            {
                broker.PostDebugMessage("xPadBridge: WebSocket connected. Sending current state.");
                SendCurrentStatus();
            };

            try { _ws.Connect(); } catch { ScheduleReconnect(); }

            broker.NetworkConnected += (sender, e) =>
            {
                lock (_lock)
                {
                    _isConnected = true;
                    _connectedCallsign = e.Callsign;
                    _activeControllers.Clear();
                }
                var payload = new { topic = "vpilot_connection_status", payload = new { isConnected = true, callsign = e.Callsign } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.NetworkDisconnected += (sender, e) =>
            {
                lock (_lock)
                {
                    _isConnected = false;
                    _connectedCallsign = null;
                    _activeControllers.Clear();
                }
                var payload = new { topic = "vpilot_connection_status", payload = new { isConnected = false } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.RadioMessageReceived += (sender, e) =>
            {
                string freqStr = "";
                if (e.Frequencies != null && e.Frequencies.Length > 0)
                {
                    freqStr = FormatFrequency(e.Frequencies[0]);
                }
                var payload = new { topic = "vpilot_message_received", payload = new { sender = e.From, content = e.Message, isPrivate = false, isSentByMe = false, tab = "ATC", frequency = freqStr } };
                broker.PostDebugMessage("xPad: RadioMsg from " + e.From + " on " + freqStr);
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.BroadcastMessageReceived += (sender, e) =>
            {
                var payload = new { topic = "vpilot_message_received", payload = new { sender = e.From + " (Broadcast)", content = e.Message, isPrivate = false, isSentByMe = false, tab = "ATC" } };
                broker.PostDebugMessage("xPad: BroadcastMsg from " + e.From);
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.AtisReceived += (sender, e) =>
            {
                string atisText = string.Join("\n", e.Lines);
                var payload = new { topic = "vpilot_message_received", payload = new { sender = e.From + " (ATIS)", content = atisText, isPrivate = false, isSentByMe = false, tab = "ATC" } };
                broker.PostDebugMessage("xPad: AtisMsg from " + e.From);
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.PrivateMessageReceived += (sender, e) =>
            {
                var payload = new { topic = "vpilot_message_received", payload = new { sender = e.From, content = e.Message, isPrivate = true, isSentByMe = false, tab = e.From } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.ControllerAdded += (sender, e) =>
            {
                string freqStr = FormatFrequency(e.Frequency);
                lock (_lock)
                {
                    _activeControllers[e.Callsign] = freqStr;
                }
                var payload = new { topic = "vpilot_controller_added", payload = new { callsign = e.Callsign, frequency = freqStr } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.ControllerDeleted += (sender, e) =>
            {
                lock (_lock)
                {
                    if (_activeControllers.ContainsKey(e.Callsign))
                    {
                        _activeControllers.Remove(e.Callsign);
                    }
                }
                var payload = new { topic = "vpilot_controller_deleted", payload = new { callsign = e.Callsign } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.ControllerFrequencyChanged += (sender, e) =>
            {
                string freqStr = FormatFrequency(e.NewFrequency);
                lock (_lock)
                {
                    _activeControllers[e.Callsign] = freqStr;
                }
                var payload = new { topic = "vpilot_controller_updated", payload = new { callsign = e.Callsign, frequency = freqStr } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };
        }

        private void SendCurrentStatus()
        {
            if (_broker == null) return;

            bool connected;
            string callsign;
            System.Collections.Generic.KeyValuePair<string, string>[] controllers;

            lock (_lock)
            {
                connected = _isConnected;
                callsign = _connectedCallsign;
                controllers = new System.Collections.Generic.KeyValuePair<string, string>[_activeControllers.Count];
                int i = 0;
                foreach (var kvp in _activeControllers)
                {
                    controllers[i++] = kvp;
                }
            }

            var statusPayload = new { topic = "vpilot_connection_status", payload = new { isConnected = connected, callsign = callsign } };
            SafeSend(JsonConvert.SerializeObject(statusPayload), _broker);

            if (connected)
            {
                foreach (var controller in controllers)
                {
                    var controllerPayload = new { topic = "vpilot_controller_added", payload = new { callsign = controller.Key, frequency = controller.Value } };
                    SafeSend(JsonConvert.SerializeObject(controllerPayload), _broker);
                }
            }
        }

        private void ScheduleReconnect()
        {
            if (_reconnectTimer == null)
            {
                _reconnectTimer = new Timer(ReconnectCallback, null, 5000, Timeout.Infinite);
            }
            else
            {
                _reconnectTimer.Change(5000, Timeout.Infinite);
            }
        }

        private void ReconnectCallback(object state)
        {
            try
            {
                if (_ws != null && _ws.ReadyState != WebSocketState.Open)
                {
                    _ws.Connect();
                }
            }
            catch
            {
                ScheduleReconnect();
            }
        }

        public void Dispose()
        {
            if (_reconnectTimer != null)
            {
                _reconnectTimer.Dispose();
            }
            if (_ws != null)
            {
                if (_ws.ReadyState == WebSocketState.Open)
                {
                    _ws.Close();
                }
                _ws = null;
            }
        }
    }
}
