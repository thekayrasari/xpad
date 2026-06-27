using System;
using System.ComponentModel.Composition;
using RossCarlson.Vatsim.Vpilot.Plugins;
using WebSocketSharp;
using Newtonsoft.Json;

using Newtonsoft.Json.Linq;

namespace xPadPlugin
{
    [Export(typeof(IPlugin))]
    public class XPadBridge : IPlugin
    {
        public string Name => "xPad Bridge";
        private WebSocket _ws;

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
                        bool isPrivate = (bool?)msg["payload"]?["isPrivate"] ?? false;
                        string text = (string)msg["payload"]?["content"];
                        string recipient = (string)msg["payload"]?["recipient"];
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
            
            try { _ws.Connect(); } catch { }

            broker.NetworkConnected += (sender, e) =>
            {
                var payload = new { topic = "vpilot_connection_status", payload = new { isConnected = true, callsign = e.Callsign } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.NetworkDisconnected += (sender, e) =>
            {
                var payload = new { topic = "vpilot_connection_status", payload = new { isConnected = false } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.RadioMessageReceived += (sender, e) =>
            {
                string freqStr = "";
                if (e.Frequencies != null && e.Frequencies.Length > 0)
                {
                    int f = e.Frequencies[0];
                    freqStr = "1" + (f / 1000).ToString() + "." + (f % 1000).ToString("000");
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
                string freqStr = "1" + (e.Frequency / 1000).ToString() + "." + (e.Frequency % 1000).ToString("000");
                var payload = new { topic = "vpilot_controller_added", payload = new { callsign = e.Callsign, frequency = freqStr } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.ControllerDeleted += (sender, e) =>
            {
                var payload = new { topic = "vpilot_controller_deleted", payload = new { callsign = e.Callsign } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };

            broker.ControllerFrequencyChanged += (sender, e) =>
            {
                string freqStr = "1" + (e.NewFrequency / 1000).ToString() + "." + (e.NewFrequency % 1000).ToString("000");
                var payload = new { topic = "vpilot_controller_updated", payload = new { callsign = e.Callsign, frequency = freqStr } };
                SafeSend(JsonConvert.SerializeObject(payload), broker);
            };
        }
    }
}
