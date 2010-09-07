mxn.register('microsoft', {	

Mapstraction: {
	
	init: function(element, api) {		
		var me = this;
		if (!VEMap) {
			throw api + ' map script not imported';
		}
		
		this.maps[api] = new VEMap(element.id);
		this.maps[api].AttachEvent('onclick', function(event){
			me.clickHandler();
			var map = me.maps[me.api];
			var shape = map.GetShapeByID(event.elementID);
			if (shape && shape.mapstraction_marker) {
				shape.mapstraction_marker.click.fire();   
			} 
			else {
				var x = event.mapX;
				var y = event.mapY;
				var pixel = new VEPixel(x, y);
				var ll = map.PixelToLatLong(pixel);
				me.click.fire({'location': new mxn.LatLonPoint(ll.Latitude, ll.Longitude)});
			}
		});
		this.maps[api].AttachEvent('onendzoom', function(event){
			me.moveendHandler(me);
			me.changeZoom.fire();				
		});
		this.maps[api].AttachEvent('onendpan', function(event){
			me.moveendHandler(me);
			me.endPan.fire();
		});
		this.maps[api].AttachEvent('onchangeview', function(event){
			me.endPan.fire();				
		});
		this.maps[api].LoadMap();
		document.getElementById("MSVE_obliqueNotification").style.visibility = "hidden"; 
	
		//removes the bird's eye pop-up
		this.loaded[api] = true;
		me.load.fire();	
	},
	
	applyOptions: function(){
		var map = this.maps[this.api];
		if(this.options.enableScrollWheelZoom){
			map.enableContinuousZoom();
			map.enableScrollWheelZoom();
		}
		
	},

	resizeTo: function(width, height){	
		this.maps[this.api].Resize(width, height);
	},

	addControls: function( args ) {
		var map = this.maps[this.api];
		
		if (args.pan) {
			map.SetDashboardSize(VEDashboardSize.Normal);
		}
		else {
			map.SetDashboardSize(VEDashboardSize.Tiny);
		}

	  	if (args.zoom == 'large') {
			map.SetDashboardSize(VEDashboardSize.Small);
		}
		else if ( args.zoom == 'small' ) {
			map.SetDashboardSize(VEDashboardSize.Tiny);
		}
		else {
			map.HideDashboard();
			map.HideScalebar();
		}
	},

	addSmallControls: function() {
		var map = this.maps[this.api];
		map.SetDashboardSize(VEDashboardSize.Tiny);
	},

	addLargeControls: function() {
		var map = this.maps[this.api];
		map.SetDashboardSize(VEDashboardSize.Normal);
		this.addControlsArgs.pan = true;
		this.addControlsArgs.zoom = 'large';
	},

	addMapTypeControls: function() {
		var map = this.maps[this.api];
		map.addTypeControl();
	
	},

	dragging: function(on) {
		var map = this.maps[this.api];
		if (on) {
			map.enableDragMap();
		}
		else {
			map.disableDragMap();
		}
	},

	setCenterAndZoom: function(point, zoom) { 
		var map = this.maps[this.api];
		var pt = point.toProprietary(this.api);
		var vzoom =  zoom;
		map.SetCenterAndZoom(new VELatLong(point.lat,point.lon), vzoom);
	},
	
	addMarker: function(marker, old) {
		var map = this.maps[this.api];
		var pin = marker.toProprietary(this.api);
		map.AddShape(pin);
		marker.pinID = pin.GetID();
		if(marker.hoverIconUrl){
			map.AttachEvent("onmouseover", function(event) {
                		var map = this.maps[this.api];
				if(event.elementID){
				    var obj =  document.getElementById(event.elementID);
				    var children =  document.getElementById(event.elementID).getElementsByTagName('img');
				     if (children) {
				         var shape = map.GetShapeByID(event.elementID);
				         if (shape.mapstraction_marker) {
				             for (i = 0; i < children.length; i++ ) {
				                var img = children[i];
				                if(img.src.indexOf(shape.mapstraction_marker.iconUrl,0) > 0) {
				                    img.src =  shape.mapstraction_marker.hoverIconUrl
				                    break;
				                }
				             }
				         }
				     }
				     // Returning true disabled the default behavior of opening the info box onmouseover
				     // use showBubble on Mapstraction marker to implement if this behavior is desired
				     // This change was made to allow the control of the mouse bubble with click events
				    return true;
				}
			}.bind(this));
			 map.AttachEvent("onmouseout", function(event) {
		         var map = this.maps[this.api];
		         if(event.elementID){
		             var children =  document.getElementById(event.elementID).getElementsByTagName('img');
		             if (children) {
		                 var shape = map.GetShapeByID(event.elementID);
		                 if (shape.mapstraction_marker) {
		                     for (i = 0; i < children.length; i++ ) {
		                        var img = children[i];
		                        if(img.src.indexOf(shape.mapstraction_marker.hoverIconUrl,0) > 0) {
		                            img.src =  shape.mapstraction_marker.iconUrl
		                            break;
		                        }
		                     }
		                 }
		             }
		         }
		        // Returning true disabled the default behavior of closing the info box onmouseout
		         // use showBubble on Mapstraction marker to implement if this behavior is desired
		         // This change was made to allow the control of the mouse bubble with click events
		        return true;
			}.bind(this));
		}
        	//give onclick event
		//give on double click event
		//give on close window
		//return the marker
		return pin;
	},

	removeMarker: function(marker) {
		var map = this.maps[this.api];
		var id = marker.proprietary_marker.GetID();
		var microsoftShape = map.GetShapeByID(id);
		map.DeleteShape(microsoftShape);
	},
	
	declutterMarkers: function(opts) {
		var map = this.maps[this.api];
		
		// TODO: Add provider code
	},

	addPolyline: function(polyline, old) {
		var map = this.maps[this.api];
		var pl = polyline.toProprietary(this.api);
		pl.HideIcon();//hide the icon VE automatically displays
		map.AddShape(pl);
		return pl;
	},

	removePolyline: function(polyline) {
		var map = this.maps[this.api];
		var id = polyline.proprietary_polyline.GetID();
		var microsoftShape = map.GetShapeByID(id);
		map.DeleteShape(microsoftShape);
	},
	
	getCenter: function() {
		var map = this.maps[this.api];
		var LL = map.GetCenter();
		var point = new mxn.LatLonPoint(LL.Latitude, LL.Longitude);
		return point;
	},
 
	setCenter: function(point, options) {
		var map = this.maps[this.api];
		var pt = point.toProprietary(this.api);
		map.SetCenter(new VELatLong(point.lat, point.lon));
	},

	setZoom: function(zoom) {
		var map = this.maps[this.api];
		map.SetZoomLevel(zoom);
	},
	
	getZoom: function() {
		var map = this.maps[this.api];
		var zoom = map.GetZoomLevel();
		return zoom;
	},

	getZoomLevelForBoundingBox: function( bbox ) {
		var map = this.maps[this.api];
		// NE and SW points from the bounding box.
		var ne = bbox.getNorthEast();
		var sw = bbox.getSouthWest();
		var zoom;
		
		// TODO: Add provider code
		
		return zoom;
	},

	setMapType: function(type) {
		var map = this.maps[this.api];
		switch(type) {
			case mxn.Mapstraction.ROAD:
				map.SetMapStyle(VEMapStyle.Road);
				break;
			case mxn.Mapstraction.SATELLITE:
				map.SetMapStyle(VEMapStyle.Aerial);
				break;
			case mxn.Mapstraction.HYBRID:
				map.SetMapStyle(VEMapStyle.Hybrid);
				break;
			default:
				map.SetMapStyle(VEMapStyle.Road);
		}	 
	},

	getMapType: function() {
		var map = this.maps[this.api];
		var mode = map.GetMapStyle();
		switch(mode){
			case VEMapStyle.Aerial:
				return mxn.Mapstraction.SATELLITE;
			case VEMapStyle.Road:
				return mxn.Mapstraction.ROAD;
			case VEMapStyle.Hybrid:
				return mxn.Mapstraction.HYBRID;
			default:
				return null;
		}
	},

	getBounds: function () {
		var map = this.maps[this.api];
		view = map.GetMapView();
		var topleft = view.TopLeftLatLong;
		var bottomright = view.BottomRightLatLong;
		
		return new mxn.BoundingBox(bottomright.Latitude,topleft.Longitude,topleft.Latitude, bottomright.Longitude );
	},

	setBounds: function(bounds){
		var map = this.maps[this.api];
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
		
		var rec = new VELatLongRectangle(new VELatLong(ne.lat, ne.lon), new VELatLong(sw.lat, sw.lon));
		map.SetMapView(rec);
	},

	addImageOverlay: function(id, src, opacity, west, south, east, north, oContext) {
		var map = this.maps[this.api];
		
		// TODO: Add provider code
	},

	setImagePosition: function(id, oContext) {
		var map = this.maps[this.api];
		var topLeftPoint; var bottomRightPoint;

		// TODO: Add provider code

		//	oContext.pixels.top = ...;
		//	oContext.pixels.left = ...;
		//	oContext.pixels.bottom = ...;
		//	oContext.pixels.right = ...;
	},
	
	addOverlay: function(url, autoCenterAndZoom) {
		var map = this.maps[this.api];
		var layer = new VEShapeLayer(); 
		var mlayerspec = new VEShapeSourceSpecification(VEDataType.GeoRSS, url, layer);
	 	map.AddShapeLayer(layer);
	},

	addTileLayer: function(tile_url, opacity, copyright_text, min_zoom, max_zoom) {
		throw 'Not implemented';
	},

	toggleTileLayer: function(tile_url) {
		throw 'Not implemented';
	},

	getPixelRatio: function() {
		throw 'Not implemented';
	},
	
	mousePosition: function(element) {
		var locDisp = document.getElementById(element);
		if (locDisp !== null) {
			var map = this.maps[this.api];
			map.AttachEvent("onmousemove", function(veEvent){
				var latlon = map.PixelToLatLong(new VEPixel(veEvent.mapX, veEvent.mapY));
				var loc = latlon.Latitude.toFixed(4) + " / " + latlon.Longitude.toFixed(4);
				locDisp.innerHTML = loc;
			});
			locDisp.innerHTML = "0.0000 / 0.0000";
		}
	}
},

LatLonPoint: {
	
	toProprietary: function() {
		return  new VELatLong(this.lat, this.lon);
	},

	fromProprietary: function(mpoint) {
		this.lat = mpoint.Latitude;
		this.lon = mpoint.Longitude;
	}
	
},

Marker: {
	
	toProprietary: function() {
		var mmarker = new VEShape(VEShapeType.Pushpin, this.location.toProprietary('microsoft'));
		mmarker.SetTitle(this.infoBubble);
		var customIcon = new VECustomIconSpecification();
		var markerOffsetx = 0;
		var markerOffsety = 0;
		var shadowOffsetx = 0;
		var shadowOffsety = 0;
		if (this.iconAnchor) {
		    markerOffsetx = -this.iconAnchor[0];
		    markerOffsety = -this.iconAnchor[1];
		} else if (this.iconSize){
		    markerOffsetx = -this.iconSize[0]/2;
		    markerOffsety = -this.iconSize[1]/2;
		}
		if (this.iconShadowUrl) {
		    if (this.iconAnchor) {
		        shadowOffsetx = -this.iconAnchor[0];
		        shadowOffsety = -this.iconAnchor[1];
		    } else if (this.iconShadowSize){
		        shadowOffsetx = -this.iconShadowSize[0]/2;
		        shadowOffsety = -this.iconShadowSize[1]/2;
		    }
		}
		var customHTML = [];
		customHTML.push("<div style='position:relative'>");
		if (this.iconShadowUrl) {
		    customHTML.push(" <div style='position:absolute;left:" + shadowOffsetx + "px;top:" +  shadowOffsety + "px;'>");
		    customHTML.push("<img src='");
		    customHTML.push(this.iconShadowUrl);
		    customHTML.push("' border='0' />");
		    customHTML.push("</div>");
		}
		customHTML.push(" <div style='position:absolute;left:" + markerOffsetx + "px;top:" +  markerOffsety + "px;'>");
		customHTML.push("<img src='");
		customHTML.push(this.iconUrl);
		customHTML.push("' id='");
		customHTML.push(this.marker);
		customHTML.push("' ");
		customHTML.push(" border='0' />");
		customHTML.push("</div>");
		customHTML.push("</div>");
		customIcon.CustomHTML = customHTML.join("");
		mmarker.SetCustomIcon(customIcon);

		return mmarker;
	},

	openBubble: function() {
		if(this.proprietary_marker.iid){
		    var shape = this.map.GetShapeByID(this.proprietary_marker.iid);
		    if (shape) {
		        this.map.ShowInfoBox(shape);
		    }
		}
	},
	
	closeBubble: function() {
		if(this.proprietary_marker.iid){
		    var shape = this.map.GetShapeByID(this.proprietary_marker.iid);
		    if (shape) {
		        this.map.HideInfoBox(shape);
		    }
		}
	},

	hide: function() {
		var shape = this.proprietary_marker;
		if (shape.GetType().equals(VEShapeType.Pushpin)) {
		    shape.Hide();
		} else {
		    shape.HideIcon();
		}
	},

	show: function() {
		var shape = this.proprietary_marker;
		if (shape.GetType().equals(VEShapeType.Pushpin)) {
		    shape.Show();
		} else {
		    shape.ShowIcon();
		}
	},

	update: function() {
		throw 'Not implemented';
	}
	
},

Polyline: {

	toProprietary: function() {
		var mpoints =[];
		for(var i =0, length = this.points.length; i < length; i++) {
			mpoints.push(this.points[i].toProprietary('microsoft'));
		}
		var mpolyline = new VEShape(VEShapeType.Polyline, mpoints);
		if(this.color){
			var color = new mxn.util.Color(this.color);
			var opacity = (typeof(this.opacity) == 'undefined' || this.opacity === null) ? 1.0 : this.opacity;
			var vecolor = new VEColor(color.red, color.green, color.blue, opacity);
			mpolyline.SetLineColor(vecolor);
		}
		//	TODO ability to change line width
		return mpolyline;
	},
		
	show: function() {
		this.proprietary_polyline.Show();
	},

	hide: function() {
		this.proprietary_polyline.Hide();
	}
	
}

});
