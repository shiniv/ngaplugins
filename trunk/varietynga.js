var varietynga_setting = new nga_plug_local_data("varietynga_setting");
var varietynga_lasthtml = "";
var varietynga_customcss = document.createElement('style');
var varietynga_maxpage ;
var varietynga_maxl = 0;
var varietynga_weibo_ajax = {t:'',f:''}

String.prototype.colorHex = function(){
        var that = this;
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if(/^(rgb|RGB)/.test(that)){
            var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
            var strHex = "#";
            for(var i=0; i<aColor.length; i++){
                var hex = Number(aColor[i]).toString(16);
                if(hex === "0"){
                    hex += hex;
                }
				hex = (hex + hex).substr(0,2);
                strHex += hex;
            }
            if(strHex.length !== 7){
                strHex = that;
            }
            return strHex;
        }else if(reg.test(that)){
            var aNum = that.replace(/#/,"").split("");
            if(aNum.length === 6){
                return that;
            }else if(aNum.length === 3){
                var numHex = "#";
                for(var i=0; i<aNum.length; i+=1){
                    numHex += (aNum[i]+aNum[i]);
                }
                return numHex;
            }
        }else{
            return that;
        }
};

function varietynga_Initialization(){
	nga_plug_addmsg("varietynga","百变NGA","由于贴吧模式会大量消耗NGA服务器资源，现暂停使用。");
	nga_plug_addmsg("varietynga","百变NGA","1.修复即时加载已经到末尾页产生的BUG。\n2.即时加载末尾页不再闪屏。\n3.UI调整。");
	nga_plug_addmsg("varietynga","百变NGA","修改即时加载时机：\n从插件运行时加载改为页面最后一个楼层从草丛中跳出来时加载，节省了服务器资源。");
	
	varietynga_setting.load();
	varietynga_setting.data = varietynga_setting.data || {set:{tieba:true,weibo:true,img:true}};
	
	//将小工具集的设置加入导出数据中
	nga_plug_setting("add","小工具设置","varietynga_setting");
	
	varietynga_setting.data.set.css = varietynga_setting.data.set.css || {colsenav:false,colsebg:false,colseinfo:false,custombg:{check:false,bg:"CCE8CC",custom:"FFFFFF"},avis:{check:false,color:"888"}}
	varietynga_css();
	
	var e = new nga_plug_tab();
	//e.add("总体设置",'<input onclick="varietynga_setting.data.set.tieba=this.checked;varietynga_setting.save();" type="checkbox" '+c(varietynga_setting.data.set.tieba)+'>启用主题图片预览（贴吧风格）<br>\
	//	<input onclick="varietynga_setting.data.set.weibo=this.checked;varietynga_setting.save();" type="checkbox" '+c(varietynga_setting.data.set.weibo)+'>启用帖子即时加载（腾讯微博风格）<br>\
	//	<input onclick="varietynga_setting.data.set.img=this.checked;varietynga_setting.save();" type="checkbox" '+c(varietynga_setting.data.set.img)+'>启用图片旋转功能>');
	e.add("总体设置",'<input onclick="varietynga_setting.data.set.weibo=this.checked;varietynga_setting.save();" type="checkbox" '+c(varietynga_setting.data.set.weibo)+'>启用帖子即时加载（腾讯微博风格）<br>\
		<input onclick="varietynga_setting.data.set.img=this.checked;varietynga_setting.save();" type="checkbox" '+c(varietynga_setting.data.set.img)+'>启用图片旋转功能>');
	e.add("界面设置",varietynga_setthtml());
	var t = e.gethtml();
	nga_plug_table_addTab("百变NGA",t);
	
	varietynga_customcss.type="text/css";
	document.body.appendChild(varietynga_customcss);
	
	var x = document.createElement('style');
	var h = document.getElementsByTagName('head')[0];
	x.innerHTML = ".varietynga_cur_zin{cursor: url(http://ngaplugins.googlecode.com/svn/trunk/img/cur_zin.cur) 14 14,pointer;}.varietynga_cur_zout{cursor: url(http://ngaplugins.googlecode.com/svn/trunk/img/cur_zout.cur) 14 14,pointer;}";
	h.insertBefore(x,h.firstChild);
	
	if (location.pathname != "/thread.php" && location.pathname != "/read.php") return;
	if (location.search.indexOf("authorid") >= 0 && location.pathname == "/thread.php") return;
	if (varietynga_setting.data.set.img){
		try{varietynga_img()}catch(e){}; //加载图片旋转功能
		nga_plug_varietynga_reload.push("varietynga_img();");   //添加到自动加载的自动运行中以在后几页也能实现图片旋转
	}
	if (location.pathname == "/thread.php"){
		//if (varietynga_setting.data.set.tieba){
		//	for (var i=0;i<35;i++){
		//		var ti = document.getElementById("t_tt"+i);
		//		new nga_plug_XMLHttp(ti.href,varietynga_tieba,"t_tt"+i);
		//		var x = document.createElement('span');
		//		x.innerHTML = "<img title='正在获取该主题的图片' src='http://lintxinclude.googlecode.com/files/progressIndicator16x16.gif'>";
		//		ti.parentNode.appendChild(x);
		//	}
		//}
	}else if(location.pathname == "/read.php" && document.URL.indexOf("page=e#a") < 0){
		if (location.search.indexOf("pid=") >= 0) return;
		if (varietynga_setting.data.set.weibo){
			
			var maxpage = __PAGE[1];
			var nowpage = __PAGE[2];
			var pageurl = "http://" + location.host + location.pathname + location.search + "&page=";
			
			if (maxpage == nowpage) return;
			if (maxpage == null && location.search.indexOf("authorid") < 0) return;
			
			if(!document.getElementById('varietynga_tip_div')) getdiv().parentNode.insertBefore(_$('/div').$0('id','varietynga_tip_div'),getdiv());  //创建放置提示信息和按钮的DIV
			
			var n = document.getElementsByTagName('table');
			for(var i=0;i<n.length;i++){
				if(n[i].rows && n[i].rows[0] && n[i].rows[0].id && /post1strow(\d+)/.exec(n[i].rows[0].id)[1]) varietynga_maxl = /post1strow(\d+)/.exec(n[i].rows[0].id)[1];
			}
			varietynga_weibo_scroll(1,'new nga_plug_XMLHttp("'+pageurl + (nowpage + 1)+'",varietynga_weibo,{url:"'+pageurl+'",p:'+(nowpage + 1)+',n:2,max:'+maxpage+'});')
		}
	}

	function c(p){
		if (p) return "checked"; else return "";
	}
	
	function getdiv(){
		var td = document.getElementById('m_posts').nextSibling;
		while (td.nodeType!=1){
			td=td.nextSibling;
		}
		td=td.firstChild;
		while (td.nodeType!=1){
			td=td.nextSibling;
		}
		td=td.firstChild;
		while (td.nodeType!=1 || td.className!='clear'){
			td=td.nextSibling;
		}
		return td;
	}
}

//腾讯微博风格-滚动条事件
varietynga_weibo_ajax.f = function(){
	try{
		var top = document.getElementById('post1strow'+varietynga_maxl).getBoundingClientRect().top //元素顶端到可见区域顶端的距离
		var se = document.documentElement.clientHeight //浏览器可见区域高度。
		if(top <= se){
			eval(varietynga_weibo_ajax.t)
		}
	}catch(e){}
}

//腾讯微博风格-绑定/解绑滚动条事件
function varietynga_weibo_scroll(check,tfunc){
	if(check){
		varietynga_weibo_ajax.t = tfunc;
		
		var oo = commonui.stdBtns()   //加载提示
		oo._.__add(
			_$('/a').$0(
				'href','javascript:void(0)',
				'innerHTML','正在加载...',
				'title','正在加载后面的页面，请稍候...',
				'className','darkred'
			)
		)
		var tipdiv = document.getElementById('varietynga_tip_div');
		tipdiv.innerHTML = '';
		tipdiv.appendChild(oo)
		if(oo._.__vml) oo._.__vml()
		
		if (navigator.appVersion.indexOf("MSIE") != -1){               //先解除事件
			window.detachEvent("onscroll",varietynga_weibo_ajax.f);
		}else{   // 非IE用addEventListener
			window.removeEventListener("scroll",varietynga_weibo_ajax.f,false);
		}
		
		if (navigator.appVersion.indexOf("MSIE") != -1){                //再重新绑定
			window.attachEvent("onscroll",varietynga_weibo_ajax.f);
		}else{   // 非IE用addEventListener
			window.addEventListener("scroll",varietynga_weibo_ajax.f,false);
		}
	}else{
		if (navigator.appVersion.indexOf("MSIE") != -1){
			window.detachEvent("onscroll",varietynga_weibo_ajax.f);
		}else{   // 非IE用addEventListener
			window.removeEventListener("scroll",varietynga_weibo_ajax.f,false);
		}
	}
}

//腾讯微博风格（即时加载下一页）
function varietynga_weibo(html,arg){
	varietynga_weibo_scroll(0)
	var tspan = document.getElementById('varietynga_over_span');
	var tipdiv = document.getElementById('varietynga_tip_div');
	if (arg.reload){
		if (Math.abs(varietynga_lasthtml.length - html.length) > 10){
			//var ttab = tspan.parentNode.lastChild;
			//while (ttab.previousSibling.id!='varietynga_over_span'){
			//	ttab=ttab.previousSibling;
			//	ttab.parentNode.removeChild(ttab.nextSibling)
			//}
		}else{
			setTimeout('new nga_plug_XMLHttp(\''+arg.url + (arg.p)+'\',varietynga_weibo,{url:\''+arg.url+'\',p:'+(arg.p)+',n:1,reload:true})',10000);
			return;
		}
	}
	
	if (/var __PAGE[\s\S]*?<\/script>/.test(html)){
		try{eval(/(var __NGAPLUG_PAGE[\s\S]*?)<\/script>/.exec(html.replace('__PAGE','__NGAPLUG_PAGE'))[1])}catch(e){};
	}
	var maxpage = __NGAPLUG_PAGE[1];
	if (maxpage == arg.p) {load(html,arg);over(html,arg);return;}
		
	if (/<title>提示信息<\/title>/.test(html)) {over(html,arg);return;}
	if (arg.n == 5) {load(html,arg);nload(html,arg);return;}
	//if(arg.obj) {
	//	arg.obj.parentNode.removeChild(arg.obj);
	//}
	load(html,arg);
	varietynga_weibo_scroll(1,'new nga_plug_XMLHttp("'+arg.url + (arg.p + 1)+'",varietynga_weibo,{url:"'+arg.url+'",p:'+(arg.p+1)+',n:'+(arg.n+1)+'});')
	function load(html,arg){
		if (/commonui.userInfo.setAll[\s\S]*?<\/script>/.test(html)){
			try{eval(/commonui.userInfo.setAll[\s\S]*?(?=__SELECTED)/.exec(html)[0])}catch(e){};
		}
		if (/<div class='w100' id='m_posts_c'[\s\S]*?<div class='module_wrap'>/.test(html)){
			var thtml = /<div class='w100' id='m_posts_c'[\s\S]*?<div class='module_wrap'>/.exec(html)[0];
	        if (/<table[\s\S]+?<\/table>[\s\S]+?(<table[\s\S]+<\/table>)/.test(thtml)){
	            thtml = /<table[\s\S]+?<\/table>[\s\S]+?(<table[\s\S]+<\/table>)/.exec(thtml)[1];
				//tspan.parentNode.removeChild(tspan);
				//document.getElementById("m_posts_c").appendChild(_$('/span').$0('className','x','id','varietynga_over_span'))
	            var x = document.createElement('div');
	            x.innerHTML = thtml;
				var tmaxl = 0;
				var n=x.firstChild
				while (n!=null && Number(varietynga_maxl)>=Number(tmaxl)){
					if(n.tagName && n.tagName.toLowerCase()=="table" && n.rows && n.rows[0] && n.rows[0].id && /post1strow(\d+)/.exec(n.rows[0].id)[1]) tmaxl = /post1strow(\d+)/.exec(n.rows[0].id)[1];
					if(Number(varietynga_maxl)>=Number(tmaxl)) n.parentNode.removeChild(n);
					n=x.firstChild
				}
				for(n=x.firstChild; n!=null; n=x.firstChild){
					if(n.tagName && n.tagName.toLowerCase()=="table" && n.rows && n.rows[0] && n.rows[0].id && /post1strow(\d+)/.exec(n.rows[0].id)[1]) varietynga_maxl = /post1strow(\d+)/.exec(n.rows[0].id)[1];
					document.getElementById("m_posts_c").appendChild(n);
					
					if (n.innerHTML && /<script>([\s\S]*?)<\/script>/gi.test(n.innerHTML)){    //附件处理
						var t_js = n.innerHTML.match(/<script>([\s\S]*?)<\/script>/gi);
						for (var i=0;i<t_js.length;i++){
							var tt_js = /<script>([\s\S]*?)<\/script>/gi.exec(t_js[i])[1];
							if(tt_js.indexOf("commonui.postArg.proc")>=0 || tt_js.indexOf("ubbcode.attach.load")>=0){
								try{eval(tt_js)}catch(e){}
							}
						}
					}
				}
	        }
	    }
		for (var i=0;i<nga_plug_varietynga_reload.length;i++){
			setTimeout('try{'+nga_plug_varietynga_reload[i]+'}catch(e){}',3000);
		}
		//setTimeout('try{Backlist_bl()}catch(e){};',3000); //调用添加屏蔽链接模块   暂行办法
		//setTimeout('try{if (varietynga_setting.data.set.img) varietynga_img();}catch(e){}',3000) //加载图片旋转功能
	}
	function nload(html,arg){
		var oo = commonui.stdBtns()
		oo._.__add(
			_$('/a').$0(
				'href','javascript:void(0)',
				'innerHTML','继续加载',
				'title','本帖内容已经显示到第'+arg.p+'页,还可以继续加载后面的页面,点击继续加载.',
				'className','darkred',
				'onclick','new nga_plug_XMLHttp("'+arg.url + (arg.p + 1)+'",varietynga_weibo,{url:"'+arg.url+'",p:'+(arg.p+1)+',n:1})'
			)
		)
		
		oo._.__add(
			_$('/a').$0(
				'href',arg.url + (arg.p + 1),
				'innerHTML','第'+(arg.p+1)+'页',
				'title','直接跳转到第'+(arg.p+1)+'页',
				'className','darkred'
			)
		)
		tipdiv.innerHTML = '';
		tipdiv.appendChild(oo)
		if(oo._.__vml) oo._.__vml()
	}
	function over(html,arg){
		var oo = commonui.stdBtns()
		oo._.__add(
			_$('/a').$0(
				'href','javascript:void(0)',
				'innerHTML','完毕...',
				'title','本帖内容已经显示到第'+arg.p+'页,已经全部加载完毕,现在每隔10秒将检测一次是否有新回复。',
				'className','darkred'
			)
		)
		tipdiv.innerHTML = '';
		tipdiv.appendChild(oo)
		if(oo._.__vml) oo._.__vml()
		if (html != null){
			varietynga_lasthtml = html;
			setTimeout('new nga_plug_XMLHttp(\''+arg.url + (arg.p)+'\',varietynga_weibo,{url:\''+arg.url+'\',p:'+(arg.p)+',n:1,reload:true})',10000);
		}
	}
}

//贴吧风格-使用AJAX获取版面帖子中是否有图片并作相应操作
function varietynga_tieba(html,arg){
var elimg = document.getElementById(arg).parentNode.getElementsByTagName("img")[0];
	var poststr = /<span id='postcontent0'.*?>(.*?)(?=<\/span>)/.exec(html)[1];
	var imgreg = /\[img\](.*?)\[\/img\]/gi;
	if (imgreg.test(poststr)){
		var postimgs = poststr.match(imgreg);
		var postimg = [];
		var ngamojostr = JSON.stringify(nga_plug_mojo).toLowerCase();
		for (var i=0;i<postimgs.length;i++){
			if (ngamojostr.indexOf(/\[img\](.*?)\[\/img\]/i.exec(postimgs[i])[1].toLowerCase()) == -1 ){
				postimg.push(/\[img\](.*?)\[\/img\]/i.exec(postimgs[i])[1]);
			}
		}

	}else{
		elimg.parentNode.removeChild(elimg);
		return;
	}
	var postattach;
	if (/<span id='postattach0'>.*?(\[.*?\])(?=<\/script>)/.test(html)){
		eval("postattach = " + /<span id='postattach0'>.*?(\[.*?\])(?=<\/script>)/.exec(html)[1]);
	}
	if(postattach != null){
		var imgstr = JSON.stringify(postimg).toLowerCase();
		for (var k in postattach){
			if(postattach[k].type=="img"){
				postattach[k].url = "./" + postattach[k].url;
				if (postattach[k].thumb == 1) postattach[k].url += ".thumb.jpg";
				if(imgstr.indexOf(postattach[k].url.toLowerCase()) == -1 ){
					postimg.push(postattach[k].url)
				}
			}
		}
	}
	if (postimg.length == 0){
		elimg.parentNode.removeChild(elimg);
		return;
	}else{
		//elimg.parentNode.removeChild(elimg);
		elimg.src = "http://ngaplugins.googlecode.com/svn/trunk/img/yes.png";
		elimg.title = "该帖有图片。";
		for(var i=0;i<postimg.length;i++){
			if (postimg[i].substr(0,1) == "."){
				var m = postimg[i].match(/^\.\/mon_(\d+)\/(\d+)/)
				var b = (window.__BBSURL=='http://bbs.ngacn.cc') ? true : false
				var r = "";
				if(m){
					if(parseInt(m[1].toString()+m[2].toString(),10)>=20130104){
						if(b)
							r = 'http://img6.ngacn.cc/attachments/'
						else
							r = 'http://img6.nga.178.com/attachments/'
					}
				else{
					if(b)
						r = 'http://img.ngacn.cc/attachments/'
					else
						r = 'http://ngaimg.178.com/attachments/'
					}
				}
				postimg[i] = r + postimg[i].substr(1);
				tdiv += '<img src='+postimg[i]+'>'
			}
		}
		var x = document.createElement('div');
		var tdiv = '<div>';
		var postimgl = postimg.length>3?3:postimg.length;
		for(var i=0;i<postimgl;i++){
			tdiv += '<img src='+postimg[i]+' onload="varietynga_setimg(this)" style="left:-9999px;top:-9999px;position:absolute;z-index:-999">'
		}
		tdiv += '</div>';
		x.innerHTML = tdiv;
		document.getElementById(arg).parentNode.appendChild(x);
		return;
	}
}

//贴吧风格-缩略图的放大缩小操作
function varietynga_setimg(img){
	if (img.offsetHeight>75){
		img.style.width = img.offsetWidth/img.offsetHeight*75 + "px";
		img.style.height = "75px";
		img.title = "点击查看大图"
		img.style.position = "static";
		img.style.border = "3px solid rgb(139, 0, 0)"; 
		img.style.marginRight = "10px";
		img.className = "varietynga_cur_zin";
		img.onclick = function(event){
			if (img.title != "点击查看大图"){
				var e = event || window.event;
				var layerY = e.offsetY || getOffset(e).offsetY;
				if (layerY > 75) {
					document.body.scrollTop -= document.body.scrollTop == 0 ? 0 : layerY -78
					document.documentElement.scrollTop -= document.documentElement.scrollTop == 0 ? 0 : layerY -78
				}
				varietynga_setimg(img);
			}else{
				var tdw = img.parentNode.parentNode.offsetWidth-30;
				img.style.width = "";
				img.style.border = "";
				img.title = "点击查看缩略图";
				img.style.height = "";
				if (img.offsetWidth > tdw){
					img.style.height = img.offsetHeight/img.offsetWidth*tdw + "px";
					img.style.width = tdw + "px";
					img.title += "，该图片过大，请进入帖子查看完整图片。"
				}
				img.className = "varietynga_cur_zout";
			}
		}
	}

	function getOffset(evt){
		var target = evt.target;
		if (target.offsetLeft == undefined) {
			target = target.parentNode;
		}
		var pageCoord = getPageCoord(target);
		var eventCoord = {
			x: window.pageXOffset + evt.clientX,
			y: window.pageYOffset + evt.clientY
		};
		var offset = {
			offsetX: eventCoord.x - pageCoord.x,
			offsetY: eventCoord.y - pageCoord.y
		};
		return offset;
	}
	function getPageCoord(element){
		var coord = {x: 0, y: 0};
		while (element){
			coord.x += element.offsetLeft;
			coord.y += element.offsetTop;
			element = element.offsetParent;
		}
		return coord;
	}
}

function varietynga_setCollapseButton(){
	var colBtn = document.getElementsByName("collapseButton");
	
	for(var i=0 ; i< colBtn.length ; i++){
		colBtn[i].onclick = function(){
			if(this.parentNode.nextSibling.style.display == "block"){
				this.parentNode.nextSibling.style.display="none";
				this.innerHTML = "+";
				this.style.padding = "0 2px";
			}else if(this.parentNode.nextSibling.style.display == "none"){
				this.parentNode.nextSibling.style.display="block";
				this.innerHTML = "-";
				this.style.padding = "0 4px";
			}
		}
	}
}

//生成CSS
function varietynga_css(){
	var tcss = "";
	if (varietynga_setting.data.set.css.colsenav){
		tcss += '#_178NavAll_110906_765453{display:none}  /*去除导航条*/\n';
	}
	if (varietynga_setting.data.set.css.colsebg){
		tcss += '#custombg{display:none}  /*去除自定义背景*/\n';
		tcss += '#mainmenu{margin:0px;}   /*去除了自定义背景后需要使用这个以清除用户头像和版面链接之间的间距*/\n';
	}
	if (varietynga_setting.data.set.css.colseinfo){
		tcss += '.cpinfo{display:none;}    /*去除底部申明*/\n';
	}

	var color = "";
	if (varietynga_setting.data.set.css.custombg.check){
		if (varietynga_setting.data.set.css.custombg.bg.toLowerCase() == "custom"){
			color = varietynga_setting.data.set.css.custombg.custom;
		}else{
			color = varietynga_setting.data.set.css.custombg.bg;
		}
		color = color.substr(0,1) == "#"?color.substr(1):color;
		tcss += 'body {background:#'+color+';}   /*body背景色*/\n';
		tcss += '.catenew{background:#'+color+';}   /*子版块主背景色*/\n';
		tcss += '.urltip, .urltip2 {background: #'+color+';}  /*浮动用户信息背景色*/\n';
		tcss += '#indexBlock3 .catenew, #indexBlock3 .catenew .b2{background-color:#'+color+'}  /*暗黑区主背景色*/\n';
		tcss += '.single_ttip2 .div2 {background: #'+color+';}  /*提醒信息背景色*/\n';
		tcss += '#atc_content {background-color: #'+getbcolor(getbcolor(color))+';}  /*回帖编辑框背景色*/\n';

		tcss += '.catenew .b2 {background-color: #'+color+';}  /*子版块表格色1*/\n';
		tcss += '.catenew .b3 {background-color: #'+getbcolor(color)+';}  /*子版块表格色2 主界面板块表格色1*/\n';
		tcss += '.catenew .b4 {background-color: #'+color+';}  /*子版块表格色3 主界面板块表格色2*/\n';

		tcss += '#indexBlock3 .catenew .b3{background-color:#'+color+'}  /*暗黑区表格色1*/\n';
		tcss += '#indexBlock3 .catenew .b4{background-color:#'+getbcolor(color)+'}  /*暗黑区表格色2*/\n';

		tcss += '.quote {background-color: #'+getbcolor(getbcolor(color))+';}  /*引用区域背景色*/\n';

		tcss += '.forumbox .row1 .c1 {background-color: #'+color+';}  /*主题列表表格背景色1.1*/\n';
		tcss += '.forumbox .row1 .c2 {background-color: #'+getbcolor(color)+';}  /*主题列表表格背景色1.2*/\n';
		tcss += '.forumbox .row1 .c3_ {background-color: #'+color+';}  /*主题列表表格背景色1.3*/\n';
		tcss += '.forumbox .row1 .c4_ {background-color: #'+getbcolor(color)+';}  /*主题列表表格背景色1.4*/\n';
		tcss += '.forumbox .row2 .c1 {background-color: #'+getbcolor(color)+';}  /*主题列表表格背景色2.1*/\n';
		tcss += '.forumbox .row2 .c2 {background-color: #'+color+';}  /*主题列表表格背景色2.2*/\n';
		tcss += '.forumbox .row2 .c3_ {background-color: #'+getbcolor(color)+';}  /*主题列表表格背景色2.3*/\n';
		tcss += '.forumbox .row2 .c4_ {background-color: #'+color+';}  /*主题列表表格背景色2.4*/\n';

		tcss += '.nga_plug_table {background-color: #'+color+';}  /*插件设置中心背景色*/\n';
		tcss += '.nga_plug_tab_main {background-color: #'+color+';}  /*插件设置中心生成的TAB的背景色*/\n';
		tcss += '.nga_plug_tab_menu_open {background-color: #'+color+';}  /*TAB表示打开的TAB的背景色*/\n';
		tcss += '.nga_plug_tab_menu_close {background-color: #'+getbcolor(color)+';}  /*TAB表示关闭的TAB的背景色*/\n';
		tcss += '.nga_edit_table {background-color: #'+getbcolor(color)+';}  /*表情选择窗口的背景色*/\n';
	}
	
	if (varietynga_setting.data.set.css.avis.check){
		tcss += '.posticon a:visited {color: #'+varietynga_setting.data.set.css.avis.color+';}  /*主题列表中已点击过的链接的颜色*/\n';
		tcss += '.posticon a:hover {text-decoration: underline;color: #314396;}  /*主题列表中鼠标划过的链接的颜色*/\n';
	}
	if (varietynga_setting.data.set.css.noad){
		tcss += '*[class^="adsc"]{display:none !important;}  /*去广告css1（有class的块）*/\n';
		tcss += '#mc>a[href^="http://www.xunyou.com"]{display:none !important;}  /*去广告css2（迅游广告）*/\n';
	}
	varietynga_customcss.innerHTML = tcss;
	
	function getbcolor(color){
		var tcolor = color;
		for (var i=0;i<3;i++){
			if (tcolor.substr(i*2,1).toLowerCase() == "a"){
				tcolor = tcolor.substr(0,(i*2)) + "9" + tcolor.substr(i*2+1);
			}else if(tcolor.substr(i*2,1) == "0"){
				tcolor = tcolor.substr(0,(i*2)) + "00" + tcolor.substr((i+1)*2);
			}else if(isNaN(tcolor.substr(i*2,1))){
				tcolor = tcolor.substr(0,(i*2)) + String.fromCharCode(tcolor.substr(i*2,1).charCodeAt() - 1) + tcolor.substr(i*2+1);
			}else{
				tcolor = tcolor.substr(0,(i*2)) + (parseInt(tcolor.substr(i*2,1)) - 1) + tcolor.substr(i*2+1);
			}
		}
		return tcolor;
	}
}

//点击快速设置主题色时的动作
function varietynga_setcolor(obj){
	var divel = obj.parentNode.getElementsByTagName("div");
	if(obj==divel[0]){
		varietynga_setting.data.set.css.custombg.check = false;
	}else{
		varietynga_setting.data.set.css.custombg.check = true;
	}
	if(obj==divel[divel.length-1]){
		obj.parentNode.getElementsByTagName("input")[0].disabled = false;
		varietynga_setting.data.set.css.custombg.bg = "custom";
	}else{
		obj.parentNode.getElementsByTagName("input")[0].disabled = true;
		if(obj.style.backgroundColor.colorHex()!='') varietynga_setting.data.set.css.custombg.bg = obj.style.backgroundColor.colorHex();
	}
	for (var i=0;i<divel.length;i++){
		divel[i].style.border='1px solid #888';
	}
	obj.style.border='1px solid #f88';
	varietynga_setting.save();
	varietynga_css();
}

//检查并设置自定义颜色
function varietynga_checkcolor(obj){
	if (obj.value.substr(0,1)=="#") obj.value = obj.value.substr(1);
	var isbg = (obj.id=="varietynga_color");
	if (!/^[a-fA-F0-9]+$/.test(obj.value)){
		if (isbg){
			obj.value = varietynga_setting.data.set.css.custombg.custom;
		}else{
			obj.value = varietynga_setting.data.set.css.avis.color;
		}
		return;
	}
	if (obj.value.length>6) obj.value = obj.value.substr(0,6);
	if (obj.value.length==3) obj.value = obj.value.replace(/([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/gi,function ($0,$1,$2,$3){return $1 + $1 + $2 + $2 + $3 + $3});
	if (obj.value.length<6) obj.value = (obj.value + "000000").substr(0,6);
	if (isbg){
		varietynga_setting.data.set.css.custombg.custom = obj.value;
	}else{
		varietynga_setting.data.set.css.avis.color = obj.value;
	}
	varietynga_setting.save();
	varietynga_css();
}

function varietynga_setthtml(){
var s = "";
	s += '<div>\
	<div style="border-bottom:1px solid #777;text-align:left;width:607px;">\
	<span class="green">自定义主题色</span><br>\
	<div title="默认颜色" onclick="varietynga_setcolor(this)" style="height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="浅绿" onclick="varietynga_setcolor(this)" style="background-color:#CCE8CC;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="蓝色" onclick="varietynga_setcolor(this)" style="background-color:#1D7F99;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="绿色" onclick="varietynga_setcolor(this)" style="background-color:#85A333;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="红色" onclick="varietynga_setcolor(this)" style="background-color:#AB0303;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="紫色" onclick="varietynga_setcolor(this)" style="background-color:#AB2C74;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="青色" onclick="varietynga_setcolor(this)" style="background-color:#518791;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="褐色" onclick="varietynga_setcolor(this)" style="background-color:#BA4C30;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="白色" onclick="varietynga_setcolor(this)" style="background-color:#FFFFFF;height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<div title="自定义颜色" onclick="varietynga_setcolor(this)" style="height:10px;width:10px;display:inline-block!important;border: 1px solid #888;"></div>\
	<img src="about:blank" style="display:none" onerror="var ts=varietynga_setting.data.set.css.custombg;var divel=this.parentNode.getElementsByTagName(\'div\');if(!ts.check){divel[0].style.border=\'1px solid #f88\';return}for(var i=1;i<divel.length-1;i++){if(ts.bg.toLowerCase()==divel[i].style.backgroundColor.colorHex().toLowerCase()){divel[i].style.border=\'1px solid #f88\';return}};divel[divel.length-1].style.border=\'1px solid #f88\';return">\
	<input onkeyup="var e = event || window.event;var keyCode = e.which || e.keyCode;if(keyCode==13) varietynga_checkcolor(this);" id="varietynga_color" size="6" value='+varietynga_setting.data.set.css.custombg.custom+' '+d(varietynga_setting.data.set.css.custombg.bg.toLowerCase() == "custom" && varietynga_setting.data.set.css.custombg.check)+' type="text"></div><div style="border-bottom:1px solid #777;text-align:left;width:607px;">\
	<span class="green">已访问帖子颜色</span><br>\
	<input type="checkbox" onclick="document.getElementById(\'varietynga_color1\').disabled=!this.checked;varietynga_setting.data.set.css.avis.check=this.checked;varietynga_setting.save();varietynga_css();" '+c(varietynga_setting.data.set.css.avis.check)+' title="是否启用已访问帖子变色">启用已访问帖子变色    颜色：\
	<input onkeyup="var e = event || window.event;var keyCode = e.which || e.keyCode;if(keyCode==13) varietynga_checkcolor(this);" id="varietynga_color1" size="6" value='+varietynga_setting.data.set.css.avis.color+' '+d(varietynga_setting.data.set.css.avis.check)+' type="text"></div>\
	<div style="border-bottom:1px solid #777;text-align:left;width:607px;">\
	<span class="green">隐藏界面元素</span><br>\
	<input onclick="varietynga_setting.data.set.css.colsenav=this.checked;varietynga_setting.save();varietynga_css();" type="checkbox" '+c(varietynga_setting.data.set.css.colsenav)+' title="是否隐藏顶部导航条">隐藏顶部导航条<br>\
	<input onclick="varietynga_setting.data.set.css.colsebg=this.checked;varietynga_setting.save();varietynga_css();" type="checkbox" '+c(varietynga_setting.data.set.css.colsebg)+' title="是否隐藏顶部背景">隐藏顶部背景<br>\
	<input onclick="varietynga_setting.data.set.css.colseinfo=this.checked;varietynga_setting.save();varietynga_css();" type="checkbox" '+c(varietynga_setting.data.set.css.colseinfo)+' title="是否隐藏底部内容">隐藏底部内容<br>\
	<input onclick="varietynga_setting.data.set.css.noad=this.checked;varietynga_setting.save();varietynga_css();" type="checkbox" '+c(varietynga_setting.data.set.css.noad)+' title="去除大部分NGA广告">去广告<br>\
	</div>\
	<div style="text-align:left;width:607px;"><span class="green">本页使用说明</span><br>\
	选择主题色时直接点击相应的颜色块即可快速选择主题色，如需自定义主题色请点击“自定义”块后在后面的文本框输入3位颜色编码或者6位颜色编码，在文本框按下回车以保存并预览效果，如不使用自定义主题色请选择第一个颜色块（默认颜色）即可。<br><br>\
	自定义已访问帖子的颜色请启用已访问帖子变色，然后在后面的文本框输入3位颜色编码或者6位颜色编码，在文本框按下回车以保存并预览效果。<br><br>\
	隐藏界面元素时开启或者关闭对应选项立即保存并查看效果。\
	</div>\
	</div>';
	return s;
	function c(p){
		if (p) return "checked"; else return "";
	}
	function d(p){
		if (!p) return "disabled"; else return "";
	}
}

//图片旋转
function varietynga_img(){
	var timg = document.getElementById("m_posts_c").getElementsByTagName("img");
	for (var i=0;i<timg.length;i++){
		if (checkimg(timg[i])){
			var ts = document.createElement("span");
			ts.className = "varietyngas";
			ts.style.display = "inline-block";
			ts.top = nga_plug_elementTop(timg[i]) + "px";
			ts.left = nga_plug_elementLeft(timg[i]) + "px";
			ts.innerHTML = "<div style='position: absolute;z-index:999'>\r\
				<div onclick='event.cancelBubble = true;varietynga_imgclick(this.parentNode.parentNode,\"l\");return false;' title='左转' \
				style='display: inline-block; background-image: url(http://ngaplugins.googlecode.com/svn/trunk/img/left.gif); \
				height: 16px; width: 16px; border:1px solid #777777; background-position: initial initial; background-repeat: initial initial;'></div>\r\
				<div onclick='event.cancelBubble = true;varietynga_imgclick(this.parentNode.parentNode,\"r\");return false;' title='右转' \
				style='display: inline-block; background-image: url(http://ngaplugins.googlecode.com/svn/trunk/img/right.gif); \
				height: 16px; width: 16px; border:1px solid #777777;background-position: initial initial; background-repeat: initial initial;'></div>\
				</div>";
			timg[i].parentNode.insertBefore(ts,timg[i]);
			//timg[i].className = timg[i].className.replace("imgmaxwidth","");
			
			if(timg[i].className == "imgmaxwidth" && timg[i].style.border != ""){
				timg[i].onclick = function(event){
					if(this.className == "imgmaxwidth"){
						this.className = "";
						this.style.border = "";
						this.title = "点击缩小";
					}else{
						this.className = "imgmaxwidth";
						this.style.border = "5px solid rgb(139, 0, 0)";
						this.title = "点击放大";
						
						var e = event || window.event;
						var layerY = e.offsetY || getOffset(e).offsetY;
						if (layerY > 75) {
							document.body.scrollTop -= document.body.scrollTop == 0 ? 0 : layerY -78
							document.documentElement.scrollTop -= document.documentElement.scrollTop == 0 ? 0 : layerY -78
						}
					} 
				}
			}
			ts.appendChild(timg[i]);
		}
	}
	
	function checkimg(img){
		if(img.parentNode.className=="varietyngas") return false
		if(img.parentNode.className=="posterinfo") return false
		if(img.parentNode.getAttribute("name")=="portrait") return false
		if(img.parentNode.getAttribute("name")=="medal") return false
		if(img.parentNode.parentNode.getAttribute("name")=="money") return false
		if(img.src == "about:blank") return false
		if(JSON.stringify(nga_plug_mojo).toLowerCase().indexOf(img.src.toLowerCase()) >= 0) return false
		//var width = img.offsetWidth || img.width
		//var height = img.offsetHeight ||img.height
		//if (width < 200 && height < 200) return false
		return true
	}
	
	varietynga_setCollapseButton();
}

function varietynga_imgclick(o,p){
	var img = o.getElementsByTagName("img")[0]
	if(!img || !p) return false;
	var n = img.getAttribute('step');
	if(n== null) n=0;
	if(p=='r'){
		(n==3)? n=0:n++;
	}else if(p=='l'){
		(n==0)? n=3:n--;
	}
	img.setAttribute('step',n);
	if(window.attachEvent) {
		img.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation='+ n +')';
		switch(n){
			case 0:
				img.parentNode.style.height = img.height + "px";
				break;
			case 1:
				img.parentNode.style.height = img.width + "px";
				break;
			case 2:
				img.parentNode.style.height = img.height + "px";
				break;
			case 3:
				img.parentNode.style.height = img.width + "px";
				break;
		}
	}else{
		var tw = img.offsetWidth;
		var th = img.offsetHeight;
		switch(n) {
		default :
		case 0 :
			img.className = img.className.replace(/\svarietynga./,"");
			img.style.marginLeft = "0px";
			img.style.marginTop = "0px";
			img.parentNode.style.width = "";
			img.parentNode.style.height = "";
			break;
		case 1 :
			img.className = img.className.replace(/\svarietynga./,"");
			img.className += " varietyngar";
			img.style.marginLeft = (img.offsetHeight - img.offsetWidth)/2 + "px";
			img.style.marginTop = (img.offsetWidth - img.offsetHeight)/2 + "px";
			
			img.parentNode.style.width = th + "px";
			img.parentNode.style.height = tw + "px";
			break;
		case 2 :
			img.className = img.className.replace(/\svarietynga./,"");
			img.className += " varietyngat";
			img.style.marginLeft = "0px";
			img.style.marginTop = "0px";
			img.parentNode.style.width = "";
			img.parentNode.style.height = "";
			break;
		case 3 :
			img.className = img.className.replace(/\svarietynga./,"");
			img.className += " varietyngal";
			img.style.marginLeft = (img.offsetHeight - img.offsetWidth)/2 + "px";
			img.style.marginTop = (img.offsetWidth - img.offsetHeight)/2 + "px";
			img.parentNode.style.width = th + "px";
			img.parentNode.style.height = tw + "px";
			break;
		}
	}
}