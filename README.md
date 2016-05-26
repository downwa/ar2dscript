# ar2dscript
Implementation of DroidScript runtime for nodejs (Raspberry Pi, other Linux, Windows, MacOS)

<h2>What's in a name?</h2>

The name is intended to remind you of a certain famous movie Droid, the Raspberry Pi, and
DroidScript for Android devices.

<h2>Purpose</h2>

This is not intended to be a replacement for the excellent Android software by Dave Smart,
but a way to run apps written in DroidScript, on non-Android platforms which can run nodejs.

The implementation purposely relies on DroidScript assets so as to be as compatible as possible
and make it easier to closely track DroidScript changes.  Thus, it requires a DroidScript_*.apk
file (which you can obtain using a backup tool on your Android device), to run stand-alone
DroidScript-compatible projects in their source-code form.  The .apk file will be consulted to
retrieve the definition of the App object, as well as for system images, sounds, fonts, etc.

Alternately, a compiled DroidScript app can be run merely from its .apk file, in which case all
resources will come from that file.

<h2>Implementation</h2>

The implementation provides a nodejs-based web server, which serves an HTML5-based framework to
a browser.  The browser then establishes a Web Socket connection back to the server, which is
used for remote procedure calls between browser and server.  Local operations such as filesystem
reads run entirely on the server.  Graphics operations requiring local resources, such as image
display, split the process-- the image is retrieved from the server but manipulated by the browser.
Other operations which only require browser resources are handled there.

Presently, existing functionality is being moved into github from an offline project.
