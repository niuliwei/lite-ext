/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("imagezoom/autorender",function(i,d,k,t){t.autoRender=function(l,m){l="."+(l||"KS_Widget");d.query(l,m).each(function(p){var n;if(p.getAttribute("data-widget-type")==="ImageZoom")try{if(n=p.getAttribute("data-widget-config"))n=n.replace(/'/g,'"');new t(p,k.parse(n))}catch(u){}})}},{requires:["dom","json","imagezoom/base"]});
KISSY.add("imagezoom/base",function(i,d,k,t,l){function m(a,b){if(!(this instanceof m))return new m(a,b);this.image=a=d.get(a);if(!a)return l;m.superclass.constructor.call(this,b);this._init();return l}function p(a,b){(a&&a.complete&&a.clientWidth?true:false)&&b();k.on(a,"load",b)}function n(a){return{width:a.clientWidth,height:a.clientHeight}}function u(a){return d.create('<div class="'+a+z)}function s(a,b,c){i.each(i.makeArray(a),function(e){d.width(e,b);d.height(e,c)})}function A(a,b){var c=d.create('<img src="'+
a+z);b&&b.appendChild(c);return c}function x(a){a=i.makeArray(a);if(a.length===1)a[1]=a[0];return a}var o=document,B=/^.+\.(?:jpg|png|gif)$/i,q=Math.round,C=Math.min,r=["top","right","bottom","left","inner"],z='" style="position:absolute;top:0;left:0">';i.extend(m,t);m.ATTRS={type:{value:"standard"},bigImageSrc:{value:"",setter:function(a){var b=this.get("bigImageSrc");if(a&&B.test(a)&&a!==b){this._cacheBigImageSrc=b;return a}return this.get("bigImageSrc")},getter:function(a){var b;if(!a)if((b=d.attr(this.image,
"data-ks-imagezoom"))&&B.test(b))a=b;return a}},bigImageSize:{value:[800,800],setter:function(a){return x(a)}},position:{value:"right"},alignTo:{value:l},offset:{value:[10,0],setter:function(a){return x(a)}},preload:{value:true},zoomSize:{value:["auto","auto"],setter:function(a){return x(a)},getter:function(a){if(this._imgRegion){if(a[0]==="auto")a[0]=this._imgRegion.width;if(a[1]==="auto")a[1]=this._imgRegion.height}return a}},lensIcon:{value:true},zoomCls:{value:""},hasZoom:{value:true,setter:function(a){return!!a}}};
i.augment(m,{_init:function(){var a=this,b,c=a.image;if((b=a.get("bigImageSrc"))&&a.get("preload"))(new Image).src=b;a._isInner=a.get("position")===r[4];a._getAlignTo();b=a.get("bigImageSize");a._bigImageSize={width:b[0],height:b[1]};a.get("hasZoom")&&!c.complete&&a._startLoading();a._firstInit=true;p(c,function(){if(a.get("hasZoom")){a._finishLoading();a._ready()}})},_getAlignTo:function(){var a;if(!this._isInner&&(a=this.get("alignTo")))if(a=a==="parent"?this.image.offsetParent:d.get(a))this._alignToRegion=
i.merge(d.offset(a),n(a))},_ready:function(){var a=this.image;this._imgRegion=i.merge(d.offset(a),n(a));this.get("lensIcon")&&this._renderIcon();if(this._firstInit){this._bindUI();this._onAttrChanges()}this._firstInit=false},_renderIcon:function(){var a=this._alignToRegion||this._imgRegion,b=this.lensIcon;if(!b){b=u("ks-imagezoom-icon");o.body.appendChild(b);this.lensIcon=b}d.offset(b,{left:a.left+a.width-d.width(b),top:a.top+a.height-d.height(b)})},_bindUI:function(){var a=this,b;k.on(a.image,"mouseenter",
function(c){if(a.get("hasZoom")){a._setEv(c);k.on(o.body,"mousemove",a._setEv,a);b=i.later(function(){a.viewer||a._createViewer();a.show()},300)}});k.on(a.image,"mouseleave",function(){if(a.get("hasZoom")){k.remove(o.body,"mousemove",a._setEv);if(b){b.cancel();b=l}}})},_onAttrChanges:function(){var a=this;a.on("afterHasZoomChange",function(b){d[b.newVal?"show":"hide"](a.lensIcon)})},_setEv:function(a){this._ev=a},_createViewer:function(){var a=this,b,c,e,f=a._bigImageSize,g=a.get("bigImageSrc");b=
u("ks-imagezoom-viewer "+a.get("zoomCls"));if(a._isInner){e=A(d.attr(a.image,"src"),b);s(e,f.width,f.height);a._bigImageCopy=e}else a._renderLens();if(g){c=A(g,b);!c.complete&&a._startBigLoading();a.bigImage=c}o.body.appendChild(b);a.viewer=b;a._setViewerRegion();p(c,function(){a._finishBigLoading();if(!a._isInner)a._bigImageSize=n(c);a._setViewerRegion();a._isInner||a._onMouseMove()})},_renderLens:function(){var a=u("ks-imagezoom-lens");d.hide(a);o.body.appendChild(a);this.lens=a},_setViewerRegion:function(){var a=
this.viewer,b=this._imgRegion,c=this._alignToRegion||b,e=this.get("zoomSize"),f=this.get("offset"),g=c.left+f[0];f=c.top+f[1];var h;this._setLensSize(h=e[0],e=e[1]);switch(this.get("position")){case r[0]:f-=e;break;case r[1]:g+=c.width;break;case r[2]:f+=c.height;break;case r[3]:g-=h;break;case r[4]:h=b.width;e=b.height}d.offset(a,{left:g,top:f});s(a,h,e)},_setLensSize:function(a,b){var c=this._imgRegion,e=this._bigImageSize,f;f=C(q(a*c.width/e.width),c.width);c=C(q(b*c.height/e.height),c.height);
this._lensSize=[f,c];this._isInner||s(this.lens,f,c)},_onMouseMove:function(){var a=this.lens,b=this._ev,c=this._imgRegion,e=c.left,f=c.top,g=c.width;c=c.height;var h=this._bigImageSize;if(b.pageX>e&&b.pageX<e+g&&b.pageY>f&&b.pageY<f+c){if(!(this._isInner&&this._animTimer)){b=this._getLensOffset();!this._isInner&&a&&d.offset(a,b);d.css([this._bigImageCopy,this.bigImage],{left:-q((b.left-e)*h.width/g),top:-q((b.top-f)*h.height/c)})}}else this.hide()},_getLensOffset:function(){var a=this._imgRegion,
b=this._ev,c=a.left,e=a.top,f=a.width;a=a.height;var g=this._lensSize,h=g[0];g=g[1];var j=b.pageX-h/2;b=b.pageY-g/2;if(j<=c)j=c;else if(j>=f+c-h)j=f+c-h;if(b<=e)b=e;else if(b>=a+e-g)b=a+e-g;return{left:j,top:b}},_anim:function(a,b){var c=this,e,f=1,g=c._imgRegion;e=g.left;var h=g.top,j=g.width,v=g.height,y=[c.bigImage,c._bigImageCopy],w=c._bigImageSize;g=c._getLensOffset();var D=-q((g.left-e)*w.width/j),E=-q((g.top-h)*w.height/v);c._animTimer&&c._animTimer.cancel();s(y,j,v);c._animTimer=i.later(e=
function(){s(y,j+(w.width-j)/b*f,v+(w.height-v)/b*f);d.css(y,{left:D/b*f,top:E/b*f});if(++f>b){c._animTimer.cancel();c._animTimer=l}},a*1E3/b,true);e()},show:function(){var a=this.lens,b=this.viewer;d.hide(this.lensIcon);if(this._isInner){d.show(b);this._anim(0.4,42)}else{d.show([a,b]);this._onMouseMove()}this._checkRefresh();this._checkBigImageSrc();k.on(o.body,"mousemove",this._onMouseMove,this);this.fire("show")},_checkRefresh:function(){if(this._refresh){this._setViewerRegion();this._refresh=
false}},_checkBigImageSrc:function(){var a=this.get("bigImageSrc");if(this._cacheBigImageSrc&&this._cacheBigImageSrc!==a){d.attr(this.bigImage,"src",a);this._cacheBigImageSrc=a;this._isInner&&d.attr(this._bigImageCopy,"src",d.attr(this.image,"src"));!this.bigImage.complete&&this._startBigLoading()}},hide:function(){d.hide([this.lens,this.viewer]);d.show(this.lensIcon);k.remove(o.body,"mousemove",this._onMouseMove,this);this.fire("hide")},_startLoading:function(){},_finishLoading:function(){},_startBigLoading:function(){d.addClass(this.viewer,
"ks-imagezoom-loading")},_finishBigLoading:function(){d.removeClass(this.viewer,"ks-imagezoom-loading")},changeImageSrc:function(a){d.attr(this.image,"src",a);this._startLoading()},refreshRegion:function(){this._getAlignTo();this._renderUI();this._refresh=true}});return m},{requires:["dom","event","base"]});KISSY.add("imagezoom",function(i,d){return d},{requires:["imagezoom/base","imagezoom/autorender"]});
