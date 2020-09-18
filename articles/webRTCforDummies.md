# webRTC for Dummies

## What is webRTC?

webRTC stands out for "web Real Time Communication" and it is a technology supported by major companies like Google and Apple. This technology supports video, voice, and generic data to be sent between peers (usually browsers), allowing developers to build powerful voice and video communication solutions like Google Meet. The main particularity of webRTC is the embed API in all modern browsers in order to avoid external plugins. 

webRTC is also [OpenSource! - GitHub](https://github.com/webrtc). Apple seize the opportunity making webRTC integrated in Apple's development [WebKit](https://webkit.org/blog/7726/announcing-webrtc-and-media-capture/), but also the open source community made a cool [WebRTC module for React Native](https://github.com/react-native-webrtc/react-native-webrtc).

### MainFrame

webRTC is made up of three main APIs:

- getUserMedia

- RTCPeerConnection

- RTCDataChannel

#### Capturing MediaStreams (mediaDevices.getUserMedia())

It's work is get access to data streams, such as from the user's webcam/camera and microphone. The "RFCs" can be found [here](https://www.w3.org/TR/mediacapture-streams/) and [here](https://w3c.github.io/webrtc-pc/). In few words the clients code calls `getUserMedia()` method which, after getting the permissions from the user, outputs a `MediaStream` object which has input and output properties, that might be passed to a video element or an RTCPeerConnection. Each `MediaStream` has a unique ID in this format `Bhnc680yqP0TMhpDdtVzprlDqJZnAENQ4pct`.

#### RTCPeerConnection

It's work is making audio and video calling, with facilities for encryption and bandwidth management. Before sending data, webRTC needs a mechanism to coordinate communication and to send control messages, a process known as signaling. 

###### Signaling

Signaling methods and protocols are *not* specified by WebRTC in order to have full compatibility with future approaches: app developers can choose whatever messaging protocol they prefer, such as SIP or XMPP and make *offers and answers* with other clients. 

Signaling is used to exchange three types of information:

- Session control messages: to initialize or close communication and report errors
- Network configuration: IPs and Ports
- Media capabilities: codecs and resolutions handled by browsers

Once the signaling process has completed successfully, data can be streamed directly peer to peer.

This signaling process needs a way for clients to pass messages back and forth, passing NATs and Firewalls. As said before, this mechanism is not implemented by the WebRTC APIs so you need to build your own, using STUN (get external IPs) and TURN (relay the traffic between peers) servers. A more detailed article about STUN and TURN can be found [HERE](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/).

#### RTCDataChannel

It's work is making peer-to-peer communication of generic data. A cool code-lab about making a functional app using RTCDataChannel can be found [HERE](https://codelabs.developers.google.com/codelabs/webrtc-web/#0).

#### What about Security

WebRTC is used by people, it sends video and audio streams, so security is important.  Several features about security are included:

- Secure protocols such as [DTLS](http://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security "Wikipedia article about Datagram Transport Layer Security") and [SRTP](http://en.wikipedia.org/wiki/Secure_Real-time_Transport_Protocol "Wikipedia article about Secure Real-time Transport Protocol").
- Encryption for signaling mechanism.
- APIs and components are updated whenever the browser is updated.
- Camera and microphone access must be granted explicitly and, when the camera or microphone are running, this is clearly shown by the user interface.

other information about security can be found [HERE](https://www.ietf.org/proceedings/82/slides/rtcweb-13.pdf). 

#### Others + Useful Tools

A cool page with many samples and working code could be found [HERE](https://webrtc.github.io/samples/).

webRTC statistics for developers:

- **chrome://webrtc-internals** page in Chrome
- **opera://webrtc-internals** page in Opera
- **about:webrtc** page in Firefox

A more detailed description about webRTC can be found in [this tutorial from HTML5 Rocks](https://www.html5rocks.com/en/tutorials/webrtc/basics/).
