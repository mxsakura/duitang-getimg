const http = require("http");
const https = require("https");
const fs = require("fs");
const request = require("request");

//堆糖专辑号
const album_id = 97245096;
//每页多少条数据，最少4条,小于4会没有初始第一页的数据;
let limit = 24;
//第几页的数据
let start = 0;
//请求信息的地址
let url = `https://www.duitang.com/napi/blog/list/by_album/?album_id=${album_id}&limit=${limit}&start=${start*limit}`;
//专辑的全部图片地址列表
let imgArr = [];
//屏蔽https异常
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
//请求接口信息
request(url, async function(err, response, body) {
	/*
	  response 响应信息的集合
	*/
	if (!err && response.statusCode == 200) {
		let total = JSON.parse(body).data.total;
		//开始下载图片
		if (total > 0) {
			console.log('有数据')
			//执行下载
			downloadFile(url);
		} else {
			console.log('无数据');
		}
	}
})

//循环下载图片
function downloadFile(geturl) {
	request(geturl, function(err, response, body) {
		/*
		  response 响应信息的集合
		*/
		if (!err && response.statusCode == 200) {
			total = JSON.parse(body).data.total;
			if (JSON.parse(body).data.object_list.length == 0 || imgArr.length >= total) {
				console.log(imgArr);
				console.log(`共${start+1}页，总数量为${imgArr.length}`);
				console.log('开始执行下载');
				let index = 0;
				saveImages(imgArr, index);
			} else {
				JSON.parse(body).data.object_list.forEach((item, index) => {
					imgArr.push(item.photo.path)
				});
				console.log(`第${start+1}页数据添加下载列队`);
				start++;
				geturl =
					`https://www.duitang.com/napi/blog/list/by_album/?album_id=${album_id}&limit=${limit}&start=${start*limit}`;
				downloadFile(geturl);
			}
		} else {
			console.log('无数据');
		}
	})
}

//批量保存网络图片
function saveImages(arr, index) {
	https.get(arr[index], function(res) {
		res.setEncoding('binary'); //二进制(binary)
		var imageData = '';
		res.on('data', function(data) { //图片加载到内存变量
			imageData += data;
		}).on('end', function() { //加载完毕保存图片
			if (!fs.existsSync("./" + album_id)) {
				fs.mkdirSync("./" + album_id);
			}
			fs.writeFile(album_id + '/' + Math.random() + '.png', imageData, 'binary', function(err) { //以二进制格式保存
				if (err) throw err;
				console.log('下载进度--' + Math.floor((index + 1) / arr.length * 10000) / 100 + '%');
				if (index + 1 <= arr.length) saveImages(arr, index + 1);
				else console.log('下载完成');
			});
		});
	});
}

//保存网络图片
function saveImage(imageUrl, index) {
	https.get(imageUrl, function(res) {
		res.setEncoding('binary'); //二进制(binary)
		var imageData = '';
		res.on('data', function(data) { //图片加载到内存变量
			imageData += data;
		}).on('end', function() { //加载完毕保存图片
			if (!fs.existsSync("./" + album_id)) {
				fs.mkdirSync("./" + album_id);
			}
			fs.writeFile(album_id + '/' + Math.random() + '.png', imageData, 'binary', function(err) { //以二进制格式保存
				if (err) throw err;
				console.log('保存成功');
			});
		});
	});
}
