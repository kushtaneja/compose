CameraInput = require "framer-camera-input/CameraInput"
InputModule = require "input-framer/input"


	# Basic usage
InputModule = require "input"
textInput = new InputModule.Input
	setup: false
	virtualKeyboard: true 
	placeholder: "Kuch to likh hi do" 
	y: textinput.x # y position
	x: textinput.y  # x position
	textColor: "#FFFFFF"
	width: textinput.width
	height: textinput.height
	parent: textinput.parent	

camera_btn.states =
	one:
		x: 188
		y: 504
		opacity: 1
	two:
		x: 180
		y: 640
		opacity: 0

gallery_btn.states =
	one:
		x: 116
		y: 504
		opacity: 1
	two:
		x: 180
		y: 640
		opacity: 0

draft_btn.states =
	one:
		x: 44
		y: 504
		opacity: 1
	two:
		x: 180
		y: 640
		opacity: 0

text_btn.states =
	one:
		x: 260
		y: 504
		opacity: 1
	two:
		x: 180
		y: 640
		opacity: 0

paste_clipboard.onClick ->
	textInput.text ="Pasted what's on your keyboard"

bg1.states =
	one:
		backgroundColor: "yellow"
	two:
		backgroundColor: "blue"
	three:
		backgroundColor: "green"
	four:
		backgroundColor: "red"

bg1.animationOptions =
	time:0.5

color_selector.states =
	one:
		backgroundColor: "yellow"
	two:
		backgroundColor: "blue"
	three:
		backgroundColor: "green"
	four:
		backgroundColor: "red"

color_selector.animationOptions =
	time:0.5

color_selector.onClick ->
	bg1.stateCycle("one","two","three","four")
	color_selector.stateCycle("one","two","three","four")

textInput.states =
	one:
		fontWeight: "bold"
	two:
		fontWeight: 100

bold_btn.onClick ->
	textInput.stateCycle("one","two")

Mask.states =
	one:
		rotation: 135
	two:
		rotation: 0

camera_btn.animationOptions =
	time: 0.40
	curve: Bezier.ease

gallery_btn.animationOptions =
	time: 0.40
	curve: Bezier.ease

draft_btn.animationOptions =
	time: 0.40
	curve: Bezier.ease

text_btn.animationOptions =
	time: 0.40
	curve: Bezier.ease

Mask.animationOptions =
	time: 0.40
	curve: Bezier.ease

Add_Tab.onTap ->
	camera_btn.stateCycle("one","two")
	text_btn.stateCycle("one","two")
	gallery_btn.stateCycle("one","two")
	draft_btn.stateCycle("one","two")
	Mask.stateCycle("one","two")
	bounds.stateCycle()
	
flow = new FlowComponent
flow.showNext(Samsung_Note_5)

draft_btn.onClick ->
	flow.showNext(draft)

draft_back.onClick ->
	flow.showPrevious()

gallery_btn.onClick ->
	flow.showNext(gallery)

gallery_back.onClick ->
	flow.showPrevious()

text_btn.onClick ->
	flow.showNext(text)
	textinput.visible = false
	textInput.setup = true

	
text_back.onClick ->
	flow.showPrevious()

camera_btn.onClick ->
	flow.showNext(camera)
	# Load CameraLayer
	CameraLayer = require "CameraLayer"
	# Create a CameraLayer
	cameraLayerObject = new CameraLayer()
	cameraLayerObject.bounds = cameraLayerView.bounds
	cameraLayerObject.frame = cameraLayerView.frame
	cameraLayerObject.start()
	
	# Start accessing a camera device
	shutter.onClick ->
		cameraLayerObject.capture()
		cameraLayerObject.stop()
		flow.showNext(imageedit)

	cameraLayerObject.onCapture (imageURL) ->
		finalImageLayer = new Layer
			x: FinalImageView.x
			y: FinalImageView.y
			width: FinalImageView.width
			height: FinalImageView.height
			image: imageURL
			parent: FinalImageView.parent
		
		finalImageLayer.placeBehind(FinalImageView)
		FinalImageView.visible = false
			
	camera_back.onClick() ->
		finalImageLayer.destroy()
		flow.showPrevious()

cam_top.onClick ->
	flow.showNext(camera)

gallery_more.onClick ->
	flow.showNext(d)

scrollDrft = new ScrollComponent
	size: Screen.size
	y: 70
	scrollHorizontal: false
scrollDraft.parent = scrollDrft.content
scrollDrft.parent = draft

draft0.onClick ->
	flow.showNext(imageedit)
	finalImageLayer = new Layer
			x: FinalImageView.x
			y: FinalImageView.y
			width: FinalImageView.width
			height: FinalImageView.height
			image: "images/design/GQlZpyrJ0iMJJAkadQkyqxk4EQPowFo7FpzRKiJP4qmPPhmSPUiBG6OuXe4I0MTgkCiPlMsS1ydaV8Ol6Q.png"
			parent: FinalImageView.parent
		
		finalImageLayer.placeBehind(FinalImageView)
		FinalImageView.visible = false
		final_text.text = draft0_text.text

draft1.onClick ->
	flow.showNext(imageedit)
	finalImageLayer = new Layer
			x: FinalImageView.x
			y: FinalImageView.y
			width: FinalImageView.width
			height: FinalImageView.height
			image: "images/design/SIQa2OYLYrrmPKQ1jPyd8QbicAr0bScqSLbfkroizCQK4hFc7rBiLpv8EDN5ofKXMncThBmRgZ1rzwrKw.png"
			parent: FinalImageView.parent
	finalImageLayer.placeBehind(FinalImageView)
	FinalImageView.visible = false
	final_text.text = draft1_text.text

draft2.onClick ->
	flow.showNext(imageedit)
	finalImageLayer = new Layer
			x: FinalImageView.x
			y: FinalImageView.y
			width: FinalImageView.width
			height: FinalImageView.height
			image: "images/design/vlnPIZhO6Vx4oekl30cHB6oCrDZjN09YPW990qoknstxKgvHAs9vh6AbTG55DHpQ2i6UMHxDCxuyqaaqEdg.png"
			parent: FinalImageView.parent
	finalImageLayer.placeBehind(FinalImageView)
	FinalImageView.visible = false
	final_text.text = draft2_text.text

draft3.onClick ->
	flow.showNext(imageedit)
	finalImageLayer = new Layer
			x: FinalImageView.x
			y: FinalImageView.y
			width: FinalImageView.width
			height: FinalImageView.height
			image: "images/design/SIQa2OYLYrrmPKQ1jPyd8QbicAr0bScqSLbfkroizCQK4hFc7rBiLpv8EDN5ofKXMncThBmRgZ1rzwrKw.png"
			parent: FinalImageView.parent
	finalImageLayer.placeBehind(FinalImageView)
	FinalImageView.visible = false
	final_text.text = draft3_text.text
	
imageedit_back.onClick ->
	flow.showPrevious()

imageedit_next.onClick ->
	flow.showNext(tag_screen)

tag_screenBack.onClick ->
	flow.showPrevious()

scrolltag = new ScrollComponent
	size: tag_scroll_bg.size
	x: tag_scroll_bg.x
	y: tag_scroll_bg.y
	scrollHorizontal: false

tag_scroll.parent = scrolltag.content
scrolltag.parent = tag_screen

y = bucket_scroll.height/2

scalebucket = (bucket) ->
	bucket.originY = 0.5
	
	x = bucket.y
	if x > y
		bucket.scale = (2.5*y - bucket.y)/y
	else
		bucket.scale = (0.5*y + bucket.y)/y

# scalebucket (Bucket_2)
# scalebucket (Bucket_1)
# scalebucket (Bucket_3)
# scalebucket (Bucket_4)
# scalebucket (Bucket_5)
# scalebucket (Bucket_6)
# scalebucket (Bucket_7)


Tag_select.onClick ->
	flow.showNext(final_screen)

final_screen_back.onClick ->
	flow.showPrevious()

post_1.onClick ->
	flow.showNext(Samsung_Note_5)

post_2.onClick ->
	flow.showNext(Samsung_Note_5)

text_next.onClick ->
	flow.showNext(tag_screen)



# Variables
rows = 16
gutter = 10
rowHeight = 48

scroll = new ScrollComponent
	width: 96
	height: screen.height
	scrollHorizontal: false

# Loop to create row layers
for index in [0...rows]

	cell = new Layer
		width:  Bucket_1.width
		height: rowHeight
		y: 16 + index * (rowHeight + gutter)
		x: 28
		parent: scroll.content
		backgroundColor: "#00AAFF"
		hueRotate: index * 10

scroll.parent = bucket_scroll


