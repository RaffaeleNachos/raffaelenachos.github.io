# Installing Asterisk 17.7.0 on Linux and set it up for webRTC Clients

Asterisk is an open source software for developing PBX (private telephone network). It is like Apache but for VoIP/SIP communications. 

## Download && Dependencies

First thing first, download the latest source code from [Downloads Asterisk](https://www.asterisk.org/downloads/). Then "untar" the archive

```bash
$ tar -zxvf asterisk-17-current.tar.gz
```

NOTE: in this article we will not cover the installing of libpri and DAHDI libraries that are necessary for communicate between ISDN (Integrated Services Digital Networks) devices.

Asterisk contains two SIP stacks, the **chain_sip** which is no longer core-supported and the new **chan_pjsip** based on [PJSIP](https://www.pjsip.org/). The new stack is a separate library but it is bundled in Asterisk, and from version 15 it is the first choice.

All the following commands should be done by root. First, move to the Asterisk directory and then install all the dependencies

```bash
$ cd asterisk-17.7.0/
$ ./contrib/scripts/install_prereq install
```

you also may need this packages

```bash
$ apt install gcc g++ make patch libedit-dev uuid-dev libxml2-dev libsqlite3-dev openssl libssl-dev bzip2
```

## Let's Compile!

Before compiling, run the configuration script. From version 15 and above the flag `--with-pjproject-bundled` is not necessary, if you want to use only the *chain_sip* stack just use the flag `--without-pjproject-bundled`. Because we are using the version 17 run the following command (note that we are including jansson C library)

```bash
$ ./configure --with-jansson-bundled
```

then

```bash
$ make menuselect
```

in this menu you can change what modules you would like to load. Make sure you are loading *res_pjsip* modules and, in the section *Codec Translators*, the opus codec. We are ready for compiling the source code.

```bash
$ make && make install
```

Now generate the sample configuration and install the initialization script

```bash
$ make samples
$ make config
```

## WebRTC Configuration

First step is creating CA certificates for TLS encryption needed by HTTPS. You can use/make your own with Let's Encrypt. In my case, I had to make it work on localhost, so we can use a self-signed certificate. Fortunately Asterisk has a tool for this (you will be asked for the same new password several times).

```bash
$ mkdir /etc/asterisk/keys
$ contrib/scripts/ast_tls_cert -C your_ip -O "My Organization" -b 2048 -d /etc/asterisk/keys
```

In order to use WebSockets for communications we have to configure the HTTP server provided by Asterisk.

Modify `/etc/asterisk/http.conf` file as follows:

```
[general]
enabled=yes
bindaddr=0.0.0.0
bindport=8088
tlsenable=yes
tlsbindaddr=0.0.0.0:8089
tlscertfile=/etc/asterisk/keys/asterisk.crt
tlsprivatekey=/etc/asterisk/keys/asterisk.key
```

and `/etc/asterisk/pjsip.conf` as follows:

```
[webrtc_client]
type=aor
max_contacts=5
remove_existing=yes

[webrtc_client]
type=auth
auth_type=userpass
username=webrtc_client
password=webrtc_client ; CHANGE THIS PASSWORD

[webrtc_client]
type=endpoint
aors=webrtc_client
auth=webrtc_client
dtls_auto_generate_cert=yes
webrtc=yes
; Setting webrtc=yes is a shortcut for setting the following options:
; use_avpf=yes
; media_encryption=dtls
; dtls_verify=fingerprint
; dtls_setup=actpass
; ice_support=yes
; media_use_received_transport=yes
; rtcp_mux=yes
context=default
disallow=all
allow=opus,ulaw
```

Now start Asterisk and check if the HTTP server is running:

```bash
$ asterisk
$ asterisk -vvvr
somewhere*CLI> http show status
HTTP Server Status:
Prefix: 
Server: Asterisk
Server Enabled and Bound to 0.0.0.0:8088

HTTPS Server Enabled and Bound to 0.0.0.0:8089

Enabled URI's:
/httpstatus => Asterisk HTTP General Status
/phoneprov/... => Asterisk HTTP Phone Provisioning Tool
/metrics/... => Prometheus Metrics URI
/ari/... => Asterisk RESTful API
/ws => Asterisk HTTP WebSocket

Enabled Redirects:
  None.
```

Note that HTTPS Server is enabled and the `/ws` directory is reachable.

Then with Firefox/Chrome you should be able to get the browser to accept the self-signed certificate by visiting `https://your_ip:8089/ws` directly. If not, just add the certificates created before in the correct settings section of your browser.

#### Basic Asterisk Commands

You can exit the Asterisk Console by pressing Ctrl-C

```bash
# for stop the service
core stop now
core stop gracefully

# restart the service
core restart now
core restart gracefully
```

have a look at [Asterisk Command Line Interface](https://wiki.asterisk.org/wiki/display/AST/Asterisk+Command+Line+Interface)

## Connect from a Client

Now, for testing purpose, modify the `/etc/asterisk/extensions.conf` file in order to make the server answering with a voice demo:

```
[default]
exten => 200,1,Answer()
same => n,Playback(demo-congrats)
same => n,Hangup()
```

Our Asterisk server will now answer the calls to 200 and then play an audio demo file. [Dialplan Doc](https://wiki.asterisk.org/wiki/display/AST/Dialplan).

After saving the modified file just restart the Asterisk process from the CLI.

From this moment we should be able to use [sipML5 HTML5 SIP demo client](https://www.doubango.org/sipml5/) with the following settings:

- Name: Your Name

- Private Identity: webrtc_client

- Public Identity: sip:webrtc_client@your_ip

- Password: the password set in /etc/asterisk/pjsip.conf file

- Realm: asterisk.org

Then click Expert mode and use this settings:

- Disable Video and 3GPP selected

- WebSocket Server URL: wss://your_ip:8089/ws

click save, and then login.

You now should be able to call [200] only with audio and you should hear a voice message.

## Enable Video Calling

After we get a fully working demo, we can test the video calling functionality by creating a new user in `/etc/asterisk/pjsip.conf` file and modifying (again) the [default] entry of `/etc/asterisk/extensions.conf` file. 

The only thing to do, in order to enable video calling, is adding a video codec to the codec allow entry in `pjsip.conf`. (As a second client we will use a softphone emulator, in particular [linphone.org](https://www.linphone.org/)) So let's create a new user in `/etc/asterisk/pjsip.conf` and add video codec options:

```
[linphone_user]
type=aor
max_contacts=5
remove_existing=yes

[linphone_user]
type=auth
auth_type=userpass
username=linphone_user
password=linphone_user    ; CHANGE THIS PASSWORD

[linphone_user]
type=endpoint
aors=linphone_user
auth=linphone_user
context=default
disallow=all
allow=opus,ulaw,vp8,h264,h263,h263p    ; NOTE THE VIDEO CODECS!
```

***make sure you add the video codec entries also to our `[webrtc_client]` user!***

Modify again `/etc/asterisk/extensions.conf` so as to make the two clients can call each other:

```
[default]
exten => 106,1,Dial(PJSIP/webrtc_client) ; calling 106 will call the webrtc_client
exten => 601,1,Dial(PJSIP/linphone_user) ; calling 601 will call the linphone client
```

Now `core restart gracefully` from the Asterisk CLI.

Simply open the linphone App and use the SIP `linphone_user` account in order to log in. You will be now able to video call the sipml5 webrtc_client and vice-versa.
