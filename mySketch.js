// Copyright (c) 2024 ml5
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
// Requires: https://unpkg.com/ml5@1/dist/ml5.js
// Documentation: https://docs.ml5js.org/#/reference/handpose

//sketch that allows you to create a shadow puppet story using
//your hands, press enter once to start recording a new puppet
//then press enter again to stop the recording, use your arrow
//keys to move this puppet around the canvas and the +/- to 
//make it smaller or bigger

let handpose; //video feed w/ hand tracking functionality
let video;
let hands = [];
let options = { maxHands: 2, flipHorizontal: true, runtime: "mediapipe" };

let enterBool = false; //recording functionality
let currentRecording = null;
let recordings = [];
let shadowBuffer;

let armsOn = false;
let song;
let img;

function preload() {
  // Load the handPose model.
  handpose = ml5.handPose(options);
	img = loadImage('cavewall2.jpg');
	// song = loadSound('Lament | Spiritual Music.m4a');
}

function setup() {
  createCanvas(800, 600);
	
  // getAudioContext().suspend(); // initialize audio context in suspended state
	
	shadowBuffer = createGraphics(width, height); //offscreen graphics buffer
	
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
	
  // start detecting hands from the webcam video
  handpose.detectStart(video, gotHands);
}

function draw() {
	// Draw background image
	// background(255);
	// tint(255, 235);
  image(img, 0, 0, width, height);
	
	// Calculate hand distance for blur if hands are present
  let blurAmount = 5; // default blur (sharpest)
  // if (hands.length > 0) {
  //   // Get z-coordinate of middle finger MCP joint for distance
  //   let handDist = hands[0].keypoints[ML5HAND_MIDDLE_FINGER_MCP].z;
  //   if (handDist !== undefined) {
  //     // Invert the mapping so closer hands (smaller z) get more blur
  //     blurAmount = map(handDist,
  //       -0.2, 0.2,    // Input range (adjust based on your setup)
  //       1, 5,         // Output range (MORE blur when close, LESS blur when far)
  //       true          // Clamp to range
  //     );
  //   }
  // }
  
  // Clear the shadow buffer each frame
  shadowBuffer.clear();
  
  // Apply transformations to shadow buffer
  shadowBuffer.push();
  shadowBuffer.shearX(PI/8);
  shadowBuffer.shearY(PI/12);
  
  // Draw hands and recordings to shadow buffer
  shadowBuffer.push();
  drawShadowsToBuffer(shadowBuffer);
  drawRecordingsToBuffer(shadowBuffer);
  shadowBuffer.pop();
	
	//Draw directions
	shadowBuffer.stroke(255);
	shadowBuffer.text("Press Enter to start and stop recordings", 20, 30);
  
  // Apply blur to shadow buffer
  shadowBuffer.filter(BLUR, blurAmount);
  shadowBuffer.pop();
  
  // Draw the blurred shadow buffer onto the main canvas
	tint(255,255,255, 190);
	// tint(255,255,255, 128 + 128*sin(millis()/2250)); //fading
  image(shadowBuffer, 0, 0);
  
  // Record hands if needed
  recordHands();
}

function drawSpotlight(){
	fill(235);
	noStroke();
	ellipse(600, 400, 1300, 900);
}

function drawShadowsToBuffer(buffer) {
  buffer.push();
  buffer.scale(width/640, height/480);
  
  let rounded = 15;
  let webDepth = 30;
  
  for (let hand of hands) {
    let isLeftHand = hand.handedness === "Left";
    
    // Draw finger outlines
    buffer.noFill();
		buffer.stroke(color(0));
    buffer.strokeWeight(20);
    buffer.strokeJoin(ROUND);
    
    // Draw thumb
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_CMC].x, hand.keypoints[ML5HAND_THUMB_CMC].y);
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_MCP].x, hand.keypoints[ML5HAND_THUMB_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_IP].x, hand.keypoints[ML5HAND_THUMB_IP].y);
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_TIP].x, hand.keypoints[ML5HAND_THUMB_TIP].y);
    buffer.endShape();
    
    // Draw index finger
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_INDEX_FINGER_MCP].x, hand.keypoints[ML5HAND_INDEX_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_INDEX_FINGER_PIP].x, hand.keypoints[ML5HAND_INDEX_FINGER_PIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_INDEX_FINGER_DIP].x, hand.keypoints[ML5HAND_INDEX_FINGER_DIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_INDEX_FINGER_TIP].x, hand.keypoints[ML5HAND_INDEX_FINGER_TIP].y);
    buffer.endShape();
    
    // Draw middle finger
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_DIP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_DIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_TIP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_TIP].y);
    buffer.endShape();
    
    // Draw ring finger
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_MCP].x, hand.keypoints[ML5HAND_RING_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_PIP].x, hand.keypoints[ML5HAND_RING_FINGER_PIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_DIP].x, hand.keypoints[ML5HAND_RING_FINGER_DIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_TIP].x, hand.keypoints[ML5HAND_RING_FINGER_TIP].y);
    buffer.endShape();
    
    // Draw pinky
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_PINKY_MCP].x, hand.keypoints[ML5HAND_PINKY_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_PINKY_PIP].x, hand.keypoints[ML5HAND_PINKY_PIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_PINKY_DIP].x, hand.keypoints[ML5HAND_PINKY_DIP].y);
    buffer.vertex(hand.keypoints[ML5HAND_PINKY_TIP].x, hand.keypoints[ML5HAND_PINKY_TIP].y);
    buffer.endShape();
    
    // Draw filled shapes
    buffer.fill(0);
    buffer.noStroke();
    
    // Fill in thumb to index
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_CMC].x, hand.keypoints[ML5HAND_THUMB_CMC].y);
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_MCP].x, hand.keypoints[ML5HAND_THUMB_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_IP].x, hand.keypoints[ML5HAND_THUMB_IP].y);
    buffer.bezierVertex(
      hand.keypoints[ML5HAND_THUMB_IP].x, hand.keypoints[ML5HAND_THUMB_IP].y + rounded*2.5,
      hand.keypoints[ML5HAND_INDEX_FINGER_MCP].x, hand.keypoints[ML5HAND_INDEX_FINGER_MCP].y + rounded*2.5,
      hand.keypoints[ML5HAND_INDEX_FINGER_MCP].x, hand.keypoints[ML5HAND_INDEX_FINGER_MCP].y
    );
    buffer.endShape(CLOSE);
    
    // Fill in between index and middle
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_INDEX_FINGER_MCP].x, hand.keypoints[ML5HAND_INDEX_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_INDEX_FINGER_PIP].x, hand.keypoints[ML5HAND_INDEX_FINGER_PIP].y);
    buffer.bezierVertex(
      hand.keypoints[ML5HAND_INDEX_FINGER_PIP].x, hand.keypoints[ML5HAND_INDEX_FINGER_PIP].y + webDepth,
      hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].y + webDepth,
      hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].y
    );
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].y);
    buffer.endShape(CLOSE);
    
    // Fill in between middle and ring
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].y);
    buffer.bezierVertex(
      hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_PIP].y + webDepth,
      hand.keypoints[ML5HAND_RING_FINGER_PIP].x, hand.keypoints[ML5HAND_RING_FINGER_PIP].y + webDepth,
      hand.keypoints[ML5HAND_RING_FINGER_PIP].x, hand.keypoints[ML5HAND_RING_FINGER_PIP].y
    );
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_MCP].x, hand.keypoints[ML5HAND_RING_FINGER_MCP].y);
    buffer.endShape(CLOSE);
    
    // Fill in between ring and pinky
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_MCP].x, hand.keypoints[ML5HAND_RING_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_PIP].x, hand.keypoints[ML5HAND_RING_FINGER_PIP].y);
    buffer.bezierVertex(
      hand.keypoints[ML5HAND_RING_FINGER_PIP].x, hand.keypoints[ML5HAND_RING_FINGER_PIP].y + webDepth,
      hand.keypoints[ML5HAND_PINKY_PIP].x, hand.keypoints[ML5HAND_PINKY_PIP].y + webDepth,
      hand.keypoints[ML5HAND_PINKY_PIP].x, hand.keypoints[ML5HAND_PINKY_PIP].y
    );
    buffer.vertex(hand.keypoints[ML5HAND_PINKY_MCP].x, hand.keypoints[ML5HAND_PINKY_MCP].y);
    buffer.endShape(CLOSE);
    
    // Draw palm shape
    buffer.beginShape();
    buffer.vertex(hand.keypoints[ML5HAND_WRIST].x, hand.keypoints[ML5HAND_WRIST].y);
    buffer.vertex(hand.keypoints[ML5HAND_THUMB_CMC].x, hand.keypoints[ML5HAND_THUMB_CMC].y);
    buffer.vertex(hand.keypoints[ML5HAND_INDEX_FINGER_MCP].x, hand.keypoints[ML5HAND_INDEX_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].x, hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_RING_FINGER_MCP].x, hand.keypoints[ML5HAND_RING_FINGER_MCP].y);
    buffer.vertex(hand.keypoints[ML5HAND_PINKY_MCP].x, hand.keypoints[ML5HAND_PINKY_MCP].y);
    
    let xOffset = isLeftHand ? -30 : 30;
    let yOffset = -30;
    
    buffer.bezierVertex(
      hand.keypoints[ML5HAND_PINKY_MCP].x + xOffset/2, hand.keypoints[ML5HAND_PINKY_MCP].y + yOffset/2,
      hand.keypoints[ML5HAND_WRIST].x + xOffset, hand.keypoints[ML5HAND_WRIST].y,
      hand.keypoints[ML5HAND_WRIST].x, hand.keypoints[ML5HAND_WRIST].y
    );
    buffer.endShape(CLOSE);
    
    // Fix curve on back side of palm
    let pinkyPoint = hand.keypoints[ML5HAND_PINKY_MCP];
    let wristPoint = hand.keypoints[ML5HAND_WRIST];
    xOffset = isLeftHand ? -30 : 30;
    yOffset = -30;
    
    let isFacingBack = hand.keypoints[ML5HAND_MIDDLE_FINGER_MCP].z < hand.keypoints[ML5HAND_WRIST].z;
    if (isFacingBack) {
      xOffset = isLeftHand ? 30 : -30;
    }
    
    buffer.beginShape();
    buffer.vertex(pinkyPoint.x, pinkyPoint.y);
    buffer.bezierVertex(
      pinkyPoint.x + xOffset/2, pinkyPoint.y + yOffset/2,
      wristPoint.x + xOffset, wristPoint.y,
      wristPoint.x, wristPoint.y
    );
    buffer.endShape();
		
		// Draw upper arm
		
		if (armsOn) {
			let p0 = hand.keypoints[0];
			let p1 = hand.keypoints[1];

			let armLength = 135;
			let armWidth = 55;

			// Calculate midpoint between p0 and p1
			let midX = (p0.x + p1.x) / 2;
			let midY = (p0.y + p1.y) / 2;

			buffer.push();
			buffer.translate(midX, midY);
			buffer.rotate(PI/2);

			// Fill for the arm
			buffer.fill(0);
			buffer.noStroke();
			buffer.rect(0, -armWidth/2, armLength, armWidth, 10, 35);

			buffer.pop();
		}
  }
  buffer.pop();
}

function recordHands() {
  if (enterBool && hands.length > 0) {
    if (!currentRecording) {
      currentRecording = {
        frames: [],
        position: {x: 0, y: 0},
        scale: 1.0,
        currentFrame: 0,
        hasArms: armsOn  // Store the arms state when recording is created
      };
    }
    currentRecording.frames.push(JSON.parse(JSON.stringify(hands)));
  } else if (!enterBool && currentRecording) {
    recordings.push(currentRecording);
    currentRecording = null;
  }
}

function drawRecordingsToBuffer(buffer) {
  for (let recording of recordings) {
    buffer.push();
    buffer.translate(recording.position.x, recording.position.y);
    buffer.scale(recording.scale);
    
    let originalHands = hands;
    let originalArmsOn = armsOn;  // Save current arms state
    armsOn = recording.hasArms;   // Use the recording's arms state
    
    hands = recording.frames[recording.currentFrame];
    drawShadowsToBuffer(buffer);
    
    // Restore original states
    hands = originalHands;
    armsOn = originalArmsOn;
    
    recording.currentFrame = (recording.currentFrame + 1) % recording.frames.length;
    buffer.pop();
  }
}

// Callback function for when handpose outputs data
function gotHands(results) {
  hands = results; // save the output to the hands variable
}

function mousePressed() {
  // Only allow placement when not recording
  if (!enterBool && recordings.length > 0) {
    let lastRecording = recordings[recordings.length - 1];
    lastRecording.position.x = mouseX;
    lastRecording.position.y = mouseY;
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    enterBool = !enterBool;
    console.log(enterBool ? "Recording started" : "Recording stopped");
  }
	
	// Toggling arms
	if (key === 'a' || key === 'A') {
		armsOn = !armsOn;
	}
	// Audio key presses
	// if (key === 's' || key === 'S') {
	// userStartAudio(); // Initialize audio context
	// if (song.isPlaying()) {
	// song.pause();
	// } else {
	// song.play();
	// }
	// }
  
  if (!enterBool && recordings.length > 0) {
    let lastRecording = recordings[recordings.length - 1];
    
    // Movement controls
    if (keyCode === LEFT_ARROW) {
      lastRecording.position.x -= 10;
    } else if (keyCode === RIGHT_ARROW) {
      lastRecording.position.x += 10;
    } else if (keyCode === UP_ARROW) {
      lastRecording.position.y -= 10;
    } else if (keyCode === DOWN_ARROW) {
      lastRecording.position.y += 10;
    }
    
    // Scaling controls
    if (key === '+' || key === '=') {
      lastRecording.scale *= 1.1;
    } else if (key === '-' || key === '_') {
      lastRecording.scale *= 0.9;
    }
		
		//Refresh page
		if (key === 'r' || key === 'R') {
			recordings = [];
		}
  }
}

// add sound and controls for blurring later

// The following index labels may be helpful:
const ML5HAND_WRIST = 0; 
const ML5HAND_THUMB_CMC = 1; 
const ML5HAND_THUMB_MCP = 2; 
const ML5HAND_THUMB_IP = 3; 
const ML5HAND_THUMB_TIP = 4; 
const ML5HAND_INDEX_FINGER_MCP = 5; 
const ML5HAND_INDEX_FINGER_PIP = 6; 
const ML5HAND_INDEX_FINGER_DIP = 7; 
const ML5HAND_INDEX_FINGER_TIP = 8; 
const ML5HAND_MIDDLE_FINGER_MCP = 9; 
const ML5HAND_MIDDLE_FINGER_PIP = 10; 
const ML5HAND_MIDDLE_FINGER_DIP = 11; 
const ML5HAND_MIDDLE_FINGER_TIP = 12; 
const ML5HAND_RING_FINGER_MCP = 13; 
const ML5HAND_RING_FINGER_PIP = 14; 
const ML5HAND_RING_FINGER_DIP = 15; 
const ML5HAND_RING_FINGER_TIP = 16; 
const ML5HAND_PINKY_MCP = 17; 
const ML5HAND_PINKY_PIP = 18; 
const ML5HAND_PINKY_DIP = 19; 
const ML5HAND_PINKY_TIP = 20; 
