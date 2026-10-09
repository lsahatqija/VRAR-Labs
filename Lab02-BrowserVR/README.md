# Lab 02 student package

`Student-Slides.md` contains 37 student-facing slides, with a task followed by its solution. Copy their content into your lecture template. This package provides slide text rather than a PowerPoint file.

## Work in your own file

Edit `my-exhibition/index.html`. Start the server **inside `my-exhibition`**, so the public tunnel exposes only that small project folder. `device-check.html` is a companion diagnostic page.

Windows:

```powershell
cd my-exhibition
py -m http.server 8000 --bind 127.0.0.1
```

Linux/macOS: use `python3` instead of `py`.

Open `http://127.0.0.1:8000`. Leave terminal 1 running.

## HTTPS on your own phone or headset

Install cloudflared before class if possible.

Windows:

```powershell
winget install --id Cloudflare.cloudflared --exact
```

macOS with Homebrew:

```bash
brew install cloudflared
```

For Linux, or portable Windows downloads, use [Cloudflare's download page](https://developers.cloudflare.com/tunnel/downloads/) and select your actual architecture. A downloaded executable must be executable and either on PATH or called by its path. For example, rename the Windows download to `cloudflared.exe`, open a terminal in its folder, and run `./cloudflared.exe --version`. For a portable Linux binary renamed `cloudflared`, use `chmod +x ./cloudflared` then `./cloudflared --version`.

Open a new terminal after installation and confirm `cloudflared --version`. Then, in terminal 2:

```bash
cloudflared tunnel --url http://127.0.0.1:8000
```

For a portable executable, replace `cloudflared` with its actual path, for example `./cloudflared.exe`.

Open the generated **HTTPS** address on your other device. Append `/device-check.html` to check the current browser. No Cloudflare account, DNS setup, inbound port forwarding, or shared Wi-Fi network is required for this Quick Tunnel route. Both the laptop and testing device need working Internet access. The local server still uses loopback HTTP; the testing device reaches Cloudflare over HTTPS.

Keep both terminals running. Save edits and manually refresh on the testing device. The URL changes if the tunnel restarts and stops working when its process stops. Anyone who knows the URL can access the served folder. Use only the exhibition folder and stop both processes with Ctrl+C when finished. HTTPS does not guarantee immersive VR support on a phone or headset.

For testing, use a full-page URL in the device browser. Embedded previews can have additional permissions restrictions. Do not bypass certificate warnings or disable browser security.

### If HTTPS testing fails

1. First open the local loopback page on the laptop. Fix that before diagnosing the tunnel.
2. Confirm the tunnel target matches the local server port.
3. Check both processes are running and use the latest printed URL. Allow a short time for the URL to become reachable.
4. On managed networks, ask the instructor/IT to check whether Cloudflare Tunnel traffic is allowed. Do this before the lab where possible.
5. If the network blocks tunnels or Quick Tunnels are unavailable, use an instructor-provided HTTPS static host. Upload only `index.html` and `device-check.html`; A-Frame loads from HTTPS. The host must allow full-page access and XR permissions. No tunnel service guarantees classroom availability.
6. A renderable page with `immersive-vr: false` can be a legitimate browser/device limitation rather than a code error.

## Solution checkpoints

Each folder contains a **complete, runnable `index.html`**, with the same A-Frame version and no build step. You can copy a checkpoint into your working file after attempting the task, or serve that checkpoint folder directly.

| Checkpoint | New behaviour | Slides |
|---|---|---|
| `00-start` | Scene, camera rig, desktop navigation scaffold | 5–7 |
| `01-room` | Floor, wall, lighting, title, metre reference | 13–14 |
| `02-cube` | One pedestal and correctly placed cube | 15–16 |
| `03-three-objects` | Sphere and cylinder on their pedestals | 17–18 |
| `04-labels` | World-space labels for all objects | 19–20 |
| `05-gaze-selection` | Head-direction dwell and selection highlight | 21–23 |
| `06-information` | Per-object descriptions and shared panel | 24–26 |
| `07-complete` | Unique visit count and controller rays | 27–28 |
| `08-mouse-pointer` | Optional desktop mouse input with VR mode switching | 34 |

The provided desktop navigation component disables W/A/S/D when entering VR and restores it on exit. Its keyboard directions follow world axes. The scene has no collision system or artificial VR locomotion.

## Before class

Install Python/cloudflared and pre-test the tunnel on the actual classroom network. Check that A-Frame and its text font assets can load. Verify one compatible headset browser. Keep the completed checkpoint available for recovery, while asking students to attempt each task first.

## References

- https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
- https://developers.cloudflare.com/tunnel/downloads/
- https://github.com/microsoft/winget-pkgs/tree/master/manifests/c/Cloudflare/cloudflared
- https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
