KISSY.Editor.add("fakeobjects",function(l){var i=KISSY.Editor,h=KISSY,m=h.Node,n=i.NODE,o=i.Config.base+"../theme/spacer.gif",k=i.HtmlParser;i=h.Editor;var j=l.htmlDataProcessor,p=j&&j.htmlFilter,q={elements:{$:function(a){var b=a.attributes;if((b=(b=(b=b&&b._ke_realelement)&&new k.Fragment.FromHtml(decodeURIComponent(b)))&&b.children[0])&&a.attributes._ke_resizable){var c=a.attributes.style;if(c){var f=/(?:^|\s)width\s*:\s*(\d+)/i.exec(c);a=f&&f[1];c=(f=/(?:^|\s)height\s*:\s*(\d+)/i.exec(c))&&f[1];
if(a)b.attributes.width=a;if(c)b.attributes.height=c}}return b}}};p&&p.addRules(q);j&&h.mix(j,{createFakeParserElement:function(a,b,c,f,g){var d;d=new k.BasicWriter;a.writeHtml(d);d=d.getHtml();var e=a.attributes.style;if(a.attributes.width)e="width:"+a.attributes.width+"px;"+e;if(a.attributes.height)e="height:"+a.attributes.height+"px;"+e;a={"class":b,src:o,_ke_realelement:encodeURIComponent(d),_ke_real_node_type:a.type,style:e,align:a.attributes.align||""};g&&delete g.width;g&&delete g.height;g&&
h.mix(a,g,false);if(c)a._ke_real_element_type=c;if(f)a._ke_resizable=f;return new k.Element("img",a)}});l.createFakeElement||h.augment(i,{createFakeElement:function(a,b,c,f,g,d){var e=a.attr("style")||"";if(a.attr("width"))e="width:"+a.attr("width")+"px;"+e;if(a.attr("height"))e="height:"+a.attr("height")+"px;"+e;a={"class":b,src:o,_ke_realelement:encodeURIComponent(g||a._4e_outerHtml()),_ke_real_node_type:a[0].nodeType,style:e};d&&delete d.width;d&&delete d.height;d&&h.mix(a,d,false);if(c)a._ke_real_element_type=
c;if(f)a._ke_resizable=f;return new m("<img/>",a,this.document)},restoreRealElement:function(a){if(a.attr("_ke_real_node_type")!=n.NODE_ELEMENT)return null;a=decodeURIComponent(a.attr("_ke_realelement"));var b=new m("<div>",null,this.document);b.html(a);return b._4e_first(function(c){return c[0].nodeType==n.NODE_ELEMENT})._4e_remove()}})},{attach:false});