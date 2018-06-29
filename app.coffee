CameraInput = require "framer-camera-input/CameraInput"
InputModule = require "input-framer/input"
# Flexer = require "Flexer"

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

tagscreen_next.onClick ->
	flow.showNext(final_screen)



# Variables
rows = 16
gutter = 10
rowHeight = 64

scroll = new ScrollComponent
	size: bucket_scroll.size
	scrollHorizontal: false

scroll.parent = bucket_scroll

cells = []
# Loop to create row layers
for index in [0...rows]

	cell = new Layer
		width:  rowHeight
		height: rowHeight
		x: bucket_scroll.width/2 - rowHeight/2
		y: index * (rowHeight + gutter)
		originX: 0.5
		originY: 0.5
		parent: scroll.content
		backgroundColor: "#00AAFF"
		hueRotate: index * 10
	cells.push(cell)

scroll.content.draggable.overdrag = false
scroll.content.draggable.bounce = false
scroll.contentInset =
	top: bucket_scroll.height/2
	bottom: bucket_scroll.height/2
scroll.content.draggable.momentumOptions = {friction: 1000}


scroll.onScroll ->
	for i in [0...rows]
		if cells[i].screenFrame.y >= -100 && cells[i].screenFrame.y <= Screen.height/2
			cells[i].scale = 0.5 + (cells[i].screenFrame.y) / Screen.height
		#	print(cells[3].scale)
		else if cells[i].screenFrame.y >= Screen.height/2 && cells[i].screenFrame.y <= Screen.height + 100
			cells[i].scale = 0.5 + (Screen.height - cells[i].screenFrame.y) / Screen.height
		else
			cells[i].scale = 0.5
		
		#hellllo = Utils.round(cells[i].screenFrame.y , 0 ,10)
		
		#print hellllo
		
	for i in [0...rows]
		if cells[i].scale < 0.94
			cells[i].opacity = 0.5
		else
			cells[i].opacity = 1

###

PageComp = new PageComponent
	x: 0
	y: 0
	height: Screen.height
	width: Screen.width
	backgroundColor: '#fedefe'
	opacity: 0.4
	scrollVertical: false
	scrollHorizontal: false
	originX: 0.5

PageComp.parent = PageComp_parent
	

Page_all.parent = PageComp.content

Page_image.parent = PageComp.content

Page_video.parent = PageComp.content

Page_audio.parent = PageComp.content

Page_gif.parent = PageComp.content

Image_1.onClick ->
   PageComp.snapToPage(Page_image)

###

Image_1.onClick ->
	Page_image.opacity = 1
	Page_all.opacity = 0
	Page_gif.opacity = 0
	Page_audio.opacity = 0
	Page_video.opacity = 0

Video.onClick ->
	Page_image.opacity = 0
	Page_all.opacity = 0
	Page_gif.opacity = 0
	Page_audio.opacity = 0
	Page_video.opacity = 1


Audio_1.onClick ->
	Page_image.opacity = 0
	Page_all.opacity = 0
	Page_gif.opacity = 0
	Page_audio.opacity = 1
	Page_video.opacity = 0
		
Gif.onClick ->
	Page_image.opacity = 0
	Page_all.opacity = 0
	Page_gif.opacity = 1
	Page_audio.opacity = 0
	Page_video.opacity = 0

All.onClick ->
	Page_image.opacity = 0
	Page_all.opacity = 1
	Page_gif.opacity = 0
	Page_audio.opacity = 0
	Page_video.opacity = 0
		
		
		
		