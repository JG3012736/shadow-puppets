# Shadow Puppets

A sketch that allows you to create a shadow puppet story using your hands. Real-time hand tracking turns your hands into shadows on a cave wall, and you can record puppet motions, play them back, and move and resize them around the canvas. Exhibited at the WQED Center in Pittsburgh on December 7, 2024, as part of an interactive group show about projecting light and shadow.

**Try it live:** [jg3012736.github.io/shadow-puppets](https://jg3012736.github.io/shadow-puppets/) (allow camera access)

**Exhibition version:** [jg3012736.github.io/shadow-puppets/exhibition](https://jg3012736.github.io/shadow-puppets/exhibition/)

**Demo video:**

[![Shadow Puppets demo](https://img.youtube.com/vi/OMl1SEck59I/hqdefault.jpg)](https://youtu.be/OMl1SEck59I)

* **Built with:** JavaScript, p5.js, ml5.js HandPose (MediaPipe runtime)
* **Features:** real-time tracking of up to two hands, shadow rendering on an offscreen graphics buffer with blur, gesture recording and looping playback, and repositioning and resizing of recorded puppets
* **Context:** Exhibited in an interactive group show at the WQED Center, Pittsburgh (December 7, 2024), hosted by Professor Johannes DeYoung. Project guided by Professor Golan Levin at Carnegie Mellon University.

## Exhibition

![Shadow puppet projected onto the wall at WQED](media/exhibition.gif)

The exhibition version was projected as a large circle onto the studio wall, with a laptop station where visitors could step up and create their own puppets. ([Watch the full clip](media/exhibition.mp4))

| The exhibition space | The projection | The visitor station |
|---|---|---|
| ![Exhibition space at WQED](media/exhibition-space.jpg) | ![Shadow projected in the circular frame](media/exhibition-projection.jpg) | ![Laptop station with on-screen instructions](media/exhibition-station.jpg) |

## Process

The piece combines two influences:
- Professor DeYoung's course on Chinese shadow puppetry, which established the visual language.
- Professor Levin's work on body tracking and interaction.

The physical puppet is replaced with a computational one, driven by real-time hand tracking. The exhibition's theme was projected light and shadow, so the rendering goal was a shadow that reads as cast onto a cave wall rather than drawn on a screen.

**Pipeline**
1. **Hand tracking:** ml5.js HandPose (MediaPipe runtime) tracks up to two hands from a 640×480 webcam feed and returns 21 keypoints per hand, which are scaled to the canvas.
2. **Shadow geometry:** each finger is drawn as a continuous 20px stroke with rounded joins along its keypoints. Bézier curves fill in the webbing between fingers and the outline of the palm. The z-depth of the middle-finger knuckle relative to the wrist detects whether the palm faces away, and the contour offset changes to match. An optional mode extends a forearm from the wrist.
3. **Projection effect:** all shadows render to an offscreen graphics buffer. A shear transform simulates an off-axis projection angle, a Gaussian blur softens the edges, and the buffer is composited over a cave-wall texture at reduced opacity.
4. **Recording and playback:** while recording, every frame of hand keypoints is deep-copied into a sequence. Recorded puppets loop independently and can be repositioned and scaled with keyboard or mouse input.

**Key challenges**
1. **Contour vs. skeleton.** Raw HandPose output reads as a joint-and-bone skeleton. Getting a believable shadow silhouette took repeated tuning of stroke weight, joins and Bézier webbing against live hand input.
2. **Soft-edge projection.** Developed with Professor Levin's guidance. Several approaches were tested before settling on rendering to a separate buffer, then applying blur, shear and opacity blending so the shadow looks like light falling onto a textured surface.

## Controls

* **Enter:** start recording a new puppet, then press Enter again to stop
* **Arrow keys:** move the last recorded puppet around the canvas
* **Click:** place the last recorded puppet where you click
* **+ / -:** make it bigger or smaller
* **a:** toggle arms
* **r:** clear all recordings

## Two Versions

* **Main version** (`/`): 800 x 600 canvas with on-screen directions. Works best on a laptop.
* **Exhibition version** (`/exhibition`): 1000 x 800 canvas with a circular mask, the version shown at WQED.

## Run Locally

The webcam only works over `https` or `localhost`, so serve the folder instead of opening the file directly:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000 and allow camera access.

## Credits

* Hand tracking built on the [ml5.js HandPose](https://docs.ml5js.org/#/reference/handpose) model and example code (MIT License, Copyright (c) 2024 ml5)
* Originally made on [OpenProcessing](https://openprocessing.org/sketch/2510419)
