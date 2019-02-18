// 上传图片
// url：上传的url地址
// data：上传的文件
// callback：上传成功返回地址
function uploadFile(url, data, callback) {
	api.ajax({
		url : url,
		method : 'post',
		timeout : 30,
		dataType : 'json',
		returnAll : false,
		data : {
			files : {
				"file" : data
			}
		}
	}, function(ret, err) {
		api.hideProgress();
		if (ret) {
			if (ret.success == true) {
				callback(ret.data);
			} else {
				alert("上传失败,请确保网络畅通!");
			}
		} else {
			api.alert({
				msg : ('网络异常,上传失败')
			});
		}
	});
}