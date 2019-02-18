// 图片压缩
// imgsrc：源图片的路径
// quality：图片压缩质量，一般建议0.5
// scale：图片压缩比例，也是建议0.5
// ext：源图片拓展名
// callback：转换成功之后回调函数
function imgCompress(imgsrc, quality, scale, ext, callback) {
	// 压缩文件的保存目录
	var savePath = api.cacheDir + "/" + getNowFormatDate() + "/";
	// 压缩文件生成的随机文件名称
	var savename = NewGuid() + "." + ext;
	imageFilter.compress({
		img : imgsrc,
		quality : quality,
		scale : quality,
		save : {
			album : false,
			imgPath : savePath,
			imgName : savename
		}
	}, function(ret, err) {
		if (ret) {
			callback(savePath + savename);
		} else {
			alert(JSON.stringify(err));
		}
	});
}

// 获取当前的时间，拼接成2015-11-09这样的格式，主要用于对图片进行时间分类
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate
	return currentdate;
}

// 生成guid,主要用于生成随机文件名
function NewGuid() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}

	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}